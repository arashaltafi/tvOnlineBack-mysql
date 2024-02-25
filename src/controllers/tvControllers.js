const mysql = require('../configs/db.config');

const getAllByState = async (req, res, next) => {
    try {
        const { state, page_number, page_size } = req.query;

        const pageOffset = (parseInt(page_number) - 1) * parseInt(page_size) || 0;
        const pageLimit = parseInt(page_size) || 1000;

        if (pageOffset < 0 || pageLimit <= 0) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا مقادیر page_number و page_size را به صورت صحیح وارد نمایید',
            });
        }

        if (!state) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا مقادیر state را به صورت صحیح وارد نمایید',
            })
        }
        if (typeof state !== 'string') {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا state را به صورت متن وارد نمایید'
            })
        }
        if (!isNaN(state)) { //its number
            return res.status(400).send({
                state: 'err',
                message: 'لطفا state را به صورت متن وارد نمایید'
            })
        }
        if (state.length > 50) {
            return res.status(400).send({
                state: 'err',
                message: 'لطفا state را صحیح وارد نمایید'
            })
        }

        const [tvItems] = await mysql.query(`SELECT * FROM tvs WHERE state = '${state}' ORDER BY id ASC LIMIT ${pageOffset}, ${pageLimit}`);

        if (tvItems.length > 0) {
            const resultTvData = {
                total: tvItems.length,
                records: tvItems.map((tvItem) => {
                    return {
                        id: tvItem.id,
                        name: tvItem.name,
                        description: tvItem.description,
                        image: tvItem.image,
                        link: tvItem.link,
                        isIran: tvItem.isIran,
                    }
                })
            }

            res.status(200).send({
                state: 'ok',
                message: 'عملیات موفق',
                data: resultTvData

            });
        } else {
            const resultTvData = {
                total: 0,
                records: []
            }

            res.status(400).send({
                state: 'ok',
                message: 'موردی یافت نشد',
                data: resultTvData
            });
        }
    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات'
        });
    }
}

const getAllData = async (req, res, next) => {
    try {
        const [banner] = await mysql.query(`SELECT * FROM banner WHERE isVisible = ${1} ORDER By id ASC`);
        const [tvsGlobal] = await mysql.query('SELECT * FROM tvs WHERE state = ?', ['TV_GLOBAL']);
        const [tvsInternational] = await mysql.query('SELECT * FROM tvs WHERE state = ?', ['TV_INTERNATIONAL']);
        const [tvsExclusive] = await mysql.query('SELECT * FROM tvs WHERE state = ?', ['TV_EXCLUSIVE']);
        const [tvsRadio] = await mysql.query('SELECT * FROM tvs WHERE state = ?', ['TV_RADIO']);
        const [tvsSatellite] = await mysql.query('SELECT * FROM tvs WHERE state = ?', ['TV_SATELLITE']);
        const [tvsProvincial] = await mysql.query('SELECT * FROM tvs WHERE state = ?', ['TV_PROVINCIAL']);

        return res.status(200).send({
            state: 'ok',
            message: 'عملیات موفق',
            data: {
                'BANNER': banner,
                'TV_GLOBAL': tvsGlobal,
                'TV_INTERNATIONAL': tvsInternational,
                'TV_EXCLUSIVE': tvsExclusive,
                'TV_RADIO': tvsRadio,
                'TV_SATELLITE': tvsSatellite,
                'TV_PROVINCIAL': tvsProvincial,
            }
        })
    } catch (error) {
        return res.status(500).send({
            state: 'err',
            message: 'خطا در انجام عملیات'
        });
    }
}

module.exports = {
    getAllByState, getAllData
};