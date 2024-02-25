const verifyRouter = require('./verify');
const profileRouter = require('./profile');
const bannerRouter = require('./banner');
const commentRouter = require('./comment');
const tvRouter = require('./tv');
const reportRouter = require('./report');
const auth = require('../middlewares/auth')

module.exports = (app) => {
    app.use('/api/v1/verify', verifyRouter);
    app.use('/api/v1/profile', [auth], profileRouter);
    app.use('/api/v1/banner', [auth], bannerRouter);
    app.use('/api/v1/comment', [auth], commentRouter);
    app.use('/api/v1/tv', [auth], tvRouter);
    app.use('/api/v1/report', [auth], reportRouter);
}