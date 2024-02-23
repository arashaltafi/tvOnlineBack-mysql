require('dotenv').config();
const bootApplication = require('./src/app');
bootApplication(process.env.APP_PORT);