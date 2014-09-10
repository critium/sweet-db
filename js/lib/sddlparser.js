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
    type:{
      key:"type"
    },
    nullable:{
      key:"nullable"
    },
    key:{
      key:"key"
    },
    autoinc:{
      key:"autoinc"
    }
  }
};

var merge = function merge(rootDefs, custDefs) {
  var tables = custDefs.tables;

  // does it extend anything?
  var mergedTables = _.map(tables, function(item, key){
    if(hasExtends(key)){
      // grab the table from the abstract table and merge them
      var superTbl = getExtendedTable(key, rootDefs)
      // not testing this yet...
      var mergedTable = mergeTables(item, superTbl);

      return mergeColumns(mergedTable, rootDefs.columns)
    } else {

      return mergeColumns(key, item, rootDefs.columns);
    }
  });

  console.log("MERGE", mergedTables);

};

var mergeColumns = function mergeColumns(key, cols, rootColumns) {
  var result = {};

  if(_.isArray(cols)){
    // find matches on the abstract columns
    var colsInArray = _.map(cols, function(col){
      var match = rootColumns[col]
      if(match) {
        result[col] = match;
      } else {
        //throw { msg: 'could not find abstract column', val:col }
      }
    });

  } else if(_.isPlainObject(cols)){
    var colsInMap = _.map(cols, function(colVal, colKey){
      var rootCol = rootColumns[colKey];
      if(rootCol) {
        result[colKey] = mergeColumn(colVal, rootCol)
      } else {
        result[colKey] = colVal;
      }
    });

  } else {
    throw {msg:"invalid format", val:mergedTable}
  }

  return result;
};

var mergeColumn = function mergeColumn(colVal, rootCol) {
  var result = {}
  mergeKey(result, STATIC.KEYWORDS.type.key, colVal, rootCol)
  mergeKey(result, STATIC.KEYWORDS.nullable.key, colVal, rootCol)
  mergeKey(result, STATIC.KEYWORDS.key.key, colVal, rootCol)
  mergeKey(result, STATIC.KEYWORDS.autoinc.key, colVal, rootCol)
  return result;
};

var mergeKey = function mergeKey(common, key, lObj, rObj) {
  var lItem = lObj[key];
  if(lItem) {
    common[key] = lItem;
  } else {
    var rItem = rObj[key];
    if(rItem) {
      common[key] = rItem;
    }
  }
};

var getExtendedTable = function getExtendedTable(tableName, rootDefs) {
  var extendsIdx = key.indexOf(STATIC.KEYWORDS.extnds.key) + STATIC.KEYWORDS.extnds.key.length
  var abstractTableName = key.substring(extendsIdx).trim()
  return rootDefs.tables[abstractTableName]
};

var mergeTables = function mergeTables(tableItem, rootTableItem){
  // nothing yet
};

var parseCust = function parseCust(custJSON) {
  var custKeys = Object.keys(custJSON);
  var tables = {};

  custKeys.forEach(function(item){
    if(hasTables(item)) {
      tables[item] = custJSON[item];
    }
  });

  return tables;
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
