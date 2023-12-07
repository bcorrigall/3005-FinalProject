function verifyUser(db, type, name, password, callback) {
  db.connect((err, dbConnection, release) => {
    if (err) {
      return callback(err, null);
    }
    const queryText = `SELECT * FROM ${type} WHERE name = '${name}' AND password = '${password}'`;
    dbConnection.query(queryText, (err, result) => {
      release();
      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows);
    });
  });
} 
function registerUser(db, type, name, password, callback) {
  db.connect((err, dbConnection, release) => {
    if (err) {
      return callback(err, null);
    }
    const queryText = `INSERT INTO ${type} (name, password) VALUES ('${name}', '${password}') ON CONFLICT DO NOTHING;`;
    dbConnection.query(queryText, (err, result) => {
      release();
      if (err) {
        return callback(err, null);
      }
      callback(null, null);
    });
  });
} 

function getAll(db, tableName, callback) {
    db.connect((err, dbConnection, release) => {
      if (err) {
        return callback(err, null);
      }
      const queryText = `SELECT * FROM ${tableName}`;
      dbConnection.query(queryText, (err, result) => {
        release();
  
        if (err) {
          return callback(err, null);
        }
        callback(null, result.rows);
      });
  });
} 
function getAllWithID(db, tableName, idType, id, callback) {
  db.connect((err, dbConnection, release) => {
    if (err) {
      return callback(err, null);
    }
    const queryText = `SELECT * FROM ${tableName} WHERE ${idType} = ${id}`;
    dbConnection.query(queryText, (err, result) => {
      release();

      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows);
    });
  });
}
function getAllWithIDAsync(db, tableName, idType, id,) {
  return new Promise((resolve, reject) => {
    getAllWithID(db, tableName, idType, id, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
function getMembersInClass(db, id, callback) {
  db.connect((err, dbConnection, release) => {
    if (err) {
      return callback(err, null);
    }
    const queryText = `SELECT * FROM Classes JOIN MemberClasses ON Classes.c_id = MemberClasses.c_id WHERE Classes.c_id = ${id}`;
    dbConnection.query(queryText, (err, result) => {
      release();

      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows);
    });
  });
} 


module.exports = { verifyUser, registerUser, getAll, getAllWithID, getMembersInClass, getAllWithIDAsync };
