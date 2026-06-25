import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import db from '../lib/db';

// ---------- DASHBOARD ----------
export async function getDashboard(_req: Request, res: Response): Promise<void> {
  const [users, stores, ratings] = await Promise.all([
    db.query('SELECT COUNT(*) FROM users'),
    db.query('SELECT COUNT(*) FROM stores'),
    db.query('SELECT COUNT(*) FROM ratings'),
  ]);
  res.json({
    totalUsers: parseInt(users.rows[0].count),
    totalStores: parseInt(stores.rows[0].count),
    totalRatings: parseInt(ratings.rows[0].count),
  });
}

// ---------- USERS ----------
export async function getUsers(req: Request, res: Response): Promise<void> {
  const { name, email, address, role, sortBy = 'name', sortOrder = 'asc' } = req.query as Record<string, string>;

  const allowed = ['name', 'email', 'address', 'role', 'created_at'];
  const field = allowed.includes(sortBy) ? sortBy : 'name';
  const dir = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (name)    { conditions.push(`name    ILIKE $${idx++}`); params.push(`%${name}%`); }
  if (email)   { conditions.push(`email   ILIKE $${idx++}`); params.push(`%${email}%`); }
  if (address) { conditions.push(`address ILIKE $${idx++}`); params.push(`%${address}%`); }
  if (role)    { conditions.push(`role = $${idx++}`); params.push(role); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows: users } = await db.query(
    `SELECT id, name, email, address, role, store_id, created_at
     FROM users ${where} ORDER BY ${field} ${dir}`,
    params
  );

  // Attach avg rating for owners
  const result = await Promise.all(users.map(async (u) => {
    if (u.role === 'owner' && u.store_id) {
      const { rows } = await db.query(
        'SELECT AVG(value)::numeric(10,2) AS avg FROM ratings WHERE store_id = $1',
        [u.store_id]
      );
      return { ...u, avgRating: rows[0].avg ? parseFloat(rows[0].avg) : null };
    }
    return u;
  }));

  res.json(result);
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const { rows } = await db.query(
    'SELECT id, name, email, address, role, store_id, created_at FROM users WHERE id = $1',
    [req.params.id]
  );
  if (rows.length === 0) { res.status(404).json({ message: 'User not found' }); return; }
  res.json(rows[0]);
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  const { name, email, address, password, role, store_id } = req.body;

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) { res.status(409).json({ message: 'Email already registered' }); return; }

  const hash = await bcrypt.hash(password, 12);
  const storeId = role === 'owner' && store_id ? store_id : null;

  const { rows } = await db.query(
    `INSERT INTO users (name, email, address, password, role, store_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, role, store_id`,
    [name, email, address, hash, role, storeId]
  );
  res.status(201).json(rows[0]);
}

// ---------- STORES ----------
export async function getStores(req: Request, res: Response): Promise<void> {
  const { name, email, address, sortBy = 'name', sortOrder = 'asc' } = req.query as Record<string, string>;

  const allowed = ['name', 'email', 'address', 'created_at'];
  const field = allowed.includes(sortBy) ? sortBy : 'name';
  const dir = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (name)    { conditions.push(`s.name    ILIKE $${idx++}`); params.push(`%${name}%`); }
  if (email)   { conditions.push(`s.email   ILIKE $${idx++}`); params.push(`%${email}%`); }
  if (address) { conditions.push(`s.address ILIKE $${idx++}`); params.push(`%${address}%`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await db.query(
    `SELECT s.id, s.name, s.email, s.address, s.created_at,
            AVG(r.value)::numeric(10,2) AS "avgRating"
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${where}
     GROUP BY s.id
     ORDER BY s.${field} ${dir}`,
    params
  );

  res.json(rows.map(r => ({ ...r, avgRating: r.avgRating ? parseFloat(r.avgRating) : null })));
}

export async function createStore(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  const { name, email, address } = req.body;
  const { rows } = await db.query(
    'INSERT INTO stores (name, email, address) VALUES ($1, $2, $3) RETURNING id, name, email, address',
    [name, email, address]
  );
  res.status(201).json(rows[0]);
}
