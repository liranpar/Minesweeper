"use strict";

//data
var length = 4;
var livesCount = 3;
var safeClicksCount = 3;
var sevenBoomMode = false;
var gBoard;
var gLevel;
var gGame;
var startTime; //interval ID
var firstClick = true;
var hintMode = false;
var hintsCount = 3;
var easyHighscore = Infinity;
var mediumHighscore = Infinity;
var hardHighscore = Infinity;
var seconds = 0;
//
//sounds
var lose = new Audio("sound/gameover.wav");
var win = new Audio("sound/win.wav");
//
// elements
var tableEl = document.querySelector("table");
var h1El = document.querySelector("h1");
var smile = document.querySelector(".smile");
var divlevelEl = document.querySelector(".lev");
var btnsEl = document.querySelectorAll(".levels");
var timeEl = document.querySelector(".time span");
var livesEl = document.querySelector(".lives span");
var safeBtnEl = document.querySelector(".safe span");
var hintEl = document.querySelector(".hint span");
var sevenEl = document.querySelector(".seven");
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
  if (sevenBoomMode) {
    cancelSevenMode();
    gBoard = buildSevenBoomBoard(gLevel.size, iIdx, jIdx);
  } else {
    gBoard = buildBoard(gLevel.size, iIdx, jIdx);
  }

  renderBoard(gLevel.size, iIdx, jIdx);
  firstClick = false;
  startTime = setInterval(countSeconds, 1000);
  gGame.shownCount++;
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
  hintMode = false;
  hintsCount = 3;
  tableEl.style.borderColor = "";
  tableEl.style.cursor = "default";
  hintEl.innerText = 3;
  livesCount = 3;
  safeClicksCount = 3;
  safeBtnEl.innerText = 3;
  livesEl.innerText = 3;
  tableEl.innerHTML = "";
  smile.style.backgroundImage = 'url("css/happy.png")';
  cancelSevenMode();
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
          cellIndex: 0,
          isShown: false,
          isMine: false,
          isMarked: false,
        };
      } else {
        content = drawCellData(cellsArray);
        board[i][j] = {
          cellIndex: 0,
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

  checkIfVictory();

  cellEl.classList.toggle("marked");
}

function leftClick(cellEl, iIdx, jIdx) {
  if (firstClick) {
    startGame(cellEl, iIdx, jIdx);
    return;
  }
  if (!gGame.isOn) return;
  var gCell = gBoard[iIdx][jIdx];
  if (gCell.isMarked || gCell.isShown) return;
  //   var location = getDataFromElement();
  if (hintMode) {
    ChosenCellHint(cellEl, iIdx, jIdx);
    return;
  }
  if (gCell.isMine) {
    mineClicked(cellEl);
    return;
  }
  gGame.shownCount++;
  showNeighbors(cellEl, iIdx, jIdx);
  checkIfVictory();
}

function ChosenCellHint(cellEl, iIdx, jIdx) {
  hintMode = false;
  var str;
  var gCell = gBoard[iIdx][jIdx];
  if (gCell.isMine) {
    str = "💣";
  } else {
    str = gCell.minesAroundCount;
  }
  cellEl.innerText = str;
  tableEl.style.borderColor = "";
  tableEl.style.cursor = "default";
  setTimeout(() => {
    cellEl.innerText = "";
  }, 500);
}

function hintClicked() {
  if (!gGame.isOn || firstClick || hintMode || !hintsCount) return;

  tableEl.style.borderColor = "blue";
  tableEl.style.cursor = "help";
  if (hintsCount === 3) showHintModal();
  hintsCount--;
  hintEl.innerText = hintsCount;
  hintMode = true;
}

function showHintModal() {
  gGame.isOn = false;
  var modalEl = document.querySelector(".modal");
  tableEl.style.filter = "blur(2px)";
  modalEl.style.display = "flex";
  setTimeout(() => {
    gGame.isOn = true;
    tableEl.style.filter = null;
    modalEl.style.display = "none";
  }, 2000);
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
  }, 1000);
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
  if (livesCount === 1) {
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
  lose.play();
  gGame.isOn = false;
}

function victory() {
  smile.style.backgroundImage = 'url("css/win1.png")';
  win.play();
  checkHighscore();
  showAllMines();
  clearTime();
  gGame.isOn = false;
}

function checkIfVictory() {
  if (
    gGame.correctMarksCount === gLevel.mines &&
    gGame.shownCount === gLevel.size ** 2 - gLevel.mines
  )
    victory();
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

function updateGLevelMines() {
  if (length === 4) return 2;
  if (length === 8) return 14;
  if (length === 12) return 40;
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

function checkHighscore() {
  var currClass = divlevelEl.classList[1];
  switch (currClass) {
    case "easy":
      if (seconds < easyHighscore) {
        easyHighscore = seconds;
        localStorage.setItem(currClass, easyHighscore + " seconds");
      }
      break;
    case "medium":
      if (seconds < mediumHighscore) {
        mediumHighscore = seconds;
        localStorage.setItem(currClass, mediumHighscore + " seconds");
      }
      break;
    case "hard":
      if (seconds < hardHighscore) {
        hardHighscore = seconds;
        localStorage.setItem(currClass, hardHighscore + " seconds");
      }
      break;
  }
}

function sevenBoom() {
  if (!firstClick || !gGame.isOn) return;
  sevenBoomMode = true;
  sevenEl.style.backgroundColor = "rgb(255, 53, 164)";
  sevenEl.style.color = "blue";
}

function cancelSevenMode() {
  sevenBoomMode = false;
  sevenEl.style.backgroundColor = "rgb(53, 0, 35)";
  sevenEl.style.color = "aqua";
}

function buildSevenBoomBoard(length, idxI, idxJ) {
  var indexCount = 0;
  var board = [];
  for (var i = 0; i < length; i++) {
    board.push([]);
    for (var j = 0; j < length; j++) {
      if (i === idxI && j === idxJ) {
        board[i][j] = {
          cellIndex: indexCount,
          isShown: false,
          isMine: false,
          isMarked: false,
        };
        indexCount++;
      } else {
        board[i][j] = {
          cellIndex: indexCount,
          isShown: false,
          isMine: checkSevenBoomCondition(indexCount),
          isMarked: false,
        };
        indexCount++;
      }
    }
  }
  gLevel.mines = updateGLevelMines();
  if (checkSevenBoomCondition(board[idxI][idxJ].cellIndex)) {
    gLevel.mines--;
  }
  console.log(gLevel);
  setMinesNegsCount(board);
  return board;
}

function checkSevenBoomCondition(indexCount) {
  return (
    (indexCount % 7 === 0 && indexCount !== 0) ||
    indexCount % 10 === 7 ||
    Math.floor(indexCount / 10) === 7
  );
}
