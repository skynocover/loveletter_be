import player from './player';
import GameService from '../game/machine';
import card from './card';

class Board {
  private players: player[];
  private deck: card[];
  constructor() {
    this.players = [];
    this.deck = [];
  }

  newPlayer(id: string, name: string) {
    this.players.push(new player(id, name));
  }

  allPlayers() {
    return this.players;
  }

  delPlayer(id: string) {
    let index = -1;
    for (const i in this.players) {
      if (this.players[i].id === id) {
        index = +i;
      }
    }
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  readyPlayer(name: string, ready: boolean) {
    for (const player of this.players) {
      if (player.name === name) {
        player.ready = ready;
      }
    }
  }

  startGame() {
    if (this.players.length < 1 || this.players.length > 5) {
      return false;
    }

    let unReadyPlayer = this.players.filter((item) => {
      return item.ready === false;
    });
    if (unReadyPlayer.length === 0) {
      GameService.send('Ready', { players: this.players });
      return true;
    } else {
      return false;
    }
  }

  restartGame() {
    GameService.send('Restart');

    // this.constructor();
  }
}

const board = new Board();

export default board;
