import card, {
  Guard,
  Priest,
  Baron,
  Handmaid,
  Prince,
  King,
  Countess,
  Priness,
} from './card';
import player from './player';
import {
  Machine,
  interpret,
  Interpreter,
  assign,
  StateMachine,
  AnyEventObject,
} from 'xstate';
import { io } from '../socket/socket';

export default class Game {
  id: string;
  deck: card[];
  players: player[];
  public GameMachine: Interpreter<
    any,
    any,
    AnyEventObject,
    {
      value: any;
      context: any;
    }
  >;

  constructor(players: player[], id: string) {
    this.id = id;
    this.deck = makeNewDeck();

    this.players = [...players];
    shuffle(this.players);

    for (const p of this.players) {
      p.ready = false;
      let popCard = this.deck.pop();
      if (popCard) {
        io().to(p.id).emit('draw', popCard.title);
        p.drawCard(popCard);
      }
    }

    this.GameMachine = this.createMachine();
  }

  createMachine() {
    const GameMachine = Machine({
      id: 'game',
      initial: 'beforeStart',
      states: {
        beforeStart: {
          on: {
            Start: 'roundStart',
          },
          onEntry: (state, context) => {
            let ns = io().of('/');
            let playersName: string[] = [];
            for (const p of this.players) {
              let socket = ns.connected[p.id];
              console.log(`socket ${p.id} join: ${this.id}`);
              socket.join(this.id);
              playersName.push(p.name);
            }
            io().emit('Game', 'Start', this.id, playersName);
          },
        },
        roundStart: {
          on: {
            Play: { target: 'roundStart' },
            End: 'End',
          },
          onEntry: () => {
            let popCard = this.deck.pop();
            if (popCard === undefined) {
              this.GameMachine.send('End');
              return true;
            }
            if (this.players.length === 1) {
              this.GameMachine.send('End');
              return true;
            }
            let popPlayer = this.currentPlayer();
            if (popCard && popPlayer) {
              popPlayer.drawCard(popCard);
              popPlayer.shield = false;
              io().to(popPlayer.id).emit('draw', popCard.title);
              return true;
            }
            return false;
          },
          onExit: () => {}, //退出
        },
        End: {
          on: {},
          onEntry: () => {
            if (this.players.length === 1) {
              io().to(this.id).emit('end', [this.players[0]]);
            } else {
              this.players.sort((a, b) => {
                return a.handCard[0].value - b.handCard[0].value;
              });
              if (
                this.players[0].handCard[0].value ===
                this.players[1].handCard[0].value
              ) {
                io()
                  .to(this.id)
                  .emit('end', [this.players[0], this.players[1]]);
              } else {
                io().to(this.id).emit('end', [this.players[0]]);
              }
            }
            console.log('end game');
          },
        },
      },
    });

    return interpret(GameMachine)
      .onTransition((state, context) => {})
      .start();
  }

  // 取得遊戲內所有玩家
  allPlayers() {
    console.log(`allplayers: ${JSON.stringify(this.players)}`);
    return this.players;
  }

  // 取得遊戲內可被指定的對象
  opponent() {
    let players = [];
    for (const player of this.players) {
      if (!player.shield) {
        players.push(player);
      }
    }
    return players;
  }

  // 所有玩家確認準備發牌
  ready(playerID: string) {
    let i = 0;
    console.log(`${playerID} game ready!!!`);
    for (const p of this.players) {
      if (p.id === playerID) {
        p.ready = true;
        i++;
      } else if (p.ready) {
        i++;
      }
    }
    if (i === this.players.length) {
      console.log('game ready, start!');
      this.GameMachine.send('Start');
      return true;
    }
    return false;
  }

  currentPlayer() {
    return this.players[this.players.length - 1];
  }
  playCard(
    id: string,
    card: number,
    opponent: string,
    selectCard: string,
  ): boolean {
    console.log(
      `game: ${id} playcard: ${card}, opponent: ${opponent}, selectCard: ${selectCard}`,
    );

    let currPlayer = this.currentPlayer();
    if (currPlayer.id === id) {
      let oppo = new player('', '');
      for (const p of this.players) {
        if (p.name === opponent) {
          oppo = p;
        }
      }

      return this.cardCallback(currPlayer, oppo, card, selectCard);
    } else {
      console.log('u r not current player');
      return false;
    }
  }

  out(player: player) {
    this.players = this.players.filter((item) => item.name !== player.name);
  }

