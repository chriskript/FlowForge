import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { githubRouter } from './routes/githubRoutes';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

function parseAllowedOrigins(rawValue: string | undefined) {
  return (rawValue ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

const configuredOrigins = parseAllowedOrigins(
  process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN,
);

const defaultDevOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedOriginSet = new Set<string>(
  process.env.NODE_ENV === 'production'
    ? configuredOrigins
    : [...configuredOrigins, ...defaultDevOrigins],
);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOriginSet.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS origin not allowed: ${origin}`));
  },
};

app.use(cors(corsOptions));
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
