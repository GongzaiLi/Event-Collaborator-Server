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

        res.status(500).send(`500: ERROR getting ${err}`);
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
                .send({eventId: response.insertId});

        }
    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);
    }

}

exports.getOneEvent = async function (req, res) {
    //200 404 500
    try {
        const response = await Events.getOneEvent(req);
        if (response) {
            res.statusMessage = "OK";
            res.status(200).send(response);
        } else {
            res.status(404).send("404: Not Found");
        }

    } catch (err) {
        res.status(500).send(`500: ERROR getting ${err}`);
    }
}

exports.updateEvent = async function (req, res) {
    //200 400 401 403 404 500
    try {
        const response = await Events.updateEvent(req);

        if (response === 200) {
            res.status(200)
                .send("OK");
        } else if (response === 400) {
            res.status(400)
                .send("400: Bad Request");
        } else if (response === 401) {
            res.status(401)
                .send("401: Unauthorized");
        } else if (response === 403) {
            res.status(403)
                .send("403: Forbidden");
        } else {
            res.status(404)
                .send("404: Not Found"); // not sure only in online
        }
    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);
    }
}

exports.deleteEvent = async function (req, res) {
    //200 401 403 404 500
    try {
        const response = await Events.deleteEvent(req);

        if (response === 200) {
            res.status(200)
                .send("OK");
        } else if (response === 401) {
            res.status(401)
                .send("401: Unauthorized");
        } else if (response === 403) {
            res.status(403)
                .send("403: Forbidden");
        } else {
            res.status(404)
                .send("404: Not Found"); // not sure only in online
        }
    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);
    }
}

exports.getAllCategories = async function (req, res) {
    try {
        const response = await Events.getAllCategories();
        res.statusMessage = "OK";
        res.status(200).send(response);

    } catch (err) {
        res.status(500).send(`500: ERROR getting ${err}`);
    }

}