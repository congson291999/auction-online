const db = require('../utils/db');
const tableName = 'admins';

module.exports = {
    all: () => db.load(`select * from ${tableName}`),
    single: (id) => db.load(`select * from ${tableName} where id=${id}`),

    singleByEmail: (email) => db.load(`select * from ${tableName} where email= '${email}'`)
};