var assert = require('assert');
var memoryStore = require('../lib/cache-manager-memory-cluster');
var cluster = require('cluster');
var memoryCache = memoryStore.create();

if (cluster.isMaster) {
  var key = 'testKey';
  var value = 'testValue';
  memoryCache.set(key, value);
  var worker = cluster.fork();
  worker.on('message', function(msg){
    if(msg.cmd === 'mocha') {
      assert.equal(msg.value, value);
    }
  });
  worker.send({
    cmd: 'mocha',
    key: key
  });
} else {
  process.on('message', function(msg){
    if(msg.cmd === 'mocha') {
      memoryCache.get(msg.key, function(err, value){
        process.send({
          cmd: 'mocha',
          value: value
        });
        process.exit();
      });
    }
  });
}