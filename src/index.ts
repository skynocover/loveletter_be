import 'dotenv/config';

import path from 'path';

import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

import { init } from './socket/socket';

import { apiHistory } from './apiagent/history';
import { apiBoard } from './apiagent/board';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(express.static(path.resolve(__dirname, '../public')));

// const server = require('http').Server(app);

app.get('/version', (req, res) => {
  res.json({ env: process.env.NODE_ENV, version: process.env.VERSION });
});

app.use('/api', apiHistory);
app.use('/api', apiBoard);

let server = app.listen(process.env.PORT, () => {
  console.log(new Date(), `env: ${process.env.NODE_ENV}`);
  console.log(new Date(), `version: ${process.env.VERSION}`);
  console.log(new Date(), `server listening on ${process.env.PORT}`);
});

init(server);
