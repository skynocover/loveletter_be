import { Machine } from 'xstate';

const GameMachine = Machine({
  id: 'game',
  initial: 'beforeStart',
  states: {
    beforeStart: {
      on: {
        Ready: 'start',
      },
    },
    start: {
      on: {
        Draw: 'play',
      },
    },
    play: {
      on: {
        Next: 'play',
        Fin: 'finally',
      },
    },
    finally: {
      on: {
        Check: 'start',
      },
    },
  },
});

const nextState = GameMachine.transition('beforeStart', 'Ready').value;

export default GameMachine;
