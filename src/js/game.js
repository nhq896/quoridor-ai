"use strict";

// thể hiện cho nước đi của quân cờ
const MOVE_UP = [-1, 0];
const MOVE_DOWN = [1, 0];
const MOVE_LEFT = [0, -1];
const MOVE_RIGHT = [0, 1];

// tạo mảng 2 chiều và gán giá trị khởi tạo
function create2DArrayInitializedTo(numOfRow, numOfCol, initialValue) {
  const arr2D = [];
  for (let i = 0; i < numOfRow; i++) {
    let row = [];
    for (let j = 0; j < numOfCol; j++) {
      row.push(initialValue);
    }
    arr2D.push(row);
  }
  return arr2D;
}

// gán 1 giá trị cho mọi phần tử của mảng 2 chiều
function set2DArrayEveryElementToValue(arr2D, value) {
  for (let i = 0; i < arr2D.length; i++) {
    for (let j = 0; j < arr2D[0].length; j++) {
      arr2D[i][j] = value;
    }
  }
}

// tạo mảng 2 chiều bằng cách clone từ mảng 2 chiều khác
function create2DArrayClonedFrom(arr2D) {
  const arr2DCloned = [];
  for (let i = 0; i < arr2D.length; i++) {
    arr2DCloned.push([...arr2D[i]]);
  }
  return arr2DCloned;
}

// thực hiện phép toàn AND giữa hai mảng 2 chiều, hai mảng 2 chiều này có kích thước bằng nhau
function logicalAndBetween2DArray(arr2DA, arr2DB) {
  const arr2D = [];
  for (let i = 0; i < arr2DA.length; i++) {
    let row = [];
    for (let j = 0; j < arr2DA[0].length; j++) {
      row.push(arr2DA[i][j] && arr2DB[i][j]);
    }
    arr2D.push(row);
  }
  return arr2D;
}

// thể hiện cho vị trí quân cờ
class PawnPosition {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }

  equals(otherPosition) {
    return this.row === otherPosition.row && this.col === otherPosition.col;
  }

  // trả về vị trí mới của quân cờ sau bước di chuyển
  newAddMove(pawnMoveTuple) {
    return new PawnPosition(
      this.row + pawnMoveTuple[0],
      this.col + pawnMoveTuple[1]
    );
  }
}

// thể hiện cho quân cờ
class Pawn {
  constructor(index, isHumanSide, isHumanPlayer, forClone = false) {
    this.index = null;
    this.isHumanSide = null;
    this.isHumanPlayer = null;
    this.position = null;
    this.goalRow = null;
    this.numberOfLeftWalls = null;
    if (!forClone) {
      // index === 0 thể hiện cho quân cờ được đi trước
      // index === 1 thể hiện cho quân cờ đi sau
      this.index = index;
      this.isHumanPlayer = isHumanPlayer;
      if (isHumanSide === true) {
        this.isHumanSide = true;
        this.position = new PawnPosition(8, 4);
        this.goalRow = 0;
      } else {
        this.isHumanSide = false;
        this.position = new PawnPosition(0, 4);
        this.goalRow = 8;
      }
      this.numberOfLeftWalls = 10;
    }
  }
}

// thể hiện cho bàn cờ
class Board {
  constructor(isHumanPlayerFirst, forClone = false) {
    this.pawns = null;
    this.walls = null;
    if (!forClone) {
      // this.pawns[0] thể hiện quân cờ được đi trước
      // this.pawns[1] thể hiện quân cờ đi sau
      if (isHumanPlayerFirst === true) {
        this.pawns = [new Pawn(0, true, true), new Pawn(1, false, false)];
      } else {
        this.pawns = [new Pawn(0, false, false), new Pawn(1, true, true)];
      }
      // horizontal, vertical: thể hiện mảng 2 chiều vị trí các bức tường
      // khởi tạo kích thước 8x8, true là có tường, false là không có tường
      this.walls = {
        horizontal: create2DArrayInitializedTo(8, 8, false),
        vertical: create2DArrayInitializedTo(8, 8, false),
      };
    }
  }
}

