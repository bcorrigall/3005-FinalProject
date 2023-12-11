/**
 * Verifies a user's credentials against the specified user type table in the database.
 *
 * @param {Object} db - The database connection object.
 * @param {String} type - Type of the user ('members', 'trainers', 'admins').
 * @param {String} name - Name of the user to verify.
 * @param {String} password - Password of the user to verify.
 *
 * @returns {Promise} - A promise that resolves with the results of the query.
 *                      If the user is not found, the promise resolves with an empty array.
 */
async function verifyUser(db, type, name, password) {
    let dbConnection;

    try {
        dbConnection = await db.connect();

        const queryText = `
            SELECT * 
            FROM ${type} 
            WHERE name = $1 AND password = $2`;

        const result = await dbConnection.query(queryText, [name, password]);

        return result.rows;
    } catch (err) {
        throw err;
    } finally {
        if (dbConnection) dbConnection.release();
    }
}

/**
 * Registers a new user of a specified type (member, trainer, admin) in the database.
 * For members, also inserts into Loyalty and Payments tables.
 *
 * @param {Object} db - The database connection object.
 * @param {String} type - Type of the user ('members', 'trainers', 'admins').
 * @param {String} name - Name of the user.
 * @param {String} password - Password of the user.
 *
 * @returns {Promise} - A promise that resolves with the results of the query.
 *                      If the username already exists, the promise resolves with null.
 */
async function registerUser(db, type, name, password) {
    let dbConnection;

    try {
        dbConnection = await db.connect();

        // using $1, $2, etc. to prevent SQL injection, they correspond to name and password
        let queryText =
            `
            INSERT INTO ${type} (name, password) VALUES 
            ($1, $2)
            ON CONFLICT DO NOTHING
            ` + (type === "members" ? "RETURNING m_id;" : ";"); // use "RETURNING m_id" to get the last inserted m_id if type === "members"

        const result = await dbConnection.query(queryText, [name, password]);

        // check if any rows were inserted
        if (result.rowCount === 0) return null; // no rows were inserted, because the username already exists

        // check if not a member
        if (type !== "members") return result; // no need to insert into Loyalty and Payments tables because it is not a member

        // it was a new member, so get the last inserted m_id when we used "RETURNING m_id"
        const lastInsertedMId = result.rows[0].m_id;

        // create queries for Loyalty and Payments
        const memberQueries = `
                INSERT INTO Loyalty (m_id) VALUES 
                (${lastInsertedMId})
                ON CONFLICT DO NOTHING;

                INSERT INTO Payments (m_id) VALUES 
                (${lastInsertedMId})
                ON CONFLICT DO NOTHING;
            `;

        const memberResult = await dbConnection.query(memberQueries);

        return memberResult;
    } catch (err) {
        throw err;
    } finally {
        if (dbConnection) dbConnection.release();
    }
}

/**
 * Gets all rows from a table in the database.
 *
 * @param {Object} db - The database connection object.
 * @param {String} tableName - Name of the database table.
 *
 * @returns {Promise<Array>} - A promise that resolves with the results of the query.
 *                             If the table is empty, the promise resolves with an empty array.
 **/
async function getAll(db, tableName) {
    let dbConnection;

    try {
        dbConnection = await db.connect();

        const queryText = `
                        SELECT * 
                        FROM ${tableName}`;

        const result = await dbConnection.query(queryText);

        return result.rows;
    } catch (err) {
        throw err;
    } finally {
        if (dbConnection) dbConnection.release();
    }
}

/**
 * Asynchronously retrieves all rows from a specified table in the database
 * where a certain column matches the given ID.
 *
 * @param {Object} db - The database connection object.
 * @param {String} tableName - Name of the database table.
 * @param {String} idType - The column name in the table to match the ID against. Could be 'm_id', 'a_id', 't_id', 'c_id', etc.
 * @param {String|Number} id - The ID value to query for.
 *
 * @returns {Promise<Array>} - A promise that resolves with the results of the query.
 *                             If the table is empty, the promise resolves with an empty array.
 */
