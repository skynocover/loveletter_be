import http from 'http';

import socketio from 'socket.io';
import dayjs from 'dayjs';
import history from '../globals/history';
import board from '../class/board';

let _io: socketio.Server;

export const init = (server: http.Server) => {
  _io = socketio(server);

  _io.on('connection', (socket) => {
    console.log(socket.id, ' is connection');
    let newhistory = history.push(
      '玩家連線',
      `id: ${socket.id}, time: ${dayjs().format('HH:mm:ss')}`,
    );
    _io.emit('newHistory', newhistory);

    socket.on('disconnect', (reason) => {
      console.log(socket.id, ' is disconnect');
      let newhistory = history.push(
        '玩家離線',
        `id: ${socket.id}, time: ${dayjs().format('HH:mm:ss')}`,
      );
      _io.emit('newHistory', newhistory);
      _io.emit('player', 'del', socket.id);

      board.delPlayer(socket.id);
    });
  });
};

export const io = () => _io;