// thể hiện cho toàn bộ trò chơi và các luật trong trò chơi
class Game {
  constructor(isHumanPlayerFirst, forClone = false) {
    this.board = null;
    this.winner = null;
    this._turn = null;
    this.validNextWalls = null;
    this._probableNextWalls = null;
    this._probableValidNextWalls = null;
    this._probableValidNextWallsUpdated = null;
    this.openWays = null;
    this._validNextPositions = null;
    this._validNextPositionsUpdated = null;
    if (!forClone) {
      this.board = new Board(isHumanPlayerFirst);
      this.winner = null;
      this._turn = 0;

      // horizontal, vertical: thể hiện mảng 2 chiều các vị trí có thể đặt bức tường hợp lệ
      // khởi tạo kích thước 8x8, true là vị trí tường hợp lệ, false là vị trí tường không hợp lệ
      // được cập nhật mỗi khi đặt một bức tường
      this.validNextWalls = {
        horizontal: create2DArrayInitializedTo(8, 8, true),
        vertical: create2DArrayInitializedTo(8, 8, true),
      };

      // mảng 2 chiều những bức tường có thể xảy ra tiếp theo
      // dành cho bước mở rộng (expansion) của Monte Carlo Tree Search
      this._probableNextWalls = {
        horizontal: create2DArrayInitializedTo(8, 8, false),
        vertical: create2DArrayInitializedTo(8, 8, false),
      };
      this._probableValidNextWalls = null;
      this._probableValidNextWallsUpdated = false;

      // mảng 2 chiều kiểm tra các hướng đi của quân cờ (lên, xuống, trái, phải) có bị chặn bởi tường không
      // được cập nhật mỗi khi đặt một bức tường
      this.openWays = {
        upDown: create2DArrayInitializedTo(8, 9, true), // kiểm tra hai chiều lên, xuống
        leftRight: create2DArrayInitializedTo(9, 8, true), // kiểm tra hai chiều trái, phải
      };

      this._validNextPositions = create2DArrayInitializedTo(9, 9, false);
      this._validNextPositionsUpdated = false;
    }
  }

  get turn() {
    return this._turn;
  }

  set turn(newTurn) {
    this._turn = newTurn;
    this._validNextPositionsUpdated = false;
    this._probableValidNextWallsUpdated = false;
  }

  get pawn0() {
    return this.board.pawns[0];
  }

  get pawn1() {
    return this.board.pawns[1];
  }

  get pawnIndexOfTurn() {
    return this.turn % 2;
  }

  get pawnIndexOfNotTurn() {
    return (this.turn + 1) % 2;
  }

  get pawnOfTurn() {
    return this.board.pawns[this.pawnIndexOfTurn];
  }

  get pawnOfNotTurn() {
    return this.board.pawns[this.pawnIndexOfNotTurn];
  }

  // phương pháp đánh giá (heuristic):
  // trong bước mở rộng (expansion)
  // sẽ không xét tất cả các vị trí tường có thể đặt
  // mà chỉ xét những bức tường có thể xảy ra tiếp theo
  // đánh giá như vậy sẽ giảm được hệ số phân nhánh của cây tìm kiếm
  // -> có thể làm giảm không gian tìm kiếm
  //
  // những bức tường có thể xảy ra tiếp theo sẽ là:
  // 1. vị trí gần quân cờ (để gây cản trở cho đối thủ nhiều hơn)
  // 2. vị trí gần những bức tường đã được đặt trước đó
  //    (để mở rộng rào cản hoặc tạo ra các khu vực hạn chế di chuyển của đối thủ)
  // 3. vị trí tường nằm ngang ngoài cùng bên trái hoặc ngoài cùng bên phải
  //    (để tránh đối thủ chỉ đi ngoài rìa bàn cờ và tạo ra khu vực không thể chặn hợp lệ)

