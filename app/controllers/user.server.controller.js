const Users = require('../models/user.server.model');

exports.createOneNewUser = async function (req, res) {
    console.log('Register as a new user.');

    try {
        const result = await Users.createOneNewUser(req);

        if (result) {
            res.status(201)
                .send({userId: result.insertId});
        } else {
            res.status(400)
                .send('400: Bad Request');
        }
    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);
    }
}

exports.loginUser = async function (req, res) {
    console.log('User login checking');

    try {
        const result = await Users.loginUser(req);
        if (result) {
            res.status(200)
                .send(result);
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
        const result = await Users.logoutUser(req);
        if (result.changedRows === 1) {
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
        const result = await Users.getUser(req);

        if (result) {
            if (!result.email.length) delete result.email;
            res.status(200)
                .send(result);

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
        const result = await Users.updateUser(req);

        if (result) {
            res.status(200)
                .send("OK");
        } else {
            res.status(404)
                .send("404: Not Found");
        }

    } catch (err) {
        res.status(500)
            .send(`500: ERROR getting ${err}`);

    }
}