export default class Card {
  title: string;
  content: string;

  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
  }
}

export class Guard extends Card {
  super() {
    this.title = 'guard';
    this.content = '猜一名對手手牌';
  }
}
