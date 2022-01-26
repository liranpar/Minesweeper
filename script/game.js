"use strict";

//data
var length;
var gBoard;
var gLevel;
var gGame;

// elements
var tableEl = document.querySelector("table");
var h1El = document.querySelector("h1");
var smile = document.querySelector(".smile");

function init() {
  length = 4;
  gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    correctMarksCount: 0,
    secPassed: 0,
  };

  gLevel = {
    size: length,
    mines: calcMinesAmmount(),
  };
  gBoard = buildBoard(gLevel.size);
  console.log(gBoard);
  renderBoard(gBoard);
}

function newGame() {
  tableEl.innerHTML = "";
  smile.style.backgroundImage = 'url("css/happy.png")';
  init();
}

function countMineNeighbors(board, rowIdx, colIdx) {
  var count = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue;
      if (j < 0 || j > length - 1) continue;
      if (board[i][j].isMine) count++;
    }
  }
  return count;
}

function setMinesNegsCount(board) {
  for (var i = 0; i < length; i++) {
    for (var j = 0; j < length; j++) {
      if (!board[i][j].isMine) {
        board[i][j].minesAroundCount = countMineNeighbors(board, i, j);
      }
      //   console.log(countMineNeighbors(i, j));
    }
  }
}

function buildBoard(length) {
  var cellsArray = createCellsArray();

  var content;
  var board = [];
  for (var i = 0; i < length; i++) {
    board.push([]);
    for (var j = 0; j < length; j++) {
      content = drawCellData(cellsArray);
      board[i][j] = {
        isShown: false,
        isMine: content === "*" ? true : false,
        isMarked: false,
      };
    }
  }
  setMinesNegsCount(board);
  return board;
}

function leftClick(cellEl, iIdx, jIdx) {
  if (!gGame.isOn) return;
  var gCell = gBoard[iIdx][jIdx];
  if (gCell.isMarked || gCell.isShown) return;
  //   var location = getDataFromElement();
  if (gCell.isMine) {
    gameOver(cellEl);
    return;
  }
  gCell.isShown = true;

  showNeighbors(cellEl, iIdx, jIdx);
}

function showNeighbors(cellEl, iIdx, jIdx) {
  cellEl.classList.add("shown");
  var gCell = gBoard[iIdx][jIdx];
  if (gCell.minesAroundCount) {
    cellEl.innerText = gCell.minesAroundCount;
  } else {
    cellEl.innerText = "";
    //
    //
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
      if (i < 0 || i > length - 1) continue;
      for (var j = jIdx - 1; j <= jIdx + 1; j++) {
        if (i === iIdx && j === jIdx) continue;
        if (j < 0 || j > length - 1) continue;
        if (
          gBoard[i][j].isMine ||
          gBoard[i][j].isMarked ||
          gBoard[i][j].isShown
        )
          continue;

        var neigCellEl = document.querySelector(`.cell-${i}-${j}`);
        if (gBoard[i][j].minesAroundCount) {
          neigCellEl.innerText = gBoard[i][j].minesAroundCount;
          neigCellEl.classList.add("shown");
        } else {
          neigCellEl.innerText = "";
          neigCellEl.classList.add("shown");

          //   showNeighbors(neigCellEl, i, j);
        }

        gBoard[i][j].isShown = true;
        gGame.shownCount++;
      }
    }
  }
}

function gameOver(cellEl) {
  smile.style.backgroundImage = 'url("css/sad.png")';
  console.log("GAME OVER");
  cellEl.classList.add("boom");
  showAllMines();
  gGame.isOn = false;
}

function victory() {
  console.log("victory!!!");
  console.log(gBoard);
  showAllMines();
  gGame.isOn = false;
}

// function getDataFromElement(cellEl) {
//   var classEl = cellEl.classList[1];
//   var data = {};
//   data.i = classEl.split("-")[1];
//   data.j = classEl.split("-")[2];
//   return data;
// }

function renderBoard(board) {
  var str = ``;
  var cellContent;
  for (var i = 0; i < board.length; i++) {
    str += `<tr>`;
    for (var j = 0; j < board.length; j++) {
      str += `<td class="cell cell-${i}-${j}" oncontextmenu="rightClick(this, ${i}, ${j})" onclick="leftClick(this, ${i}, ${j})" onmouseover="mouseOn(this)" onmouseleave="mouseOff(this)"></td>`;
    }
    str += `</tr>`;
  }

  tableEl.innerHTML = str;
}

function mouseOn(cellEl) {
  cellEl.style.backgroundColor = "rgb(15, 185, 15, 0.5)";
}

function mouseOff(cellEl) {
  cellEl.style.backgroundColor = "rgb(15, 185, 15)";
}

function calcMinesAmmount() {
  if (length === 4) return 2;
  if (length === 8) return 12;
  if (length === 12) return 30;
}

function createCellsArray() {
  var minesAmmount = calcMinesAmmount();
  var cellsArr = getEmptyArr(length ** 2 - minesAmmount);

  for (var i = 0; i < minesAmmount; i++) {
    cellsArr.push("*");
  }
  return cellsArr;
}

function showAllMines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      var cellEl = document.querySelector(`.cell-${i}-${j}`);
      if (gBoard[i][j].isMine) cellEl.innerText = "💣";
    }
  }
}

function rightClick(cellEl, idxI, idxJ) {
  window.event.preventDefault();
  if (!gGame.isOn) return;
  var gCell = gBoard[idxI][idxJ];
  if (gCell.isShown) return;

  if (gCell.isMarked) {
    gCell.isMarked = false;
    gGame.markedCount--;
    gGame.correctMarksCount += gCell.isMine ? -1 : 1;
  } else {
    gCell.isMarked = true;
    gGame.markedCount++;
    gGame.correctMarksCount += gCell.isMine ? 1 : -1;
  }

  if (gGame.correctMarksCount === gLevel.mines) victory();

  cellEl.classList.toggle("marked");
}
