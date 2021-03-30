const eventHelper = require('../resources/helpers/events.server.helper');
const userHelper = require('../resources/helpers/users.server.helper');


exports.readEvents = async function (req) {
    console.log('Request to get all Event from the database...');

    const queryParameters = req.query;// 1. filtered: q categoryIds organizerId 2. sorted 3. startIndex and count---???????? can do sql
    const query = eventHelper.validQueryParameters(queryParameters);

    if (query) {
        if (!await eventHelper.validGetCategoryIds(query)) return false;

        const rows = await eventHelper.getEvent(query.q, query.categoryIds, query.organizerId, query.sortBy);
        const result = eventHelper.modifyResult(rows);
        return eventHelper.filterEvents(result, query.startIndex, query.count); //some time has problem
    } else {
        return false;
    }
} // ok/ but the filter has a problem should ask tutor startIndex = 1 and count = 1

exports.createEvent = async function (req) {
    const token = req.headers["x-authorization"];
    const requestBody = req.body;

    const insertData = {
        title: '', //**
        description: '',//**
        categoryIds: [], //**
        date: '',//**
        isOnline: 0,
        url: null,
        venue: null,
        capacity: null,
        requiresAttendanceControl: 0,
        fee: 0.00,
        organizer_id: -1
    }

    const responseToken = await userHelper.checkToken(token);

    if (!responseToken) return 401;
    insertData.organizer_id = responseToken.id;

    if (!(eventHelper.validTitle(requestBody) && eventHelper.validDescription(requestBody) &&
        await eventHelper.validPostCategoryIds(requestBody) && eventHelper.validData(requestBody))) return 400;
    insertData.title = requestBody.title;
    insertData.description = requestBody.description;
    insertData.categoryIds = requestBody.categoryIds;
    insertData.date = requestBody.date;

    if ('isOnline' in requestBody) {
        if (!eventHelper.validIsOnline(requestBody.isOnline)) return 400;
        if (requestBody.isOnline) insertData.isOnline = 1;
    }


    if ('url' in requestBody) {
        if (!eventHelper.validUrl(requestBody.url)) return 400;
        insertData.url = requestBody.url; // should I check the len of url
    }

    if ('venue' in requestBody) {
        if (!eventHelper.validVenue(requestBody.venue)) return 400;
        insertData.venue = requestBody.venue; // should I check the len of venue
    }


    if ('capacity' in requestBody) {
        if (!eventHelper.validCapacity(requestBody.capacity)) return 400;
        insertData.capacity = requestBody.capacity;
    }

    if ('requiresAttendanceControl' in requestBody) {
        if (!eventHelper.validRequiresAttendanceControl(requestBody.requiresAttendanceControl)) return 400;
        if (requestBody.requiresAttendanceControl) insertData.requiresAttendanceControl = 1;
    }

    if ('fee' in requestBody) {
        if (!eventHelper.validFee(requestBody.fee)) return 400;
        insertData.fee = requestBody.fee;
    }

    const response = await eventHelper.insertEvent(insertData);
    await eventHelper.insertEventCategory(insertData.categoryIds, response.insertId);

    return response;
} // ok need testing a date (yyyy-MM-dd) or date and time (yyyy-MM-dd hh:mm:ss.sss)

exports.getOneEvent = async function (req) {
    console.log('Request to get a Event from the database...');
    const eventId = req.params.id;

    if (!await eventHelper.checkEventId(eventId)) return false;

    let result = {
        eventId: -1,
        title: "",
        categories: [],
        organizerFirstName: "",
        organizerLastName: "",
        numAcceptedAttendees: 0,//can null
        capacity: null,
        description: "",
        organizerId: -1,
        date: null,
        isOnline: false,
        url: null,
        venue: null,
        requiresAttendanceControl: false,
        fee: null
    }

    const response = await eventHelper.getOneEvent(eventId);

    result.eventId = response.eventId;
    result.title = response.title;
    result.categories = response.categories.split(',').map(function (item) {
        return parseInt(item);
    });

    result.organizerFirstName = response.organizerFirstName;
    result.organizerLastName = response.organizerLastName;
    result.numAcceptedAttendees = response.numAcceptedAttendees;
    result.capacity = response.capacity;
    result.description = response.description;
    result.organizerId = response.organizerId;
    result.date = response.date;
    result.isOnline = (response.isOnline) ? true : false;
    result.url = response.url;
    result.venue = response.venue;
    result.requiresAttendanceControl = (response.requiresAttendanceControl) ? true : false;
    result.fee = response.fee;


    return result;
} // ok

