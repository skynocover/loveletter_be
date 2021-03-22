import card from './card';

export default class Player {
  handCard: card[];
  id: string;
  name: string;
  ready: boolean;
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.handCard = [];
    this.ready = false;
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
