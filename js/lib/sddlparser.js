"use strict"

var fs = require('fs');
var _  = require('lodash');

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
    columns:{
      key:"columns"
    },
    FK:{},
    tables:{
      key:"tables"
    },
    extnds:{
      key:"extends"
    },
    styles:{},
    header:{},
    style_name:{},
    type:{},
    nullable:{},
    key:{},
    autoinc:{}
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

      return mergeColumns(item, rootDefs.columns);
    }
  });

  console.log("MERGE", mergedTables);

};

var mergeColumns = function mergeColumns(mergedTable, rootColumns) {
  var result = _.mapValues(mergedTable, function(cols){
    if(_.isArray(cols)){
      var colsInArray = _.map(cols, function(col){
        var match = rootColumns[col]
        if(match) {
          var result = {};
          result[col] = match;
          return result;
        } else {
          //throw { msg: 'could not find abstract column', val:col }
        }
      });
      // convert [{}] to {}
      var result = {};
      colsInArray.forEach(function(col){
        var colKeys = Object.keys(col);
        colKeys.forEach(function(key){
          result[key] = col[key];
        });
      });
      return result;
    } else if(_.isPlainObject(cols)){
    } else {
      throw {msg:"invalid format", val:mergedTable}
    }

  });
  console.log("MC", result);
  return result;
};

var getExtendedTable = function (item, rootDefs) {
  var tableName = item.table;
  var extendsIdx = item.indexOf(STATIC.KEYWORDS.extnds.key) + STATIC.KEYWORDS.extnds.key.length
  var abstractTableName = item.substring(extendsIdx).trim()
  return rootDefs.tables[abstractTableName]
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
  var columns = {};

  rootKeys.forEach(function(item){
    if(hasAbstract(item) && hasTables(item)) {
      tables.push(rootJSON[item])
    }
    if(hasAbstract(item) && hasColumns(item)) {
      columns = rootJSON[item]
    }
  });

  return {
    tables:tables,
    columns:columns
  }
};

var hasColumns = function hasColumns(item) {
  return hasKey(item, STATIC.KEYWORDS.columns.key);
}

var hasExtends = function hasExtends(item) {
  return hasKey(item, STATIC.KEYWORDS.extnds.key);
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
