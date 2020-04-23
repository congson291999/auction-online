const db = require('../utils/db');
const tableName = 'descriptions';
module.exports = {
    all: () => db.load(`select * from ${tableName}`),
    countAll : async () => {
        const rows = await db.load(`select count(*) as total from ${tableName}`)
        return rows[0].total;
    },
    countByProduct : async id => {
        const rows = await db.load(`select count(*) as total from ${tableName} WHERE product_id=${id}`)
        return rows[0].total;
    },
    desByProduct: (id_product) => db.load(`select * from ${tableName} WHERE product_id=${id_product}`),
    single: id => db.load(`select * from ${tableName} where id=${id}`),
    add: entity => db.add(tableName, entity),
    del: id_des => db.del(tableName, { id: id_des }),
}