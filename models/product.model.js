const db = require('../utils/db');
const config = require('../config/default.json');

//product model
module.exports = {
    productCategory: (id, offset) => db.load(`select * from product_categories JOIN products ON products.id=product_categories.product_id WHERE product_categories.category_id=${id} limit ${config.paginate.limit} offset ${offset}`),

    all: () => db.load(`select * from products`),

    single: id => db.load(`select * from products where id= ${id}`),

    countByCate: async id => {
        const rows = await db.load(`select count(*) as total from products JOIN product_categories WHERE product_categories.product_id = ${id} `)
        return rows[0].total;
    },

    autionPro: (id) => db.load(`SELECT b.name as name, h.created_at as tim, b.id as bidder, h.price as price, h.id as condi, h.product_id as pro FROM bidders b INNER JOIN history_auctions h ON b.id=h.bidder_id WHERE product_id=${id} ORDER BY price DESC`),

    pageByCate: (id, offset) => db.load(`select * from products where CatID = ${id} limit ${config.paginate.limit} offset ${offset}`),

    add: entity => db.add('products', entity),

    del: id_product => db.del('products', {
        id: id_product
    }),

    patch: entity => {
        const condition = {
            id: entity.id
        };
        delete entity.id;
        return db.patch('products', entity, condition);
    },

    productImage: id => db.load(`select product_images.image from products JOIN product_images on products.id=product_images.product_id WHERE product_images.product_id = ${id}`),
    productFail: (offset) => db.load(`select * from products p WHERE duration < NOW() and
                                                                    not exists(
                                                                        select *
                                                                        from history_auctions
                                                                        where p.id=history_auctions.product_id
                                                                        ) 
                                            limit ${config.paginate.limit} offset ${offset}`),
    productSuccess: (offset) => db.load(`select * from products p WHERE duration < NOW() and
                                                                    exists(
                                                                        select *
                                                                        from history_auctions
                                                                        where p.id=history_auctions.product_id
                                                                        ) 
                                                                limit ${config.paginate.limit} offset ${offset}`),
    productAction: (offset) => db.load(`select * from products WHERE duration>NOW() limit ${config.paginate.limit} offset ${offset}`),
    countAction: async() => {
        const rows = await db.load(`select count(*) as total from products where duration>NOW()`)
        return rows[0].total;
    },
    countFail: async() => {
        const rows = await db.load(`select count(*) as total from products p where duration <NOW() and 
                                     not exists(
                                        select *
                                        from history_auctions
                                        where p.id=history_auctions.product_id
                                        )`)
        return rows[0].total;
    },
    countSuccess: async() => {
        const rows = await db.load(`select count(*) as total from products p where duration <NOW() and 
                                    exists(
                                        select *
                                        from history_auctions
                                        where p.id=history_auctions.product_id
                                        )`)
        return rows[0].total;
    },

    bidderWin: (id) => db.load(`select MAX(his.price) as Price,  bidders.name as Win from products JOIN history_auctions his ON products.id = his.product_id JOIN bidders ON bidders.id=his.bidder_id WHERE products.id=${id} NOT EXITS (select * from blocked_auctions where history_auctions.bidder_id=blocked_auctio.bidder_id and history_auctions.product_id=blocked_auctio.product_id)`),

    delImage: (id) => db.del('product_images', {
        product_id: id
    }),

    addBlock: (entity) => db.add('blocked_auctions', entity),

    delImage: (id) => db.del('product_images', {
        product_id: id
    }),
    topBidTimes: _ => db.load(`SELECT * FROM history_auctions LEFT OUTER JOIN products on products.id = history_auctions.product_id  GROUP BY product_id ORDER BY COUNT(*) DESC LIMIT 5`),

    currentPrice: (id) => db.load(`SELECT bd.id, ha.price, bd.name, ha.price_end as price_end, ha.id as his_id FROM  history_auctions ha, products pd, bidders bd
    WHERE pd.duration > NOW() 
    and ha.product_id = pd.id 
    and bd.id = ha.bidder_id
    and pd.id = ${id}
    and not EXISTS (SELECT * from blocked_auctions ba WHERE ba.product_id = pd.id and ba.bidder_id = ha.bidder_id )
    and not EXISTS (SELECT * from history_auctions ha1 WHERE ha1.product_id = pd.id 
                                                       and ha1.price > ha.price
                                                       and not EXISTS (SELECT * from blocked_auctions ba1 WHERE ha1.product_id = pd.id and ba1.bidder_id = ha1.bidder_id ) 
                                                
                   )`),
    PriceEnd: (id) => db.load(`SELECT bd.id, ha.price_end, ha.id as his_id FROM  history_auctions ha, products pd, bidders bd
    WHERE pd.duration > NOW() 
    and ha.product_id = pd.id 
    and bd.id = ha.bidder_id
    and pd.id = ${id}
    and not EXISTS (SELECT * from blocked_auctions ba WHERE ba.product_id = pd.id and ba.bidder_id = ha.bidder_id )
    and not EXISTS (SELECT * from history_auctions ha1 WHERE ha1.product_id = pd.id 
                                                        and ha1.price_end > ha.price_end
                                                        and not EXISTS (SELECT * from blocked_auctions ba1 WHERE ba1.product_id = pd.id and ba1.bidder_id = ha1.bidder_id ) 
                                                        )`),
    PriceEndsecond: (id, bidder_id) => db.load(`SELECT bd.id, ha.price_end, ha.id as his_id FROM  history_auctions ha, products pd, bidders bd
    WHERE pd.duration > NOW() 
    and ha.product_id = pd.id 
    and bd.id = ha.bidder_id
    and pd.id = ${id}
    and not EXISTS (SELECT * from blocked_auctions ba WHERE ba.product_id = pd.id and ba.bidder_id = ha.bidder_id )
    and not EXISTS (SELECT * from history_auctions ha1 WHERE ha1.product_id = pd.id 
                                                        and ha1.price_end > ha.price_end and ha1.bidder_id != ${bidder_id}
                                                        and not EXISTS (SELECT * from blocked_auctions ba1 WHERE ba1.product_id = pd.id and ba1.bidder_id = ha1.bidder_id ) 
                                                        )`),
    delHistory: (id) => {
        db.del('history_auctions', {
            id: id
        });
    },

    listEnd: (id) => db.load(`SELECT b.id as bidder, p.name as name, p.id as id, b.name as win, h.price as price, p.price_start as started, p.price_end as ended, p.step as step 
    FROM products p, history_auctions h, bidders b 
    WHERE p.seller_id=${id} AND p.id=h.product_id AND h.bidder_id=b.id AND 
    h.price=(SELECT price from 
        history_auctions JOIN bidders on history_auctions.bidder_id = bidders.id 
        WHERE product_id= p.id ORDER BY price DESC LIMIT 1)`),

    editDes: (id, des) => db.load(`UPDATE products Set description="${des}" WHERE id=${id}`),

    countByCate: async(id) => {
        const rows = await db.load(`select count(*) as total from products JOIN product_categories ON products.id=product_categories.product_id WHERE product_categories.category_id=${id}`)
        return rows[0].total;
    },
    aboutToEnd: () => db.load("SELECT * FROM `products` WHERE duration > NOW() ORDER BY duration LIMIT 5"),
    topPrice: () => db.load(`SELECT * FROM  history_auctions ha, products pd
            WHERE pd.duration > NOW() and ha.product_id = pd.id ORDER BY ha.price DESC LIMIT 5 `),

    bidTimes: (id) => db.load(`SELECT COUNT(*) as bidTimes FROM history_auctions WHERE product_id = ${id} and status = 1`),
    listWon: (id) => db.load(`SELECT b.id as bidder, p.name as name, p.id as id, h.price as price, p.price_start as started, p.price_end as ended, p.step as step, p.seller_id FROM products p, history_auctions h, bidders b WHERE b.id=${id} AND p.id=h.product_id AND h.bidder_id=b.id AND h.price=(SELECT price from history_auctions JOIN bidders on history_auctions.bidder_id = bidders.id WHERE product_id= p.id ORDER BY price DESC LIMIT 1) `),
    addWishlist: (id, bidder_id) => db.add(`wish_lists`, {
        product_id: id,
        bidder_id: bidder_id
    }),
    isWish: async(id, bidder_id) => {
        const rows = await db.load(`select count(*) as total from wish_lists where product_id=${id} and bidder_id=${bidder_id}`);
        return rows[0].total;
    },
    WishList: (id) => db.load(`select * from products join wish_lists on products.id=wish_lists.product_id where wish_lists.bidder_id=${id}`),
    delWish: (id, bidder_id) => db.load(`DELETE FROM wish_lists WHERE product_id=${id} and bidder_id=${bidder_id}`),
    biddingList: (id) => db.load(`SELECT p.id as id, p.name as name, p.duration as duration, b.id as me FROM history_auctions h, bidders b, products p WHERE h.bidder_id=b.id and h.product_id=p.id and b.id=${id} and p.duration>now() and h.price = (SELECT MAX(price) FROM history_auctions h1 WHERE h1.bidder_id=b.id and h1.product_id=p.id) `),
    patchHis: (entity) => {
        const condition = {
            id: entity.id
        };
        delete entity.id;
        return db.patch('history_auctions', entity, condition);
    },
    currentEnd: (id) => db.load(`SELECT bd.id, ha.price, bd.name, ha.price_end as price_end, ha.id as his_id FROM  history_auctions ha, products pd, bidders bd
    WHERE pd.duration < NOW() 
    and ha.product_id = pd.id 
    and bd.id = ha.bidder_id
    and pd.id = ${id}
    and not EXISTS (SELECT * from blocked_auctions ba WHERE ba.product_id = pd.id and ba.bidder_id = ha.bidder_id )
    and not EXISTS (SELECT * from history_auctions ha1 WHERE ha1.product_id = pd.id 
                                                       and ha1.price > ha.price
                                                       and not EXISTS (SELECT * from blocked_auctions ba1 WHERE ha1.product_id = pd.id and ba1.bidder_id = ha1.bidder_id ) 
                                                
                   )`),
    orderByName: (id, offset) => db.load(`select * from products JOIN product_categories ON products.id=product_categories.product_id WHERE product_categories.category_id=${id}  order by products.name DESC limit ${config.paginate.limit} offset ${offset}`),
    orderByTime: (id, offset) => db.load(`select * from products JOIN product_categories ON products.id=product_categories.product_id WHERE product_categories.category_id=${id}  order by products.duration DESC limit ${config.paginate.limit} offset ${offset}`),
    orderByCost: (id, offset) => db.load(`select * from products JOIN product_categories ON products.id=product_categories.product_id WHERE product_categories.category_id=${id}  order by products.price_start DESC limit ${config.paginate.limit} offset ${offset}`),
    biddingList: (id) => db.load(`SELECT p.id as id, p.name as name, p.duration as duration, b.id as me FROM history_auctions h, bidders b, products p WHERE h.bidder_id=b.id and h.product_id=p.id and b.id=${id} and p.duration>now() and h.price = (SELECT MAX(price) FROM history_auctions h1 WHERE h1.bidder_id=b.id and h1.product_id=p.id) `),
    searchByName: (name, offset) => db.load(`SELECT * FROM products WHERE MATCH(name) Against("+${name}*" IN BOOLEAN MODE) limit ${config.paginate.limit} offset ${offset} `),
    countSearchByName: (name) => db.load(`SELECT count(name) FROM products WHERE MATCH(name) Against("+${name}*" IN BOOLEAN MODE) `),
    searchByCat: (cat, offset) => db.load(`SELECT * FROM products, product_categories WHERE products.id = product_categories.product_id and product_categories.category_id IN(SELECT id FROM categories WHERE MATCH(name) Against("+${cat}*" IN BOOLEAN MODE)) limit ${config.paginate.limit} offset ${offset}`),
    countSearchByCat: (cat) => db.load(`SELECT count(name) FROM categories WHERE MATCH(name) Against("+${cat}*" IN BOOLEAN MODE) `),
    relatedProduct: (id)=>db.load(`select * from product_categories JOIN products ON products.id=product_categories.product_id WHERE product_categories.category_id=${id} limit 5`)
}