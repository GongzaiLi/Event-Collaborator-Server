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
                .send('Bad Request');
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR getting ${err}`);
    }
}

exports.loginUser = async function (req, res) {
    console.log('User login checking');

    try {
        const result = await Users.loginUser(req);
        if (result) {
            res.status(200)
                .send({
                    userId: result.id,
                    token: result.password
                });
        } else {
            res.status(400)
                .send('Bad Request');
        }

    } catch (err) {
        res.status(500)
            .send(`ERROR getting ${err}`);
    }
}