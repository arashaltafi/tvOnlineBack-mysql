const verifyRouter = require('./verify');
const profileRouter = require('./profile');
const auth = require('../middlewares/auth')

module.exports = (app) => {
    app.use('/api/v1/verify', verifyRouter);
    app.use('/api/v1/profile', [auth], profileRouter);
}