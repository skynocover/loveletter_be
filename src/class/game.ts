import card, { Guard } from './card';

export default class game {
  deck: card[];
  constructor(playNum: number) {
    this.deck = [];
    for (let i = 0; i < 5; i++) {
      this.deck.push(new Guard('', ''));
    }
    shuffle(this.deck);
  }
}

// Fisher-Yates ...
function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
