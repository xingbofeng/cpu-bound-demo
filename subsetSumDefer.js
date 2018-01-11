"use strict";

const EventEmitter = require('events').EventEmitter;

class SubsetSumDefer extends EventEmitter {
  constructor(sum, set) {
    super();
    this.sum = sum;
    this.set = set;
    this.totalSubsets = 0;
  }

  /**
   * 增添一个_combineInterleaved方法，把计算过程放到setImmediate异步处理
   * @param  {Array} set
   * @param  {Array} subset
   */
  _combineInterleaved(set, subset) {
    this.runningCombine++;
    setImmediate(() => {
      this._combine(set, subset);
      if(--this.runningCombine === 0) {
        this.emit('end');
      }
    });
  }

  _combine(set, subset) {
    for(let i = 0; i < set.length; i++) {
      let newSubset = subset.concat(set[i]);
      // 替换到setImmediate
      this._combineInterleaved(set.slice(i + 1), newSubset);
      this._processSubset(newSubset);
    }
  }

  _processSubset(subset) {
    console.log('Subset', ++this.totalSubsets, subset);
    const res = subset.reduce((prev, item) => prev + item, 0);
    if(res == this.sum) {
      this.emit('match', subset);
    }
  }

  start() {
    // 设定一个计数器，计数器又归零的时候认为结束计算过程
    this.runningCombine = 0;
    this._combineInterleaved(this.set, []);
  }
}

module.exports = SubsetSumDefer;
