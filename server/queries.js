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
    let queryText = `INSERT INTO ${type} (name, password) VALUES ('${name}', '${password}') ON CONFLICT DO NOTHING;`;
    if (type === 'members') {
      queryText += `
      INSERT INTO Loyalty (m_id) VALUES ((SELECT m_id FROM ${type} WHERE name = '${name}')) ON CONFLICT DO NOTHING;
      INSERT INTO Payments (m_id) VALUES ((SELECT m_id FROM ${type} WHERE name = '${name}')) ON CONFLICT DO NOTHING;`
    }
    console.log(queryText);
    dbConnection.query(queryText, (err, result) => {
      release();
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
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
    const queryText = `SELECT * FROM ${tableName} WHERE ${idType} = $1`;
    const betterID = typeof id === 'string' ? id : id.toString();
    dbConnection.query(queryText, [betterID], (err, result) => {
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
function matchTrainers(db, idType, id) {
  return new Promise((resolve, reject) => {
    db.connect((err, dbConnection, release) => {
      if (err) {
        release();
        return reject(err);
      }
      let queryText;
      if (idType === 'm_id') {
        queryText = `SELECT * FROM Sessions JOIN Trainers ON Sessions.t_id = Trainers.t_id WHERE Sessions.m_id = ${id};`;
      }
      dbConnection.query(queryText, (err, result) => {
        release();
          
        if (err) {
          return reject(err);
        }
        resolve(result.rows);
      });
    });
  });
}
function insertWithID(db, tableName, columns, values, callback) {
  db.connect((err, dbConnection, release) => {
    if (err) {
      return callback(err, null);
    }

    const placeholders = values.map((_, index) => `$${index + 1}`);
    const queryText = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders.join(', ')})`;

    dbConnection.query(queryText, values, (err, result) => {
      console.log('here ' + tableName + ' Columns: ' + columns + ' Values: ' + values);
      console.log(queryText);
      release();

      if (err) {
        return callback(err, null);
      }

      callback(null, result);
    });
  });
}
function deleteAllWithId(db, tableName, idType, id, callback) {
  db.connect((err, dbConnection, release) => {
    if (err) {
      return callback(err, null);
    }
    const queryText = `DELETE FROM ${tableName} WHERE ${idType} = $1`;
    const betterID = typeof id === 'string' ? id : id.toString();
    dbConnection.query(queryText, [betterID], (err, result) => {
      release();

      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows);
    });
  });
}
function toggleAllWithID(db, tableName, idType, id, toggled, callback) {
  db.connect((err, dbConnection, release) => {
    if (err) {
      return callback(err, null);
    }
    const queryText = `UPDATE ${tableName} SET ${toggled} = CASE WHEN ${toggled} = TRUE THEN FALSE ELSE TRUE END WHERE ${idType} = ${id};`;

    dbConnection.query(queryText, (err, result) => {
      release();

      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows);
    });
  });
}

module.exports = { verifyUser, registerUser, getAll, getAllWithID, getMembersInClass, getAllWithIDAsync, matchTrainers, insertWithID, deleteAllWithId, toggleAllWithID };
