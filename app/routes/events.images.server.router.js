const eventsImage = require('../controllers/events.images.server.controller');

module.exports = function (app) {

    app.route(app.rootUrl + '/events/:id/image')
        .get(eventsImage.getImage)
        .put(eventsImage.putImage);
}