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
        },
        roundStart: {
          on: {
            Ready: { actions: () => {} },
            Start: { target: 'beforeStart', actions: () => {} },
          },
          onEntry: () => {
            let popCard = this.deck.pop();
            let popPlayer = this.players.pop();
            if (popCard && popPlayer) {
              popPlayer.drawCard(popCard);
              this.players.unshift(popPlayer);
              console.log(JSON.stringify(this.players));
              io().to(popPlayer.id).emit('draw', popCard.title);
              return true;
            }
            return false;
          },
          onExit: () => {
            io().emit('Game', 'start');
          }, //退出
        },
      },
    });

    return interpret(GameMachine)
      .onTransition((state, context) => {})
      .start();
  }

  ready(name: string) {
    let i = 0;
    for (const p of this.players) {
      if (p.name === name) {
        p.ready = true;
        i++;
      } else if (p.ready) {
        i++;
      }
    }
    return i === this.players.length;
  }

  currentPlayer() {
    return this.players[this.players.length - 1];
  }
  playCard(id: string, card: number) {
    console.log('game. playcard: ', id, card);

    let popPlayer = this.players.pop();
    if (popPlayer) {
      popPlayer.playCard(card);
    }
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
