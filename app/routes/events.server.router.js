const events = require('../controllers/events.server.controller');

/**
 * 200 OK

 GET: The resource has been fetched and is transmitted in the message body.
 HEAD: The entity headers are in the message body.
 PUT or POST: The resource describing the result of the action is transmitted in the message body.


 201 Created
 The request has succeeded and a new resource has been created as a result. This is typically the response sent after POST requests, or some PUT requests.
 * @param app
 */
module.exports = function (app) {
    app.route(app.rootUrl + '/events')
        .get(events.readEvents)// problem
        .post(events.createEvent);
    app.route(app.rootUrl + '/events/:id')
        .get(events.getOneEvent)
        .patch(events.updateEvent)
        .delete(events.deleteEvent);
}