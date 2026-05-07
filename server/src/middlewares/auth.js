import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Token nao informado.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findByPk(payload.sub);

    if (!user || !user.active) {
      return res.status(401).json({ message: 'Conta inexistente ou inativa.' });
    }

    req.user = user;
    next();
  } catch (_error) {
    res.status(401).json({ message: 'Token invalido.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores.' });
  }

  next();
}
