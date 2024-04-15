"use strict";

class View {
  constructor(controller, humanMode = false) {
    this.controller = controller;
    this.humanMode = humanMode;

    this._game = null;
    this.progressBarIntervalId = null; // Interval cho thanh tiến trình AI
    this.aiLevel = null; // tên của cấp độ khó
    this.numOfMCTSSimulations = null; // số mô phỏng tối đa khi thực hiện tính toán

    this.htmlBoardTable = document.getElementById("board_table"); // bàn cờ
    this.htmlPawns = [
      document.getElementById("pawn0"),
      document.getElementById("pawn1"),
    ]; // các quân cờ
    this.htmlMessageBox = document.getElementById("message_box"); // box thông điệp
    this.playerName = document.querySelectorAll(".player-name");
    this.htmlAboutBox = document.getElementById("about_box"); // box giới thiệu
    this.htmlChooseAILevelMessageBox = document.getElementById(
      "choose_ai_level_message_box"
    ); // box chọn level AI
    this.htmlChoosePawnMessageBox = document.getElementById(
      "choose_pawn_message_box"
    ); // box chọn quân cờ
    this.htmlRestartMessageBox = document.getElementById("restart_message_box"); // box xác nhận restart game

    let humanModeBtn = document.querySelector("#human-mode-button"); //
    humanModeBtn.onclick = () => {
      humanMode = true;
      controller = new Controller(0.2, humanMode);
      this.htmlChoosePawnMessageBox.classList.remove("hidden");
    };

    let closeInstruction = document.querySelector("#close-instruction");
    let instructionBtn = document.querySelector("#instruction-button");
    instructionBtn.onclick = () => {
      document.querySelector("#instruction").style.display = "flex";
    };
    closeInstruction.onclick = () => {
      document.querySelector("#instruction").style.display = "none";
    };

    // các nút chọn level AI
    const aiLevelButton = {
      easy: document.getElementById("easy_level"),
      medium: document.getElementById("medium_level"),
      hard: document.getElementById("hard_level"),
      // extreme: document.getElementById("extreme_level"),
    };
    const onclickAILevelButton = (e) => {
      const x = e.target;
      if (x.id === "easy_level") {
        this.aiLevel = "Dễ";
        this.numOfMCTSSimulations = 5000;
      } else if (x.id === "medium_level") {
        this.aiLevel = "Trung bình";
        this.numOfMCTSSimulations = 10000;
      } else if (x.id === "hard_level") {
        this.aiLevel = "Khó";
        this.numOfMCTSSimulations = 20000;
      }
      // } else if (x.id === "extreme_level") {
      //   this.aiLevel = "Siêu khó";
      //   this.numOfMCTSSimulations = 30000;
      // }
      console.log(this, this.numOfMCTSSimulations);
      this.htmlChooseAILevelMessageBox.classList.add("hidden");
      this.htmlChoosePawnMessageBox.classList.remove("hidden");
    };
    aiLevelButton.easy.onclick = onclickAILevelButton.bind(this);
    aiLevelButton.medium.onclick = onclickAILevelButton.bind(this);
    aiLevelButton.hard.onclick = onclickAILevelButton.bind(this);
    // aiLevelButton.extreme.onclick = onclickAILevelButton.bind(this);

    // chọn quân cờ
    const pawn0Button = document.getElementsByClassName("pawn pawn0 button")[0];
    const pawn1Button = document.getElementsByClassName("pawn pawn1 button")[0];
    const onclickPawnButton = function (e) {
      const x = e.target;
      if (x.classList.contains("pawn0")) {
        this.startNewGame(true, this.numOfMCTSSimulations);
      } else if (x.classList.contains("pawn1")) {
        this.startNewGame(false, this.numOfMCTSSimulations);
      }
      this.htmlAboutBox.classList.add("hidden");
      this.htmlChooseAILevelMessageBox.classList.remove(
        "choose_ai_level_message_box2"
      );
      this.htmlChoosePawnMessageBox.classList.remove(
        "choose_pawn_message_box2"
      );
    };
    pawn0Button.onclick = onclickPawnButton.bind(this);
    pawn1Button.onclick = onclickPawnButton.bind(this);

    this.button = {
      confirm: document.getElementById("confirm_button"),
      undo: document.getElementById("undo_button"),
      redo: document.getElementById("redo_button"),
    };
    this.button.confirm.disabled = true;
    this.button.undo.disabled = true;
    this.button.redo.disabled = true;

    const onclickUndoButton = function (e) {
      this.button.undo.disabled = true;
      this.button.redo.disabled = true;
      this.button.confirm.disabled = true;
      View.removePreviousFadeInoutBox();
      // View.cancelPawnClick();
      // View.cancelWallShadows();
      this.controller.undo();
    };
    this.button.undo.onclick = onclickUndoButton.bind(this);

    const onclickRedoButton = function (e) {
      this.button.redo.disabled = true;
      this.button.undo.disabled = true;
      this.button.confirm.disabled = true;
      // View.cancelPawnClick();
      // View.cancelWallShadows();
      this.controller.redo();
    };
    this.button.redo.onclick = onclickRedoButton.bind(this);

    const restartButton = document.getElementById("restart_button");
    const onclickRestartButton = function (e) {
      this.button.undo.disabled = true;
      this.button.redo.disabled = true;
      View.removePreviousFadeInoutBox();
      this.htmlAboutBox.classList.add("hidden");
      this.htmlChoosePawnMessageBox.classList.add("hidden");
      this.htmlChooseAILevelMessageBox.classList.add("hidden");
      this.htmlRestartMessageBox.classList.remove("hidden");
    };
    restartButton.onclick = onclickRestartButton.bind(this);

    const restartYesNoButton = {
      yes: document.getElementById("restart_yes"),
      no: document.getElementById("restart_no"),
    };
    const onclickRestartYesNoButton = function (e) {
      const x = e.target;
      this.htmlRestartMessageBox.classList.add("hidden");
      if (x.id === "restart_yes") {
        if (humanMode == true) {
          this.htmlChoosePawnMessageBox.classList.remove("hidden");
        } else {
          this.htmlChooseAILevelMessageBox.classList.remove("hidden");
        }
      } else {
        this.enableUndoRedoButtonIfNecessary();
      }
    };
    restartYesNoButton.yes.onclick = onclickRestartYesNoButton.bind(this);
    restartYesNoButton.no.onclick = onclickRestartYesNoButton.bind(this);

    const onclickAboutButton = function (e) {
      this.htmlMessageBox.innerText = "....";
      if (this.htmlAboutBox.classList.contains("hidden")) {
        this.button.undo.disabled = true;
        this.button.redo.disabled = true;
        View.removePreviousFadeInoutBox();
        this.htmlRestartMessageBox.classList.add("hidden");
        this.htmlChooseAILevelMessageBox.classList.add("hidden");
        this.htmlChooseAILevelMessageBox.classList.add(
          "choose_ai_level_message_box2"
        );
        this.htmlChoosePawnMessageBox.classList.add("hidden");
        this.htmlChoosePawnMessageBox.classList.add("choose_pawn_message_box2");
        this.htmlAboutBox.classList.remove("hidden");
      } else {
        this.htmlAboutBox.classList.add("hidden");
        this.enableUndoRedoButtonIfNecessary();
      }
    };
    const aboutButton = document.getElementById("about_button");
    aboutButton.onclick = onclickAboutButton.bind(this);

    const onclickCloseButtonInAbout = function (e) {
      humanMode = false;
      controller = new Controller(0.2, humanMode);
      this.htmlChooseAILevelMessageBox.classList.remove("hidden");
      // this.htmlAboutBox.classList.add("hidden");
      this.enableUndoRedoButtonIfNecessary();
    };
    const onclickCloseButtonInAboutFirst = function (e) {
      // this.htmlAboutBox.classList.add("hidden");
      humanMode = false;
      controller = new Controller(0.2, humanMode);
      this.htmlChooseAILevelMessageBox.classList.remove("hidden");
      // let grid1 = document.querySelector(".gridcontainer1");
      // grid1.style.display = "grid";
      closeButtonInAbout.onclick = onclickCloseButtonInAbout.bind(this);
    };
    const closeButtonInAbout = document.getElementById("about_close_button");
    closeButtonInAbout.onclick = onclickCloseButtonInAboutFirst.bind(this);

    const htmlConfirmButtonStyle = window.getComputedStyle(this.button.confirm);

    this.isHoverPossible = htmlConfirmButtonStyle.display === "none";
  }

