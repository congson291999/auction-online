const db = require('../utils/db');
const config = require('../config/default.json');
const tableName = 'bidders';
module.exports = {
    all: (offset) => db.load(`select * from ${tableName} limit ${config.paginate.limit} offset ${offset}`),
    single: id => db.load(`select * from ${tableName} where id=${id}`),
    add: entity => db.add(tableName, entity),
    del: id_bid => db.del(tableName, {
        id: id_bid
    }),
    patch: entity => {
        const condition = {
            id: entity.id
        };
        delete entity.id;
        // console.log(condition, entity);
        return db.patch(tableName, entity, condition);
    },
    name: (id) => db.load(`select name from ${tableName} where id=${id}`),
    singleByEmail: (email) => db.load(`select * from ${tableName} where email = '${email}'`),
    singleByFacebookId: (fbId) => db.load(`select * from ${tableName} where facebook_id = '${fbId}'`),
    totalReviews: async(id) => {
        const rows = await db.load(`select count(*) as total from bidders JOIN seller_reviews ON bidders.id=seller_reviews.bidder_id WHERE bidders.id=${id}`)
        return rows[0].total;
    },
    pointReviews: async(id) => {
        const rows = await db.load(`select count(*) as total from bidders JOIN seller_reviews ON bidders.id=seller_reviews.bidder_id WHERE bidders.id=${id} and seller_reviews.love=1`)
        return rows[0].total;
    },
    count: async() => {
        const rows = await db.load(`select count(*) as total from bidders`)
        return rows[0].total;
    },
    feedback: (product, bidder, love, review, create) => {
        db.load(`INSERT INTO seller_reviews (product_id, bidder_id, love, review, created_at) VALUES (${product}, ${bidder}, ${love}, "${review}","${create}")`)
    },
    canBid: (id, productId) =>
        db.load(`SELECT * FROM blocked_auctions WHERE product_id = ${productId} and bidder_id = ${id}`),
    
    manager: ()=> db.load(`SELECT * FROM bidder_managers`),
}