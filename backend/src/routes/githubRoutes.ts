import { Router } from 'express';
import { getGithubOverview } from '../controllers/githubController';

const githubRouter = Router();

githubRouter.get('/overview', getGithubOverview);

export { githubRouter };
