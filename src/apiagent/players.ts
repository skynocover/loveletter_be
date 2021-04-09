import express from 'express';

import board from '../class/board';
import { io } from '../socket/socket';
import { Resp } from '../resp/resp';

const routes = express.Router();

// 取得房間內所有人
routes.get('/players/:roomID', (req, res) => {
  let roomID = req.params.roomID;
  console.log('RoomID: ', roomID);
  let players = board.allPlayers(roomID);
  console.log('api all players: ', players);
  res.status(200).json({ ...Resp.success, players });
});

// 新增玩家
routes.post('/players', (req, res) => {
  let newPlayer = req.body.player;
  if (newPlayer.id === undefined || newPlayer.name === undefined) {
    res.status(404).json({ ...Resp.paramInputEmpty });
    return;
  }

  // board.BoardMachine.send('Join', { newPlayer });
  board.addPlayer(newPlayer.id, newPlayer.name);
  res.status(200).json({ ...Resp.success });
});

// 玩家準備
routes.post('/players/ready/:name', (req, res) => {
  let name = req.params.name;
  if (name === null) {
    res.status(404).json({ ...Resp.paramInputEmpty });
    return;
  }

  board.readyPlayer(name, true);
  res.status(200).json({ ...Resp.success });
});

// 玩家未準備
routes.delete('/players/ready/:name', (req, res) => {
  let name = req.params.name;
  if (name === null) {
    res.status(200).json(Resp.paramInputEmpty);
    return;
  }

  board.readyPlayer(name, false);
  res.status(200).json({ ...Resp.success });
});

export { routes as apiPlayers };
