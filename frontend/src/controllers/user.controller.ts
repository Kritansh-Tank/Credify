import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import db from '../lib/db';

export async function getStores(req: Request, res: Response): Promise<void> {
  const { search, sortBy = 'name', sortOrder = 'asc' } = req.query as Record<string, string>;
  const userId = req.user!.id;

  const allowed = ['name', 'address', 'created_at'];
  const field = allowed.includes(sortBy) ? sortBy : 'name';
  const dir = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const params: unknown[] = [userId];
  let searchClause = '';
  if (search) {
    searchClause = `AND (s.name ILIKE $2 OR s.address ILIKE $2)`;
    params.push(`%${search}%`);
  }

  const { rows } = await db.query(
    `SELECT s.id, s.name, s.address,
            AVG(r.value)::numeric(10,2)                          AS "avgRating",
            MAX(CASE WHEN r.user_id = $1 THEN r.value END)       AS "userRating",
            MAX(CASE WHEN r.user_id = $1 THEN r.id::text END)    AS "userRatingId"
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE TRUE ${searchClause}
     GROUP BY s.id
     ORDER BY s.${field} ${dir}`,
    params
  );

  res.json(rows.map(r => ({
    ...r,
    avgRating:    r.avgRating  ? parseFloat(r.avgRating)  : null,
    userRating:   r.userRating ? parseInt(r.userRating)   : null,
    userRatingId: r.userRatingId ?? null,
  })));
}

export async function submitRating(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  const { store_id, value } = req.body;
  const userId = req.user!.id;

  const store = await db.query('SELECT id FROM stores WHERE id = $1', [store_id]);
  if (store.rows.length === 0) { res.status(404).json({ message: 'Store not found' }); return; }

  const existing = await db.query(
    'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
    [userId, store_id]
  );
  if (existing.rows.length > 0) {
    res.status(409).json({ message: 'You have already rated this store. Use PATCH to modify.' });
    return;
  }

  const { rows } = await db.query(
    'INSERT INTO ratings (user_id, store_id, value) VALUES ($1, $2, $3) RETURNING *',
    [userId, store_id, value]
  );
  res.status(201).json(rows[0]);
}

export async function modifyRating(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  const { storeId } = req.params;
  const { value } = req.body;
  const userId = req.user!.id;

  const existing = await db.query(
    'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
    [userId, storeId]
  );
  if (existing.rows.length === 0) {
    res.status(404).json({ message: 'No existing rating to modify' });
    return;
  }

  const { rows } = await db.query(
    'UPDATE ratings SET value = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [value, existing.rows[0].id]
  );
  res.json(rows[0]);
}
