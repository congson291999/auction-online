module.exports = function (app) {
    app.use('/', require('../routes/public/public.route'));
    app.use('/bidder', require('../routes/bidder/bidder.route'));
    app.use('/admin', require('../routes/admin/admin.route'));
    app.use('/seller', require('../routes/seller/seller.route'));
  };