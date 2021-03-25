import { Machine, interpret, assign } from 'xstate';
import Game from '../class/game';
import { io } from '../socket/socket';

const BoardMachine = Machine({
  id: 'board',
  initial: 'beforeStart',
  states: {
    beforeStart: {
      on: {
        Pending: 'Pending',
      },
    },
    Pending: {
      on: {
        Join: { actions: () => {} },
      },
    },
    start: {
      on: {
        Ready: { actions: () => {} },
        Start: 'start',
      },
    },
  },
});
