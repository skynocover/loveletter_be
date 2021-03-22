import player from './player';

class Board {
  private players: player[];
  constructor() {
    this.players = [];
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
    let unReadyPlayer = this.players.filter((item) => {
      return item.ready === false;
    });
    if (unReadyPlayer.length === 0) {
      return false;
    } else {
      return true;
    }
  }
}

const board = new Board();

export default board;
