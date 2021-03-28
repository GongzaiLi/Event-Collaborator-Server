const db = require('../../../config/db');

//---------------------------------------------------------get----------------------------------------------------------
exports.getEventAttendee = async function (eventId, userId) {
    const sql = {
        select: `select EA1.user_id as attendeeId, US1.name as status, U1.first_name as firstName, U1.last_name as lastName, EA1.date_of_interest as dateOfInterest
                 from event_attendees as EA1,
                      user as U1,
                      attendance_status as US1
                 where EA1.user_id = U1.id and EA1.attendance_status_id = US1.id and EA1.event_id = ${eventId}`,
        whereNoOrganizer: ` and US1.name = 'accepted'`,
        whereOrganizer: ` and (US1.name = 'accepted' or U1.id = ${userId})`,
        orderBy: `order by dateOfInterest desc;`
    }
    const conn = await db.getPool().getConnection(); //CONNECTING
    if (userId) {
        const [rows] = await conn.query(`${sql.select} ${sql.whereOrganizer} ${sql.orderBy}`);
        conn.release();
        return rows;
    }
    const [rows] = await conn.query(`${sql.select} ${sql.whereNoOrganizer} ${sql.orderBy}`);
    conn.release();
    return rows;


}

//---------------------------------------------------------check--------------------------------------------------------
exports.checkEventIdInEventAttendees = async function (eventId) {

    const conn = await db.getPool().getConnection(); //CONNECTING

    const [[rows]] = await conn.query(`select *
                                       from event_attendees
                                       where event_id = (?)`, [eventId]);
    conn.release();
    return rows;
}

exports.checkUserIdInEventAttendees = async function (eventId, userId) {

    const conn = await db.getPool().getConnection(); //CONNECTING

    const [[rows]] = await conn.query(`select *
                                       from event_attendees
                                       where event_id = (?)
                                         and user_id = (?)`, [eventId, userId]);
    conn.release();
    return rows;
}

//----------------------------------------------------------insert------------------------------------------------------
exports.insertEventIdInEventAttendees = async function (eventId, userId, status) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query(`INSERT INTO event_attendees (event_id, user_id, attendance_status_id)
                                     VALUES (?, ?, ?)`,
        [eventId, userId, status]); //query from database.
    conn.release();
    return rows;
}
//-----------------------------------------------Delete-----------------------------------------------------------------


exports.deleteEventIdAndUserIdInEventAttendee = async function (eventId, userId) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("DELETE FROM event_attendees WHERE event_id = (?) and user_id = (?)", [eventId, userId]);
    conn.release();
    return rows;
}
