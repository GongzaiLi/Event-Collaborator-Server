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

}
exports.deleteAttendees = async function (req, res) {

}