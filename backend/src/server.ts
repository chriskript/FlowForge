import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { githubRouter } from './routes/githubRoutes';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.use('/api/github', githubRouter);

app.get('/health', async (_req, res) => {
  res.json({ ok: true, service: 'flowforge-backend' });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`FlowForge backend running on http://localhost:${port}`);
});
