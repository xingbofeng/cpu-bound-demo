"use strict";

const http = require('http');
// 阻塞server进程的算法
const SubsetSum = require('./subsetSum');
// 使用setImmediate
// const SubsetSum = require('./subsetSumDefer');
// 使用子进程
// const SubsetSum = require('./subsetSumFork');

http.createServer((req, res) => {
  const url = require('url').parse(req.url, true);
  if(url.pathname === '/subsetSum') {
    const data = JSON.parse(url.query.data);
    res.writeHead(200);
    const subsetSum = new SubsetSum(url.query.sum, data);
    subsetSum.on('match', match => {
      res.write('Match: ' + JSON.stringify(match) + '\n');
    });
    subsetSum.on('end', () => res.end());
    subsetSum.start();
  } else {
    res.writeHead(200);
    res.end('I\m alive!\n');
  }
}).listen(8000, () => console.log('Started'));
