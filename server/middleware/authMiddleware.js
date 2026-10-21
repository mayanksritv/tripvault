import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token, ...extra] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token || extra.length > 0) {
    return res.status(401).json({ message: 'Please sign in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'tripvault-api',
      audience: 'tripvault-client'
    });

    if (!payload.sub) {
      return res.status(401).json({ message: 'Your session is invalid. Please sign in again.' });
    }

    req.auth = { userId: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ message: 'Your session has expired or is invalid. Please sign in again.' });
  }
}
