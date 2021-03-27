const Events = require('../models/events.server.model');

exports.readEvents = async function (req, res) {
    try {

        const response = await Events.readEvents(req);
        if (response) {
            res.statusMessage = "OK";
            res.status(200).send(response);
        } else {
            res.status(400).send("400: Bad Request");
        }

    } catch (err) {

        res.status(500).send("Internal Server Error");
    }
};

exports.createEvent = async function (req, res) {
    //201 400 401 500
    try {
        const response = await Events.createEvent(req);

        if (response === 400) {
            res.status(400)
                .send("400: Bad Request");
        } else if (response === 401) {
            res.status(401)
                .send("401: Unauthorized");
        } else {
            res.status(201)
                .send({eventId : response.insertId});

        }
    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);
    }

}