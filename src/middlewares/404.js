module.exports = (app) => {
    app.use((req, res, next) => {
        res.status(404).send({
            status: 404,
            code: "Not Found",
            message: "requested resource could not be found!"
        });
    });
}