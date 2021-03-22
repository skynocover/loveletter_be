import express from 'express';

import board from '../class/board';
import { io } from '../socket/socket';
import { Resp } from '../resp/resp';

const routes = express.Router();

routes.post('/game/start', (req, res) => {
  let check = board.startGame();
  if (!check) {
    res.status(200).json(Resp.unReady);
  } else {
    res.status(200).json(Resp.success);
  }
});

export { routes as apiGame };
