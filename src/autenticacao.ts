import { Request, Response, NextFunction } from "express"
import { sessions } from '@clerk/clerk-sdk-node'

const verificaClerk = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.query.userId as string
  if (!userId) return res.status(401).send({message: 'Não autorizado'})
  const sessionsList = await sessions.getSessionList()
  let session = sessionsList.find(s => s.userId === userId)
  if (session && (session.expireAt <= new Date().getTime() || session.status !== 'active')) {
    return res.status(403).send({message: 'Sessão inválida'})
  }
  return next()
}
export {verificaClerk}