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

  return {
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
}
