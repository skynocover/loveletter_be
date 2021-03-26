import express from 'express';

import board from '../class/board';
import { io } from '../socket/socket';
import { Resp } from '../resp/resp';

const routes = express.Router();

routes.get('/players/:roomID', (req, res) => {
  let roomID = req.params.roomID;
  console.log('RoomID: ', roomID);

  console.log(board.allPlayers(roomID));
  res.status(200).json({ ...Resp.success, players: board.allPlayers(roomID) });
});

routes.post('/players', (req, res) => {
  let newPlayer = req.body.player;
  if (newPlayer.id === undefined || newPlayer.name === undefined) {
    res.status(404).json({ ...Resp.paramInputEmpty });
    return;
  }

  board.BoardMachine.send('Join', { newPlayer });
  // board.newPlayer(player.id, player.name);
  // io().emit('player', 'add', player);
  res.status(200).json({ ...Resp.success });
});

routes.post('/players/ready/:name', (req, res) => {
  let name = req.params.name;
  if (name === null) {
    res.status(404).json({ ...Resp.paramInputEmpty });
    return;
  }
  // board.readyPlayer(name, true);
  board.BoardMachine.send('Ready', { name, ready: true });

  res.status(200).json({ ...Resp.success });

  // console.log(board.allPlayers());
});

routes.delete('/players/ready/:name', (req, res) => {
  let name = req.params.name;
  if (name === null) {
    res.status(200).json(Resp.paramInputEmpty);
    return;
  }
  board.BoardMachine.send('Ready', { name, ready: false });
  // board.readyPlayer(name, false);
  // io().emit('player', 'unReady', name);
  res.status(200).json({ ...Resp.success });

  // console.log(board.allPlayers());
});

export { routes as apiPlayers };
