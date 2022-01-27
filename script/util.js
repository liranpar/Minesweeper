"use strict";

function getEmptyArr(n) {
  var arr = [];
  for (var i = 0; i < n; i++) {
    arr.push("");
  }
  return arr;
}

function drawCellData(cellData) {
  var idx = getRandomInt(0, cellData.length - 1);
  var num = cellData[idx];
  cellData.splice(idx, 1);
  return num;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
