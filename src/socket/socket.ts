import http from 'http';

import socketio from 'socket.io';
import dayjs from 'dayjs';
import history from '../globals/history';
import board from '../class/board';

let _io: socketio.Server;

export const init = (server: http.Server) => {
  _io = socketio(server);

  _io.on('connection', (socket) => {
    // console.log(socket.id);
    let newhistory = history.push(
      '玩家連線',
      `id: ${socket.id}, time: ${dayjs().format('HH:mm:ss')}`,
    );
    _io.emit('newHistory', newhistory);
    // socket.emit('welcom', 1, 2, 5);
    // socket.join('game');

    socket.on('msg', (data) => {
      console.log(data);
      socket.emit('welcome', { newData: 'newData' });
    });

    socket.on('disconnect', (reason) => {
      let newhistory = history.push(
        '玩家離線',
        `id: ${socket.id}, time: ${dayjs().format('HH:mm:ss')}`,
      );
      _io.emit('newHistory', newhistory);
      _io.emit('player', { action: 'del', id: socket.id });

      board.delPlayer(socket.id);
    });
  });
};

export const io = () => _io;
