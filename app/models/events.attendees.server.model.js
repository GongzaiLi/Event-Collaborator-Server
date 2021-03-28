const eventAttendHelper = require('../resources/helpers/events.attendees.server.helper');
const userHelper = require('../resources/helpers/users.server.helper');
const eventHelper = require('../resources/helpers/events.server.helper');

exports.getAttendees = async function (req) {
    const token = req.headers["x-authorization"];
    const findToken = await userHelper.checkToken(token);
    const eventId = req.params.id;
    const findEvent = await eventHelper.checkEventId(eventId);
    let organizerId = null;
    if (!await eventAttendHelper.checkEventIdInEventAttendees(eventId) || !findEvent) return 404;
    if (findToken) {
        if (findEvent.organizer_id === findToken.id) organizerId = findToken.id;
    }
    return await eventAttendHelper.getEventAttendee(eventId, organizerId);
}

exports.createAttendees = async function (req) {

}
exports.deleteAttendees = async function (req) {

}