const backdoor = require('../controllers/backdoor.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/reset')
        .post(backdoor.resetDb);  //built database

    app.route(app.rootUrl + '/resample')
        .post(backdoor.resample);  //load data

    app.route(app.rootUrl + '/reload')
        .post(backdoor.reload);  // built database and load data

    app.route(app.rootUrl + '/executeSql')
        .post(backdoor.executeSql); // body add sql =>select * from user;
};
