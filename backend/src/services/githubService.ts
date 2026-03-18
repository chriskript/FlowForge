type GitHubGraphqlResult = {
  data?: {
    repository: {
      defaultBranchRef: {
        target: {
          history: {
            nodes: Array<{
              oid: string;
              committedDate: string;
              messageHeadline: string;
              author: {
                user: {
                  login: string;
                } | null;
              } | null;
            }>;
          };
        };
      } | null;
      pullRequests: {
        nodes: Array<{
          number: number;
          title: string;
          state: string;
          createdAt: string;
          mergedAt: string | null;
          author: {
            login: string;
          } | null;
        }>;
      };
      issues: {
        nodes: Array<{
          number: number;
          title: string;
          state: string;
          createdAt: string;
          closedAt: string | null;
          author: {
            login: string;
          } | null;
        }>;
      };
    } | null;
  };
  errors?: Array<{
    message: string;
  }>;
};

export type GithubOverview = {
  commits: Array<{
    sha: string;
    committedAt: string;
    message: string;
    author: string | null;
  }>;
  prs: Array<{
    number: number;
    title: string;
    state: string;
    createdAt: string;
    mergedAt: string | null;
    author: string | null;
  }>;
  issues: Array<{
    number: number;
    title: string;
    state: string;
    createdAt: string;
    closedAt: string | null;
    author: string | null;
  }>;
};

type OverviewCacheEntry = {
  data: GithubOverview;
  expiresAt: number;
};

const OVERVIEW_CACHE_MAX_ENTRIES = 200;
const OVERVIEW_CACHE_DEFAULT_TTL_MS = 60_000;
const overviewCache = new Map<string, OverviewCacheEntry>();

function getOverviewCacheTtlMs() {
  const rawTtl = process.env.OVERVIEW_CACHE_TTL_SECONDS;

  if (rawTtl === undefined) {
    return OVERVIEW_CACHE_DEFAULT_TTL_MS;
  }

  const parsedSeconds = Number(rawTtl);

  if (!Number.isFinite(parsedSeconds)) {
    return OVERVIEW_CACHE_DEFAULT_TTL_MS;
  }

  return Math.max(0, Math.floor(parsedSeconds * 1000));
}

function getOverviewCacheKey(owner: string, repo: string, limit: number) {
  return `${owner.toLowerCase()}/${repo.toLowerCase()}?limit=${limit}`;
}

function getCachedOverview(cacheKey: string) {
  const entry = overviewCache.get(cacheKey);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    overviewCache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

function pruneOverviewCache() {
  const now = Date.now();

  for (const [key, entry] of overviewCache.entries()) {
    if (entry.expiresAt <= now) {
      overviewCache.delete(key);
    }
  }

  while (overviewCache.size > OVERVIEW_CACHE_MAX_ENTRIES) {
    const oldestKey = overviewCache.keys().next().value;

    if (!oldestKey) {
      break;
    }

    overviewCache.delete(oldestKey);
  }
}

const OVERVIEW_QUERY = `
  query GitHubOverview($owner: String!, $name: String!, $limit: Int!) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: $limit) {
              nodes {
                oid
                committedDate
                messageHeadline
                author {
                  user {
                    login
                  }
                }
              }
            }
          }
        }
      }
      pullRequests(first: $limit, orderBy: { field: UPDATED_AT, direction: DESC }) {
        totalCount
        nodes {
          number
          title
          state
          createdAt
          mergedAt
          author {
            login
          }
        }
      }
      issues(first: $limit, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          number
          title
          state
          createdAt
          closedAt
          author {
            login
          }
        }
      }
    }
  }
`;

function getGithubToken() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error('Missing GITHUB_TOKEN environment variable');
  }

  return token;
}

export async function fetchGithubOverview(
  owner: string,
  repo: string,
  limit = 20,
): Promise<GithubOverview> {
  const cacheTtlMs = getOverviewCacheTtlMs();
  const cacheKey = getOverviewCacheKey(owner, repo, limit);

  if (cacheTtlMs > 0) {
    const cachedOverview = getCachedOverview(cacheKey);

    if (cachedOverview) {
      return cachedOverview;
    }
  }

  const token = getGithubToken();

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: OVERVIEW_QUERY,
      variables: {
        owner,
        name: repo,
        limit,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed with status ${response.status}`);
  }

  const result = (await response.json()) as GitHubGraphqlResult;

  if (result.errors && result.errors.length > 0) {
    const firstError = result.errors[0];
    throw new Error(firstError?.message ?? 'Unknown GitHub GraphQL error');
  }

  const repository = result.data?.repository;

  if (!repository) {
    throw new Error('Repository not found');
  }

  const commitHistory = repository.defaultBranchRef?.target.history.nodes ?? [];

  const overview: GithubOverview = {
    commits: commitHistory.map((commit) => ({
      sha: commit.oid,
      committedAt: commit.committedDate,
      message: commit.messageHeadline,
      author: commit.author?.user?.login ?? null,
    })),
    prs: repository.pullRequests.nodes.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      createdAt: pr.createdAt,
      mergedAt: pr.mergedAt,
      author: pr.author?.login ?? null,
    })),
    issues: repository.issues.nodes.map((issue) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      createdAt: issue.createdAt,
      closedAt: issue.closedAt,
      author: issue.author?.login ?? null,
    })),
  };

  if (cacheTtlMs > 0) {
    overviewCache.set(cacheKey, {
      data: overview,
      expiresAt: Date.now() + cacheTtlMs,
    });
    pruneOverviewCache();
  }

  return overview;
}
