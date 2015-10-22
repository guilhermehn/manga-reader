var amrcsql = {};
amrcsql.webdb = {};
amrcsql.webdb.db = null;

amrcsql.webdb.open = function () {
  var dbSize = 100 * 1024 * 1024; // 100MB max...
  this.db = openDatabase('AMR', '1.0', 'All mangas reader', dbSize);
};

amrcsql.webdb.createTable = function () {
  this.db.transaction(function (tx) {
    var query = 'CREATE TABLE IF NOT EXISTS websites(id INTEGER PRIMARY KEY ASC, idext INTEGER, objectName TEXT, mirrorName TEXT, websites TEXT, revision INTEGER, developer TEXT, icon TEXT, url TEXT, code TEXT, activated INTEGER)';
    tx.executeSql(query, []);
  });
};

amrcsql.webdb.storeWebsite = function (amrcObject, callback) {
  this.db.transaction(function (tx) {
    var query = 'INSERT INTO websites(idext, objectName, mirrorName, websites, revision, developer, icon, url, code, activated) VALUES (?,?,?,?,?,?,?,?,?,?)';

    tx.executeSql(query, [amrcObject.id, amrcObject.objectName, amrcObject.mirrorName, JSON.stringify(amrcObject.webSites), amrcObject.revision, amrcObject.developer, amrcObject.mirrorIcon, amrcObject.mirrorUrl, amrcObject.jsCode, 1], callback, function () {
      console.log('Error while inserting ' + amrcObject.id + ' for mirror ' + amrcObject.mirrorName);
    });
  });
};

amrcsql.webdb.updateWebsite = function (amrcObject, callback) {
  this.db.transaction(function (tx) {
    var query = 'update websites set idext = ?, objectName = ?, websites = ?, revision = ?, developer = ?, icon = ?, url = ?, code = ? where mirrorName = ?';

    tx.executeSql(query, [amrcObject.id, amrcObject.objectName, JSON.stringify(amrcObject.webSites), amrcObject.revision, amrcObject.developer, amrcObject.mirrorIcon, amrcObject.mirrorUrl, amrcObject.jsCode, amrcObject.mirrorName], callback, function () {
      console.log('Error while inserting ' + amrcObject.id + ' for mirror ' + amrcObject.mirrorName);
    });
  });
};

amrcsql.webdb.onError = function (tx, e) {
  alert('There has been an error: ' + e.message);
};

amrcsql.webdb.getWebsites = function (callback) {
  this.db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM websites', [], function (tx, res) {
      var ret = [];
      var i = -1;
      var length = res.rows.length;
      var item;

      if (length > 0) {
        while (++i < length) {
          item = res.rows.item(i);

          if (item.websites !== 'undefined') {
            ret.push({
              id: item.id,
              idext: item.idext,
              objectName: item.objectName,
              mirrorName: item.mirrorName,
              webSites: JSON.parse(item.websites),
              revision: item.revision,
              developer: item.developer,
              mirrorIcon: item.icon,
              mirrorUrl: item.url,
              jsCode: item.code,
              activated: (item.activated === 1)
            });
          }
        }
      }

      callback(ret);
    }, amrcsql.webdb.onError);
  });
};

amrcsql.init = function () {
  amrcsql.webdb.open();
  amrcsql.webdb.createTable();
};
