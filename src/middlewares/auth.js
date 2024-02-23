const mysql = require('../configs/db.config');

module.exports = async (req, res, next) => {
    const authorization = req.headers.authorization
    const userAgent = req.headers['user-agent'];

    if (!authorization || !userAgent) {
        return res.status(401).send({
            state: 'err',
            message: "ارسال کد کاربر الزامی می باشد"
        });
    }

    const [token] = await mysql.query('SELECT * FROM tbl_subscribers WHERE token = ? AND user_agent = ?', [authorization, userAgent]);
    if (token.length !== 1) {
        return res.status(401).send({
            state: 'err',
            message: "کد کاربر صحیح نمی باشد"
        });
    }

    next()
}