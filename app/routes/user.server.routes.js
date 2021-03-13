const users = require('../controllers/user.server.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/test')
        .get( users.list )
}