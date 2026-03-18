type RepoHealthInputs = {
  commitFrequencyPerWeek: number
  issueClosureRate: number
  averagePrMergeHours: number | null
}

type RepoHealthResult = {
  score: number
  breakdown: {
    commitFrequency: number
    issueClosureRate: number
    prMergeSpeed: number
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeCommitFrequency(commitsPerWeek: number) {
  // 20 commits/week is considered excellent for this simple baseline model.
  return clamp((commitsPerWeek / 20) * 100, 0, 100)
}

function normalizeIssueClosureRate(rate: number) {
  return clamp(rate * 100, 0, 100)
}

function normalizePrMergeSpeed(averageHours: number | null) {
  if (averageHours === null || Number.isNaN(averageHours) || averageHours <= 0) {
    return 40
  }

  // 6h average merge gets top score; 72h or more bottoms out.
  if (averageHours <= 6) return 100
  if (averageHours >= 72) return 0

  const score = 100 - ((averageHours - 6) / (72 - 6)) * 100
  return clamp(score, 0, 100)
}

export function calculateRepoHealthScore(inputs: RepoHealthInputs): RepoHealthResult {
  const commitScore = normalizeCommitFrequency(inputs.commitFrequencyPerWeek)
  const issueScore = normalizeIssueClosureRate(inputs.issueClosureRate)
  const prScore = normalizePrMergeSpeed(inputs.averagePrMergeHours)

  const score = Math.round(commitScore * 0.35 + issueScore * 0.35 + prScore * 0.3)

  return {
    score: clamp(score, 0, 100),
    breakdown: {
      commitFrequency: Math.round(commitScore),
      issueClosureRate: Math.round(issueScore),
      prMergeSpeed: Math.round(prScore),
    },
  }
}
