var cluster = require('cluster');
var LRUCache = require('lru-cache');
var uuid = require('node-uuid');
var callbackMap = {};
var lru;

var LRUCacheProxy = function LRUCacheProxy(options) {
  if (!lru && cluster.isMaster) {
    lru = new LRUCache(options);
    var lruGet = LRUCache.prototype.get;
    lru.get = function (key, callback) {
      var ret = lruGet.apply(lru, arguments);
      callback && callback(ret);
      return ret;
    };
  }
}

var sendCommand = function (msg, callback) {
  if (callback) {
    var id = uuid.v4();
    callbackMap[id] = callback;
    msg.id = id;
  }
  process.send(msg);
}
LRUCacheProxy.prototype.get = function (key, callback) {
  var failSafe = setTimeout(function () {
    failSafe = undefined;
    callback(undefined);
  }, 200);
  if (cluster.isMaster) {
    return lru.get(key, callback);
  } else {
    sendCommand({
      id: id, cmd: 'get', key: key
    }, function (data) {
      clearTimeout(failSafe);
      callback(data);
    });
  }
}

LRUCacheProxy.prototype.set = function (key, value) {
  if (cluster.isMaster) {
    return lru.set(key, value);
  } else {
    sendCommand({cmd: 'set', key: key, value: value});
  }
};
LRUCacheProxy.prototype.del = function (key) {
  if (cluster.isMaster) {
    return lru.del(key);
  } else {
    sendCommand({cmd: 'del', key: key});
  }
};
LRUCacheProxy.prototype.keys = function () {
  if (cluster.isMaster) {
    return lru.del(key);
  } else {
    sendCommand({cmd: 'keys'});
  }
};
LRUCacheProxy.prototype.reset = function () {
  if (cluster.isMaster) {
    return lru.del(key);
  } else {
    sendCommand({cmd: 'keys'});
  }
};

if (cluster.isMaster) {
  process.on('message', function onWorkerMessage(msg) {
    if (!msg || msg.cmd !== 'lru-response') {
      return;
    }
    var id = msg.id;
    var value = msg.data;
    var callback = callbackMap[id];
    if (callback) {
      callback(value);
    }
  });
  cluster.on('fork', function (worker) {
    worker.on('message', function (msg) {
      if (msg.cmd === 'get') {
        var data = lru.get(msg.key);
        process.send({cmd: 'lru-response', data: data});
      } else if (msg.cmd === 'keys') {
        var data = lru.keys();
        process.send({cmd: 'lru-response', data: data});
      } else if (msg.cmd === 'set') {
        lru.set(msg.key, msg.value);
      } else if (msg.cmd === 'del') {
        lru.del(msg.key);
      } else if (msg.cmd === 'reset') {
        lru.reset();
      }
    });
  });
}

module.exports = LRUCacheProxy;