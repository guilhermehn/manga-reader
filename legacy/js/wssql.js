﻿/*
Usage :
 - background request actmirrors : enrich each mirror with list of mangas
 - background request getListManga : return list of mangas for a website
 - background desactivateMirror : empty list of mangas
 - background refreshNewMirrorsMangaLists : check if empty or not... + get list
 - background mangaListLoaded  : store list
 - popupSearch refreshSearchAll : getList for mirror

Method to add
 - getMangaList(mirror, callback)
 - isEmpty(mirror, callback);
 - empty(mirror);
 - storeMangaList(mirror);

*/

var wssql = {
  webdb: {
    db: null
  }
};

wssql.webdb.open = function () {
  var dbSize = 100 * 1024 * 1024; // 100MB max...
  wssql.webdb.db = openDatabase('AMR', '1.0', 'All mangas reader', dbSize);
};

wssql.webdb.createTable = function () {
  var db = wssql.webdb.db;

  db.transaction((tx) => {
    tx.executeSql('CREATE TABLE IF NOT EXISTS manga(ID INTEGER PRIMARY KEY ASC, mirror TEXT, mgname TEXT, mgurl TEXT)', []);
  });
};

wssql.webdb.storeMangaList = function (mirrorname, list) {
  var db = wssql.webdb.db;

  db.transaction((tx) => {
    for (var i = 0; i < list.length; i++) {
      tx.executeSql('INSERT INTO manga(mirror, mgname, mgurl) VALUES (?,?,?)',
          [mirrorname, list[i][0], list[i][1]],
          (tx, sql_res) => {},
          (tx, e) => {
            console.log(`Error while inserting ${list[i][0]} for mirror ${mirrorname}`);
          }
      );
    }
  });
};

wssql.webdb.empty = function (mirror, callback) {
  var db = wssql.webdb.db;
  db.transaction((tx) => {
    tx.executeSql('delete from manga where mirror = ?', [mirror], callback, wssql.webdb.onError);
  });
};

wssql.webdb.onError = function (tx, e) {
  alert(`There has been an error: ${e.message}`);
};

wssql.webdb.isEmpty = function (mirror, callback) {
  var db = wssql.webdb.db;

  db.transaction((tx) => {
    tx.executeSql('SELECT count(*) as num FROM manga', [], (tx, res) => {
      if (res.rows.length > 0) {
        callback((res.rows.item(0).num == 0));
      }

      callback(true);
    },
    wssql.webdb.onError);
  });
};

wssql.webdb.getMangaList = function (mirror, callback) {
  var db = wssql.webdb.db;

  db.transaction((tx) => {
    tx.executeSql('SELECT * FROM manga where mirror = ?', [mirror], (tx, res) => {
      var result = [].slice.call(res.rows).map((row) => {
        return [row.mgname, row.mgurl];
      });

      callback(result, mirror);
    },
    wssql.webdb.onError);
  });
};

wssql.init = function () {
  wssql.webdb.open();
  wssql.webdb.createTable();
};