  cardCallback(
    player: player,
    opponent: player,
    card: number,
    selectCard: string,
  ) {
    let playCard = player.peekCard(card);
    if (!playCard) {
      console.log('peekCard not found');
      return false;
    }
    io().to(this.id).emit('playCard', `${player.name}`, `${playCard.title}`);

    switch (playCard.title) {
      case 'guard':
        if (opponent.peekCard(0)?.title === selectCard) {
          this.out(opponent);
          io().to(this.id).emit('result', 'out', opponent.name);
        } else {
          io().to(this.id).emit('result', 'guard', opponent.name, selectCard);
        }
        break;

      case 'priest':
        console.log(`opponent Card: ${opponent.peekCard(0)?.title}`);
        io().to(player.id).emit('result', 'peek', opponent.peekCard(0)?.title);
        break;

      case 'baron':
        let oppoCard = opponent.peekCard(0);
        let playCard = player.peekOtherCard(card);

        console.log(`opponent Card: ${JSON.stringify(opponent.peekCard(0))}`);
        console.log(
          `playerCard: ${JSON.stringify(player.peekOtherCard(card))}`,
        );
        if (!oppoCard || !playCard) {
          for (const p of this.players) {
            if (p.name !== player.name && !p.shield) {
              return false;
            }
          }
        }

        if (oppoCard) {
          if (oppoCard.value > playCard.value) {
            io().to(this.id).emit('result', 'baron out', player.name);
          } else if (oppoCard.value < playCard.value) {
            io().to(this.id).emit('result', 'baron out', opponent.name);
          } else {
            io().to(this.id).emit('result', 'baron out', null);
          }
        }
        break;

      case 'handmaid':
        player.shield = true;
        break;

      case 'prince':
        let cardplay: string;
        if (opponent.name === player.name) {
          if (card === 0) {
            cardplay = player.handCard[1].title;
          }
        }
        cardplay = opponent.handCard[0].title;

        if (cardplay === 'priness') {
          io().to(this.id).emit('result', 'priness', opponent.name);
        } else {
          let popCard = this.deck.pop();
          if (popCard) {
            opponent.handCard[0] = popCard;
            io().to(opponent.id).emit('result', 'prince', popCard.title);
          }
        }

        break;

      case 'king':
        console.log(`players before!!!: ${JSON.stringify(this.players)}`);

        //有可以指定的對象時
        if (opponent.handCard[0]) {
          let tempCard = opponent.handCard[0];

          console.log(`!!!!!!opponent card: ${tempCard.title}`);
          opponent.handCard[0] = player.peekOtherCard(card);
          io()
            .to(opponent.id)
            .emit('result', 'king', player.peekOtherCard(card).title);

          console.log(
            `!!!!!!!player card: ${player.peekOtherCard(card).title}`,
          );

          player.handCard[card] = tempCard;

          io().to(player.id).emit('result', 'king', tempCard.title);
        }

        break;

      case 'countess':
        break;

      case 'priness':
        io().to(this.id).emit('result', 'priness', player.name);
        break;

      default:
        break;
    }

    player.playCard(card);

    let pop = this.players.pop();
    if (pop) {
      this.players.unshift(pop);
    }

    console.log(`players!!!: ${JSON.stringify(this.players)}`);

    this.GameMachine.send('Play');
    return true;
  }

  // 玩家取得手上的卡牌
  getCard(playerID: string): string[] {
    let card: string[] = [];
    for (const player of this.players) {
      if (player.id == playerID) {
        for (const handCard of player.handCard) {
          card.push(handCard.title);
        }
        break;
      }
    }
    console.log(`game player${playerID} get card: ${card}`);
    return card;
  }
}

// Fisher-Yates ...
function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function makeNewDeck(): card[] {
  let deck: card[] = [];

  for (let i = 0; i < 5; i++) {
    deck.push(new Guard());
  }
  for (let i = 0; i < 2; i++) {
    deck.push(new Priest());
  }
  for (let i = 0; i < 2; i++) {
    deck.push(new Baron());
  }
  for (let i = 0; i < 2; i++) {
    deck.push(new Handmaid());
  }
  for (let i = 0; i < 2; i++) {
    deck.push(new Prince());
  }

  // for (let i = 0; i < 2; i++) {
  //   deck.push(new King());
  // }

  deck.push(new King());
  deck.push(new Countess());
  deck.push(new Priness());

  shuffle(deck);

  return deck;
}
