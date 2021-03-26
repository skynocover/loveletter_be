import player from './player';
import GameService from '../game/machine';
import card from './card';
import { io } from '../socket/socket';
import Game from './game';
import { v4 as uuidv4 } from 'uuid';

import {
  Machine,
  interpret,
  Interpreter,
  assign,
  StateMachine,
  AnyEventObject,
} from 'xstate';

class Board {
  private players: player[];
  public BoardMachine: Interpreter<
    any,
    any,
    AnyEventObject,
    {
      value: any;
      context: any;
    }
  >;

  public Games: Map<string, Game>;
  constructor() {
    this.players = [];
    this.BoardMachine = this.createMachine();
    this.Games = new Map<string, Game>();
  }

  createMachine() {
    const BoardMachine = Machine({
      id: 'board',
      initial: 'beforeStart',
      states: {
        beforeStart: {
          on: {
            Join: {
              actions: (context: any, event: any) => {
                let newPlayer = event.newPlayer;
                console.log('machine join: ', newPlayer);
                this.players.push(new player(newPlayer.id, newPlayer.name));
                io().emit('player', 'add', newPlayer);
              },
            },
            Ready: {
              actions: (context: any, event: any) => {
                console.log(event);
                let name = event.name;
                let ready = event.ready;

                for (const player of this.players) {
                  if (player.name === name) {
                    player.ready = ready;
                    break;
                  }
                }
                io().emit('player', ready ? 'ready' : 'unReady', name);
              },
            },
            Start: 'start',
          },
        },
        start: {
          on: {
            Ready: { actions: () => {} },
            Restart: { target: 'beforeStart', actions: () => {} },
            Finish: 'beforeStart',
          },
          onExit: () => {
            // io().emit('Game', 'start');
          }, //退出
          onEntry: (state, context) => {
            let roomID = uuidv4();
            let newGame = new Game(this.players, roomID);
            this.players = [];
            this.Games.set(roomID, newGame);
          },
        },
      },
    });

    return interpret(BoardMachine)
      .onTransition((state, context) => {})
      .start();
  }

  allPlayers(roomID: string) {
    if (roomID !== 'none') {
      let room = this.Games.get(roomID);
      return room?.allPlayers();
    }
    return this.players;
  }

  delPlayer(id: string) {
    let index = -1;
    for (const i in this.players) {
      if (this.players[i].id === id) {
        index = +i;
      }
    }
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  startGame() {
    if (this.players.length < 1 || this.players.length > 5) {
      return false;
    }

    let unReadyPlayer = this.players.filter((item) => {
      return item.ready === false;
    });

    if (unReadyPlayer.length === 0) {
      // GameService.send('Ready', { players: this.players });
      this.BoardMachine.send('Start');

      return true;
    } else {
      return false;
    }
  }

  restartGame(roomID: string) {
    let room = this.Games.get(roomID);
    if (room) {
      for (const p of room.players) {
        this.players.push(p);
      }
    }
    this.Games.delete(roomID);
  }

  playCard(id: string, card: number) {
    GameService.send('PlayCard', { id, card });
  }

  gameReady(roomID: string, playerID: string) {
    let game = this.Games.get(roomID);
    console.log(playerID);
    if (game?.ready(playerID)) {
      this.BoardMachine.send('Finish');
    }
  }
}

const board = new Board();

export default board;
