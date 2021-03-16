import card, { Guard } from './card';
import player from './player';

export default class game {
  deck: card[];
  players: player[];
  constructor(playNum: number) {
    ///// make the deck
    this.deck = [];
    for (let i = 0; i < 5; i++) {
      this.deck.push(new Guard('', ''));
    }

    shuffle(this.deck);

    this.players = [];
    for (let i = 0; i < playNum; i++) {
      let top = this.deck.pop();
      if (top) {
        this.players.push(new player(top));
      }
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
