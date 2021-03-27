const express = require('express');
const bodyParser = require('body-parser');
const { allowCrossOriginRequestsMiddleware } = require('../app/middleware/cors.middleware');


module.exports = function () {
    // INITIALISE EXPRESS //
    const app = express();
    app.rootUrl = '/api/v1';

    // MIDDLEWARE
    app.use(allowCrossOriginRequestsMiddleware);
    app.use(bodyParser.json()); //-- for json
    app.use(bodyParser.raw({ type: 'text/plain' }));  // for the /executeSql endpoint
    //--------------------------------image---------------------------
    app.use(bodyParser.raw({type: 'image/*', limit: '50mb'}));

    // DEBUG (you can remove these)
    app.use((req, res, next) => {
        console.log(`##### ${req.method} ${req.path} #####`);
        next();
    });

    app.get('/', function (req, res) {
        res.send({ 'message': 'Hello World!' })
    });

    // ROUTES
    require('../app/routes/backdoor.routes')(app);
    require('../app/routes/users.server.route')(app);
    require('../app/routes/events.server.router')(app);
    require('../app/routes/events.images.server.router')(app);

    return app;
};
