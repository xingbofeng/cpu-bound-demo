"use strict";

const fork = require('child_process').fork;

class ProcessPool {
  constructor(file, poolMax) {
    this.file = file;
    this.poolMax = poolMax; // 进程池最大进程数量
    this.pool = []; // 准备运行的进程
    this.active = []; // 正在运行的进程列表，比poolMax数量少
    this.waiting = []; // 任务队列
  }

  /**
   * 取出一个进程，然后调用一个任务
   * @param  {Function} callback 
   */
  acquire(callback) {
    let worker;
    if(this.pool.length > 0) {  // 如果进程池中有准备好使用的进程可以取出，那就取出这个进程
      worker = this.pool.pop(); // 取出这个进程
      this.active.push(worker); // 把这个进程放入正在运行的进程列表
      return process.nextTick(callback.bind(null, null, worker)); // 在下一次Tick之前调用它的回调
    }

    if(this.active.length >= this.poolMax) {  // 如果进程池中没有准备好使用的进程，或者已经达到了最大进程运行数量，把这个任务放入等待队列
      return this.waiting.push(callback); // 放入等待队列
    }

    worker = fork(this.file);  // 否则，既不是进程池有进程可以取出，也不是达到最大进程数量，就创建一个进程
    this.active.push(worker); // 把当前进程放入正在运行的进程列表
    process.nextTick(callback.bind(null, null, worker)); // 在下一次Tick之前调用它的回调
  }

  /**
   * 释放正在运行的进程资源，把这个进程放回进程池
   * @param  {Object} worker 表示一个进程
   */
  release(worker) {
    if(this.waiting.length > 0) {  // 如果还有任务等待被执行，先把任务执行完毕
      const waitingCallback = this.waiting.shift(); // 取出等待队列的一个任务
      waitingCallback(null, worker); // 执行这个任务
    }
    this.active = this.active.filter(w => worker !==  w);  // 如果没有任务等待被执行了，则在正在运行的进程列表找到这个进程，并在这个列表删掉它
    this.pool.push(worker); // 并把这个进程放到进程池里
  }
}

module.exports = ProcessPool;
