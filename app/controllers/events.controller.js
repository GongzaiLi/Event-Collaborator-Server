const Events = require('../models/events.model');

exports.readAllEvents = async function (req, res) {
    try {
        const result = await Events.readAllEvents(req);
        res.statusMessage = "OK";
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};