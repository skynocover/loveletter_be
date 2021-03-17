import express from 'express';
import history from '../globals/history';

const routes = express.Router();

routes.get('/history', (req, res) => {
  //   console.log(history.get());
  res.status(200).json({ errorCode: 0, history: history.get() });
});

export { routes as apiHistory };
