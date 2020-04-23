const db = require('../utils/db');

module.exports = {
    sellerReview: () => db.load(`select * from seller_reviews`),
    addSellerReview: entity => db.add(sellerReview, entity),
    delSellerReview: id_rev => db.del(seller_reviews, {
        id: id_rev
    }),

    listReviewBidder: (id)=>db.load(`select * from seller_reviews join products on products.id=seller_reviews.product_id where seller_reviews.bidder_id=${id} `),
    bidderReview: () => db.load(`select * from bidder_reviews`),
    addBidderReview: entity => db.add(bidderReview, entity),
    delBidderReview: id_rev => db.del(bidder_reviews, {
        id: id_rev
    }),
    viewReview: (id) => db.load(`select * from bidder_reviews where bidder_id=${id}`),
}