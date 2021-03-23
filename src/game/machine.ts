import { Machine, interpret, assign } from 'xstate';

const GameMachine = Machine({
  id: 'game',
  initial: 'beforeStart',
  states: {
    beforeStart: {
      on: {
        Ready: 'start', //事件: 更新狀態
      },
    },
    start: {
      on: {
        Draw: 'play',
        Restart: 'beforeStart',
        Check: { actions: () => {} }, //收到Event時執行並不會轉移state
        Ready: { target: 'play', actions: () => {} },
      },
      onEntry: (state, context) => {
        //進入
        console.log('state: ' + state);
        console.log('context: ' + JSON.stringify(context));
      },
      onExit: () => {}, //退出
    },
    play: {
      on: {
        Next: 'play',
        Fin: 'finally',
        Restart: 'beforeStart',
      },
    },
    finally: {
      on: {
        Check: 'start',
        Restart: 'beforeStart',
      },
    },
  },
});

const GameService = interpret(GameMachine)
  .onTransition((state, context) => {})
  .start();

export default GameService;
