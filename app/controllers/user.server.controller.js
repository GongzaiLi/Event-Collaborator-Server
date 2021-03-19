const Users = require('../models/user.server.model');

exports.createUser = async function (req, res) {
    console.log('Register as a new user.');

    try {
        const response = await Users.createUser(req);
        if (response) {
            if (response.insertId >= 0) {
                res.status(201) // minimum: 0
                    .send({userId: response.insertId});
            }
        }
        res.status(400)
            .send('400: Bad Request'); // need talk what is the error

    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);
    }
}

exports.loginUser = async function (req, res) {
    console.log('User login checking');

    try {
        const response = await Users.loginUser(req);
        if (response) {
            res.status(200)
                .send(response);
        } else {
            res.status(400)
                .send('400: Bad Request');
        }


    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);
    }
}

exports.logoutUser = async function (req, res) {
    console.log('User logout checking');

    try {
        const response = await Users.logoutUser(req);

        if (response) {
            res.status(200)
                .send("OK");
        } else {
            res.status(401)
                .send("401: Unauthorized");
        }


    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);
    }
}

exports.getUser = async function (req, res) {
    console.log('Searching a user.')

    try {
        const response = await Users.getUser(req);

        if (response) {
            if (response.firstName && response.lastName) {
                if (!response.email) delete response.email;
                res.status(200)
                    .send(response);
            } else {
                res.status(404)
                    .send("404: Not Found");
            }
        } else {
            res.status(404)
                .send("404: Not Found");
        }

    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);

    }

}

exports.updateUser = async function (req, res) {
    console.log("Change a user's details.");

    try {
        const response = await Users.updateUser(req);

        if (response === 200) {
            res.status(200)
                .send("OK");
        } else if (response === 400) {
            res.status(400)
                .send("400: Bad Request");
        } else if (response === 401) {
            res.status(401)
                .send("401: Unauthorized");
        } else {
            res.status(403)
                .send("404: Forbidden");
        }
    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);

    }
}