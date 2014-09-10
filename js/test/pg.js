var assert = require("assert")
var sDDL   = require('../lib/sddlparser')
var pgDef  = require('../lib/defaults/pg.json')

describe("pg_test1", function(){
  it('test 1 should match', function (){
    var sddlTest = { table: {
      id: { type: 'integer', nullable: 'false', key: 'true', autoinc: 'sequence' },
      name: { type: 'varchar(64)', nullable: 'true' },
      description: { type: 'varchar(256)', nullable: 'true' }
    }};

    var sDDLFile = runit("./test/resources/pg/pg_test1.json")
    assertObjectEqual(sddlTest, sDDLFile);
  });

  it("test 2 should match", function(){
    var sddlTest = { table: {
      id: { type: 'varchar(64)', nullable: 'false', key: 'true', autoinc: 'sequence' },
      name: { type: 'varchar(64)', nullable: 'false' },
      description: { type: 'varchar(256)', nullable: 'true' },
      ts:{type:"timestamp", nullable:"true"}
    }};

    var sDDLFile = runit("./test/resources/pg/pg_test2.json")
    assertObjectEqual(sddlTest, sDDLFile);
  })

  it("test 3 should match", function(){
    var sddlTest = { table: {
      test_hstore : { type : 'hstore', nullable           : 'true'},
      test_json   : { type : 'json', nullable             : 'true'},
      test_ts     : { type : 'timestamp', nullable        : 'true'},
      test_tx     : { type : 'varchar(64)', nullable      : 'true'},
      test_long   : { type : 'bigint', nullable           : 'false'},
      test_dbl    : { type : 'double precision', nullable : 'false'},
      test_int    : { type : 'integer', nullable          : 'false'},
      test_type   : { type : 'varchar(64)', nullable      : 'false'},
      test_id     : { type : 'integer', nullable          : 'false'},
      default     : { type : 'varchar(64)', nullable      : 'true'}
    }};

    var sDDLFile = runit("./test/resources/pg/pg_test3.json")
    assertObjectEqual(sddlTest, sDDLFile);
  })

})


var runit = function runit(path) {
 return sDDL.merge(
    pgDef,
    sDDL.read(path)
  );
};


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
