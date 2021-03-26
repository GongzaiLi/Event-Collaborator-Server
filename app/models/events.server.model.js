const eventHelper = require('../resources/helper/events.server.helper');
const fs = require('mz/fs');


exports.readEvents = async function (req) {
    console.log('Request to get all Event from the database...');

    const queryParameters = req.query;// 1. filtered: q categoryIds organizerId 2. sorted 3. startIndex and count
    //console.log(queryParameters);
    let query = {
        q: '',
        categoryIds: [],
        organizerId: '',
        sortBy: '',
        count: '',
        startIndex: ''
    };
    if (eventHelper.validQueryParameters(queryParameters)) {
        this.query = queryParameters;// need this
        //console.log(query);
        const rows = await eventHelper.getEvent(query.q, query.categoryIds, query.organizerId, query.sortBy);
        //console.log(rows, "============================================");
        const response = eventHelper.filterEvents(rows, query.startIndex, query.count)
        //console.log(response, "=============================================1");
        return response;
    } else {
        return null;
    }
}

exports.createEvent = async function (req) {

}