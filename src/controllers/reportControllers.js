const mysql = require('../configs/db.config');

const sendReport = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const { videoId, videoTitle, videoLink, videoImage } = req.body;

        if (!videoId) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا آیدی را وارد نمایید',
            })
        }
        if (typeof videoId !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا آیدی را به صورت متن وارد نمایید',
            })
        }
        if (videoId.length > 5) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا آیدی را به صورت صحیح وارد نمایید',
            })
        }
        if (isNaN(videoId)) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا آیدی را به صورت عدد وارد نمایید'
            })
        }

        if (!videoTitle) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا نام شبکه را وارد نمایید',
            })
        }
        if (typeof videoTitle !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا نام شبکه را به صورت متن وارد نمایید',
            })
        }
        if (!isNaN(videoTitle)) { //its number
            return res.status(400).send({
                state: 'err',
                message: 'لطفا نام شبکه را به صورت متن وارد نمایید'
            })
        }

        if (!videoLink) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا لینک شبکه را وارد نمایید',
            })
        }
        if (typeof videoLink !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا لینک شبکه را به صورت متن وارد نمایید',
            })
        }
        if (!isNaN(videoLink)) { //its number
            return res.status(400).send({
                state: 'err',
                message: 'لطفا لینک شبکه را به صورت متن وارد نمایید'
            })
        }

        if (!videoImage) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا عکس شبکه را وارد نمایید',
            })
        }
        if (typeof videoImage !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا عکس شبکه را به صورت متن وارد نمایید',
            })
        }
        if (!isNaN(videoImage)) { //its number
            return res.status(400).send({
                state: 'err',
                message: 'لطفا عکس شبکه را به صورت متن وارد نمایید'
            })
        }

        // Query To Get Phone By Token
        const [phone] = await mysql.query('SELECT phone FROM tbl_subscribers WHERE token = ?', [token]);

        // Check Phone Its For Token
        if (phone.length !== 1) {
            return res.status(401).send({
                state: 'err',
                message: "کد کاربر صحیح نمی باشد"
            });
        }

        // SELECT FROM COMMENT To Check it's Exist Or No
        const [userReports] = await mysql.query('SELECT * FROM report WHERE phone = ? AND video_id = ?', [phone, videoId])

        // If Comment Exist Return Error
        if (userReports.length > 0) {
            return res.status(400).send({
                state: 'err',
                message: 'گزارش شما قبلا ثبت شده است',
            });
        }

        // INSERT INTO COMMENT
        await mysql.query('INSERT INTO report SET ?', {
            video_id: videoId,
            video_link: videoLink,
            video_image: videoImage,
            video_title: videoTitle,
            phone: phone,
        })

        return res.status(200).send({
            state: 'ok',
            message: 'عملیات موفق'
        });

    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات',
        });
    }
}


module.exports = {
    sendReport
};