const jwt = require('jsonwebtoken');

exports.signToken = (data) => {
    return jwt.sign(data, process.env.APP_SECRET)
}

exports.verifyToken = (token) => {
    try {
        jwt.verify(token, process.env.APP_SECRET)
        return true;
    } catch (error) {
        return false;
    }
}

exports.decodeToken = (token) => {
    return jwt.decode(token, process.env.APP_SECRET)
}