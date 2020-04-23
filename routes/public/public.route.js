const route = require('express').Router();
const productModel = require('../../models/product.model')
const categoryModel = require('../../models/category.model');
const sellerModel = require('../../models/seller.model');
const bidderModel = require('../../models/bidders.model');
const utils = require('../../utils/utils');
const config = require('../../config/default.json')
const moment = require('moment');

//Home page
route.get('/', async(req, res) => {
    let topBidTimes = await productModel.topBidTimes();

    for (let product of topBidTimes) {
        let current_price = await productModel.currentPrice(product.id);
        // let image= await productModel.productImage(product.id);
        // product.image=image[0].image;
        if (current_price.length > 0) {
            current_price = current_price[0].price;
            product.current_price = current_price;
        } else
            product.current_price = product.price_start;
        //get current time
        product.remaining_time = utils.formatDuration(product.duration);
    }
    topBidTimes.reverse();
    //About to end
    let aboutToEnd = await productModel.aboutToEnd();

    for (let product of aboutToEnd) {
        let current_price = await productModel.currentPrice(product.id);
        // let image= await productModel.productImage(product.id);
        // product.image=image[0].image;
        if (current_price.length > 0) {
            current_price = current_price[0].price;
            product.current_price = current_price;
        } else
            product.current_price = product.price_start;
        //get current time
        product.remaining_time = utils.formatDuration(product.duration);
    }
    aboutToEnd.reverse();
    //top Price
    let topPrice = await productModel.topPrice();
    for (let product of topPrice) {
        let current_price = await productModel.currentPrice(product.id);
        // let image= await productModel.productImage(product.id);
        // product.image=image[0].image;
        if (current_price.length > 0) {
            current_price = current_price[0].price;
            product.current_price = current_price;
        } else
            product.current_price = product.price_start;
        //get current time
        product.remaining_time = utils.formatDuration(product.duration);
    }
    res.render('guest/index', {
        topBidTimes,
        aboutToEnd,
        topPrice
    });
});
//about view
route.get('/about', (req, res) => {
    res.render('guest/about');
})
route.get('/blog', (req, res) => {
    res.render('guest/blog');
})
route.get('/blog_single', (req, res) => {
    res.render('guest/blog_single');
})
route.get('/contact', (req, res) => {
    res.render('guest/contact');
})

route.get('/faq', (req, res) => {
    res.render('guest/faq');
})

//Product for each category
route.get('/category/:id', async(req, res) => {
    var orderBy = req.query.orderBy;
    const limit = config.paginate.limit1;
    const page = req.query.page || 1;
    if (page < 1) page = 1;
    const offset = (page - 1) * config.paginate.limit;
    const id = req.params.id;
    var data;
    if (orderBy == 1) {
        data = await productModel.orderByName(id, offset);
    }
    if (orderBy == 2) {
        data = await productModel.orderByTime(id, offset);
    }
    if (orderBy == 3) {
        data = await productModel.orderByCost(id, offset);
    } else {
        data = await productModel.productCategory(id, offset);
    }
    const total = await productModel.countByCate(id);
    var now = moment();
    for (dat of data) {
        var time = now.diff(moment(dat.created_at), 'seconds');
        dat.new = (time < 3600);
    }
    let nPages = Math.floor(total / limit);
    if (total % limit > 0) nPages++;
    const page_numbers = [];
    for (i = 1; i <= nPages; i++) {
        page_numbers.push({
            value: i,
            isCurrentPage: i === +page
        })
    }
    for (parent of data) {
        parent.end_time = utils.formatDuration(parent.duration);
    }
    if (req.user) {
        user_id = req.user.id;
    } else {
        user_id = 0;
    }
    const cate = await categoryModel.single(id);
    res.render('guest/list_product', {
        layout: 'main',
        user_id,
        data,
        category: cate[0],
        page_numbers,
        not_prev: +page - 1 === 0,
        not_next: +page === +nPages,
        prev_value: +page - 1,
        next_value: +page + 1,
    })
})

route.get('/search', async(req, res) => {
    let type = req.query.type;
    let key = req.query["search-string"];

    //Lấy page
    const limit = config.paginate.limit1;
    const page = req.query.page || 1;
    if (page < 1) page = 1;
    const offset = (page - 1) * config.paginate.limit;
    const id = key;

    //Lấy data
    var data, total;
    if (type == 1) {
        data = await productModel.searchByName(key, offset);
        total = await productModel.countSearchByName(key);

    } else {
        data = await productModel.searchByCat(key, offset);
        total = await productModel.countSearchByCat(key);
    }

    //Lấy total


    var now = moment();
    for (dat of data) {
        var time = now.diff(moment(dat.created_at), 'seconds');
        dat.new = (time < 3600);
    }
    let nPages = Math.floor(total / limit);
    if (total % limit > 0) nPages++;
    const page_numbers = [];
    for (i = 1; i <= nPages; i++) {
        page_numbers.push({
            value: i,
            isCurrentPage: i === +page
        })
    }
    for (parent of data) {
        parent.end_time = utils.formatDuration(parent.duration);
    }
    if (req.user) {
        user_id = req.user.id;
    } else {
        user_id = 0;
    }
    res.render('search-results', {
        layout: 'main',
        key,
        user_id,
        data,
        page_numbers,
        not_prev: +page - 1 === 0,
        not_next: +page === +nPages,
        prev_value: +page - 1,
        next_value: +page + 1,
    })
})
route.get('/product/:id', async(req, res) => {
    const id = req.params.id;
    let product = await productModel.single(id);
    product = product[0];
    if (typeof(req.user) != 'undefined') {
        if (req.user.id == product.seller_id)
            return res.redirect('/seller/product/' + id);
        return res.redirect('/bidder/product/' + id);
    }
    let categories = await categoryModel.cateOfProduct(id);
    product.categories = categories;
    product.seller_review = "" + await bidderModel.pointReviews(product.seller_id) + "/" + await bidderModel.totalReviews(product.seller_id);
    let currentPrice = await productModel.currentPrice(id);
    if (currentPrice.length > 0) {
        product.hasWinner = true;
        product.price = currentPrice[0].price;
        product.winner_name = currentPrice[0].name;
        product.winner_review = "" + await bidderModel.pointReviews(currentPrice[0].id) + "/" + await bidderModel.totalReviews(currentPrice[0].id);
        let bidTimes = await productModel.bidTimes(product.id);
        product.bidTimes = bidTimes[0].bidTimes;
    } else {
        product.price = product.price_start;
        product.hasWinner = false;
    }
    let seller_name = await sellerModel.nameOfSeller(product.seller_id);
    product.seller_name = seller_name[0].name;
    product.end_time = utils.formatDuration(product.duration);
    const cate = await categoryModel.single(id);
    var bidders = await productModel.autionPro(id);
    let relatedProduct = await productModel.relatedProduct(cate[0].id);
    for(data of relatedProduct){
        data.price= await productModel.currentPrice(data.id);
    }
    res.render('guest/Product', {
        product,
        cate: cate[0],
        bidder: bidders,
        relatedProduct
    });

});

route.post('/wishlist/add', async(req, res) => {
    if (req.user) {
        id = req.body.id;
        result = await productModel.isWish(id, req.user.id)
        if (result === 0) {
            productModel.addWishlist(id, req.user.id);
        }
    }
    res.redirect('/bidder/product/' + id);
});

route.get('/')

module.exports = route;