const express = require('express');
const middlewares = require('../middlewares');
const middlewares404 = require('../middlewares/404');
const middlewaresException = require('../middlewares/exception');
const routers = require('../routers');

const app = express();
middlewares(app);
routers(app);
middlewaresException(app);
middlewares404(app);

module.exports = (port) => {
    app.listen(port, () => {
        console.log(`app is running on port: ${port}`);
    });
}