const mysql = require('../configs/db.config');

const getAll = async (req, res, next) => {
    try {
        // Select All Banners
        const [banners] = await mysql.query(`SELECT * FROM banner WHERE isVisible = ${1} ORDER By id ASC`);

        const bannersData = {
            total: banners.length,
            records: banners.map((banner) => {
                return {
                    id: banner.id,
                    videoId: banner.videoId,
                    videoImage: banner.videoImage,
                    title: banner.title,
                    videoUrl: banner.videoUrl,
                    imageUrl: banner.imageUrl
                }
            })
        }

        return res.status(200).send({
            state: 'ok',
            message: 'عملیات موفق',
            data: bannersData
        });
    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات',
        });
    }
}

module.exports = {
    getAll
};