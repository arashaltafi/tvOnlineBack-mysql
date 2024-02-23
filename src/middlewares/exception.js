module.exports = (app) => {
    app.use((error, req, res, next) => {
        const status = error.status || 500;
        res.status(status).send({
            status: status,
            code: 'Exception',
            message: error.message
        });
    });
}