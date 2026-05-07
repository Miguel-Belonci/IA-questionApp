import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign(
    {
      role: user.role,
    },
    process.env.JWT_SECRET || 'dev-secret',
    {
      subject: String(user.id),
      expiresIn: '7d',
    },
  );
}
