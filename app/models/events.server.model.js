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
        const response = eventHelper.filterEvents(result, query.startIndex, query.count);


        return response;
    } else {
        return null;
    }
}

exports.createEvent = async function (req) {

}