  // lấy ra vị trí những bức tường hợp lệ có thể xảy ra tiếp theo
  get probableValidNextWalls() {
    if (this._probableValidNextWallsUpdated) {
      // nếu các vị trí đã được cập nhật thì trả về danh sách hợp lệ
      return this._probableValidNextWalls;
    }
    this._probableValidNextWallsUpdated = true;

    // vị trí gần những bức tường đã được đặt trước đó
    const _probableValidNextWalls = {
      horizontal: create2DArrayClonedFrom(this._probableNextWalls.horizontal),
      vertical: create2DArrayClonedFrom(this._probableNextWalls.vertical),
    };

    // vị trí tường nằm ngang ngoài cùng bên trái hoặc ngoài cùng bên phải
    // chỉ xem xét đặt sau khi đã có 1 vài lượt đi
    // để hạn chế lãng phí tường chắn ngay từ đầu và bị đối thủ đoán ra chiến lược
    if (this.turn >= 6) {
      for (let i = 0; i < 8; i++) {
        _probableValidNextWalls.horizontal[i][0] = true;
        _probableValidNextWalls.horizontal[i][7] = true;
      }
    }

    // vị trí gần quân cờ
    // chỉ xem xét đặt sau khi đã có 1 vài lượt đi
    // để hạn chế lãng phí tường chắn ngay từ đầu và bị đối thủ đoán ra chiến lược
    if (this.turn >= 3) {
      Game.setWallsBesidePawn(_probableValidNextWalls, this.pawnOfNotTurn);
    }
    if (
      this.turn >= 6 ||
      indicesOfValueIn2DArray(this.board.walls.horizontal, true).length > 0 ||
      indicesOfValueIn2DArray(this.board.walls.vertical, true).length > 0
    ) {
      // support myself
      Game.setWallsBesidePawn(_probableValidNextWalls, this.pawnOfTurn);
    }
    _probableValidNextWalls.horizontal = logicalAndBetween2DArray(
      _probableValidNextWalls.horizontal,
      this.validNextWalls.horizontal
    );
    _probableValidNextWalls.vertical = logicalAndBetween2DArray(
      _probableValidNextWalls.vertical,
      this.validNextWalls.vertical
    );
    this._probableValidNextWalls = _probableValidNextWalls;
    return _probableValidNextWalls;
  }

  get validNextPositions() {
    if (this._validNextPositionsUpdated === true) {
      return this._validNextPositions;
    }
    this._validNextPositionsUpdated = true;

    set2DArrayEveryElementToValue(this._validNextPositions, false);

    this._set_validNextPositionsToward(MOVE_UP, MOVE_LEFT, MOVE_RIGHT);
    this._set_validNextPositionsToward(MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT);

    this._set_validNextPositionsToward(MOVE_LEFT, MOVE_UP, MOVE_DOWN);
    this._set_validNextPositionsToward(MOVE_RIGHT, MOVE_UP, MOVE_DOWN);

    return this._validNextPositions;
  }

  // check and set this._validNextPostions toward mainMove.
  // subMoves are needed for jumping case.
  _set_validNextPositionsToward(mainMove, subMove1, subMove2) {
    if (
      this.isValidNextMoveNotConsideringOtherPawn(
        this.pawnOfTurn.position,
        mainMove
      )
    ) {
      // mainMovePosition: the pawn's position after main move
      let mainMovePosition = this.pawnOfTurn.position.newAddMove(mainMove);
      // if the other pawn is on the position after main move (e.g. up)
      if (mainMovePosition.equals(this.pawnOfNotTurn.position)) {
        // check for jumping toward main move (e.g. up) direction
        if (
          this.isValidNextMoveNotConsideringOtherPawn(
            mainMovePosition,
            mainMove
          )
        ) {
          // mainMainMovePosition: the pawn's position after two main move
          let mainMainMovePosition = mainMovePosition.newAddMove(mainMove);
          this._validNextPositions[mainMainMovePosition.row][
            mainMainMovePosition.col
          ] = true;
        } else {
          // check for jumping toward sub move 1 (e.g. left) direction
          if (
            this.isValidNextMoveNotConsideringOtherPawn(
              mainMovePosition,
              subMove1
            )
          ) {
            // mainSub1MovePosition: the pawn's position after (main move + sub move 1)
            let mainSub1MovePosition = mainMovePosition.newAddMove(subMove1);
            this._validNextPositions[mainSub1MovePosition.row][
              mainSub1MovePosition.col
            ] = true;
          }
          // check for jumping toward sub move 2 (e.g. right) direction
          if (
            this.isValidNextMoveNotConsideringOtherPawn(
              mainMovePosition,
              subMove2
            )
          ) {
            // mainSub2MovePosition: the pawn's position after (main move + sub move 2)
            let mainSub2MovePosition = mainMovePosition.newAddMove(subMove2);
            this._validNextPositions[mainSub2MovePosition.row][
              mainSub2MovePosition.col
            ] = true;
          }
        }
      } else {
        this._validNextPositions[mainMovePosition.row][
          mainMovePosition.col
        ] = true;
      }
    }
  }

