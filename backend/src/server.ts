import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  res.json({ ok: true, service: 'flowforge-backend' });
});

app.listen(port, () => {
  console.log(`FlowForge backend running on http://localhost:${port}`);
});