  set game(game) {
    this._game = game;

    View.removeWalls();
    this.htmlPawns[0].classList.remove("hidden");
    this.htmlPawns[1].classList.remove("hidden");

    // khởi tạo ô chứa số tường
    let symbolPawnList = document.getElementsByClassName("pawn symbol");
    let wallNumList = document.getElementsByClassName("wall_num");
    if (this.game.board.pawns[0].goalRow === 8) {
      symbolPawnList[0].classList.remove("pawn1");
      wallNumList[0].classList.remove("pawn1");
      symbolPawnList[0].classList.add("pawn0");
      wallNumList[0].classList.add("pawn0");

      symbolPawnList[1].classList.remove("pawn0");
      wallNumList[1].classList.remove("pawn0");
      symbolPawnList[1].classList.add("pawn1");
      wallNumList[1].classList.add("pawn1");
      this.htmlWallNum = { pawn0: wallNumList[0], pawn1: wallNumList[1] };
    } else {
      symbolPawnList[0].classList.remove("pawn0");
      wallNumList[0].classList.remove("pawn0");
      symbolPawnList[0].classList.add("pawn1");
      wallNumList[0].classList.add("pawn1");

      symbolPawnList[1].classList.remove("pawn1");
      wallNumList[1].classList.remove("pawn1");
      symbolPawnList[1].classList.add("pawn0");
      wallNumList[1].classList.add("pawn0");
      this.htmlWallNum = { pawn0: wallNumList[1], pawn1: wallNumList[0] };
    }
  }
  get game() {
    return this._game;
  }

