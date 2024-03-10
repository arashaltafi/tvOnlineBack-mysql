const mysql = require('../configs/db.config');

const getMyComments = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        // Query To Get Phone By Token
        const [phone] = await mysql.query('SELECT phone FROM tbl_subscribers WHERE token = ?', [token]);

        // Check Phone Its For Token
        if (phone.length !== 1) {
            return res.status(401).send({
                state: 'err',
                message: "کد کاربر صحیح نمی باشد"
            });
        }

        // Select All Comment By Token
        const [comments] = await mysql.query(`
            SELECT comment.id, comment.rating, comment.comment, tvs.image, tvs.name, tvs.state
            FROM tbl_subscribers
            INNER JOIN comment ON tbl_subscribers.phone = comment.phone
            INNER JOIN tvs ON comment.idVideo = tvs.id
            WHERE tbl_subscribers.phone = ? AND isConfirm = ? ORDER By id ASC
        `, [phone[0].phone, 1]);

        const commentsData = {
            total: comments.length,
            records: comments.map((comment) => {
                return {
                    id: comment.id,
                    name: comment.name,
                    state: comment.state,
                    image: comment.image,
                    rating: comment.rating,
                    comment: comment.comment
                }
            })
        }

        return res.status(200).send({
            state: 'ok',
            message: 'عملیات موفق',
            data: commentsData
        });
    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات'
        });
    }
}

const getAllById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا آیدی را وارد نمایید',
            })
        }
        if (typeof id !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا آیدی را به صورت متن وارد نمایید',
            })
        }
        if (id.length > 5) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا آیدی را به صورت صحیح وارد نمایید',
            })
        }
        if (isNaN(id)) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا آیدی را به صورت عدد وارد نمایید'
            })
        }

        // Select All Comment By Video ID
        const [comments] = await mysql.query(`
            SELECT tbl_subscribers.name, tbl_subscribers.date, tbl_subscribers.avatar, comment.id, comment.rating, comment.comment
            FROM tbl_subscribers
            INNER JOIN comment ON tbl_subscribers.phone = comment.phone
            WHERE isConfirm = ? AND idVideo = ? ORDER By id ASC
        `, [1, id]);

        const commentsData = {
            total: comments.length,
            records: comments.map((comment) => {
                return {
                    id: comment.id,
                    name: comment.name,
                    date: comment.date,
                    avatar: comment.avatar,
                    rating: comment.rating,
                    comment: comment.comment
                }
            })
        }

        return res.status(200).send({
            state: 'ok',
            message: 'عملیات موفق',
            data: commentsData
        });
    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات'
        });
    }
}

const sendComment = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const { idVideo, rating, comment } = req.body;

        if (!idVideo) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا آیدی را وارد نمایید',
            })
        }
        if (typeof idVideo !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا آیدی را به صورت متن وارد نمایید',
            })
        }
        if (idVideo.length > 5) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا آیدی را به صورت صحیح وارد نمایید',
            })
        }
        if (isNaN(idVideo)) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا آیدی را به صورت عدد وارد نمایید'
            })
        }

        if (!rating) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا امتیاز را وارد نمایید',
            })
        }
        if (typeof rating !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا امتیاز را به صورت متن وارد نمایید',
            })
        }
        if (rating.length > 3) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا امتیاز را به صورت صحیح وارد نمایید',
            })
        }

        if (!comment) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا نظر خود را وارد نمایید',
            })
        }
        if (typeof comment !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا نظر را به صورت متن وارد نمایید',
            })
        }
        if (rating.length > 1000) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا نظر خود را به کوتاه و خلاصه تر وارد نمایید',
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
        const [userComments] = await mysql.query('SELECT * FROM comment WHERE phone = ? AND idVideo = ?', [phone[0].phone, idVideo])

        // If Comment Exist Return Error
        if (userComments.length > 0) {
            return res.status(400).send({
                state: 'err',
                message: 'نظر شما قبلا ثبت شده است',
            });
        }

        // INSERT INTO COMMENT
        await mysql.query('INSERT INTO comment SET ?', {
            idVideo: idVideo,
            phone: phone[0].phone,
            rating: rating,
            comment: comment,
            isConfirm: 0
        })

        return res.status(200).send({
            state: 'ok',
            message: 'عملیات موفق'
        });

    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات'
        });
    }
}

module.exports = {
    getMyComments, getAllById, sendComment
};