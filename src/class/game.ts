import card, {
  Guard,
  Priest,
  Baron,
  Handmaid,
  Prince,
  King,
  Countess,
  Princss,
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
    ///// make the deck
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
            Ready: { actions: () => {} },
            // Start: { target: 'beforeStart', actions: () => {} },
            Play: { target: 'roundStart' },
            End: 'endGame',
          },
          onEntry: () => {
            let popCard = this.deck.pop();
            if (popCard === undefined) {
              this.GameMachine.send('End');
              return true;
            }
            let popPlayer = this.currentPlayer();
            if (popCard && popPlayer) {
              popPlayer.drawCard(popCard);
              // console.log(JSON.stringify(popPlayer));
              io().to(popPlayer.id).emit('draw', popCard.title);
              return true;
            }
            return false;
          },
          onExit: () => {
            console.log('exit roundStart');
            // io().emit('Game', 'start');
          }, //退出
        },
        endGame: {
          on: {},
          onEntry: () => {
            console.log('end game');
          },
        },
      },
    });

    return interpret(GameMachine)
      .onTransition((state, context) => {})
      .start();
  }

  allPlayers() {
    return this.players;
  }

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
  playCard(id: string, card: number, opponent: string, selectCard: string) {
    console.log(
      `game: ${id} playcard: ${card}, opponent: ${opponent}, selectCard: ${selectCard}`,
    );

    let currPlayer = this.currentPlayer();
    if (currPlayer.id === id) {
      for (const p of this.players) {
        if (p.name === opponent) {
          this.cardCallback(currPlayer, p, card, selectCard);
        }
      }

      currPlayer.playCard(card);

      let pop = this.players.pop();
      if (pop) {
        this.players.unshift(pop);
      }

      this.GameMachine.send('Play');
      return true;
    }
    return false;
  }

  cardCallback(
    player: player,
    opponent: player,
    card: number,
    selectCard: string,
  ) {
    let playCard = player.peekCard(card);
    if (!playCard) {
      return;
    }
    switch (playCard.title) {
      case 'guard':
        if (opponent.peekCard(0)?.title === selectCard) {
          console.log('kill!!!');
        }
        break;
      case 'priest':
        console.log(`opponent Card: ${opponent.peekCard(0)?.title}`);
        break;
      case 'baron':
        console.log(`opponent Card: ${opponent.peekCard(0)?.title}`);
        console.log(`playerCard: ${player.peekOtherCard(card)?.title}`);
        break;
      case 'handmaid':
        break;
      case 'prince':
        opponent.playCard(0);
        let popCard = this.deck.pop();
        if (popCard) {
          opponent.drawCard(popCard);
        }
        break;
      case 'king':
        let tempCard = opponent.handCard[0];
        opponent.handCard[0] = player.peekOtherCard(card);
        player.handCard[0] = tempCard;

        break;
      case 'countess':
        break;
      case 'priness':
        console.log('u lose');
        break;

      default:
        break;
    }
  }

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
    console.log(`get card: ${card}`);
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

  deck.push(new King());
  deck.push(new Countess());
  deck.push(new Princss());

  shuffle(deck);

  return deck;
}