  // this method checks if the pawnMoveTuple of the pawn of this turn is valid against walls on the board and the board size.
  // this method do not check the validity against the other pawn's position.
  isValidNextMoveNotConsideringOtherPawn(currentPosition, pawnMoveTuple) {
    if (pawnMoveTuple[0] === -1 && pawnMoveTuple[1] === 0) {
      // up
      return (
        currentPosition.row > 0 &&
        this.openWays.upDown[currentPosition.row - 1][currentPosition.col]
      );
    }
    if (pawnMoveTuple[0] === 1 && pawnMoveTuple[1] === 0) {
      // down
      return (
        currentPosition.row < 8 &&
        this.openWays.upDown[currentPosition.row][currentPosition.col]
      );
    } else if (pawnMoveTuple[0] === 0 && pawnMoveTuple[1] === -1) {
      // left
      return (
        currentPosition.col > 0 &&
        this.openWays.leftRight[currentPosition.row][currentPosition.col - 1]
      );
    } else if (pawnMoveTuple[0] === 0 && pawnMoveTuple[1] === 1) {
      // right
      return (
        currentPosition.col < 8 &&
        this.openWays.leftRight[currentPosition.row][currentPosition.col]
      );
    } else {
      throw "pawnMoveTuple should be one of [1, 0], [-1, 0], [0, 1], [0, -1]";
    }
  }

  isOpenWay(currentRow, currentCol, pawnMoveTuple) {
    if (pawnMoveTuple[0] === -1 && pawnMoveTuple[1] === 0) {
      // up
      return currentRow > 0 && this.openWays.upDown[currentRow - 1][currentCol];
    } else if (pawnMoveTuple[0] === 1 && pawnMoveTuple[1] === 0) {
      //down
      return currentRow < 8 && this.openWays.upDown[currentRow][currentCol];
    } else if (pawnMoveTuple[0] === 0 && pawnMoveTuple[1] === -1) {
      // left
      return (
        currentCol > 0 && this.openWays.leftRight[currentRow][currentCol - 1]
      );
    } else if (pawnMoveTuple[0] === 0 && pawnMoveTuple[1] === 1) {
      // right
      return currentCol < 8 && this.openWays.leftRight[currentRow][currentCol];
    } else {
      throw "pawnMoveTuple should be one of [1, 0], [-1, 0], [0, 1], [0, -1]";
    }
  }

  movePawn(row, col, needCheck = false) {
    if (needCheck && this.validNextPositions[row][col] !== true) {
      return false;
    }
    this.pawnOfTurn.position.row = row;
    this.pawnOfTurn.position.col = col;
    if (this.pawnOfTurn.goalRow === this.pawnOfTurn.position.row) {
      this.winner = this.pawnOfTurn;
    }
    this.turn++;
    return true;
  }

  testIfAdjecentToOtherWallForHorizontalWallLeft(row, col) {
    if (col >= 1) {
      if (this.board.walls.vertical[row][col - 1]) {
        return true;
      }
      if (row >= 1) {
        if (this.board.walls.vertical[row - 1][col - 1]) {
          return true;
        }
      }
      if (row <= 6) {
        if (this.board.walls.vertical[row + 1][col - 1]) {
          return true;
        }
      }
      if (col >= 2) {
        if (this.board.walls.horizontal[row][col - 2]) {
          return true;
        }
      }
    }
    return false;
  }

  testIfAdjecentToOtherWallForHorizontalWallRight(row, col) {
    if (col <= 6) {
      if (this.board.walls.vertical[row][col + 1]) {
        return true;
      }
      if (row >= 1) {
        if (this.board.walls.vertical[row - 1][col + 1]) {
          return true;
        }
      }
      if (row <= 6) {
        if (this.board.walls.vertical[row + 1][col + 1]) {
          return true;
        }
      }
      if (col <= 5) {
        if (this.board.walls.horizontal[row][col + 2]) {
          return true;
        }
      }
    }
    return false;
  }

  testIfAdjecentToOtherWallForHorizontalWallMiddle(row, col) {
    if (row >= 1) {
      if (this.board.walls.vertical[row - 1][col]) {
        return true;
      }
    }
    if (row <= 6) {
      if (this.board.walls.vertical[row + 1][col]) {
        return true;
      }
    }
    return false;
  }

