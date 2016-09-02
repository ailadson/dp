"use strict";

class EditDistance {
  constructor(config) {
    config = config || {}
    if(config.indel) this.indel = config.indel
    if(config.match) this.match = config.match
  }

  rStringCompare(str1, str2, idx1, idx2) {
    idx1 = (idx1 === undefined ? str1.length : idx1)
    idx2 = (idx2 === undefined ? str2.length : idx2)

    if(idx1 === 0){ return idx2 * this.indel(' ') }
    if(idx2 === 0){ return idx1 * this.indel(' ') }

    var costs = [];

    costs[EditDistance.MAT] = this.rStringCompare(str1, str2, idx1 - 1, idx2 - 1) + this.match(str1[idx1], str2[idx2])
    costs[EditDistance.INS] = this.rStringCompare(str1, str2, idx1, idx2 - 1) + this.indel(str2[idx2])
    costs[EditDistance.DEL] = this.rStringCompare(str1, str2, idx1 - 1, idx2) + this.indel(str1[idx1])

    var lowestCost = costs[EditDistance.MAT];

    for (var i = EditDistance.INS; i < EditDistance.DEL; i++) {
      if(lowestCost > costs[i]){
        lowestCost = costs[i];
      }
    }

    return lowestCost;
  }

  dpStringCompare(str1, str2) {
    var costs = [];
    var matrix = new Matrix(str1, str2);
    var m = matrix.m;

    for (var i = 1; i <= str1.length; i++) {
      for (var j = 1; j <= str2.length; j++) {
        costs[EditDistance.MAT] = m[i - 1][j - 1].cost + this.match(str1[i], str2[j]);
        costs[EditDistance.INS] = m[i][j - 1].cost + this.indel(str2[j]);
        costs[EditDistance.DEL] = m[i - 1][j].cost + this.indel(str1[i]);

        m[i][j].cost = costs[EditDistance.MAT];
        m[i][j].parent = EditDistance.MAT;

        for (var k = EditDistance.INS; k < EditDistance.DEL; k++) {
          if(costs[k] < m[i][j].cost){
            m[i][j].cost = costs[k];
            m[i][j].parent = k;
          }
        }
      }
    }

    return matrix.reconstructPath(str1, str2);
  }

  indel(char){
    return 1;
  }

  match(char1, char2){
      return (char1 === char2 ? 0 : 1)
  }
}

EditDistance.MAT = 0;
EditDistance.INS = 1;
EditDistance.DEL = 2;

class Matrix {
    constructor(str1, str2) {
      this.m = [];

      for (var i = 0; i <= str1.length; i++) {
        this.m[i] = [];
        for (var j = 0; j <= str2.length; j++) {
          this.m[i][j] = { cost : null, parent : null };
          if(i === 0) { this.rowInit(j) };
        }
        this.colInit(i);
      }
    }

    rowInit(i){
      this.m[0][i].cost = i;

      if(i === 0) {
        this.m[0][i].parent = -1
      } else {
        this.m[0][i].parent = EditDistance.INS
      }
    }

    colInit(i){
      this.m[i][0].cost = i;

      if(i === 0) {
        this.m[i][0].parent = -1
      } else {
        this.m[i][0].parent = EditDistance.DEL
      }
    }

    reconstructPath(str1, str2, idx1, idx2) {
      idx1 = (idx1 === undefined ? str1.length - 1 : idx1)
      idx2 = (idx2 === undefined ? str2.length - 1 : idx2)
      // console.log(this.m[idx1]);
      if(this.m[idx1][idx2].parent == -1){
        return "";
      }

      if(this.m[idx1][idx2].parent == EditDistance.MAT){
        var path = this.reconstructPath(str1, str2, idx1 - 1, idx2 - 1)
        return path + this.matchOut(str1[idx1], str2[idx2]);
      }

      if(this.m[idx1][idx2].parent == EditDistance.INS){
        var path = this.reconstructPath(str1, str2, idx1, idx2 - 1)
        return path + this.insertOut(str2[idx2]);
      }

      if(this.m[idx1][idx2].parent == EditDistance.DEL){
        var path = this.reconstructPath(str1, str2, idx1 - 1, idx2)
        return path + this.deleteOut(str1[idx1]);
      }
    }

    matchOut(char1, char2) {
      return (char1 === char2 ? "M" : "S")
    }

    insertOut(char) {
      return "I"
    }

    deleteOut(char) {
      return "D"
    }
}

var e = new EditDistance();

console.log(e.dpStringCompare(" thou shalt not", " you should not"));
