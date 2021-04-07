import player from './player';
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
  private lobby: player[];
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
    this.lobby = [];
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

  addPlayer(id: string, name: string) {
    console.log(`addPlayer id: ${id} name: ${name}`);
    this.players.push(new player(id, name));
    io().emit('player', 'add', { id, name });
  }

  readyPlayer(name: string, ready: boolean) {
    for (const player of this.players) {
      if (player.name === name) {
        player.ready = ready;
        break;
      }
    }
    io().emit('player', ready ? 'ready' : 'unReady', name);
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
        p.reset();
        this.players.push(p);
      }
    }
    this.Games.delete(roomID);
    io().to(roomID).emit('Game', 'ReStart');
  }

  playCard(
    id: string,
    roomID: string,
    card: number,
    opponent: string,
    selectCard: string,
  ) {
    let room = this.Games.get(roomID);
    if (room) {
      return room.playCard(id, card, opponent, selectCard);
    }
    return false;
  }

  gameReady(roomID: string, playerID: string) {
    let game = this.Games.get(roomID);
    console.log(playerID);
    if (game?.ready(playerID)) {
      this.BoardMachine.send('Finish');
    }
  }

  getCard(roomID: string, playerID: string): string[] {
    let game = this.Games.get(roomID);
    if (game?.ready(playerID)) {
      return game.getCard(playerID);
    }
    return [];
  }

  opponent(roomID: string) {
    let room = this.Games.get(roomID);
    return room?.opponent();
  }
}

const board = new Board();

export default board;