  testIfConnectedOnTwoPointsForHorizontalWall(row, col) {
    // if left side is connected with border of board or other wall
    const left =
      col === 0 ||
      this.testIfAdjecentToOtherWallForHorizontalWallLeft(row, col);
    // if right side is connected with border of board or other wall
    const right =
      col === 7 ||
      this.testIfAdjecentToOtherWallForHorizontalWallRight(row, col);
    const middle = this.testIfAdjecentToOtherWallForHorizontalWallMiddle(
      row,
      col
    );
    return (left && right) || (right && middle) || (middle && left);
  }

  testIfAdjecentToOtherWallForVerticalWallTop(row, col) {
    if (row >= 1) {
      if (this.board.walls.horizontal[row - 1][col]) {
        return true;
      }
      if (col >= 1) {
        if (this.board.walls.horizontal[row - 1][col - 1]) {
          return true;
        }
      }
      if (col <= 6) {
        if (this.board.walls.horizontal[row - 1][col + 1]) {
          return true;
        }
      }
      if (row >= 2) {
        if (this.board.walls.vertical[row - 2][col]) {
          return true;
        }
      }
    }
    return false;
  }

  testIfAdjecentToOtherWallForVerticalWallBottom(row, col) {
    if (row <= 6) {
      if (this.board.walls.horizontal[row + 1][col]) {
        return true;
      }
      if (col >= 1) {
        if (this.board.walls.horizontal[row + 1][col - 1]) {
          return true;
        }
      }
      if (col <= 6) {
        if (this.board.walls.horizontal[row + 1][col + 1]) {
          return true;
        }
      }
      if (row <= 5) {
        if (this.board.walls.vertical[row + 2][col]) {
          return true;
        }
      }
    }
    return false;
  }

  testIfAdjecentToOtherWallForVerticalWallMiddle(row, col) {
    if (col >= 1) {
      if (this.board.walls.horizontal[row][col - 1]) {
        return true;
      }
    }
    if (col <= 6) {
      if (this.board.walls.horizontal[row][col + 1]) {
        return true;
      }
    }
    return false;
  }

  testIfConnectedOnTwoPointsForVerticalWall(row, col) {
    // if top side is connected with border of board or other wall
    const top =
      row === 0 || this.testIfAdjecentToOtherWallForVerticalWallTop(row, col);
    // if bottom side is connected with border of board or other wall
    const bottom =
      row === 7 ||
      this.testIfAdjecentToOtherWallForVerticalWallBottom(row, col);
    const middle = this.testIfAdjecentToOtherWallForVerticalWallMiddle(
      row,
      col
    );
    return (top && bottom) || (bottom && middle) || (middle && top);
  }

  testIfExistPathsToGoalLinesAfterPlaceHorizontalWall(row, col) {
    // wall which does not connected on two points do not block path.
    if (!this.testIfConnectedOnTwoPointsForHorizontalWall(row, col)) {
      return true;
    }
    this.openWays.upDown[row][col] = false;
    this.openWays.upDown[row][col + 1] = false;
    const result = this._existPathsToGoalLines();
    this.openWays.upDown[row][col] = true;
    this.openWays.upDown[row][col + 1] = true;
    return result;
  }

  testIfExistPathsToGoalLinesAfterPlaceVerticalWall(row, col) {
    // wall which does not connected on two points do not block path.
    if (!this.testIfConnectedOnTwoPointsForVerticalWall(row, col)) {
      return true;
    }
    this.openWays.leftRight[row][col] = false;
    this.openWays.leftRight[row + 1][col] = false;
    const result = this._existPathsToGoalLines();
    this.openWays.leftRight[row][col] = true;
    this.openWays.leftRight[row + 1][col] = true;
    return result;
  }

  isPossibleNextMove(move) {
    const movePawnTo = move[0];
    const placeHorizontalWallAt = move[1];
    const placeVerticalWallAt = move[2];
    if (movePawnTo) {
      return this.validNextPositions[movePawnTo[0]][movePawnTo[1]];
    } else if (placeHorizontalWallAt) {
      return this.testIfExistPathsToGoalLinesAfterPlaceHorizontalWall(
        placeHorizontalWallAt[0],
        placeHorizontalWallAt[1]
      );
    } else if (placeVerticalWallAt) {
      return this.testIfExistPathsToGoalLinesAfterPlaceVerticalWall(
        placeVerticalWallAt[0],
        placeVerticalWallAt[1]
      );
    }
  }

