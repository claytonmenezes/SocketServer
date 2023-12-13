import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rota from './src/rota'
import socket from './src/socket'

const app = express()
app.use(cors({
  origin: '*'
}))
app.use(express.json())

const PORT = process.env.PORT || 8081

async function start () {
  const httpServer = app.listen(PORT, () => {
    console.log(`Socket server rodando na porta: ${PORT}`);
  })
  const io = socket.createSocket(httpServer)
  app.use(rota(io))
}

start()
