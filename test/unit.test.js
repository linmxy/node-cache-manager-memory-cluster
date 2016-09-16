var assert = require('assert');
var memoryStore = require('../lib/cache-manager-memory-cluster');

describe("master memory store", function () {
  describe("instantiating", function () {
    it("lets us pass in no args", function (done) {
      var memoryCache = memoryStore.create();
      var key = 'testKey';
      var value = 'testValue';
      memoryCache.set(key, value);
      var worker = require('child_process').fork('test/fork');
      worker.on('message', function (msg) {
        if (msg.cmd === 'mocha') {
          console.log('receieve msg from child', msg);
          assert.equal(msg.value, value);
          done();
        }
      });
      worker.send({
        cmd: 'mocha',
        key: key
      });
    });
  });
});

