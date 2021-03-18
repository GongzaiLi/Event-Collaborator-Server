const db = require('../../../config/db');
//----------------------------------------------------INSERT------------------------------------------------------------
exports.insertRegister = async function (registerNeed) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query('INSERT INTO user (email, first_name, last_name, password) VALUES (?, ?, ?, ?)', Object.values(registerNeed)); //query from database.
    conn.release();
    return rows;
}
//----------------------------------------------------check-------------------------------------------------------------
exports.checkId = async function (id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [[rows]] = await conn.query("select * from user where id = (?)", [id]);
    conn.release();
    return rows;
}

exports.checkEmail = async function (email) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [[rows]] = await conn.query("select * from user where email = (?)", [email]);
    conn.release();
    return rows;
}

exports.checkFirstName = async function (first_name) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [[rows]] = await conn.query("select * from user where first_name = (?)", [first_name]);
    conn.release();
    return rows;
}

exports.checkLastName = async function (last_name) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [[rows]] = await conn.query("select * from user where last_name = (?)", [last_name]);
    conn.release();
    return rows;
}

exports.checkImage = async function (image_filename) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [[rows]] = await conn.query("select * from user where image_filename = (?)", [image_filename]);
    conn.release();
    return rows;
}


exports.checkToken = async function (auth_token) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [[rows]] = await conn.query("select * from user where auth_token = (?)", [auth_token]);
    conn.release();
    return rows;
}


//---------------------------------------------------update------------------------------------------------
exports.updateEmail = async function (email, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update user set email=(?) where id=(?)", [email, id]);
    conn.release();
    return rows;
}
exports.updateFirstName = async function (first_name, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update user set first_name=(?) where id=(?)", [first_name, id]);
    conn.release();

    return rows;
}
exports.updateLastName = async function (last_name, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update user set last_name=(?) where id=(?)", [last_name, id]);
    conn.release();
    return rows;
}
exports.updatePassword = async function (password, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update user set password = ( ? ) where id = ( ? )", [password, id]);
    conn.release();
    return rows;
}
exports.updateToken = async function (auth_token, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update user set auth_token=(?) where id=(?)", [auth_token, id]);
    conn.release();
    return rows;
}
//------------------------------------------------------valid----------{true, false}------------------------------------
exports.validateEmail = function (email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


