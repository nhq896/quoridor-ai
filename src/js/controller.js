"use strict";

class Controller {
  constructor(uctConst, humanMode = false) {
    this.humanMode = humanMode;
    // if (this.humanMode) {
    //   console.log("human mode");
    // }
    this.game = null;
    this.gameHistory = null;
    this.gameHistoryTrashCan = null; // cho chức năng Redo
    this.view = new View(this, this.humanMode);
    this.worker = null;
    this.numOfMCTSSimulations = null;
    this.uctConst = uctConst;
  }

  setNewWorker() {
    if (this.worker !== null) {
      this.worker.terminate();
    }
    this.worker = new Worker("js/worker.js");
    const onMessageFunc = function (event) {
      const data = event.data;
      if (typeof data === "number") {
        this.view.adjustProgressBar(data * 100);
      } else {
        const move = data;
        this.doMove(move);
      }
    };
    this.worker.onmessage = onMessageFunc.bind(this);
    this.worker.onerror = function (error) {
      //   console.log("worker error: " + error.message + "\n");
      throw error;
    };
  }

  startNewGame(isHumanPlayerFirst, numOfMCTSSimulations) {
    this.numOfMCTSSimulations = numOfMCTSSimulations;
    this.setNewWorker();
    let game = new Game(isHumanPlayerFirst);
    this.game = game;
    this.gameHistory = [];
    this.gameHistoryTrashCan = [];
    if (this.humanMode) {
      this.game.board.pawns[0].isHumanPlayer = true;
      this.game.board.pawns[1].isHumanPlayer = true;
    }
    this.gameHistory.push(Game.clone(this.game));
    this.view.game = this.game;
    this.view.render();
    if (!this.humanMode && !isHumanPlayerFirst) {
      this.aiDo();
    }
  }

  doMove(move) {
    if (this.game.doMove(move, true)) {
      this.gameHistory.push(Game.clone(this.game));
      this.gameHistoryTrashCan = [];
      this.view.render();
      if (!this.game.pawnOfTurn.isHumanPlayer) {
        this.aiDo();
      }
    } else {
      this.view.printImpossibleWallMessage();
    }
  }

  undo() {
    this.setNewWorker();
    this.view.adjustProgressBar(0);

    // pop và push trạng thái hiện tại của trò chơi để redo
    this.gameHistoryTrashCan.push(this.gameHistory.pop());

    let game = this.gameHistory.pop(); // trở về 1 lượt trước
    while (!game.pawnOfTurn.isHumanPlayer) {
      this.gameHistoryTrashCan.push(game);
      game = this.gameHistory.pop(); // trở về 1 lượt trước lần nữa
    }
    this.game = game;
    this.gameHistory.push(Game.clone(this.game));
    this.view.game = this.game;
    this.view.render();
  }

  redo() {
    this.game = this.gameHistoryTrashCan.pop();
    this.gameHistory.push(Game.clone(this.game));
    this.view.game = this.game;
    this.view.render();
  }

  aiDo() {
    this.worker.postMessage({
      game: this.game,
      numOfMCTSSimulations: this.numOfMCTSSimulations,
      uctConst: this.uctConst,
      humanMode: this.humanMode,
    });
  }
}
