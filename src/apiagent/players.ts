import express from 'express';

import board from '../class/board';
import { io } from '../socket/socket';
import { Resp } from '../resp/resp';

const routes = express.Router();

routes.get('/players', (req, res) => {
  //   console.log(history.get());

  console.log(board.allPlayers());
  res.status(200).json({ ...Resp.success, players: board.allPlayers() });
});

routes.post('/players', (req, res) => {
  let player = req.body.player;
  console.log(player);
  if (player.id === undefined || player.name === undefined) {
    res.status(404).json({ ...Resp.paramInputEmpty });
    return;
  }
  board.newPlayer(player.id, player.name);
  io().emit('player', 'add', player);
  res.status(200).json({ ...Resp.success });
});

routes.post('/players/ready/:name', (req, res) => {
  let name = req.params.name;
  if (name === null) {
    res.status(404).json({ ...Resp.paramInputEmpty });
    return;
  }
  board.readyPlayer(name, true);
  io().emit('player', 'ready', name);
  res.status(200).json({ ...Resp.success });

  console.log(board.allPlayers());
});

routes.delete('/players/ready/:name', (req, res) => {
  let name = req.params.name;
  if (name === null) {
    res.status(200).json(Resp.paramInputEmpty);
    return;
  }
  board.readyPlayer(name, false);
  io().emit('player', 'unReady', name);
  res.status(200).json({ ...Resp.success });

  console.log(board.allPlayers());
});

export { routes as apiPlayers };
