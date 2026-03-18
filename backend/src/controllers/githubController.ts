import type { Request, Response, NextFunction } from 'express';
import { fetchGithubOverview } from '../services/githubService';

const DEFAULT_LIMIT = 20;

export async function getGithubOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const owner = String(req.query.owner ?? process.env.GITHUB_OWNER ?? '').trim();
    const repo = String(req.query.repo ?? process.env.GITHUB_REPO ?? '').trim();

    if (!owner || !repo) {
      res.status(400).json({
        error: 'Missing repository coordinates',
        message: 'Provide owner and repo as query params or set GITHUB_OWNER and GITHUB_REPO.',
      });
      return;
    }

    const parsedLimit = Number(req.query.limit ?? DEFAULT_LIMIT);
    const limit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(100, Math.floor(parsedLimit)))
      : DEFAULT_LIMIT;

    const overview = await fetchGithubOverview(owner, repo, limit);
    res.json(overview);
  } catch (error) {
    next(error);
  }
}
