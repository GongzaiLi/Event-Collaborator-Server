const eventAttendHelper = require('../resources/helpers/events.attendees.server.helper');
const userHelper = require('../resources/helpers/users.server.helper');
const eventHelper = require('../resources/helpers/events.server.helper');

exports.getAttendees = async function (req) {
    const token = req.headers["x-authorization"];
    const findToken = await userHelper.checkToken(token);
    const eventId = req.params.id;
    const findEvent = await eventHelper.checkEventId(eventId);
    let userId = null;
    if (!await eventAttendHelper.checkEventIdInEventAttendees(eventId) || !findEvent) return 404;
    if (findToken) {
        userId = findToken.id;
    }
    return await eventAttendHelper.getEventAttendee(eventId, userId);
}

exports.createAttendees = async function (req) {
    const token = req.headers["x-authorization"];//201 403

    const findToken = await userHelper.checkToken(token);
    const eventId = req.params.id;
    const findEvent = await eventHelper.checkEventId(eventId);

    if (! findToken) return 401;
    if (! findEvent) return 404;

    if (!eventHelper.compareDate(findEvent.date) || await eventAttendHelper.checkUserIdInEventAttendees(eventId, findToken.id)) return 403;
    let stats = 2;// is pending
    if (findEvent.organizer_id === findToken.id) stats = 1; // is accepted

    await eventAttendHelper.insertEventIdInEventAttendees(eventId, findToken.id, stats);

    return 201;

}
exports.deleteAttendees = async function (req) {

}