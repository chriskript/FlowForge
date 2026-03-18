import { useCallback, useEffect, useMemo, useState } from 'react'

export type GithubCommit = {
  sha: string
  committedAt: string
  message: string
  author: string | null
}

export type GithubPullRequest = {
  number: number
  title: string
  state: string
  createdAt: string
  mergedAt: string | null
  author: string | null
}

export type GithubIssue = {
  number: number
  title: string
  state: string
  createdAt: string
  closedAt: string | null
  author: string | null
}

export type GithubOverviewData = {
  commits: GithubCommit[]
  prs: GithubPullRequest[]
  issues: GithubIssue[]
}

type UseGithubDataOptions = {
  owner?: string
  repo?: string
  limit?: number
  enabled?: boolean
}

type UseGithubDataResult = {
  data: GithubOverviewData | null
  commits: GithubCommit[]
  prs: GithubPullRequest[]
  issues: GithubIssue[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const overviewCache = new Map<string, GithubOverviewData>()

function toQueryString(options: UseGithubDataOptions) {
  const params = new URLSearchParams()

  if (options.owner) params.set('owner', options.owner)
  if (options.repo) params.set('repo', options.repo)
  if (options.limit) params.set('limit', String(options.limit))

  const query = params.toString()
  return query ? `?${query}` : ''
}

function isOverviewPayload(payload: unknown): payload is GithubOverviewData {
  if (!payload || typeof payload !== 'object') return false

  const source = payload as Record<string, unknown>
  return Array.isArray(source.commits) && Array.isArray(source.prs) && Array.isArray(source.issues)
}

export function useGithubData(options: UseGithubDataOptions = {}): UseGithubDataResult {
  const query = useMemo(() => toQueryString(options), [options.owner, options.repo, options.limit])
  const enabled = options.enabled ?? true
  const cacheKey = query || '__default__'

  const [data, setData] = useState<GithubOverviewData | null>(() => overviewCache.get(cacheKey) ?? null)
  const [loading, setLoading] = useState<boolean>(() => enabled && !overviewCache.has(cacheKey))
  const [error, setError] = useState<string | null>(null)

  const fetchGithubData = useCallback(async () => {
    if (!enabled) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    const cached = overviewCache.get(cacheKey)
    if (cached) {
      setData(cached)
    }

    setLoading(!cached)
    setError(null)

    try {
      const response = await fetch(`/api/github/overview${query}`)
      const payload = (await response.json()) as unknown

      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload !== null && 'message' in payload
            ? String((payload as { message: unknown }).message)
            : `Request failed with status ${response.status}`

        throw new Error(message)
      }

      if (!isOverviewPayload(payload)) {
        throw new Error('Unexpected API response format for GitHub overview.')
      }

      overviewCache.set(cacheKey, payload)
      setData(payload)
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Failed to fetch GitHub data.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [cacheKey, enabled, query])

  useEffect(() => {
    void fetchGithubData()
  }, [fetchGithubData])

  return {
    data,
    commits: data?.commits ?? [],
    prs: data?.prs ?? [],
    issues: data?.issues ?? [],
    loading,
    error,
    refresh: fetchGithubData,
  }
}
