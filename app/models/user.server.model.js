const db = require('../../config/db');
const password = require('../resources/helper/password');

exports.createOneNewUser = async function (req) {
    console.log('Request to Register as a new user into the database...');
    const conn = await db.getPool().getConnection(); //CONNECTING

    const user = req.body;

    let userInfo = {
        email: '',
        firstName: '',
        lastName: '',
        imageFilename: null,
        password: ''
    };

    userInfo.firstName = (user.firstName) ? user.firstName : null;
    userInfo.lastName = (user.lastName) ? user.lastName : null;
    userInfo.email = (user.email) ? user.email : null;
    userInfo.imageFilename = (user.imageFilename) ? user.imageFilename : null;

    userInfo.password = (user.password) ? await password.hashPassword(user.password) : null;
    userInfo.authToken = (user.authToken) ? user.authToken : null;


    //The firstName / lastName/ email/ password must not be an empty string.
    if (!userInfo.firstName && !userInfo.lastName && !userInfo.email && !userInfo.password) return null;
    if (user.email.search('@') == -1) return null;//The email must be syntactically valid @ //-1

    //The email address must not already be in use
    const [[checkEmail]] = await conn.query(`select count(email) as number from user where email="${userInfo.email}"`);
    if (checkEmail.number) return null;

    // console.log(typeof Object.values(userInfo));
    const sql = 'INSERT INTO user (email, first_name, last_name, image_filename, password) VALUES (?, ?, ?, ?, ?)';

    const [rows] = await conn.query(sql, Object.values(userInfo)); //query from database.
    conn.release();
    //console.log(rows);
    return rows;
};

exports.loginUser = async function (req) {
    console.log('Request to User login!');
    const conn = await db.getPool().getConnection(); //CONNECTING

    const user = req.body;

    let result = {
        userId: '',
        token: ''
    };

    const [[rows]] = await conn.query(`select * from user where email="${user.email}"`);

    if (rows) {
        if (await password.loadPassword(user.password, rows.password)) {
            const token = await password.hashPassword(rows.id.toString())
            //console.log(token);
            await conn.query(`UPDATE user
                              SET auth_token = (?)
                              where id = (?)`, [token, rows.id]); // ???????????????????????????????????????? can login many time???
            conn.release();
            result.userId = rows.id;
            result.token = token;
            return result;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

exports.logoutUser = async function (req) {
    console.log('Request to User logout!');
    const conn = await db.getPool().getConnection(); //CONNECTING

    const token = req.headers["x-authorization"];

    const [[rows]] = await conn.query(`select * from user where auth_token="${token}"`);

    if (rows) {
        const [result] = await conn.query(`UPDATE user
                                           SET auth_token = null
                                           where auth_token = (?)`, [token]);
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

exports.updateUser = async function(req) {

}