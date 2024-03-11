const mysql = require('../configs/db.config');
const axios = require('axios');
const { createImageFromBase64, generateRandomNumber } = require('../utils/Helper');

const sendName = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا نام خود را وارد نمایید'
            })
        }
        if (typeof name !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا نام خود را به صورت متن وارد نمایید'
            })
        }
        if (name.length > 40) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا نام خود را کوتاه تر از 40 کاراکتر وارد نمایید'
            })
        }

        const token = req.headers.authorization;

        // Update Avatar Name
        await mysql.query('UPDATE tbl_subscribers SET name = ? WHERE token = ?', [name, token]);

        // Select User Data
        const [user] = await mysql.query('SELECT name, avatar FROM tbl_subscribers WHERE token = ?', [token])

        return res.status(200).send({
            state: 'ok',
            message: 'عملیات موفق',
            data: {
                name: user[0].name,
                avatar: user[0].avatar
            }
        });
    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات',
        });
    }
}

const sendAvatar = async (req, res, next) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا عکس خود را ارسال نمایید'
            })
        }
        if (typeof image !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا عکس را به صورت رشته ارسال نمایید'
            })
        }

        const token = req.headers.authorization;

        // Select User Phone
        const [userPhone] = await mysql.query('SELECT phone FROM tbl_subscribers WHERE token = ?', [token])

        const response = await axios({
            url: 'https://arashaltafi.ir/tvonline/v1/send_profile_avatar2.php',
            method: 'POST',
            data: {
                phone: userPhone[0].phone,
                image: image
            },
        })

        if (response.status !== 200) {
            return res.status(500).send({
                state: 'err',
                message: 'خطا در انجام عملیات',
            });
        }

        // Update Avatar User
        await mysql.query('UPDATE tbl_subscribers SET avatar = ? WHERE token = ?', [response.data.avatar, token]);

        // Select User Data
        const [user] = await mysql.query('SELECT name, avatar FROM tbl_subscribers WHERE token = ?', [token])

        return res.status(200).send({
            state: 'ok',
            message: 'عملیات موفق',
            data: {
                name: user[0].name,
                avatar: user[0].avatar
            }
        });

    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات',
        });
    }
}

const sendAvatar2 = async (req, res, next) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا عکس خود را ارسال نمایید'
            })
        }
        if (typeof image !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا عکس را به صورت رشته ارسال نمایید'
            })
        }

        const token = req.headers.authorization;

        // Select User Data
        const [userPhone] = await mysql.query('SELECT phone FROM tbl_subscribers WHERE token = ?', [token])

        // Convert Base64 to Image
        createImageFromBase64(image, './assets/images/' + `${userPhone[0].phone}_${generateRandomNumber()}.png`, 2).then(async (result) => {
            const finalFileName = 'https://github.com/arashaltafi/tvOnline-mysql/blob/master/back/assets/images/' + result
            // Update Avatar User
            await mysql.query('UPDATE tbl_subscribers SET avatar = ? WHERE token = ?', [finalFileName, token]);

            // Select User Data
            const [user] = await mysql.query('SELECT name, avatar FROM tbl_subscribers WHERE token = ?', [token])

            return res.status(200).send({
                state: 'ok',
                message: 'عملیات موفق',
                data: {
                    name: user[0].name,
                    avatar: user[0].avatar
                }
            });
        }).catch((error) => {
            return res.status(400).send({
                state: 'err',
                message: 'خطا در انجام عملیات'
            })
        }).finally(() => { })
    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات'
        })
    }
}

module.exports = {
    sendName, sendAvatar
};