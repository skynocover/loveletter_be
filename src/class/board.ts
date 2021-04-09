import player from './player';
import card from './card';
import { io } from '../socket/socket';
import Game from './game';
import { v4 as uuidv4 } from 'uuid';

import { Machine, interpret, Interpreter, AnyEventObject } from 'xstate';

class Board {
  private players: player[];
  private lobby: player[];
  private id: string;
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
    this.id = uuidv4();
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
            // 離開大廳聊天室
            let ns = io().of('/');
            for (const p of this.players) {
              let socket = ns.connected[p.id];
              socket.leave(this.id);
            }
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

  // 玩家加入大廳
  addPlayer(id: string, name: string) {
    console.log(`addPlayer id: ${id} name: ${name}`);
    this.players.push(new player(id, name));
    io().emit('player', 'add', { id, name });

    //將socket加到lobby聊天室
    let ns = io().of('/');
    let socket = ns.connected[id];
    console.log(`socket ${id} join: ${this.id}`);
    socket.join(this.id);
  }

  // 玩家準備 | 未準備
  readyPlayer(name: string, ready: boolean) {
    for (const player of this.players) {
      if (player.name === name) {
        player.ready = ready;
        break;
      }
    }
    io().emit('player', ready ? 'ready' : 'unReady', name);
  }

  // 取得在大廳或遊戲內的所有玩家
  allPlayers(roomID: string) {
    if (roomID !== 'none') {
      return this.Games.get(roomID)?.allPlayers();
    }
    return this.players;
  }

  // 玩家斷線,刪除玩家
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

  // 開始遊戲, 確認所有玩家已經準備
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

  // 遊戲重開
  restartGame(roomID: string) {
    let room = this.Games.get(roomID);
    let ns = io().of('/');
    if (room) {
      io().to(roomID).emit('Game', 'ReStart');
      for (const p of room.players) {
        p.reset();
        this.players.push(p);
        //將socket加到lobby聊天室
        let socket = ns.connected[p.id];
        socket.join(this.id);
      }
    }
    this.Games.delete(roomID);
  }

  // 玩家出牌
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

  // 玩家確認callback
  gameReady(roomID: string, playerID: string) {
    let game = this.Games.get(roomID);
    if (game?.ready(playerID)) {
      this.BoardMachine.send('Finish');
    }
  }

  // 玩家取得手上的卡牌
  getCard(roomID: string, playerID: string): string[] {
    let game = this.Games.get(roomID);
    return game?.getCard(playerID) || [];
  }
}

const board = new Board();

export default board;
