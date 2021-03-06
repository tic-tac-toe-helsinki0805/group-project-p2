const Player = require("./player");
const Board = require("./board");

class Game {
  constructor(name) {
    this.name = name;
    this.maxPlayers = 2;
    this.sockets = {};
    this.players = {};
    this.currentTurn = null;
    this.board = {};
    this.isStart = false;
    this.canPlay = false;
    this.canJoin = true;
    this.winner = {
      img: ""
    };
    setInterval(this.update.bind(this), 1000/15);
  }

  addPlayer(socket, username, img) {
    if (!this.canJoin) return;
    this.sockets[socket.id] = socket;
    this.players[socket.id] = new Player(socket.id, username, img);
    if (this.currentTurn == null) {
      this.currentTurn = socket.id
    };
    if (Object.keys(this.players).length == this.maxPlayers) {
      this.preStart()
    };
  }

  preStart() {
    if (this.interval) return;
    this.canJoin = false;
    let time = 5;
    this.interval = setInterval(() => {
      Object.keys(this.sockets).forEach(playerID => {
        let socket = this.sockets[playerID];
        socket.emit("waiting", time);
      });
      time--;
      if (time == -1) {
        clearInterval(this.interval);
        this.interval = null;
        this.start();
      }
    }, 1000);
  }

  removePlayer(socket) {
    if (socket.id == this.currentTurn) {
      this.nextPlayer(socket.id)
    };
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  start() {
    this.isStart = true;
    this.canPlay = true;
    this.board = new Board(this.maxPlayers + 1);
  }

  move(socketID, cellID) {
    if (!this.canPlay) return;
    if (socketID != this.currentTurn) return;

    this.board.move(this.players[socketID], cellID);
    if (this.board.win(socketID)) {
      this.canPlay = false;
      this.winner = this.players[socketID];
    }
    this.nextPlayer(socketID);
  }

  nextPlayer(socketID) {
    let playersID = [];
    for (let k in this.players) {
      playersID.push(k)
    };
    let i = playersID.indexOf(socketID);
    if (i + 1 >= playersID.length) {
      this.currentTurn = playersID[0]
    } else {
      this.currentTurn = playersID[i + 1]
    }
  }

  update() {
    if (this.isStart) {
      if (this.board.tie() && !this.winner.id) {
        this.canPlay = false;
        this.winner = {
          img: "https://previews.123rf.com/images/choostudio/choostudio1803/choostudio180300049/97413372-vector-game-over-phrase-in-pixel-art-8-bit-style-with-glitch-vhs-effect-three-color-half-shifted-let.jpg"
        };
      }
    }
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      socket.emit("update", this.createUpdate());
    })
  }

  createUpdate() {
    return {
      cells: this.board.cells,
      currentTurn: this.currentTurn,
      winner: this.winner,
      players: ObjToArr(this.players),
      isStart: this.isStart,
      roomID: this.name,
      size: this.board.size
    }
  }
}

function ObjToArr(arr) {
  return Object.keys(arr).map(function (key) {
    return arr[key];
  });
}

module.exports = Game;