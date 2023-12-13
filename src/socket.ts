import { Server as SocketServer } from 'socket.io'
import { Server } from 'http'
import { sessions as sessionClerk } from '@clerk/clerk-sdk-node'

const sessions: {socketId: string, sessionId: string}[] = []

export default {
  sessions,
  createSocket (httpServer: Server) {
    try {
      const io = new SocketServer(httpServer, { cors: { origin: '*' } })
      this.sessions = []
      io.on('connection', (socket) => {
        socket.on('register', async (message: {socketId: string, sessionId: string}) => {
          if (this.sessions.some(s => s.sessionId === message.sessionId && s.socketId === message.socketId)) return
          const session = await sessionClerk.getSession(message.sessionId)
          if (session.status !== 'active') {
            io.to(message.socketId).emit('error', {message: 'Sessão inválida'})
          }
          else {
            this.sessions.push(message)
            console.log(`sessionId: ${message.sessionId} registrado`)
          }
        })
        socket.on('disconnect', () => {
          console.log(socket.id, this.sessions)
          const index = this.sessions.findIndex(u => u.socketId === socket.id)
          console.log(index)
          const session = this.sessions.splice(index, 1)
          console.log(`sessionId: ${session[0].sessionId} removido`)
        })
      })
      return io
    } catch (error) {
      throw error
    }
  }
}