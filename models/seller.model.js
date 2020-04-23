const db = require('../utils/db');
const config = require('../config/default.json');
const tableName = 'sellers';

module.exports = {
    all: (offset) => db.load(`select * from ${tableName} JOIN bidders ON bidders.id=sellers.seller_id limit ${config.paginate.limit} offset ${offset}`),
    single: (id) => db.load(`select * from ${tableName} where id=${id}`),

    insert(pro_id, id, name, price_start, price_end, step, auto_renew, description, created_at, duaration) {
        return db.add('products', { id: pro_id, seller_id: id, name, price_start, price_end, buy_now: price_end, step, auto_renew, description, duration: duaration, created_at, status: 0 });
    },
    //UPDATE `products` SET `created_at` = '2020-01-01 03:16:15' WHERE `products`.`id` = 2 
    maxId: () => db.load(`SELECT Max(id) as id From products`),

    allActive: (id, day) => db.load(`select * from products where seller_id=${id} and duration>now()`),

    del: (tableName, condition) => db.del(tableName, condition),

    cat: () => db.load(`SELECT * FROM categories`),

    sellId: (id) => db.load(`SELECT * FROM sellers WHERE id=${id} `),

    singPro: (id) => db.load(`Select * from products where id=${id}`),

    patch: (entity) => {
        const condition = {
            id: entity.id
        };
        delete entity.id;
        // console.log(condition, entity);
        return db.patch(tableName, entity, condition);
    },
    totalReviews: async(id) => {
        const rows = await db.load(`select count(*) as total from sellers JOIN bidder_reviews ON sellers.id=bidder_reviews.seller_id WHERE sellers.id=${id}`)
        return rows[0].total;
    },
    pointReviews: async(id) => {
        const rows = await db.load(`select count(*) as total from sellers JOIN bidder_reviews ON sellers.id=bidder_reviews.seller_id WHERE sellers.id=${id} and bidder_reviews.love=1`)
        return rows[0].total;
    },
    count: async() => {
        const rows = await db.load(`select count(*) as total from sellers`)
        return rows[0].total;
    },
    add: (id, now, created_at) => {
        const condition = {
            seller_id: id,
            expiry_date: now,
            created_at: created_at
        };
        db.add('sellers', condition);
    },
    feedback: (product, bidder, love, review, create) => db.load(
        `INSERT INTO bidder_reviews (product_id, bidder_id, love, review, created_at) VALUES (${product}, ${bidder}, ${love}, "${review}","${create}") `
    ),
    nameOfSeller: (id) => db.load(`select name from bidders where bidders.id = ${id}`),
    isSeller: (id) => db.load(`select * from sellers where seller_id = ${id} and expiry_date > now() `),
    manager:()=>db.load(`SELECT * FROM seller_managers`),
};