export default abstract class Card {
  title: string;
  content: string;
  value: number;

  constructor(title: string, content: string, value: number) {
    this.title = title;
    this.content = content;
    this.value = value;
  }
}

// 1 衛兵
export class Guard extends Card {
  constructor() {
    super('guard', '猜一名對手手牌', 1);
  }
}

// 2 神父
export class Priest extends Card {
  constructor() {
    super('priest', '看一名對手手牌', 2);
  }
}

// 3 男爵
export class Baron extends Card {
  constructor() {
    super('baron', '和一名對手比手牌,小者出局', 3);
  }
}

// 4 侍女
export class Handmaid extends Card {
  constructor() {
    super('handmaid', '一輪內不受其他牌影響', 4);
  }
}

// 5 王子
export class Prince extends Card {
  constructor() {
    super('prince', '一名玩家棄掉手牌重抽', 5);
  }
}

// 6 國王
export class King extends Card {
  constructor() {
    super('king', '和對手交換手牌', 6);
  }
}

// 8 伯爵夫人
export class Countess extends Card {
  constructor() {
    super('countess', '手上有國王或王子時必須棄掉', 8);
  }
}

// 9 公主
export class Priness extends Card {
  constructor() {
    super('priness', '棄掉公主時出局', 9);
  }
}
