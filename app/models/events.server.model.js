const eventHelper = require('../resources/helper/events.server.helper');
const fs = require('mz/fs');


exports.readEvents = async function (req) {
    console.log('Request to get all Event from the database...');

    const queryParameters = req.query;// 1. filtered: q categoryIds organizerId 2. sorted 3. startIndex and count
    const query = eventHelper.validQueryParameters(queryParameters);

    if (query) {
        if (! await eventHelper.validCategoryIds(query)) return null;

        const rows = await eventHelper.getEvent(query.q, query.categoryIds, query.organizerId, query.sortBy);
        const result  = eventHelper.modifyResult(rows);
        const response = await eventHelper.filterEvents(result, query.startIndex, query.count);


        return response;
    } else {
        return null;
    }
}

exports.createEvent = async function (req) {


    const event = req.body;
    //console.log(event);
    const conn = await db.getPool().getConnection(); //CONNECTING
    //title description date image_filename is_online url venue capacity requires_attendance_control fee organizer_id

    let sql = "insert into event (title ,description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id)";
    let sqlValues = "VALUES ( ";

    sqlValues += ` '${event.title}', `; // not null
    sqlValues += ` '${event.description}', `; // not null
    sqlValues += ` '${event.date}', `;// not null
    sqlValues += (event.imageFilename) ? ` '${event.imageFilename}', ` : 'NULL, ';
    sqlValues += ` ${event.isOnline}, `;
    sqlValues += (event.url) ? ` '${event.url}', ` : 'NULL, ';
    sqlValues += (event.venue) ? ` '${event.venue}', ` : 'NULL, ';
    sqlValues += (event.capacity) ? ` ${event.capacity}, ` : 'NULL, ';
    sqlValues += (event.requiresAttendanceControl) ? ` ${event.requiresAttendanceControl}, ` : '0, ';
    sqlValues += (event.fee) ? ` ${event.fee}, ` : '0.00, ';
    sqlValues += ` ${event.organizerId} )`;

    console.log(sql+sqlValues);

    const [rows] = await conn.query(sql+sqlValues); // ??????????????
    const eventId = rows.insertId;

    for (const categoryId of event.categoryIds) {
        await conn.query("INSERT INTO event_category ( event_id, category_id) VALUES ( ? , ? )", [eventId, categoryId]); // ???????????
    }

    conn.release(); // release space
    return eventId;

}