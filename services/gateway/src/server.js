import http from 'node:http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { app } from './app.js';
import { config } from './config.js';
import { dataService } from './services/dataService.js';

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.nodeEnv === 'production' ? false : config.corsOrigin } });
app.set('io', io);
io.use(async (socket, next) => {
  try {
    const claims = jwt.verify(socket.handshake.auth?.token, config.jwtSecret);
    const { data: account } = await dataService.get(`/users/${claims.sub}/`);
    if (!account.is_active) return next(new Error('Unauthorized'));
    socket.user = { ...claims, sub: String(account.id), role: account.role };
    return next();
  } catch {
    return next(new Error('Unauthorized'));
  }
});
io.on('connection', (socket) => socket.join(`user:${socket.user.sub}`));
server.listen(config.port, () => console.log(`HomeServe gateway listening on :${config.port}`));
