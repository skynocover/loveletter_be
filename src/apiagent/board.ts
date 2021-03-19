import express from 'express';
import board from '../class/board';

import { io } from '../socket/socket';

const routes = express.Router();

routes.get('/players', (req, res) => {
  //   console.log(history.get());

  console.log(board.allPlayers());
  res.status(200).json({ errorCode: 0, players: board.allPlayers() });
});

routes.post('/players', (req, res) => {
  let player = req.body.player;
  console.log(player);
  if (player.id === undefined || player.name === undefined) {
    res.status(404).json({ errorCode: 1000 });
    return;
  }
  board.newPlayer(player.id, player.name);
  io().emit('player', { action: 'add', player });
  res.status(200).json({ errorCode: 0 });
});

export { routes as apiBoard };
