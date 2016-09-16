var assert = require('assert');
var support = require('./support');
var memoryStore = require('../lib/cache-manager-memory-cluster');
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');

describe("master memory store", function() {
  describe("instantiating", function() {
    it("lets us pass in no args", function(done) {
      var memoryCache = memoryStore.create();
      //if (cluster.isMaster) {
      //  setTimeout(function() {
      //    done();
      //  }, 15000);
      //  for (var i = 0; i < 2; i++) {
      //    cluster.fork();
      //  }
      //} else {
        support.testSetGetDel(memoryCache, done);
      //}
    });
  });
});