var memoryStore = require('../lib/cache-manager-memory-cluster');
var memoryCache = memoryStore.create();

process.on('message', function(msg){
  if(msg.cmd === 'mocha') {
    console.log('receieve msg from master', msg);
    memoryCache.get(msg.key, function(err, value){
      console.log(err, value);
      process.send({
        cmd: 'mocha',
        value: value
      });
      process.exit();
    });
  }
});
