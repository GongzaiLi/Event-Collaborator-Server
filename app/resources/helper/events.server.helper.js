const db = require('../../../config/db');

//----------------------------------------------------------Get/events modify--------------------------------------------------
exports.getEvent = async function (q, categoryIds, organizerId, sortBy) {
    const sql = {
        table1: `(select event.id, count(user_id) as numAcceptedAttendees from event, 
                    event_attendees where event.id = event_attendees.event_id and 
                    attendance_status_id = (select id from attendance_status 
                                            where name = 'accepted') 
                    group by event_id) as table1`,
        table2: `(select event.id as eventId,
                      GROUP_CONCAT(event_category.category_id) as categories,
                      event.title as title, event.capacity as capacity,
                      user.first_name as organizerFirstName,
                      user.last_name as organizerLastName,
                      event.date as date, 
                      event.description, 
                      event.organizer_id as categoryIds
                   from event, event_category, user
                   where event.id = event_category.event_id and user.id = event.organizer_id
                   group by event.id) as table2`,
        where: "WHERE table1.id = table2.eventId",
        sort: "order by table2.date"
    }
    if (q.length) {
        sql.where += ` and (table2.title like '%${q}%' or description like '%${q}%')`;
    }
    if (categoryIds.length) { // using or
        sql.where += ` and (`;
        for (const categoryId in categoryIds) { // I do not Know....
            sql.where += (categoryId === '0') ?  ` find_in_set(${categoryIds[categoryId]}, table2.categories)` :
                ` or find_in_set(${categoryIds[categoryId]}, table2.categories)`;
        }
        sql.where += ` )`;
    }
    if (organizerId) {
        sql.where += ` and table2.categoryIds = ${organizerId}`;
    }
    if (sortBy) {
        switch (sortBy) {
            case 'ALPHABETICAL_ASC' :
                sql.sort = " order by table2.title asc";
                break; // asc a-z desc z-a
            case 'ALPHABETICAL_DESC' :
                sql.sort = " order by table2.title desc";
                break;
            case 'DATE_ASC' :
                sql.sort = " order by table2.date asc";
                break;
            case 'DATE_DESC' :
                sql.sort = " order by table2.date desc";
                break;
            case 'ATTENDEES_ASC' :
                sql.sort = " order by table1.numAcceptedAttendees asc";
                break;
            case 'ATTENDEES_DESC' :
                sql.sort = " order by table1.numAcceptedAttendees desc";
                break;
            case 'CAPACITY_ASC' :
                sql.sort = " order by table2.capacity asc";
                break;
            case 'CAPACITY_DESC' :
                sql.sort = " order by table2.capacity desc";
                break;
        }
    }
    const conn = await db.getPool().getConnection(); //CONNECTING
    console.log(`select * from ${sql.table1}, ${sql.table2} ${sql.where} ${sql.sort}`);//-----------------
    const [[rows]] = await conn.query(`select * from ${sql.table1}, ${sql.table2} ${sql.where} ${sql.sort}`);
    conn.release();
    return rows;


}


//---------------------------------------------------------valid--------------------------------------------------------
exports.validTitle = function (request) { //**
    if ("title" in request) {
        if (typeof request.title === 'string' && request.title.length) {
            return true;
        }
    }
    return false;
}

exports.validDescription = function (request) {//**
    if ("description" in request) {
        if (typeof request.description === 'string' && request.description.length) {
            return true;
        }
    }
    return false;
}

exports.validCategoryIds = function (request) {//**
    if ("categoryIds" in request) {
        if (request.categoryIds.length) {
            for (const categoryId in request.categoryIds) {
                if (!Number.isInteger(categoryId)) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}

exports.validData = function (request) {
    if ("date" in request) {
        if (typeof request.date === 'string' && request.date.length) {
            return true;
        }
    }
    return false;
}

exports.validIsOnline = function (isOnline) {
    return typeof isOnline === "boolean";
}

exports.validUrl = function (url) {
    return typeof url === "string";
}

exports.validVenue = function (venue) {
    return typeof venue === "string";
}

exports.validCapacity = function (capacity) {
    return Number.isInteger(capacity);
}

exports.validRequiresAttendanceControl = function (requiresAttendanceControl) {
    return typeof requiresAttendanceControl === "boolean";
}















