import { Server as SocketServer } from 'socket.io'
import { Server } from 'http'
import { sessions } from '@clerk/clerk-sdk-node'

const clients: {socketId: string, userId: string}[] = []

export default {
  clients,
  createSocket (httpServer: Server) {
    try {
      const io = new SocketServer(httpServer, { cors: { origin: '*' } })
      this.clients = []
      io.on('connection', (socket) => {
        socket.on('register', async (message: {socketId: string, userId: string}) => {
          if (this.clients.some(s => s.userId === message.userId && s.socketId === message.socketId)) return
          const sessionsList = await sessions.getSessionList()
          let session = sessionsList.find(s => s.userId === message.userId)
          if (session && (session.expireAt <= new Date().getTime() || session.status !== 'active')) {
            io.to(message.socketId).emit('error', {message: 'Sessão inválida'})
          }
          else {
            this.clients.push(message)
            console.log(`sessionId: ${message.userId} registrado`)
          }
        })
        socket.on('disconnect', () => {
          const index = this.clients.findIndex(u => u.socketId === socket.id)
          const session = this.clients.splice(index, 1)
          console.log(`sessionId: ${session[0].userId} removido`)
        })
      })
      return io
    } catch (error) {
      throw error
    }
  }
}