exports.updateEvent = async function (req) {
    const token = req.headers["x-authorization"];
    const eventId = req.params.id;
    const eventBody = req.body;
    if (typeof eventBody !== 'object' || Object.keys(eventBody).length === 0) return 400;

    const findToken = await userHelper.checkToken(token);
    if (!findToken) return 401;// id for organizer_id
    const findEventId = await eventHelper.checkEventId(eventId);

    if (!findEventId) return 404;
    if (findToken.id !== findEventId.organizer_id || !eventHelper.compareDate(findEventId.date)) return 403; // Data

    let checkUpdate = {
        title: false,
        description: false,
        categoryIds: false,
        date: false,
        isOnline: false,
        url: false,
        venue: false,
        capacity: false,
        requiresAttendanceControl: false,
        fee: false
    };

    if ('title' in eventBody) {
        if (!eventHelper.validTitle(eventBody) || await eventHelper.checkTitleNotSelf(eventBody.title, eventId)) {
            return 400;
        }
        checkUpdate.title = true;
    }

    if ('description' in eventBody) {
        if (!eventHelper.validDescription(eventBody)) {
            return 400;
        }
        checkUpdate.description = true;
    }

    if ('categoryIds' in eventBody) {
        if (!await eventHelper.validPostCategoryIds(eventBody)) {
            return 400;
        }
        checkUpdate.categoryIds = true;
    }

    if ('date' in eventBody) {
        if (!eventHelper.validData(eventBody)) {
            return 400;
        }
        checkUpdate.date = true;
    }

    if ('isOnline' in eventBody) {
        if (!eventHelper.validIsOnline(eventBody.isOnline)) {
            return 400;
        }
        checkUpdate.isOnline = true;
    }

    if ('url' in eventBody) {
        if (!eventHelper.validUrl(eventBody.url)) {
            return 400;
        }
        checkUpdate.url = true;
    }

    if ('venue' in eventBody) {
        if (!eventHelper.validVenue(eventBody.venue)) {
            return 400;
        }
        checkUpdate.venue = true;
    }

    if ('capacity' in eventBody) {
        if (!eventHelper.validCapacity(eventBody.capacity)) {
            return 400;
        }
        checkUpdate.capacity = true;
    }

    if ('requiresAttendanceControl' in eventBody) {
        if (!eventHelper.validRequiresAttendanceControl(eventBody.requiresAttendanceControl)) {
            return 400;
        }
        checkUpdate.requiresAttendanceControl = true;
    }

    if ('fee' in eventBody) {
        if (!eventHelper.validFee(eventBody.fee)) {
            return 400;
        }
        checkUpdate.fee = true;
    }

    if (checkUpdate.title) await eventHelper.updateTitle(eventBody.title, eventId);
    if (checkUpdate.description) await eventHelper.updateDescription(eventBody.description, eventId);
    if (checkUpdate.categoryIds) await eventHelper.updateCategoryIds(eventBody.categoryIds, eventId);
    if (checkUpdate.date) await eventHelper.updateDate(eventBody.date, eventId);
    if (checkUpdate.isOnline) await eventHelper.updateIsOnline(eventBody.isOnline, eventId);
    if (checkUpdate.url) await eventHelper.updateUrl(eventBody.url, eventId);
    if (checkUpdate.venue) await eventHelper.updateVenue(eventBody.venue, eventId);
    if (checkUpdate.capacity) await eventHelper.updateCapacity(eventBody.capacity, eventId);
    if (checkUpdate.requiresAttendanceControl) await eventHelper.updateRequiresAttendanceControl(eventBody.requiresAttendanceControl, eventId);
    if (checkUpdate.fee) await eventHelper.updateFee(eventBody.fee, eventId);
    return 200;
} // ok

exports.deleteEvent = async function (req) {
    const token = req.headers["x-authorization"];
    const eventId = req.params.id;

    const findToken = await userHelper.checkToken(token);
    if (!findToken) return 401;

    const findEventId = await eventHelper.checkEventId(eventId);
    if (!findEventId) return 404;

    if (findToken.id !== findEventId.organizer_id) return 403;

    await eventHelper.deleteEventIdInEventAttendee(eventId);
    await eventHelper.deleteEventIdInEventCategory(eventId);
    await eventHelper.deleteEventIdInEvent(eventId);
    return 200;
}//ok

exports.getAllCategories = async function () {
    return await eventHelper.getAllCategories();
}//ok