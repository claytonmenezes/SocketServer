import server from './socket'
import { Server as SocketServer } from 'socket.io'
import { verificaClerk } from './autenticacao'
import { Router } from 'express'
const router = Router()

export default function (io: SocketServer) {
  try {
    router.get('/', (_, res) => (res.sendStatus(200)))

    router.use(verificaClerk, (req, res) => {
      try {
        const nomeMetodo = req.url.split('?')[0]?.substring(1)
        const usuariosFiltrados = server.sessions?.filter(u => u.sessionId === req.query?.usuarioId)
        if (usuariosFiltrados.length) {
          for (const usuario of usuariosFiltrados) {
            io.to(usuario.socketId).emit(nomeMetodo, req.body)
          }
          res.sendStatus(200)  
        } else {
          res.status(404).send('Usuário não encontrado')
        }
      } catch (error) {
        res.status(500).send(error)
      }
    })
    
    return router
  } catch (error) {
    throw error
  }
}