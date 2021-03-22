import express from 'express';
import history from '../globals/history';
import { Resp } from '../resp/resp';

const routes = express.Router();

routes.get('/history', (req, res) => {
  //   console.log(history.get());
  res.status(200).json({ ...Resp.success, history: history.get() });
});

export { routes as apiHistory };
