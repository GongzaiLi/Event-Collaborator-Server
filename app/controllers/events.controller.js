const Events = require('../models/events.model');

exports.readAllEvents = async function (req, res) {
    try {
        const result = await Events.readAllEvents(req);
        res.statusMessage = "OK";
        res.status(200).send(result);
    } catch (err) {
        res.status(400).send("Bad Request");
        res.status(500).send("Internal Server Error");
    }
};

exports.createOneEvent = async function (req, res) {
    try {
        const eventId = await Events.createOneEvent(req);
        console.log(eventId);
        res.statusMessage = "OK";
        res.status(201).send({eventId : eventId});
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}