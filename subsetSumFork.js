"use strict";

const EventEmitter = require('events').EventEmitter;
const ProcessPool = require('./processPool');
const workers = new ProcessPool(__dirname + '/subsetSumWorker.js', 2);

class SubsetSumFork extends EventEmitter {
  constructor(sum, set) {
    super();
    this.sum = sum;
    this.set = set;
  }

  /**
   * 开始执行SubsetSum计算任务
   */
  start() {
    workers.acquire((err, worker) => { // 尝试从进程池获得一个新进程
      worker.send({sum: this.sum, set: this.set}); // 创建成功后，给子进程发送一条消息，包含当前需要计算的列表和总和

      const onMessage = msg => {
        if (msg.event === 'end') {  // 如果子进程发出的是end事件，则首先去除worker的监听器，再把当前进程放回进程池
          worker.removeListener('message', onMessage); // 移除事件监听器，节省内存
          workers.release(worker); // 放回内存
        }

        this.emit(msg.event, msg.data); // 其它事件则放出给外部监听，match事件
      };
      worker.on('message', onMessage); // 监听子进程的消息
    });
  }
}

module.exports = SubsetSumFork;
