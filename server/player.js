class Player {
  constructor(id, username, img) {
    this.username = username;
    this.id = id;
    this.img = img;
  }

  minimax(board, currentTurn, depth, alpha, beta, players) {
    let lastTurn = previousPlayer(players, currentTurn);
    let nextTurn = nextPlayer(players, currentTurn);
    //check win
    if (board.win(lastTurn)) {
      if (lastTurn == this.id) return { value: 20 + depth };
      return { value: -20 + depth };
    }
    if (!board.canPlay()) return { value: 0 }; //tie
    if (depth == 0) return { value: 0 }; //out of think

    let result = { value: 0, move: 0 };
    if (currentTurn == this.id) result.value = -1e8;
    else result.value = 1e8;

    for (let i = 0; i < board.size ** 2; i++) {
      if (board.cells[i].mark != "") continue;
      board.move(players[currentTurn], i);

      let temp = this.minimax(board, nextTurn, depth - 1, alpha, beta, players);
      if (currentTurn == this.id) {
        if (temp.value > result.value) result = { value: temp.value, move: i };
        if (temp.value == result.value && Math.random() > 0.5)
          result = { value: temp.value, move: i };
        alpha = Math.max(alpha, result.value);
      } else {
        if (temp.value < result.value) result = { value: temp.value, move: i };
        if (temp.value == result.value && Math.random() > 0.5)
          result = { value: temp.value, move: i };
        beta = Math.min(beta, result.value);
      }
      board.unMove(i);
      if (alpha >= beta) return result;
    }
    return result;
  } 
}

function nextPlayer(players, socketID) {
  let playersID = [];
  for (let k in players) {
    playersID.push(k);
  }
  let i = playersID.indexOf(socketID);

  if (i + 1 >= playersID.length) {
    return playersID[0]; // playersID[0]
  }

  return playersID[i + 1]; // playersID[1]
}

function previousPlayer(players, socketID) {
  let playersID = [];
  for (let k in players) {
    playersID.push(k);
  }

  let i = playersID.indexOf(socketID);

  if (i === 0) {
    return playersID[playersID.length - 1]; // playersID[1]
  }

  return playersID[i - 1]; // playersID[0]
}

module.exports = Player;