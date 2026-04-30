import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db, User } from '../models/database'
import { config } from '../config'

export interface AuthRequest extends Request {
  user?: User
  token?: string
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token' })
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }
    const user = db.findUserById(decoded.userId)
    if (!user || !user.active) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }
    req.user = user
    req.token = token
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export const roleMiddleware = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Required roles: ${roles.join(', ')}` })
    }
    next()
  }
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '24h' })
}
