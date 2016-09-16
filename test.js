var memoryStore = require('./lib/cache-manager-memory-cluster');
var support = require('./test/support');
const cluster = require('cluster');

if (cluster.isMaster) {
  for (var i = 0; i < 2; i++) {
    cluster.fork();
  }
} else {
  var key = 'TEST' + support.random.string();
  var val = support.random.string();

  var cache = memoryStore.create();
  cache.set(key, val, function(err) {
    if (err) {
      console.log(err);
    }
    cache.get(key, function(err, result) {
      if (err) {
        console.log(err);
      }
      console.log(result);
    });
  });
}