const db = require('../../../config/db');

//---------------------------------------------------------get----------------------------------------------------------
exports.getEventAttendee = async function (eventId, organizer_id) {
    const sql = {
        select: `select EA1.user_id as attendeeId, US1.name as status, U1.first_name as firstName, U1.last_name as lastName, EA1.date_of_interest as dateOfInterest
                 from event_attendees as EA1,
                      user as U1,
                      attendance_status as US1
                 where EA1.user_id = U1.id and EA1.attendance_status_id = US1.id and EA1.event_id = ${eventId}`,
        whereNoOrganizer: ` and US1.name = 'accepted'`,
        whereOrganizer: ` and (US1.name = 'accepted' or U1.id = ${organizer_id}`,
        orderBy: `order by dateOfInterest desc;`
    }
    const conn = await db.getPool().getConnection(); //CONNECTING
    if (organizer_id) {
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
    const [[rows]] = await conn.query(`select * from event_attendees where event_id = ${eventId}`);
    conn.release();
    return rows;
}
