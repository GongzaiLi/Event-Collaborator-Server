const users = require('../controllers/user.server.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/register')
        .post(users.createOneNewUser);

    app.route(app.rootUrl + '/users/login')
        .post(users.loginUser);
}