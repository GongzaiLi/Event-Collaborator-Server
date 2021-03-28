const eventAttend = require('../controllers/events.attendees.server.controller');


module.exports = function (app) {
    app.route(app.rootUrl + '/events/:id/attendees')
        .get(eventAttend.getAttendees)
        .post(eventAttend.createAttendees)
        .delete(eventAttend.deleteAttendees);
}