  adjustProbableValidNextWallForAfterPlaceHorizontalWall(row, col) {
    if (row >= 1) {
      this._probableNextWalls.vertical[row - 1][col] = true;
    }
    if (row <= 6) {
      this._probableNextWalls.vertical[row + 1][col] = true;
    }
    if (col >= 1) {
      this._probableNextWalls.vertical[row][col - 1] = true;
      if (row >= 1) {
        this._probableNextWalls.vertical[row - 1][col - 1] = true;
      }
      if (row <= 6) {
        this._probableNextWalls.vertical[row + 1][col - 1] = true;
      }
      if (col >= 2) {
        this._probableNextWalls.horizontal[row][col - 2] = true;
        this._probableNextWalls.vertical[row][col - 2] = true;
        if (col >= 3) {
          this._probableNextWalls.horizontal[row][col - 3] = true;
        }
      }
    }
    if (col <= 6) {
      this._probableNextWalls.vertical[row][col + 1] = true;
      if (row >= 1) {
        this._probableNextWalls.vertical[row - 1][col + 1] = true;
      }
      if (row <= 6) {
        this._probableNextWalls.vertical[row + 1][col + 1] = true;
      }
      if (col <= 5) {
        this._probableNextWalls.horizontal[row][col + 2] = true;
        this._probableNextWalls.vertical[row][col + 2] = true;
        if (col <= 4) {
          this._probableNextWalls.horizontal[row][col + 3] = true;
        }
      }
    }
  }

  adjustProbableValidNextWallForAfterPlaceVerticalWall(row, col) {
    if (col >= 1) {
      this._probableNextWalls.horizontal[row][col - 1] = true;
    }
    if (col <= 6) {
      this._probableNextWalls.horizontal[row][col + 1] = true;
    }
    if (row >= 1) {
      this._probableNextWalls.horizontal[row - 1][col] = true;
      if (col >= 1) {
        this._probableNextWalls.horizontal[row - 1][col - 1] = true;
      }
      if (col <= 6) {
        this._probableNextWalls.horizontal[row - 1][col + 1] = true;
      }
      if (row >= 2) {
        this._probableNextWalls.vertical[row - 2][col] = true;
        this._probableNextWalls.horizontal[row - 2][col] = true;
        if (row >= 3) {
          this._probableNextWalls.vertical[row - 3][col] = true;
        }
      }
    }
    if (row <= 6) {
      this._probableNextWalls.horizontal[row + 1][col] = true;
      if (col >= 1) {
        this._probableNextWalls.horizontal[row + 1][col - 1] = true;
      }
      if (col <= 6) {
        this._probableNextWalls.horizontal[row + 1][col + 1] = true;
      }
      if (row <= 5) {
        this._probableNextWalls.vertical[row + 2][col] = true;
        this._probableNextWalls.horizontal[row + 2][col] = true;
        if (row <= 4) {
          this._probableNextWalls.vertical[row + 3][col] = true;
        }
      }
    }
  }

  placeHorizontalWall(row, col, needCheck = false) {
    if (
      needCheck &&
      !this.testIfExistPathsToGoalLinesAfterPlaceHorizontalWall(row, col)
    ) {
      return false;
    }
    this.openWays.upDown[row][col] = false;
    this.openWays.upDown[row][col + 1] = false;
    this.validNextWalls.vertical[row][col] = false;
    this.validNextWalls.horizontal[row][col] = false;
    if (col > 0) {
      this.validNextWalls.horizontal[row][col - 1] = false;
    }
    if (col < 7) {
      this.validNextWalls.horizontal[row][col + 1] = false;
    }
    this.board.walls.horizontal[row][col] = true;

    this.adjustProbableValidNextWallForAfterPlaceHorizontalWall(row, col);
    this.pawnOfTurn.numberOfLeftWalls--;
    this.turn++;
    return true;
  }

  placeVerticalWall(row, col, needCheck = false) {
    if (
      needCheck &&
      !this.testIfExistPathsToGoalLinesAfterPlaceVerticalWall(row, col)
    ) {
      return false;
    }
    this.openWays.leftRight[row][col] = false;
    this.openWays.leftRight[row + 1][col] = false;
    this.validNextWalls.horizontal[row][col] = false;
    this.validNextWalls.vertical[row][col] = false;
    if (row > 0) {
      this.validNextWalls.vertical[row - 1][col] = false;
    }
    if (row < 7) {
      this.validNextWalls.vertical[row + 1][col] = false;
    }
    this.board.walls.vertical[row][col] = true;

    this.adjustProbableValidNextWallForAfterPlaceVerticalWall(row, col);
    this.pawnOfTurn.numberOfLeftWalls--;
    this.turn++;
    return true;
  }

