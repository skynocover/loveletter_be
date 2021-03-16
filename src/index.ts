import 'dotenv/config';

import path from 'path';

import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(express.static(path.resolve(__dirname, '../public')));

const server = require('http').Server(app);
const io = require('socket.io')(server);

let nicknames: any[] = [];

io.sockets.on('connection', (socket: any) => {
  socket.on('new user', (data: any) => {
    console.log(data);
    if (nicknames.indexOf(data) != -1) {
    } else {
      socket.emit('chat', 'SERVER', '歡迎光臨 ' + data);

      socket.nickname = data;
      nicknames.push(socket.nickname);
      io.sockets.emit('usernames', nicknames);
      updateNicknames();
    }
  });

  function updateNicknames() {
    io.sockets.emit('usernames', nicknames);
  }

  //
  socket.on('send message', (data: any) => {
    io.sockets.emit('new message', { msg: data, nick: socket.nickname });
  });

  socket.on('disconnect', (data: any) => {
    if (!socket.nickname) return;
    io.sockets.emit('chat', 'SERVER', socket.nickname + ' 離開了聊天室～');
    nicknames.splice(nicknames.indexOf(socket.nickname), 1);
    updateNicknames();
  });
});

app.get('/version', (req, res) => {
  res.json({ env: process.env.NODE_ENV, version: process.env.VERSION });
});

app.listen(process.env.PORT, () => {
  console.log(new Date(), `env: ${process.env.NODE_ENV}`);
  console.log(new Date(), `version: ${process.env.VERSION}`);
  console.log(new Date(), `server listening on ${process.env.PORT}`);
});
