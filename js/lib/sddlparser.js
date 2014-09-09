"use strict"

var fs = require('fs');

this.read = function read(file) {
  var result = fs.readFileSync(file, 'utf8');
  return JSON.parse(result);
};

this.merge = function(rootJSON, custJSON) {
  var tables = {};

  // get all abstract tables
  var rootDefs = parseRoot(rootJSON);

  // get all customer tables
  var custDefs = parseCust(custJSON);


  console.log("RD", rootDefs)
  console.log("CD", custDefs)

  // merge
  var mergedDefs = merge(rootDefs, custDefs);

};

// INTERNAL STUFF //
var STATIC = {
  KEYWORDS:{
    abstrct:{
      key:"abstract"
    },
    columns:{},
    FK:{},
    tables:{
      key:"tables"
    },
    extnds:{
      key:"extends"
    },
    styles:{},
    header:{},
    style_name:{}
  }
};

var merge = function merge(rootDefs, custDefs) {
  var tables = custDefs.tables;

  // does it extend anything?
  var mergedTables = tables.map(function(item){
    if(hasExtends(item.table)){
      // grab the table from the abstract table and merge them
      var superTbl = getExtendedTable(item, rootDefs)
      // not testing this yet...
      var mergedTable = mergeTables(item, superTbl);

      return mergeColumns(mergedTable, rootDefs.columns)
    } else {

      return mergeColumns(item);
    }
  });

  // names collide with abstract columns?

};

var mergeColumns = function mergeColumns(mergedTable, rootColumns) {
};

var getExtendedTable = function (item, rootDefs) {
  var tableName = item.table;
  var extendsIdx = item.indexOf(STATIC.KEYWORDS.extnds.key) + STATIC.KEYWORDS.extnds.key.length
  var abstractTableName = item.substring(extendsIdx).trim()
  return rootDefs.abstrct.tables[abstractTableName]
};

var mergeTables = function mergeTables(tableItem, rootTableItem){
  // nothing yet
};

var parseCust = function parseCust(custJSON) {
  var custKeys = Object.keys(custJSON);
  var tables = [];

  custKeys.forEach(function(item){
    if(hasTables(item)) {
      tables.push(custJSON[item])
    }
  });

  return {
    tables:tables
  };
};

var parseRoot = function parseRoot(rootJSON) {
  // get all the keys, parse them and sort them
  var rootKeys = Object.keys(rootJSON);
  var tables = [];

  rootKeys.forEach(function(item){
    if(hasAbstract(item) && hasTables(item)) {
      tables.push(rootJSON[item])
    }
  });

  return {
    abstrct:{
      tables:tables
    }
  }
};

var hasExtends = function hasExtends(item) {
  return hasKey(item, STATIC.KEYWORDS.extnds.key)
};

var hasTables = function hasTables(item) {
  return hasKey(item, STATIC.KEYWORDS.tables.key);
};

var hasAbstract = function hasAbstract(item) {
  return hasKey(item, STATIC.KEYWORDS.abstrct.key);
};

var hasKey = function hasKey (item, key) {
  if(item.indexOf(key) > -1) {
    return true;
  } else {
    return false;
  }
};
