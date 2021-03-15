const db = require('../../config/db');


exports.createOneNewUser = async function (req) {
    console.log('Request to Register as a new user into the database...');
    const user = req.body;
    const conn = await db.getPool().getConnection(); //CONNECTING

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
    userInfo.password = (user.password) ? user.password : null;
    userInfo.authToken = (user.authToken) ? user.authToken : null;

    //The firstName / lastName/ email/ password must not be an empty string.
    if (!userInfo.firstName && !userInfo.lastName && !userInfo.email && !userInfo.password) return;
    if (user.email.search('@') == -1) return;//The email must be syntactically valid @

    //The email address must not already be in use
    const [[checkEmail]] = await conn.query(`select count(email) as number from user where email="${userInfo.email}"`);
    if (checkEmail.number) return;

    // console.log(typeof Object.values(userInfo));
    const sql = 'INSERT INTO user (email, first_name, last_name, image_filename, password) VALUES (?, ?, ?, ?, ?)';
    const [rows] = await conn.query(sql, Object.values(userInfo)); //query from database.
    conn.release();
    //console.log(rows);
    return rows;
};

// let sqlQuery = {
//     select: '',
//     from: '',
//     where: '',
//     groupBy: '',
//     sortBy: ''
// };