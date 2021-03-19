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

export default class Game {
  deck: card[];
  //   players: player[];
  constructor(playNum: number) {
    ///// make the deck
    this.deck = [];
    for (let i = 0; i < 5; i++) {
      this.deck.push(new Guard());
    }
    for (let i = 0; i < 2; i++) {
      this.deck.push(new Priest());
    }
    for (let i = 0; i < 2; i++) {
      this.deck.push(new Baron());
    }
    for (let i = 0; i < 2; i++) {
      this.deck.push(new Handmaid());
    }
    for (let i = 0; i < 2; i++) {
      this.deck.push(new Prince());
    }

    this.deck.push(new King());
    this.deck.push(new Countess());
    this.deck.push(new Princss());

    shuffle(this.deck);

    //     this.players = [];
    //     for (let i = 0; i < playNum; i++) {
    //       let top = this.deck.pop();
    //       if (top) {
    //         this.players.push(new player(top));
    //       }
    //     }
  }
}

// Fisher-Yates ...
function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
