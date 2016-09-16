var fs = require('fs');
var util = require('util');
var assert = require('assert');

var support = {
  random: {
    string: function(strLen) {
      strLen = strLen || 8;
      var chars = "abcdefghiklmnopqrstuvwxyz";
      var randomStr = '';
      for (var i = 0; i < strLen; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomStr += chars.substring(rnum, rnum + 1);
      }
      return randomStr;
    },

    number: function(max) {
      max = max || 1000;
      return Math.floor((Math.random() * max));
    }
  },

  testSetGetDel: function(cache, cb) {
    var key = 'TEST' + support.random.string();
    var val = support.random.string();

    cache.set(key, val, function(err) {
      if (err) { return cb(err); }

      cache.get(key, function(err, result) {
        if (err) { return cb(err); }
        assert.equal(result, val);

        cache.del(key, function(err) {
          if (err) { return cb(err); }

          cache.get(key, function(err, result) {
            if (err) { return cb(err); }
            assert.ok(!result);
            cb();
          });
        });
      });
    });
  }
};

module.exports = support;