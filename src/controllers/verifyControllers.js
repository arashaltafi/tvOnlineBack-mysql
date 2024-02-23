const mysql = require('../configs/db.config');
const axios = require('axios');
const { getCurrentDate, getCurrentDatePersian, generateRandomHashId } = require('../utils/Helper');
const { signToken, verifyToken } = require('../services/TokenService');

const verify = async (req, res, next) => {
    try {
        //Check Validation For Phone
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا شماره تلفن را وارد نمایید'
            });
        }
        if (phone.length !== 11) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا شماره تلفن را به صورت صحیح و 11 رقمی وارد نمایید'
            });
        }
        if (typeof phone !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا شماره تلفن را به صورت متن وارد نمایید'
            })
        }
        if (!phone.startsWith('09')) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا شماره را به صورت صحیح و با 09 وارد نمایید'
            })
        }
        if (isNaN(phone)) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا شماره تلفن را به صورت عدد وارد نمایید'
            })
        }

        const currentTime = getCurrentDate();
        const currentTimePersian = getCurrentDatePersian();

        // Get User Info By Phone
        let resultUser;
        resultUser = await mysql.query(`SELECT * FROM tbl_subscribers WHERE phone = ${phone}`);

        // Update SMS Sended Count
        if (resultUser[0][0] && resultUser[0][0].day_left && resultUser[0][0].day_left != currentTime) {
            await mysql.query(`UPDATE tbl_subscribers SET count = ? WHERE phone = ?`, ['0', phone]);
            resultUser = await mysql.query(`SELECT * FROM tbl_subscribers WHERE phone = ${phone}`);
        }


        let countCodeSended = '0'
        if (resultUser[0][0]) {
            countCodeSended = resultUser[0][0].count
        } else {
            countCodeSended = '0'
        }

        if (resultUser[0].length > 1) {
            return res.status(400).send({
                state: 'err',
                message: 'این شماره قبلا ثبت شده است'
            })
        }

        if (isNaN(countCodeSended)) {
            return res.status(500).send({
                state: 'err',
                message: 'خطا در انجام عملیات',
            });
        }

        // Check For Maximum SMS Sended
        if (parseInt(countCodeSended) >= 5) {
            return res.status(400).send({
                state: 'err',
                message: 'درخواست های شما برای امروز بیش از اندازه بوده است. لطفا روز آینده تلاش نمایید'
            })
        }

        // Send Sms Code
        const code = await sendMessage(phone);
        const token = generateRandomHashId();
        const userAgent = req.headers['user-agent'];
        console.log(token)

        if (code) { // SMS sent successfully
            if (resultUser[0].length === 1) { // Update User in DB
                await mysql.query(`UPDATE tbl_subscribers SET token = ?, user_agent = ?, smscode = ?, count = ?, day_left = ? WHERE phone = ?`, [token, userAgent, code, countCodeSended + 1, currentTime, phone]);
            } else { // Insert User to DB
                await mysql.query(`INSERT INTO tbl_subscribers SET phone = ?, token = ?, user_agent = ?, smscode = ?, date = ?, day_left = ?, count = ?`, [phone, token, userAgent, code, currentTimePersian, currentTime, countCodeSended + 1]);
            }
            // Query Select User From DB
            const userData = await mysql.query(`SELECT smscode, name, phone, avatar, date, token FROM tbl_subscribers WHERE phone = ${phone}`);
            const resultUserData = {
                name: userData[0][0].name,
                phone: userData[0][0].phone,
                avatar: userData[0][0].avatar,
                date: userData[0][0].date,
            }
            return res.status(200).send({ // Send Final Success User Data
                state: 'ok',
                message: 'عملیات موفق',
                data: resultUserData
            });
        } else { // SMS Don't Send successfully
            return res.status(500).send({
                state: 'err',
                message: 'خطا در ارسال پیامک'
            })
        }
    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات',
        });
    }
}

const checkValidation = async (req, res, next) => {
    try {
        const { code, phone } = req.body;
        if (!phone) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا شماره تلفن را به صورت عدد وارد نمایید'
            })
        }
        if (phone.length !== 11) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا شماره تلفن را به صورت صحیح و 11 رقمی وارد نمایید'
            });
        }
        if (typeof phone !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا شماره تلفن را به صورت متن وارد نمایید'
            })
        }
        if (!phone.startsWith('09')) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا شماره را به صورت صحیح و با 09 وارد نمایید'
            })
        }
        if (!code) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا کد تایید را به صورت عدد وارد نمایید'
            })
        }
        if (code.length !== 4) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا کد تایید را به صورت صحیح و 4 رقمی وارد نمایید'
            });
        }
        if (typeof code !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا کد تایید را به صورت متن وارد نمایید'
            })
        }

        // Query Select User From DB
        const [user] = await mysql.query('SELECT * FROM tbl_subscribers WHERE smscode = ? AND phone = ?', [code, phone]);
        if (user.length !== 1) {
            return res.status(400).send({
                state: 'err',
                message: 'کد وارد شده صحیح نمی باشد'
            })
        } else {
            // Query Delete smsCode From DB
            await mysql.query('UPDATE tbl_subscribers set smscode = ? WHERE phone = ?', ['', phone]);

            const token = {
                token: user[0].token
            }
            return res.status(200).send({
                state: 'ok',
                message: 'ورود شما با موفقیت انجام شد',
                data: token
            })
        }
    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات',
        });
    }
}

const sendMessage = async (phone) => {
    const token = Math.floor(1000 + Math.random() * 9000);
    const template = 'mrenglish';
    const apiUrl = `https://api.kavenegar.com/v1/3333666873757723423469694C324433707145adf33421432414B32576B70716A634D525A593D/verify/lookup.json?receptor=${phone}&token=${token}&template=${template}&type=sms`;
    const response = await axios.get(apiUrl);

    if (response.status === 200) {
        return token;
    } else {
        return null;
    }
}

module.exports = {
    verify, checkValidation
};