  startNewGame(isHumanPlayerFirst, numOfMCTSSimulations) {
    this.htmlChoosePawnMessageBox.classList.add("hidden");
    this.controller.startNewGame(isHumanPlayerFirst, numOfMCTSSimulations);
    if (this.humanMode) {
      this.playerName[0].innerText = "Player đen";
      this.playerName[1].innerText = "Player vàng";
    } else {
      this.playerName[0].innerHTML = `AI ${this.aiLevel}
                                      <div id="progress_bar" style="width: 0%"></div>
                                    `;
      this.playerName[1].innerText = "Player";
    }
  }

  // in ra các thông báo như lượt hoặc kết quả
  printMessage(message) {
    let textNode;
    for (let i = 0; i < this.htmlMessageBox.childNodes.length; i++) {
      if (this.htmlMessageBox.childNodes[i].nodeType === Node.TEXT_NODE) {
        textNode = this.htmlMessageBox.childNodes[i];
        break;
      }
    }
    textNode.nodeValue = message;
  }

  // in ra thông báo đặt tường không hợp lệ
  printImpossibleWallMessage() {
    View.removePreviousFadeInoutBox();
    const box = document.createElement("div");
    box.classList.add("fade_box");
    box.classList.add("inout");
    box.id = "note_message_box";
    box.innerHTML = "Chặn hoàn toàn đường đi tới đích là không hợp lệ.";
    const boardTableContainer = document.getElementById(
      "board_table_container"
    );
    boardTableContainer.appendChild(box);
  }

  // in ra kết quả trò chơi
  printGameResultMessage(message) {
    View.removePreviousFadeInoutBox();
    const box = document.createElement("div");
    box.classList.add("fade_box");
    box.classList.add("inout");
    box.id = "game_result_message_box";
    box.innerHTML = message;
    const boardTableContainer = document.getElementById(
      "board_table_container"
    );
    boardTableContainer.appendChild(box);
  }

