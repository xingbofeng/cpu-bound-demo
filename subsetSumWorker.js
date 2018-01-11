"use strict";

const SubsetSum = require('./subsetSum');

process.on('message', msg => {  // 子进程在收到父进程消息时执行回调，其实是对subsetSum的事件做转发
  const subsetSum = new SubsetSum(msg.sum, msg.set);
  
  subsetSum.on('match', data => {  // 如果收到来自subsetSum的match事件，则向父进程发送收到的数据
    process.send({event: 'match', data: data});
  });
  
  subsetSum.on('end', data => { // 如果收到来自subsetSum的end事件，则向父进程发送收到的数据
    process.send({event: 'end', data: data});
  });
  
  subsetSum.start();
});
