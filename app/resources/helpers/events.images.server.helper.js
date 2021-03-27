const db = require('../../../config/db');

exports.checkImage = async function (eventId) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [[rows]] = await conn.query("select image_filename from event where id = (?)", [eventId]);
    conn.release();
    return rows;
}

exports.updateImage = async function (image_filename, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update event set image_filename=(?) where id=(?)", [image_filename, id]);
    conn.release();
    return rows;
}