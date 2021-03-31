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
  console.log('game restart api, roomID: ', req.body.roomID);
  board.restartGame(req.body.roomID);
  //   getConnectedSockets().forEach((s) => {
  //     s.disconnect(true);
  //   });
  res.status(200).json(Resp.success);
});

routes.post('/game/ready', (req, res) => {
  let roomID = req.body.roomID;
  let playerID = req.body.playerID;
  console.log(`roomID: ${roomID}, playerID: ${playerID}`);
  board.gameReady(roomID, playerID);
  res.status(200).json(Resp.success);
});

routes.post('/game/playCard', (req, res) => {
  let id = req.body.id;
  let roomID = req.body.roomID;
  let card = req.body.card;
  let content = req.body.content;
  console.log(JSON.stringify(content));
  if (id === null || roomID === null || card === null || content === null) {
    res.status(200).json(Resp.paramInputEmpty);
    return;
  }
  if (board.playCard(id, roomID, card, content.opponent, content.card)) {
    res.status(200).json(Resp.success);
  } else {
    res.status(200).json(Resp.roomIDisNotExist);
  }
});

function getConnectedSockets() {
  return Object.values(io().of('/').connected);
}

export { routes as apiGame };
