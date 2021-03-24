import { Machine, interpret, assign } from 'xstate';
import Game from '../class/game';
import { io } from '../socket/socket';

let game: Game;

const GameMachine = Machine(
  {
    id: 'game',
    initial: 'beforeStart',
    states: {
      beforeStart: {
        on: {
          Ready: {
            target: 'start',
            actions: ['start'],
          }, //事件: 更新狀態
        },
        onEntry: (state, context) => {
          //進入
          try {
            io().emit('gameState', 'Restart');
          } catch (error) {
            console.log('entry: ', error);
          }
        },
      },
      start: {
        on: {
          Draw: 'play',
          Restart: 'beforeStart',
          Check: { actions: () => {} }, //收到Event時執行並不會轉移state
          Ready: {
            target: 'play',
            actions: (playerNum: any) => {
              console.log(playerNum);
            },
          },
          PlayCard: {
            actions: (id: any, card: any) => {
              if (id !== game.currentPlayer().id) {
                return false;
              }
              console.log('state.id,card: ', id, card);
              game.playCard(id, card);
              return true;
            },
          },
        },
        onEntry: (state, context) => {
          //進入
          io().emit('gameState', 'Ready');
          game = new Game(context.players);
          console.log('entry state: ' + state);
          console.log('entry context: ' + JSON.stringify(context));
        },
        onExit: () => {}, //退出
      },
      play: {
        on: {
          Next: 'play',
          Fin: 'finally',
          Restart: 'beforeStart',
        },
        onEntry: (state, context) => {
          //進入
          console.log('entry state: ' + state);
          console.log('entry context: ' + JSON.stringify(context));
        },
      },
      finally: {
        on: {
          Check: 'start',
          Restart: 'beforeStart',
        },
      },
    },
  },
  {
    actions: {
      // action implementations
      start: (context, event) => {
        console.log('context: ' + context);
        console.log('event: ' + JSON.stringify(event));
        game = new Game(event.players);
      },
    },
  },
);

const GameService = interpret(GameMachine)
  .onTransition((state, context) => {})
  .start();

export default GameService;