async function getAllWithID(db, tableName, idType, id) {
    let dbConnection;

    try {
        dbConnection = await db.connect();

        const queryText = `
                        SELECT * 
                        FROM ${tableName} 
                        WHERE ${idType} = $1`;

        const result = await dbConnection.query(queryText, [id.toString()]);

        return result.rows;
    } catch (err) {
        throw err; // Rethrow the error for the caller to handle
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

/**
 * Asynchronously retrieves all members enrolled in a specific class from the database.
 * It retrieves all columns from the Classes, MemberClasses, and Members tables.
 * @param {Object} db - The database connection object.
 * @param {Number} id - The class ID to search for.
 *
 * @returns {Promise<Array>} - A promise that resolves with the results of the query.
 *                             If the table is empty, the promise resolves with an empty array.
 */
async function getMembersInClass(db, id) {
    let dbConnection;

    try {
        dbConnection = await db.connect();

        const queryText = `
            SELECT * 
            FROM Classes 
            JOIN MemberClasses ON Classes.c_id = MemberClasses.c_id 
            JOIN Members ON MemberClasses.m_id = Members.m_id 
            WHERE Classes.c_id = $1`;

        const result = await dbConnection.query(queryText, [id]); // here $1 is used for the WHERE clause, it corresponds to the id passed in

        return result.rows;
    } catch (err) {
        throw err;
    } finally {
        if (dbConnection) dbConnection.release(); // Now dbConnection is in scope here
    }
}

/**
 * Asynchronously retrieves all rows from two tables in the database where the specified columns match.
 * @param {Object} db - The database connection object.
 * @param {String} tableName1 - Name of the first table.
 * @param {String} tableName2 - Name of the second table.
 * @param {String} joinOn - The column name in both tables to match against.
 * @param {String|Number} id - The ID value to query for.
 * @param {String} selectBy - The column name in the first table to match the ID against.
 *
 * @returns {Promise<Array>} - A promise that resolves with the results of the query.
 *                      If the table is empty, the promise resolves with an empty array.
 */
async function joinTablesOn(db, tableName1, tableName2, joinOn, id, selectBy) {
    let dbConnection;

    try {
        dbConnection = await db.connect();

        const queryText = `
            SELECT * 
            FROM ${tableName1} 
            JOIN ${tableName2} ON ${tableName1}.${joinOn} = ${tableName2}.${joinOn} 
            WHERE ${tableName1}.${selectBy} = ${id}`;

        const result = await dbConnection.query(queryText);

        return result.rows;
    } catch (err) {
        throw err;
    } finally {
        if (dbConnection) dbConnection.release();
    }
}

/**
 * Asynchronously retrieves all rows from two tables in the database where the specified columns match.
 * @param {Object} db - The database connection object.
 * @param {String} idType - The column name in the table to match the ID against. Could be 'm_id' or 't_id'.
 * @param {String|Number} id - The ID value to query for.
 *
 * @returns {Promise<Array>} - A promise that resolves with the results of the query.
 *                     If the table is empty, the promise resolves with an empty array.
 */
async function matchTrainers(db, idType, id) {
    let dbConnection;
    let queryText;

    try {
        dbConnection = await db.connect();

        if (idType === "m_id") {
            queryText = `
                        SELECT * 
                        FROM Sessions 
                        JOIN Trainers ON Sessions.t_id = Trainers.t_id 
                        WHERE Sessions.m_id = $1;`;
        } else if (idType === "t_id") {
            queryText = `
                        SELECT * 
                        FROM Sessions 
                        JOIN Members ON Sessions.m_id = Members.m_id 
                        WHERE Sessions.t_id = $1;`;
        }

        const result = await dbConnection.query(queryText, [id]);

        return result.rows;
    } catch (err) {
        throw err;
    } finally {
        if (dbConnection) dbConnection.release();
    }
}

/**
 * Asynchronously inserts a new row into a table in the database.
 *
 * @param {Object} db - The database connection object.
 * @param {String} tableName - Name of the database table.
 * @param {String} columns - The columns to insert into.
 * @param {Array} values - The values to insert into the columns.
 *
 * @returns {Promise} - A promise that resolves with the results of the query.
 *
 */
async function insertWithID(db, tableName, columns, values) {
    let dbConnection;

    try {
        dbConnection = await db.connect();

        const placeholders = values.map((_, index) => `$${index + 1}`);
        const queryText = `
                        INSERT INTO ${tableName} (${columns}) 
                        VALUES (${placeholders.join(", ")})`;

        const result = await dbConnection.query(queryText, values);

        return result;
    } catch (err) {
        console.error("Error in insertWithID: ", err);
        throw err;
    } finally {
        if (dbConnection) dbConnection.release();
    }
}

/**
 * Asynchronously deletes all rows with a specified ID from a table in the database.
 *
 * @param {Object} db - The database connection object.
 * @param {String} tableName - Name of the database table.
 * @param {String} idType - The column name of the ID to match for deletion.
 * @param {String|Number} id - The ID value to match for deletion.
 *
 * @returns {Promise<Array>} - A promise that resolves with the results of the delete query.
 */
async function deleteAllWithId(db, tableName, idType, id) {
    let dbConnection;
    try {
        dbConnection = await db.connect();

        const queryText = `
                        DELETE FROM ${tableName} 
                        WHERE ${idType} = $1`;

        const result = await dbConnection.query(queryText, [id.toString()]);

        return result.rows;
    } catch (err) {
        throw err; // Rethrow the error for the caller to handle
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

/**
 * Asynchronously toggles a boolean column in a table for a specified ID.
 *
 * @param {Object} db - The database connection object.
 * @param {String} tableName - Name of the database table.
 * @param {String} idType - The column name of the ID to match for toggling.
 * @param {String|Number} id - The ID value to match for toggling.
 * @param {String} toggled - The column name of the boolean value to be toggled.
 *
 * @returns {Promise<Array>} - A promise that resolves with the results of the update query.
 *
 */
async function toggleAllWithID(db, tableName, idType, id, toggled) {
    let dbConnection;

    try {
        dbConnection = await db.connect();

        // this query toggles a boolean value where the id matches
        const queryText = `
                            UPDATE ${tableName} 
                            SET ${toggled} = CASE WHEN ${toggled} = TRUE THEN FALSE ELSE TRUE END 
                            WHERE ${idType} = $1`;

        const result = await dbConnection.query(queryText, [id]);

        return result.rows;
    } catch (err) {
        throw err;
    } finally {
        if (dbConnection) dbConnection.release();
    }
}

/**
 * Asynchronously adds loyalty points to a member's account.
 *
 * @param {Object} db - The database connection object.
 * @param {Number} points - Number of loyalty points to add.
 * @param {String|Number} id - The member ID to which the points will be added.
 *
 * @returns {Promise<Array>} - A promise that resolves with the results of the update query.
 */
async function addLoyalty(db, points, id) {
    let dbConnection;

    try {
        dbConnection = await db.connect();

        const queryText = `
                        UPDATE Loyalty 
                        SET points = points + $1 WHERE m_id = $2;`;

        const result = await dbConnection.query(queryText, [parseInt(points), parseInt(id)]);

        return result.rows;
    } catch (err) {
        throw err;
    } finally {
        if (dbConnection) dbConnection.release();
    }
}

/**
 * Asynchronously retrieves all equipment and their corresponding room names from the database.
 *
 * @param {Object} db - The database connection object.
 *
 * @returns {Promise<Array>} - A promise that resolves with the results of the query.
 *                             Each element in the array represents an equipment with its corresponding room name.
 */
async function getAllEquipmentWithRoomNames(db) {
    let dbConnection;

    try {
        dbConnection = await db.connect();

        const queryText = `
            SELECT Equipment.e_id, Equipment.e_name, Equipment.target_date, Equipment.last_fixed, Rooms.name AS room_name 
            FROM Equipment
            JOIN Rooms ON Equipment.r_id = Rooms.r_id`;

        const result = await dbConnection.query(queryText);

        return result.rows;
    } catch (err) {
        throw err;
    } finally {
        if (dbConnection) dbConnection.release();
    }
}

/**
 * Asynchronously updates the maintenance details for a piece of equipment.
 *
 * @param {Object} db - The database connection object.
 * @param {String|Number} e_id - The equipment ID.
 * @param {Date} target_date - The target date for the next maintenance.
 *
 * @returns {Promise<Array>} - A promise that resolves with the results of the update query.
 */
async function updateMaintenance(db, e_id, target_date) {
    let dbConnection;
    console.log(target_date);
    try {
        dbConnection = await db.connect();

        const queryText = `
                        UPDATE Equipment 
                        SET last_fixed = CURRENT_DATE, target_date = $1 
                        WHERE e_id = $2;`;

        const result = await dbConnection.query(queryText, [target_date, parseInt(e_id)]);

        return result.rows;
    } catch (err) {
        throw err;
    } finally {
        if (dbConnection) dbConnection.release();
    }
}

module.exports = {
    verifyUser,
    registerUser,
    getAll,
    getAllWithID,
    getMembersInClass,
    joinTablesOn,
    matchTrainers,
    insertWithID,
    deleteAllWithId,
    toggleAllWithID,
    addLoyalty,
    updateMaintenance,
    getAllEquipmentWithRoomNames,
};
