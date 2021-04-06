import card from './card';

export default class Player {
  handCard: card[];
  id: string;
  name: string;
  ready: boolean;
  shield: boolean;
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.handCard = [];
    this.ready = false;
    this.shield = false;
  }
  peekCard(index: number): card | null {
    if (index >= this.handCard.length) {
      return null;
    }
    return this.handCard[index];
  }

  peekOtherCard(index: number): card {
    if (index === 0) {
      return this.handCard[1];
    }
    return this.handCard[0];
  }

  playCard(index: number): boolean {
    if (index >= this.handCard.length) {
      return false;
    }
    this.handCard = this.handCard.splice(index - 1, 1);
    this.shield = false;
    return true;
  }
  drawCard(card: card) {
    this.handCard.push(card);
  }
}
