export default class Card {
  title: string;
  content: string;

  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
  }
}

export class Handmaid extends Card {
  super() {
    this.title = 'handmaid';
    this.content = '一輪內不受其他牌影響';
  }
}

export class Countess extends Card {
  super() {
    this.title = 'countess';
    this.content = '手上有國王或王子時必須棄掉';
  }
}

export class Baron extends Card {
  super() {
    this.title = 'baron';
    this.content = '和一名對手比手牌,小者出局';
  }
}

export class King extends Card {
  super() {
    this.title = 'king';
    this.content = '和對手交換手牌';
  }
}

export class Priest extends Card {
  super() {
    this.title = 'priest';
    this.content = '看一名對手手牌';
  }
}

export class Prince extends Card {
  super() {
    this.title = 'prince';
    this.content = '一名玩家棄掉手牌重抽';
  }
}

export class Guard extends Card {
  super() {
    this.title = 'guard';
    this.content = '猜一名對手手牌';
  }
}

export class princss extends Card {
  super() {
    this.title = 'priness';
    this.content = '棄掉公主時出局';
  }
}
