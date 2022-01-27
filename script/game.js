"use strict";

//data
var length = 4;
var livesCount = 3;
var safeClicksCount = 3;
var gBoard;
var gLevel;
var gGame;
var startTime; //interval ID
var firstClick = true;
var hintMode = false;
var seconds = 0;
//
//
// elements
var tableEl = document.querySelector("table");
var h1El = document.querySelector("h1");
var smile = document.querySelector(".smile");
var divlevelEl = document.querySelector(".lev");
var btnsEl = document.querySelectorAll(".levels");
var timeEl = document.querySelector("span");
var livesEl = document.querySelector(".lives span");
var safeBtnEl = document.querySelector(".safe span");
//
//
//

function init() {
  timeEl.innerText = 0;
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
  renderBoard(gLevel.size);
  firstClick = true;
}

function startGame(cellEl, iIdx, jIdx) {
  gBoard = buildBoard(gLevel.size, iIdx, jIdx);
  safeClick(); ////////////////////////////////////////////////////////////////////////////DELET
  renderBoard(gLevel.size, iIdx, jIdx);
  firstClick = false;
  startTime = setInterval(countSeconds, 1000);

  showNeighbors(cellEl, iIdx, jIdx);
}

function countSeconds() {
  firstClick = false;
  seconds += 1;
  // secFixed = seconds.toFixed(1);
  timeEl.innerText = seconds;
}

function changeLevel(btnEl) {
  if (divlevelEl.classList.contains(btnEl.innerText)) return;
  var currClass = divlevelEl.classList[1];
  var prevBtn = document.querySelector(`.curr`);
  //update DOMs
  divlevelEl.classList.remove(currClass);
  divlevelEl.classList.add(btnEl.innerText);
  prevBtn.classList.remove(`curr`);
  btnEl.classList.add(`curr`);
  //update game
  if (btnEl.innerText === "easy") length = 4;
  if (btnEl.innerText === "medium") length = 8;
  if (btnEl.innerText === "hard") length = 12;
  clearTime();
  newGame();
}

function newGame() {
  livesCount = 3;
  safeClicksCount = 3;
  safeBtnEl.innerText = 3;
  livesEl.innerText = 3;
  tableEl.innerHTML = "";
  smile.style.backgroundImage = 'url("css/happy.png")';
  clearTime();
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

function buildBoard(length, idxI, idxJ) {
  var cellsArray = createCellsArray();

  var content;
  var board = [];
  for (var i = 0; i < length; i++) {
    board.push([]);
    for (var j = 0; j < length; j++) {
      if (i === idxI && j === idxJ) {
        board[i][j] = {
          isShown: false,
          isMine: false,
          isMarked: false,
        };
      } else {
        content = drawCellData(cellsArray);
        board[i][j] = {
          isShown: false,
          isMine: content === "*" ? true : false,
          isMarked: false,
        };
      }
    }
  }
  setMinesNegsCount(board);
  return board;
}

function rightClick(cellEl, idxI, idxJ) {
  window.event.preventDefault();
  if (!gGame.isOn) return;
  if (firstClick) return;
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

function leftClick(cellEl, iIdx, jIdx) {
  if (firstClick) {
    startGame(cellEl, iIdx, jIdx);
    return;
  }
  if (!gGame.isOn) return;
  var gCell = gBoard[iIdx][jIdx];
  if (gCell.isMarked) return;
  //   var location = getDataFromElement();
  if (gCell.isMine) {
    mineClicked(cellEl);
    return;
  }

  showNeighbors(cellEl, iIdx, jIdx);
}

function safeClick() {
  if (safeClicksCount === 0 || !gGame.isOn || firstClick) return;
  var safeLocationsArr = getSafeCells();
  if (!safeLocationsArr.length) return;
  safeClicksCount--;
  safeBtnEl.innerText = safeClicksCount;
  var randSafeLocation =
    safeLocationsArr[getRandomInt(0, safeLocationsArr.length)];
  var safeCellEl = document.querySelector(
    `.cell-${randSafeLocation.iIdx}-${randSafeLocation.jIdx}`
  );
  safeCellEl.classList.add("safe-cell");
  setTimeout(() => {
    safeCellEl.classList.remove("safe-cell");
  }, 700);
}

function getSafeCells() {
  var gCell;
  var safesArr = [];
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      gCell = gBoard[i][j];
      if (!gCell.isMine && !gCell.isShown && !gCell.isMarked)
        safesArr.push({ iIdx: i, jIdx: j });
    }
  }
  return safesArr;
}

function showNeighbors(cellEl, iIdx, jIdx) {
  var gCell = gBoard[iIdx][jIdx];
  if (gCell.isShown) return;
  gCell.isShown = true;
  cellEl.classList.add("shown");
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

          showNeighbors(neigCellEl, i, j);
        }

        gBoard[i][j].isShown = true;
        gGame.shownCount++;
      }
    }
  }
  cellEl.classList.add("shown");
}

function mineClicked(cellEl) {
  if (!livesCount) {
    gameOver(cellEl);
    return;
  }
  livesCount--;
  livesEl.innerText = livesCount;
  cellEl.classList.add("shown");
  cellEl.innerText = "💣";
  setTimeout(() => {
    cellEl.classList.remove("shown");
    cellEl.innerText = "";
  }, 300);
}

function gameOver(cellEl) {
  clearTime();
  smile.style.backgroundImage = 'url("css/sad.png")';
  cellEl.classList.add("boom");
  showAllMines();
  gGame.isOn = false;
}

function victory() {
  smile.style.backgroundImage = 'url("css/win1.png")';
  clearTime();
  showAllMines();
  gGame.isOn = false;
}

function clearTime() {
  clearInterval(startTime);
  seconds = 0;
}

function renderBoard(length, iIdx = -1, jIdx = -1) {
  tableEl.innerHTML = "";
  var str = ``;
  for (var i = 0; i < length; i++) {
    str += `<tr>`;
    for (var j = 0; j < length; j++) {
      if (i === iIdx && j === jIdx) {
        var cellText =
          gBoard[iIdx][jIdx].minesAroundCount > 0
            ? gBoard[iIdx][jIdx].minesAroundCount
            : "";
        str += `<td class="cell cell-${i}-${j} shown" oncontextmenu="rightClick(this, ${i}, ${j})" onclick="leftClick(this, ${i}, ${j})" onmouseover="mouseOn(this)" onmouseleave="mouseOff(this)">${cellText}</td>`;
      } else {
        str += `<td class="cell cell-${i}-${j}" oncontextmenu="rightClick(this, ${i}, ${j})" onclick="leftClick(this, ${i}, ${j})" onmouseover="mouseOn(this)" onmouseleave="mouseOff(this)"></td>`;
      }
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
  var cellsArr = getEmptyArr(length ** 2 - minesAmmount - 1);

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

// function getDataFromElement(cellEl) {
//   var classEl = cellEl.classList[1];
//   var data = {};
//   data.i = classEl.split("-")[1];
//   data.j = classEl.split("-")[2];
//   return data;
// }
