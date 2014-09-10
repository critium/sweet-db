var assert = require("assert")

/**
 * A better way to compare two objects in Javascript
 **/
function getKeys(obj) {
  var keys;
  if(obj.keys) {
    keys = obj.keys();
  } else {
    keys = [];

    for(var k in obj) {
      if(Object.prototype.hasOwnProperty.call(obj, k)) {
        keys.push(k);
      }
    }
  }

  return keys;
}

/**
 * Create a new object so the keys appear in the provided order.
 * @param {Object} obj The object to be the base for the new object
 * @param {Array} keys The order in which properties of the new object should appear
 **/
function reconstructObject(obj, keys) {
  var result = {};
  for (var i = 0, l = keys.length; i < l; i++) {
    if (Object.prototype.hasOwnProperty.call(obj, keys[i])) {
      result[keys[i]] = obj[keys[i]];
    }
  }

  return result;
}

function assertObjectEqual(a, b, msg) {
  msg = msg || '';
  if( Object.prototype.toString.call( a ) === '[object Array]' && Object.prototype.toString.call( b ) === '[object Array]') {
    // special case: array of objects
    if (a.filter(function(e) { return Object.prototype.toString.call( e ) === '[object Object]' }).length > 0 ||
        b.filter(function(e) { return Object.prototype.toString.call( e ) === '[object Object]' }).length > 0 ){

      if (a.length !== b.length) {
        assert.equal(JSON.stringify(a), JSON.stringify(b), msg);
      } else {
        for(var i = 0, l = a.length; i < l; i++) {
          assertObjectEqual(a[i], b[i], msg + '[elements at index ' + i + ' should be equal]');
        }
      }
      // simple array of primitives
    } else {
      assert.equal(JSON.stringify(a), JSON.stringify(b), msg);
    }
  } else {
    var orderedA = reconstructObject(a, getKeys(a).sort()),
    orderedB = reconstructObject(b, getKeys(b).sort());

    // compare as strings for diff tolls to show us the difference
    assert.equal(JSON.stringify(orderedA), JSON.stringify(orderedB), msg);
  }
}

this.assertObjectEqual = assertObjectEqual
