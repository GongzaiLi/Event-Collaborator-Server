const events = require('../controllers/events.server.controller');

module.exports = function (app) {

    app.route(app.rootUrl + '/events/categories')//should put in the top should ask ???????????????????????????/
        .get(events.getAllCategories);

    app.route(app.rootUrl + '/events')
        .get(events.readEvents)
        .post(events.createEvent);

    app.route(app.rootUrl + '/events/:id')
        .get(events.getOneEvent)
        .patch(events.updateEvent)
        .delete(events.deleteEvent);
}