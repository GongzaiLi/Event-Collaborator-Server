const EventsImage = require('../models/events.images.server.model');

exports.getImage = async function (req, res) {
    console.log("get a user's Image.");

    try {
        const response = await EventsImage.getImage(req);
        if (response) {
            res.contentType(response.type);
            res.status(200)
                .send(response.image);
        } else {
            res.status(404)
                .send("404: Not Found");
        }
    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);
    }
}

exports.putImage = async function (req, res) {

    console.log("put Image into a user's.");

    try {//200 201 400 401 403 404
        const response = await EventsImage.putImage(req);

        if (response === 200) {
            res.status(200)
                .send("OK");
        } else if (response === 201) {
            res.status(201)
                .send('Created');
        } else if (response === 400) {
            res.status(400)
                .send('400: Bad Request');
        } else if (response === 401) {
            res.status(401)
                .send('401: Unauthorized');
        } else if (response === 403) {
            res.status(403)
                .send('403: Forbidden');
        } else {
            res.status(404)
                .send('404: Not Found');
        }
    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);
    }

}