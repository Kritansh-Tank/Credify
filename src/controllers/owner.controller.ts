import { Request, Response } from 'express';
import db from '../lib/db';

export async function getOwnerDashboard(req: Request, res: Response): Promise<void> {
  const storeId = req.user!.store_id;
  if (!storeId) { res.status(400).json({ message: 'No store associated with this account' }); return; }

  const storeRes = await db.query(
    'SELECT id, name, address, email FROM stores WHERE id = $1',
    [storeId]
  );
  if (storeRes.rows.length === 0) { res.status(404).json({ message: 'Store not found' }); return; }

  const { rows: ratings } = await db.query(
    `SELECT r.id, r.value, r.created_at, r.updated_at,
            u.name AS user_name, u.email AS user_email
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY r.created_at DESC`,
    [storeId]
  );

  const avgRes = await db.query(
    'SELECT AVG(value)::numeric(10,2) AS avg, COUNT(*) AS total FROM ratings WHERE store_id = $1',
    [storeId]
  );

  const { avg, total } = avgRes.rows[0];

  res.json({
    store: storeRes.rows[0],
    avgRating: avg ? parseFloat(avg) : null,
    totalRatings: parseInt(total),
    ratings: ratings.map(r => ({
      id: r.id,
      value: r.value,
      created_at: r.created_at,
      updated_at: r.updated_at,
      user: { name: r.user_name, email: r.user_email },
    })),
  });
}