  // render giao diện trò chơi
  render() {
    this._removePreviousRender();
    this._renderNumberOfLeftWalls();
    this._renderPawnPositions();
    this._renderWalls();
    if (this.game.winner !== null) {
      if (this.humanMode) {
        if (this.game.winner.index === 0) {
          this.printGameResultMessage("Bên vàng chiến thắng!");
          this.printMessage("Bên vàng thắng!");
        } else {
          this.printGameResultMessage("Bên đen chiến thắng!");
          this.printMessage("Bên đen thắng!");
        }
      } else if (this.game.winner.isHumanPlayer) {
        this.printGameResultMessage("Bạn đã đánh bại AI!");
        this.printMessage("Bạn thắng!");
      } else {
        this.printGameResultMessage("Bạn đã bị AI đánh bại!");
        this.printMessage("AI thắng!");
      }
    } else {
      if (this.humanMode) {
        this._renderValidNextPawnPositions();
        this._renderValidNextWalls();
        if (this.game.pawnOfTurn.index === 0) {
          this.printMessage("Lượt bên vàng");
        } else {
          this.printMessage("Lượt bên đen");
        }
      } else if (this.game.pawnOfTurn.isHumanPlayer) {
        this._renderValidNextPawnPositions();
        this._renderValidNextWalls();
        this.printMessage("Lượt của bạn");
      } else {
        this.printMessage("Lượt của AI");
      }
    }

    if (this.controller.gameHistory.length > 2) {
      this.button.undo.disabled = false;
    } else {
      this.button.undo.disabled = true;
    }

    if (this.controller.gameHistoryTrashCan.length > 0) {
      this.button.redo.disabled = false;
    } else {
      this.button.redo.disabled = true;
    }
  }

  // xóa phần giao diện được render trước đó
  _removePreviousRender() {
    for (let i = 0; i < this.htmlBoardTable.rows.length; i++) {
      for (let j = 0; j < this.htmlBoardTable.rows[0].cells.length; j++) {
        let element = this.htmlBoardTable.rows[i].cells[j];
        element.removeAttribute("onmouseenter");
        element.removeAttribute("onmouseleave");
        element.onclick = null;
      }
    }
    // xóa bóng cũ của quân cờ
    let previousPawnShadows = document.getElementsByClassName("pawn shadow");
    while (previousPawnShadows.length !== 0) {
      previousPawnShadows[0].remove();
    }
  }

  // render lại số tường còn lại của hai bên
  _renderNumberOfLeftWalls() {
    this.htmlWallNum.pawn0.innerHTML =
      this.game.board.pawns[0].numberOfLeftWalls;
    this.htmlWallNum.pawn1.innerHTML =
      this.game.board.pawns[1].numberOfLeftWalls;
  }

  // render lại vị trí hiện tại của quân cờ
  _renderPawnPositions() {
    this.htmlBoardTable.rows[this.game.board.pawns[0].position.row * 2].cells[
      this.game.board.pawns[0].position.col * 2
    ].appendChild(this.htmlPawns[0]);
    this.htmlBoardTable.rows[this.game.board.pawns[1].position.row * 2].cells[
      this.game.board.pawns[1].position.col * 2
    ].appendChild(this.htmlPawns[1]);
  }

