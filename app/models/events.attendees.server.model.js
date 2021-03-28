const eventAttendHelper = require('../resources/helpers/events.attendees.server.helper');
const userHelper = require('../resources/helpers/users.server.helper');
const eventHelper = require('../resources/helpers/events.server.helper');

//need do the status in attendance_status
exports.getAttendees = async function (req) {
    const token = req.headers["x-authorization"];
    const findToken = await userHelper.checkToken(token);
    const eventId = req.params.id;
    const findEvent = await eventHelper.checkEventId(eventId);
    let userId = null;
    if (!await eventAttendHelper.checkEventIdInEventAttendees(eventId) || !findEvent) return null;
    if (findToken) userId = findToken.id;
    return await eventAttendHelper.getEventAttendee(eventId, userId);
}// need check

exports.createAttendees = async function (req) {
    const token = req.headers["x-authorization"];//201 403

    const findToken = await userHelper.checkToken(token);
    const eventId = req.params.id;
    const findEvent = await eventHelper.checkEventId(eventId);

    if (!findToken) return 401;
    if (!findEvent) return 404;

    if (!eventHelper.compareDate(findEvent.date) || await eventAttendHelper.checkUserIdInEventAttendees(eventId, findToken.id)) return 403;
    let stats = 2;// is pending
    if (findEvent.organizer_id === findToken.id) stats = 1; // is accepted

    await eventAttendHelper.insertEventIdInEventAttendees(eventId, findToken.id, stats);

    return 201;

}// need check

exports.deleteAttendees = async function (req) {
    //200 404
    const token = req.headers["x-authorization"];
    const findToken = await userHelper.checkToken(token);
    if (!findToken) return 401;
    const eventId = req.params.id;
    const findEvent = await eventHelper.checkEventId(eventId);
    if (!findEvent) return 404;

    const findEventAttend = await eventAttendHelper.checkUserIdInEventAttendees(eventId, findToken.id);
    if (!findEventAttend || !eventHelper.compareDate(findEvent.date)) return 403;
    if (findEventAttend) {
        if (findEventAttend.attendance_status_id === 3) {
            return 403;
        }
    }
    await eventAttendHelper.deleteEventIdAndUserIdInEventAttendee(eventId, findToken.id);
    return 200;
}// need check

exports.changeStatus = async function (req) {
    //200 404
    const token = req.headers["x-authorization"];
    const eventId = req.params.event_id;
    const userId = req.params.user_id;
    const statusBody = req.body;
    const statusList = await eventAttendHelper.getAttendanceStatus();
    const findToken = await userHelper.checkToken(token);
    if (!findToken) return 401;
    const findEvent = await eventHelper.checkEventId(eventId);
    const findEventAttendees = await eventAttendHelper.checkUserIdInEventAttendees(eventId, userId);
    if (!findEvent || !findEventAttendees) return 404; // not sure the find event should in hare??
    if (!findEvent.organizer_id === findToken.id) return 403;
    if (!eventAttendHelper.validStatus(statusBody.status) || !statusBody.status in statusList) return 400;
    await eventAttendHelper.updateStatus(eventId, userId, statusList[statusBody.status]);
    return 200;
}