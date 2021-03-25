import express from 'express';

import board from '../class/board';
import { io } from '../socket/socket';
import { Resp } from '../resp/resp';

const routes = express.Router();

routes.post('/game/start', (req, res) => {
  if (board.startGame()) {
    res.status(200).json(Resp.success);
  } else {
    res.status(200).json(Resp.unReady);
  }
});

routes.post('/game/restart', (req, res) => {
  board.restartGame();
  //   getConnectedSockets().forEach((s) => {
  //     s.disconnect(true);
  //   });
  res.status(200).json(Resp.success);
});

routes.post('/game/ready', (req, res) => {
  let roomID = req.body.roomID;
  let name = req.body.name;
});

routes.post('/game/playCard', (req, res) => {
  if (req.body.id === null || req.body.card === null) {
    res.status(200).json(Resp.paramInputEmpty);
    return;
  }
  board.playCard(req.body.id, req.body.card);
  res.status(200).json(Resp.success);
});

function getConnectedSockets() {
  return Object.values(io().of('/').connected);
}

export { routes as apiGame };
