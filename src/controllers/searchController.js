const mysql = require('../configs/db.config');

const searchTv = async (req, res, next) => {
    try {
        const { search, page_number, page_size } = req.query;

        const pageOffset = (parseInt(page_number) - 1) * parseInt(page_size) || 0;
        const pageLimit = parseInt(page_size) || 1000;

        if (pageOffset < 0 || pageLimit <= 0) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا مقادیر page_number و page_size را به صورت صحیح وارد نمایید',
            });
        }

        const [searchItems] = await mysql.query(`SELECT * FROM tvs WHERE name LIKE '%${search}%' ORDER BY id ASC LIMIT ${pageOffset}, ${pageLimit}`);

        if (searchItems.length > 0) {
            const resultSearchData = {
                total: searchItems.length,
                records: searchItems.map((searchItem) => {
                    return {
                        id: searchItem.id,
                        name: searchItem.name,
                        description: searchItem.description,
                        image: searchItem.image,
                        link: searchItem.link,
                        isIran: searchItem.isIran,
                    }
                })
            }

            res.status(200).send({
                state: 'ok',
                message: 'عملیات موفق',
                data: resultSearchData

            });
        } else {
            const resultSearchData = {
                total: 0,
                records: []
            }

            res.status(200).send({
                state: 'ok',
                message: 'جستجوی شما نتیجه ای در بر نداشت',
                data: resultSearchData
            });
        }
    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات',
        });
    }
}

module.exports = {
    searchTv
};