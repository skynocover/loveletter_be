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
}

const board = new Board();

export default board;
