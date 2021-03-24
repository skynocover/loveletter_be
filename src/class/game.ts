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

import { io } from '../socket/socket';

export default class Game {
  deck: card[];
  players: player[];
  //   players: player[];
  constructor(players: player[]) {
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

    this.players = [...players];
    shuffle(this.players);

    for (const player1 of this.players) {
      let popCard = this.deck.pop();
      if (popCard) {
        io().to(player1.id).emit('draw', popCard.title);
        player1.drawCard(popCard);
      }
    }

    this.drawCard();

    // console.log('new Deck: ' + JSON.stringify(this.deck));
    // console.log('new player: ' + JSON.stringify(this.players));
  }

  drawCard() {
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
