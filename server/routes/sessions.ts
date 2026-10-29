import { Router } from 'express';
import { db } from '../db.js';

export const sessionsRouter = Router();

type Session = {
  id: number;
  subject: string;
  duration_minutes: number;
  notes: string | null;
  created_at: string;
};

sessionsRouter.get('/', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM sessions ORDER BY created_at DESC, id DESC')
    .all() as Session[];
  res.json(rows);
});

sessionsRouter.post('/', (req, res) => {
  const { subject, duration_minutes, notes } = req.body ?? {};

  if (
    typeof subject !== 'string' || !subject.trim() ||
    !Number.isInteger(duration_minutes) || duration_minutes <= 0
  ) {
    res.status(400).json({
      error: 'subject (texto) e duration_minutes (inteiro > 0) são obrigatórios',
    });
    return;
  }

  const result = db
    .prepare('INSERT INTO sessions (subject, duration_minutes, notes) VALUES (?, ?, ?)')
    .run(subject.trim(), duration_minutes, typeof notes === 'string' ? notes : null);

  const created = db
    .prepare('SELECT * FROM sessions WHERE id = ?')
    .get(result.lastInsertRowid) as Session;

  res.status(201).json(created);
});