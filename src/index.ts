import 'dotenv/config';

import path from 'path';

import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import socketio from 'socket.io';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(express.static(path.resolve(__dirname, '../public')));

// const server = require('http').Server(app);

app.get('/version', (req, res) => {
  res.json({ env: process.env.NODE_ENV, version: process.env.VERSION });
});

let server = app.listen(process.env.PORT, () => {
  console.log(new Date(), `env: ${process.env.NODE_ENV}`);
  console.log(new Date(), `version: ${process.env.VERSION}`);
  console.log(new Date(), `server listening on ${process.env.PORT}`);
});

const io = socketio(3005);

io.on('connection', (socket) => {
  console.log(socket.id);
  socket.emit('welcom', 1, 2, 5);
  socket.join('game');

  socket.on('msg', (data) => {
    console.log(data);
  });
});
