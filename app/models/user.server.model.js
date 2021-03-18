const db = require('../../config/db');
const password = require('../resources/helper/password');
const helper = require('../resources/helper/user.server.helper');


exports.createOneNewUser = async function (req) {
    console.log('Request to Register as a new user into the database...');

    let registerNeed = req.body;
    if (registerNeed.email && registerNeed.firstName && registerNeed.lastName && registerNeed.password) {
        if (helper.validateEmail(registerNeed.email)) {
            registerNeed.password = await password.hashPassword(registerNeed.password);
            const response = await helper.insertRegister(registerNeed);
            return response;
        }
    }
    return null;
};


exports.loginUser = async function (req) {
    console.log('Request to User login!');

    const user = req.body;
    let response = {
        userId: '',
        token: ''
    };

    const rows = await helper.checkEmail(user.email);

    if (rows) {

        if (await password.loadPassword(user.password, rows.password)) {

            //??????????????????????????????????????????????????????????????????need fixing
            //console.log(token);
            if (await password.loadPassword(rows.id.toString(), await helper.checkToken(token))) {
                const token = await password.hashPassword(rows.id.toString())
                await helper.updateToken(token, rows.id);// ???????????????????????????????????????? can login many time???
            }
            response.userId = rows.id;
            response.token = token;
            return response;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

exports.logoutUser = async function (req) {
    console.log('Request to User logout!');


    const token = req.headers["x-authorization"];

    const rows = await helper.checkToken(token);
    console.log('Request to User logout!');

    if (rows) {
        const [result] = await conn.query(`UPDATE user
                                           SET auth_token = null
                                           where id = (?)`, [rows.id]);
        conn.release();
        return result;

    } else {
        return null;
    }
}

exports.getUser = async function (req) {
    console.log('Retrieve information about a user.');
    const conn = await db.getPool().getConnection(); //CONNECTING

    const token = req.headers["x-authorization"];
    const userId = req.params.id;

    let result = {
        firstName: '',
        lastName: '',
        email: ''
    }

    const [[rows]] = await conn.query(`select * from user where auth_token="${token}"`);

    if (rows) {
        if (rows.id.toString() === userId) { // row.id type is number
            result.firstName = rows.first_name;
            result.lastName = rows.last_name;
            result.email = rows.email;
        } else {
            const [[rows]] = await conn.query(`select * from user where id="${userId}"`);
            //console.log(rows); if the sql not the data will return "undefined"
            if (rows) {
                result.firstName = rows.first_name;
                result.lastName = rows.last_name;
            } else {
                conn.release();
                return null; // cannot find the id
            }
        }
        conn.release();
        return result;

    } else {
        return null;
    }
}

exports.updateUser = async function (req) {
    console.log('Request to update User!');

    const token = req.headers["x-authorization"];
    const id = req.params.id;

    const loginUser = await helper.checkToken(token);
    let user = req.body;
    let status = 400;

    if (loginUser) {
        if (loginUser.id === parseInt(id)) {
            if (user.currentPassword) { //0, "", null, undefined, is false

                if (user.firstName) {
                    console.log(1);
                    await helper.updateFirstName(user.firstName, id);
                    console.log(2);
                    status = 200;
                }
                if (await password.loadPassword(user.currentPassword, loginUser.password)) {
                    user.password = await password.hashPassword(user.password);

                    const row = await helper.updatePassword(user.password, loginUser.id);
                    console.log(typeof loginUser.id, typeof id);
                    if (row) status = 200;
                } else {
                    return 403; // ??????if current password is not right ?????
                }
            }

            if (user.lastName) await helper.updateFirstName(user.lastName, id), status = 200;
            if (helper.validateEmail(user.email)) await helper.updateFirstName(user.email, id), status = 200;

        } else {
            status = 403;
        }

    } else {
        status = 401;
    }
    return status;
}




