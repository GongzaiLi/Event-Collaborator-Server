const eventHelper = require('../resources/helper/events.server.helper');
const userHelper = require('../resources/helper/users.server.helper');
const fs = require('mz/fs');


exports.readEvents = async function (req) {
    console.log('Request to get all Event from the database...');

    const queryParameters = req.query;// 1. filtered: q categoryIds organizerId 2. sorted 3. startIndex and count
    const query = eventHelper.validQueryParameters(queryParameters);

    if (query) {
        if (!await eventHelper.validGetCategoryIds(query)) return null;

        const rows = await eventHelper.getEvent(query.q, query.categoryIds, query.organizerId, query.sortBy);
        const result = eventHelper.modifyResult(rows);
        return eventHelper.filterEvents(result, query.startIndex, query.count); //some time has problem
    } else {
        return null;
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

    console.log(1);
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
    await eventHelper.insertEventCategory(response.insertId, insertData.categoryIds);

    return response;
} // need testing a date (yyyy-MM-dd) or date and time (yyyy-MM-dd hh:mm:ss.sss)

exports.getOneEvent = async function (req) {
    console.log('Request to get a Event from the database...');
    const eventId = req.params.id;

    if (!await eventHelper.checkEventId(eventId)) return null;

    let result = {
        eventId: -1,
        title: "",
        categories: [],
        organizerFirstName: "",
        organizerLastName: "",
        numAcceptedAttendees: null,
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
} // need check

