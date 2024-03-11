const bodyParser = require('body-parser');
const cors = require('cors');

module.exports = (app) => {
    app.use(cors());
    // app.use(bodyParser.json());
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
}