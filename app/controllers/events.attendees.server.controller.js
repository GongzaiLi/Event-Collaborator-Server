const EventAttend = require('../models/events.attendees.server.model');


exports.getAttendees = async function (req, res) {
    try {
        const response = await EventAttend.getAttendees(req);
        if (response) {
            res.status(200)
                .send(response);
        } else {
            res.status(404)
                .send("404: Not Found");
        }
    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);
    }

}

exports.createAttendees = async function (req, res) {
    //201 401 403 404
    try {
        const response = await EventAttend.createAttendees(req);

        if (response === 201) {
            res.status(201)
                .send("OK");
        } else if (response === 401) {
            res.status(401)
                .send("401: Unauthorized");
        } else if (response === 403) {
            res.status(403)
                .send("403: Forbidden");
        } else {
            res.status(404)
                .send("404: Not Found");
        }
    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);
    }

}
exports.deleteAttendees = async function (req, res) {

}