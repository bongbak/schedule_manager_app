import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const [rows] = await db.query('SELECT * FROM SwapRequest');
  res.json(rows);
});

export default router;