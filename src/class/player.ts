import card from './card';

export default class player {
  handCard: card[];
  constructor(handcard: card) {
    this.handCard = [handcard];
  }
  playCard(index: number): boolean {
    if (index >= this.handCard.length) {
      return false;
    }
    this.handCard = this.handCard.splice(index - 1, 1);
    return true;
  }
  drawCard(card: card) {
    this.handCard.push(card);
  }
}
