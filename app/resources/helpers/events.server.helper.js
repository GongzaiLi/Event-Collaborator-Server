const db = require('../../../config/db');
const moment = require('moment');

//----------------------------------------------------------Get/events modify--------------------------------------------------
exports.getEvent = async function (q, categoryIds, organizerId, sortBy) {
    const sql = {
        table1: `(select event.id as eventId, count(user_id) as numAcceptedAttendees from event, 
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
                      event.organizer_id as organizerId
                   from event, event_category, user
                   where event.id = event_category.event_id and user.id = event.organizer_id
                   group by event.id) as table2`,
        where: "",//WHERE table1.eventId = table2.eventId
        sort: "order by table2.date desc"
    }
    if (q.length) {
        sql.where += (sql.where.length) ? ' and' : '';
        sql.where += ` (table2.title like '%${q}%' or description like '%${q}%')`;
    }
    if (categoryIds.length) { // using or
        sql.where += (sql.where.length) ? ' and (' : ' (';
        for (const categoryId in categoryIds) { // I do not Know....
            sql.where += (categoryId === '0') ? ` find_in_set(${categoryIds[categoryId]}, table2.categories)` :
                ` or find_in_set(${categoryIds[categoryId]}, table2.categories)`;
        }
        sql.where += ` )`;
    }
    if (organizerId.length) {
        sql.where += (sql.where.length) ? ' and' : '';
        sql.where += ` table2.organizerId = ${organizerId}`;
    }
    if (sql.where.length) {
        sql.where = 'where' + sql.where;
    }
    if (sortBy.length) {
        switch (sortBy) {
            case 'ALPHABETICAL_ASC' :
                sql.sort = " order by table2.title asc";
                break;
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
    //console.log(`select * from ${sql.table1}, ${sql.table2} ${sql.where} ${sql.sort}`);//-----------------
    const [rows] = await conn.query(`select * from ${sql.table1} right join ${sql.table2} on table1.eventId = table2.eventId ${sql.where} ${sql.sort}`);
    conn.release();

    return rows;
}

exports.filterEvents = function (raws, startIndex, count) {
    let result = raws;
    //console.log(result.length);
    if (startIndex.length) {
        result = result.filter((item, index) => index >= parseInt(startIndex)) //>2
        //result.slice(parseInt(startIndex));
    }
    if (count.length) {
        result = result.filter((item, index) => index < parseInt(count)) //10
        //result.slice(0, parseInt(count));
    }
    //console.log(result.length);
    return result;
}

exports.modifyResult = function (rows) {
    let result = [];//const DateFormat = require("dateformat");

    for (let row of rows) {
        let dataModel = {
            eventId: -1,
            title: "",
            capacity: -1,
            organizerFirstName: "",
            organizerLastName: "",
            date: "",
            categories: [],
            numAcceptedAttendees: 0//can null
        };
        dataModel.eventId = row.eventId;
        dataModel.title = row.title;
        dataModel.capacity = row.capacity;
        dataModel.organizerFirstName = row.organizerFirstName;
        dataModel.organizerLastName = row.organizerLastName;
        dataModel.date = row.date;
        dataModel.categories = row.categories.split(',').map(function (item) {
            return parseInt(item);
        });
        dataModel.numAcceptedAttendees = row.numAcceptedAttendees || 0;

        //console.log(dataModel);
        result.push(dataModel);
    }
    return result;
}

exports.getOneEvent = async function (eventId) {
    const sql = {
        table1: `(select event.id as eventId, count(user_id) as numAcceptedAttendees from event, 
                    event_attendees where event.id = event_attendees.event_id and 
                    attendance_status_id = (select id from attendance_status 
                                            where name = 'accepted') 
                    group by event_id) as table1`,
        table2: `(select event.id as eventId,
                      GROUP_CONCAT(event_category.category_id) as categories,
                      event.title as title, event.capacity as capacity,
                      user.first_name as organizerFirstName,
                      user.last_name as organizerLastName,
                      event.date, 
                      event.description,
                      event.organizer_id as organizerId,
                      event.is_online as isOnline,
                      event.url,
                      event.venue,
                      event.requires_attendance_control as requiresAttendanceControl,
                      event.fee
                   from event, event_category, user
                   where event.id = event_category.event_id and user.id = event.organizer_id
                   group by event.id) as table2`,
    }
    const conn = await db.getPool().getConnection(); //CONNECTING
    //console.log(`select * from ${sql.table1}, ${sql.table2} ${sql.where} ${sql.sort}`);//-----------------
    //console.log(`select * from ${sql.table1} right join ${sql.table2} on table1.eventId = table2.eventId where table2.eventId = ${eventId}`);
    const [[rows]] = await conn.query(`select * from ${sql.table1} right join ${sql.table2} on table1.eventId = table2.eventId where table2.eventId = ${eventId}`);
    conn.release();
    return rows;
}

exports.getAllCategories = async function () {
    const conn = await db.getPool().getConnection(); //CONNECTING
    //console.log(`select * from ${sql.table1}, ${sql.table2} ${sql.where} ${sql.sort}`);//-----------------
    const [rows] = await conn.query(`select id as categoryId, name from category`);
    conn.release();
    return rows;
}


//---------------------------------------------------------valid--------------------------------------------------------
exports.validQueryParameters = function (query) {
    let newQuery = {
        q: '',
        categoryIds: [],
        organizerId: '',
        sortBy: '',
        count: '',
        startIndex: ''
    };

    if ('startIndex' in query) {
        if (!(Number.isInteger(parseInt(query.startIndex)) && query.startIndex.length)) {
            return false;
        }
        newQuery.startIndex = query.startIndex;
    }

    if ('count' in query) {
        if (!(Number.isInteger(parseInt(query.count)) && query.count.length)) {
            return false;
        }
        newQuery.count = query.count;
    }

    if ('q' in query) {
        if (!(typeof query.q === 'string' && query.q.length)) {
            return false;
        }
        newQuery.q = query.q;
    }

    if ('categoryIds' in query) {
        if (Array.isArray(query.categoryIds)) {
            for (const categoryId of query.categoryIds) {
                if (!(Number.isInteger(parseInt(categoryId)) && categoryId.length)) {
                    return false;
                }
            }
        } else {
            if (!(Number.isInteger(parseInt(query.categoryIds)) && query.categoryIds.length)) {
                return false;
            }
        }

        newQuery.categoryIds = query.categoryIds;
    }

    if ('organizerId' in query) {
        if (!(Number.isInteger(parseInt(query.organizerId)) && query.organizerId.length)) {
            return false;
        }
        newQuery.organizerId = query.organizerId;
    }

    if ('sortBy' in query) {
        if (!(typeof query.sortBy === 'string' && query.sortBy.length)) {
            return false;
        }
        newQuery.sortBy = query.sortBy;
    }
    return newQuery;
}

exports.validTitle = function (eventBody) {
    if ("title" in eventBody) {
        if (typeof eventBody.title === 'string' && eventBody.title.length) {
            return true;
        }
    }
    return false;
} //**

exports.validDescription = function (eventBody) {
    if ("description" in eventBody) {
        if (typeof eventBody.description === 'string' && eventBody.description.length) {
            return true;
        }
    }
    return false;
}//**

exports.validGetCategoryIds = async function (eventBody) {
    if (Array.isArray(eventBody.categoryIds)) {
        for (const categoryId of eventBody.categoryIds) {
            if (!await this.checkCategoryId(categoryId)) {
                return false;
            }
        }
    } else {
        if (!await this.checkCategoryId(eventBody.categoryIds)) {
            return false;
        }
    }
    return true;
}//-----------------------------------------async

exports.validPostCategoryIds = async function (eventBody) {
    if (Array.isArray(eventBody.categoryIds) && eventBody.categoryIds.length) {
        for (const categoryId of eventBody.categoryIds) {
            if (!await this.checkCategoryId(categoryId)) {
                return false;
            }
        }
        return true;
    }
    return false;
}//**-----------------------------------------async

exports.validData = function (eventBody) {
    if ("date" in eventBody) {
        if (typeof eventBody.date === 'string' && eventBody.date.length) {
            if (moment(eventBody.date, "YYYY-MM-DD HH:mm:ss.SSS", true).isValid() || moment(eventBody.date, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
                return true;
            }
        }
    }
    return false;
} /// may have problem // **

exports.validIsOnline = function (isOnline) {
    return typeof isOnline === "boolean";
} // can 0 or 1 // can null

exports.validUrl = function (url) {
    return typeof url === "string";
}// can null // can null

exports.validVenue = function (venue) {
    return typeof venue === "string";
}// can null

exports.validCapacity = function (capacity) {
    return Number.isInteger(capacity);
}// can null

exports.validRequiresAttendanceControl = function (requiresAttendanceControl) {
    return typeof requiresAttendanceControl === "boolean";
}// can 0 or 1 // can null

exports.validFee = function (fee) {
    return typeof fee === "number";
} // can 0.00//// can null

//------------------------------------------------------check-----------------------------------------------------------
exports.checkCategoryId = async function (categoryId) { // in table category or not
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [[rows]] = await conn.query(`select * from category where id = ${categoryId}`);
    conn.release();
    return rows;
}

exports.checkEventIdInEventCategory = async function (event_id) { // in table category or not
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [[rows]] = await conn.query(`select GROUP_CONCAT(category_id) as categories from event_category where event_id = ${event_id}`);
    conn.release();
    return rows;
}

exports.checkTitle = async function (title) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [[rows]] = await conn.query("select * from event where title = (?)", [title]);
    conn.release();
    return rows;
}

exports.checkTitleNotSelf = async function (title, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [[rows]] = await conn.query("select * from event where title = (?) and id != (?)", [title, id]);
    conn.release();
    return rows;
}

exports.checkEventId = async function (eventId) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [[rows]] = await conn.query(`select * from event where id = ${eventId}`);
    conn.release();
    return rows;
}
//----------------------------------------------------INSERT------------------------------------------------------------
exports.insertEvent = async function (eventInfo) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query(`INSERT INTO event (title, description,
                                                        date, is_online,
                                                        url, venue,
                                                        capacity, requires_attendance_control,
                                                        fee, organizer_id)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [eventInfo.title, eventInfo.description,
            eventInfo.date, eventInfo.isOnline,
            eventInfo.url, eventInfo.venue,
            eventInfo.capacity, eventInfo.requiresAttendanceControl,
            eventInfo.fee, eventInfo.organizer_id]); //query from database.
    conn.release();
    return rows;
}

exports.insertEventCategory = async function (categoryIds, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    for (const categoryId of categoryIds) {
        await conn.query('INSERT INTO event_category (event_id, category_id) VALUES (?, ?)', [id, categoryId]);
        conn.release();
    }
    return true;
} //return can it ?????

//--------------------------------------------------UPDATE--------------------------------------------------------------
exports.updateTitle = async function (title, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update event set title=(?) where id=(?)", [title, id]);
    conn.release();
    return rows;
}

exports.updateDescription = async function (description, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update event set description=(?) where id=(?)", [description, id]);
    conn.release();
    return rows;
}

exports.updateDate = async function (date, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update event set date=(?) where id=(?)", [date, id]);
    conn.release();
    return rows;
}

exports.updateIsOnline = async function (is_online, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update event set is_online=(?) where id=(?)", [is_online, id]);
    conn.release();
    return rows;
}

exports.updateUrl = async function (url, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update event set url=(?) where id=(?)", [url, id]);
    conn.release();
    return rows;
}

exports.updateVenue = async function (venue, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update event set venue=(?) where id=(?)", [venue, id]);
    conn.release();
    return rows;
}

exports.updateCapacity = async function (capacity, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update event set capacity=(?) where id=(?)", [capacity, id]);
    conn.release();
    return rows;
}

exports.updateRequiresAttendanceControl = async function (requires_attendance_control, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update event set requires_attendance_control=(?) where id=(?)", [requires_attendance_control, id]);
    conn.release();
    return rows;
}

exports.updateFee = async function (fee, id) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("update event set fee=(?) where id=(?)", [fee, id]);
    conn.release();
    return rows;
}

exports.updateCategoryIds = async function (categoryIds, eventId) { //--------------------need delete older one return ?????
    if (await this.checkEventIdInEventCategory(eventId)) {
        await this.deleteEventIdInEventCategory(eventId);
    }
    return await this.insertEventCategory(categoryIds, eventId);
}
//-----------------------------------------------Comparison-------------------------------------------------------------
exports.compareDate = function (date) {
    const now = new Date();
    return moment(date).isAfter(moment(now));
} //
//-----------------------------------------------Delete-----------------------------------------------------------------

exports.deleteEventIdInEventCategory = async function (eventId) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("DELETE FROM event_category WHERE event_id = (?)", [eventId]);
    conn.release();
    return rows;
}

exports.deleteEventIdInEventAttendee = async function (eventId) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("DELETE FROM event_attendees WHERE event_id = (?)", [eventId]);
    conn.release();
    return rows;
}

exports.deleteEventIdInEvent = async function (eventId) {
    const conn = await db.getPool().getConnection(); //CONNECTING
    const [rows] = await conn.query("DELETE FROM event WHERE id = (?)", [eventId]);
    conn.release();
    return rows;
}