  // render bóng mờ của quân cờ ở các vị trí hợp lệ
  _renderValidNextPawnPositions() {
    let onclickNextPawnPosition;
    if (this.isHoverPossible) {
      onclickNextPawnPosition = function (e) {
        const x = e.target;
        const row = x.parentElement.parentElement.rowIndex / 2;
        const col = x.parentElement.cellIndex / 2;
        this.controller.doMove([[row, col], null, null]);
      };
    } else {
      onclickNextPawnPosition = function (e) {
        // View.cancelPawnClick();
        // View.cancelWallShadows();
        const x = e.target;
        let pawnShadows = document.getElementsByClassName("pawn shadow");
        for (let i = 0; i < pawnShadows.length; i++) {
          if (pawnShadows[i] !== x) {
            pawnShadows[i].classList.add("hidden");
          }
        }
        x.classList.add("clicked");
        this.button.confirm.disabled = false;
      };
    }
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.game.validNextPositions[i][j] === true) {
          let element = this.htmlBoardTable.rows[i * 2].cells[j * 2];
          let pawnShadow = document.createElement("div");
          pawnShadow.classList.add("pawn");
          pawnShadow.classList.add("pawn" + this.game.pawnIndexOfTurn);
          pawnShadow.classList.add("shadow");
          element.appendChild(pawnShadow);
          pawnShadow.onclick = onclickNextPawnPosition.bind(this);
        }
      }
    }
  }

  // render tường
  _renderWalls() {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.game.board.walls.horizontal[i][j] === true) {
          let horizontalWall = document.createElement("div");
          horizontalWall.classList.add("horizontal_wall");
          if (
            !this.htmlBoardTable.rows[i * 2 + 1].cells[j * 2].hasChildNodes()
          ) {
            this.htmlBoardTable.rows[i * 2 + 1].cells[j * 2].appendChild(
              horizontalWall
            );
          }
        }
        if (this.game.board.walls.vertical[i][j] === true) {
          let verticalWall = document.createElement("div");
          verticalWall.classList.add("vertical_wall");
          if (
            !this.htmlBoardTable.rows[i * 2].cells[j * 2 + 1].hasChildNodes()
          ) {
            this.htmlBoardTable.rows[i * 2].cells[j * 2 + 1].appendChild(
              verticalWall
            );
          }
        }
      }
    }
  }

  // render ra bóng mờ tường nếu vị trí hợp lệ
  _renderValidNextWalls() {
    if (this.game.pawnOfTurn.numberOfLeftWalls <= 0) {
      return;
    }
    let onclickNextHorizontalWall, onclickNextVerticalWall;
    if (this.isHoverPossible) {
      onclickNextHorizontalWall = function (e) {
        const x = e.currentTarget;
        View.horizontalWallShadow(x, false);
        const row = (x.parentElement.rowIndex - 1) / 2;
        const col = x.cellIndex / 2;
        this.controller.doMove([null, [row, col], null]);
      };
      onclickNextVerticalWall = function (e) {
        const x = e.currentTarget;
        View.verticalWallShadow(x, false);
        const row = x.parentElement.rowIndex / 2;
        const col = (x.cellIndex - 1) / 2;
        this.controller.doMove([null, null, [row, col]]);
      };
    } else {
      onclickNextHorizontalWall = function (e) {
        // View.cancelPawnClick();
        // View.cancelWallShadows();
        const x = e.currentTarget;
        View.horizontalWallShadow(x, true);
        this.button.confirm.disabled = false;
        // this.button.cancel.disabled = false;
      };
      onclickNextVerticalWall = function (e) {
        // View.cancelPawnClick();
        // View.cancelWallShadows();
        const x = e.currentTarget;
        View.verticalWallShadow(x, true);
        this.button.confirm.disabled = false;
        // this.button.cancel.disabled = false;
      };
    }
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.game.validNextWalls.horizontal[i][j] === true) {
          let element = this.htmlBoardTable.rows[i * 2 + 1].cells[j * 2];
          if (this.isHoverPossible) {
            element.setAttribute(
              "onmouseenter",
              "View.horizontalWallShadow(this, true)"
            );
            element.setAttribute(
              "onmouseleave",
              "View.horizontalWallShadow(this, false)"
            );
          }
          element.onclick = onclickNextHorizontalWall.bind(this);
        }
        if (this.game.validNextWalls.vertical[i][j] === true) {
          let element = this.htmlBoardTable.rows[i * 2].cells[j * 2 + 1];
          if (this.isHoverPossible) {
            element.setAttribute(
              "onmouseenter",
              "View.verticalWallShadow(this, true)"
            );
            element.setAttribute(
              "onmouseleave",
              "View.verticalWallShadow(this, false)"
            );
          }
          element.onclick = onclickNextVerticalWall.bind(this);
        }
      }
    }
  }

  // điều chỉnh thanh tiến trình tính toán
  adjustProgressBar(percentage) {
    if (!this.humanMode) {
      percentage = Math.round(percentage);
      const htmlProgressBar = document.getElementById("progress_bar");
      if (this.progressBarIntervalId !== null) {
        clearInterval(this.progressBarIntervalId);
        this.progressBarIntervalId = null;
      }
      let width = parseInt(htmlProgressBar.style.width, 10);
      if (width > percentage) {
        width = 0;
        htmlProgressBar.style.width = width + "%";
      }
      const frame = () => {
        if (width >= percentage) {
          clearInterval(this.progressBarIntervalId);
          this.progressBarIntervalId = null;
          if (percentage >= 100) {
            width = 0;
            htmlProgressBar.style.width = width + "%";
          }
        } else {
          width++;
          htmlProgressBar.style.width = width + "%";
        }
      };
      if (percentage >= 100) {
        this.progressBarIntervalId = setInterval(frame.bind(this), 1);
      } else {
        this.progressBarIntervalId = setInterval(frame.bind(this), 10);
      }
    }
  }

  // bật nút Undo Redo
  enableUndoRedoButtonIfNecessary() {
    const gameHistory = this.controller.gameHistory;
    if (gameHistory !== null && gameHistory.length > 2) {
      this.button.undo.disabled = false;
    }

    const gameHistoryTrashCan = this.controller.gameHistoryTrashCan;
    if (gameHistoryTrashCan !== null && gameHistoryTrashCan.length > 0) {
      this.button.redo.disabled = false;
    }
  }

  // vẽ bóng mờ tường ngang để đặt tường
  static horizontalWallShadow(x, turnOn) {
    if (turnOn === true) {
      const _horizontalWallShadow = document.createElement("div");
      _horizontalWallShadow.classList.add("horizontal_wall");
      _horizontalWallShadow.classList.add("shadow");
      x.appendChild(_horizontalWallShadow);
    } else {
      while (x.firstChild) {
        x.removeChild(x.firstChild);
      }
    }
  }
  // vẽ bóng mờ tường dọc để đặt tường
  static verticalWallShadow(x, turnOn) {
    if (turnOn === true) {
      const _verticalWallShadow = document.createElement("div");
      _verticalWallShadow.classList.add("vertical_wall");
      _verticalWallShadow.classList.add("shadow");
      x.appendChild(_verticalWallShadow);
    } else {
      while (x.firstChild) {
        x.removeChild(x.firstChild);
      }
    }
  }

  /*static cancelWallShadows() {
    let previousWallShadows = document.getElementsByClassName(
      "horizontal_wall shadow"
    );
    while (previousWallShadows.length !== 0) {
      previousWallShadows[0].remove();
    }
    previousWallShadows = document.getElementsByClassName(
      "vertical_wall shadow"
    );
    while (previousWallShadows.length !== 0) {
      previousWallShadows[0].remove();
    }
  }*/

  /* static cancelPawnClick() {
    let pawnShadows = document.getElementsByClassName("pawn shadow");
    for (let i = 0; i < pawnShadows.length; i++) {
      pawnShadows[i].classList.remove("clicked");
      pawnShadows[i].classList.remove("hidden");
    }
  }*/

  // xóa box thông báo đã show trước đó
  static removePreviousFadeInoutBox() {
    let previousBoxes;
    if ((previousBoxes = document.getElementsByClassName("fade_box inout"))) {
      while (previousBoxes.length !== 0) {
        previousBoxes[0].remove();
      }
    }
  }

  // xóa toàn bộ tường cũ khi chơi game mới
  static removeWalls() {
    let previousWalls = document.querySelectorAll("td > .horizontal_wall");
    for (let i = 0; i < previousWalls.length; i++) {
      previousWalls[i].remove();
    }
    previousWalls = document.querySelectorAll("td > .vertical_wall");
    for (let i = 0; i < previousWalls.length; i++) {
      previousWalls[i].remove();
    }
  }
}
