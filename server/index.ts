import express from 'express';
import { migrate } from './db.js';
import { sessionsRouter } from './routes/sessions.js';

migrate();

const app = express();
app.use(express.json());
app.use('/api/sessions', sessionsRouter);

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});