  // only one argument must be provided by 2-element array.
  // other two arguments must be null.
  doMove(move, needCheck = false) {
    if (this.winner !== null) {
      console.log("error: doMove after already terminal......"); // for debug
    }
    const movePawnTo = move[0];
    const placeHorizontalWallAt = move[1];
    const placeVerticalWallAt = move[2];
    if (movePawnTo) {
      return this.movePawn(movePawnTo[0], movePawnTo[1], needCheck);
    } else if (placeHorizontalWallAt) {
      return this.placeHorizontalWall(
        placeHorizontalWallAt[0],
        placeHorizontalWallAt[1],
        needCheck
      );
    } else if (placeVerticalWallAt) {
      return this.placeVerticalWall(
        placeVerticalWallAt[0],
        placeVerticalWallAt[1],
        needCheck
      );
    }
  }

  _existPathsToGoalLines() {
    return (
      this._existPathToGoalLineFor(this.pawnOfTurn) &&
      this._existPathToGoalLineFor(this.pawnOfNotTurn)
    );
  }

  // Intuitively DFS would be better than BFS on this function.
  // Tested somewhat between DFS and BFS for checking intuition.
  _existPathToGoalLineFor(pawn) {
    const visited = create2DArrayInitializedTo(9, 9, false);
    const pawnMoveTuples = [MOVE_UP, MOVE_LEFT, MOVE_RIGHT, MOVE_DOWN];
    const depthFirstSearch = function (currentRow, currentCol, goalRow) {
      for (const pawnMoveTuple of pawnMoveTuples) {
        if (this.isOpenWay(currentRow, currentCol, pawnMoveTuple)) {
          const nextRow = currentRow + pawnMoveTuple[0];
          const nextCol = currentCol + pawnMoveTuple[1];
          if (!visited[nextRow][nextCol]) {
            visited[nextRow][nextCol] = true;
            if (nextRow === goalRow) {
              return true;
            }
            if (depthFirstSearch.bind(this)(nextRow, nextCol, goalRow)) {
              return true;
            }
          }
        }
      }
      return false;
    };
    return depthFirstSearch.bind(this)(
      pawn.position.row,
      pawn.position.col,
      pawn.goalRow
    );
  }

  static setWallsBesidePawn(wall2DArrays, pawn) {
    const row = pawn.position.row;
    const col = pawn.position.col;
    if (row >= 1) {
      if (col >= 1) {
        wall2DArrays.horizontal[row - 1][col - 1] = true;
        wall2DArrays.vertical[row - 1][col - 1] = true;
        if (col >= 2) {
          wall2DArrays.horizontal[row - 1][col - 2] = true;
        }
      }
      if (col <= 7) {
        wall2DArrays.horizontal[row - 1][col] = true;
        wall2DArrays.vertical[row - 1][col] = true;
        if (col <= 6) {
          wall2DArrays.horizontal[row - 1][col + 1] = true;
        }
      }
      if (row >= 2) {
        if (col >= 1) {
          wall2DArrays.vertical[row - 2][col - 1] = true;
        }
        if (col <= 7) {
          wall2DArrays.vertical[row - 2][col] = true;
        }
      }
    }
    if (row <= 7) {
      if (col >= 1) {
        wall2DArrays.horizontal[row][col - 1] = true;
        wall2DArrays.vertical[row][col - 1] = true;
        if (col >= 2) {
          wall2DArrays.horizontal[row][col - 2] = true;
        }
      }
      if (col <= 7) {
        wall2DArrays.horizontal[row][col] = true;
        wall2DArrays.vertical[row][col] = true;
        if (col <= 6) {
          wall2DArrays.horizontal[row][col + 1] = true;
        }
      }
      if (row <= 6) {
        if (col >= 1) {
          wall2DArrays.vertical[row + 1][col - 1] = true;
        }
        if (col <= 7) {
          wall2DArrays.vertical[row + 1][col] = true;
        }
      }
    }
  }
}
