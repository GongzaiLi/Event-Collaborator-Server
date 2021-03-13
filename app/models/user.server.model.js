const  db = require('../../config/db');


exports.getAll = async function(){

    console.log( 'Request to get all users from the database...' );

    const conn = await db.getPool().getConnection(); //CONNECTING
    const query = 'select * from user '; // string
    const [ rows ] = await conn.query( query ); //query from database.
    conn.release();
    return rows;
};