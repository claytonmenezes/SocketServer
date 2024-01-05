import { Request, Response, NextFunction } from "express"
import { sessions } from '@clerk/clerk-sdk-node'

const verificaClerk = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.query.sessionId as string
  if (!sessionId) return res.status(401).send({message: 'Não autorizado'})
  const session = await sessions.getSession(sessionId)
  if (session.expireAt <= new Date().getTime() || session.status === 'active') {
    return res.status(403).send({message: 'Sessão inválida'})
  }
  return next()
}
export {verificaClerk}