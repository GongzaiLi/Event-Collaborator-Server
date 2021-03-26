const eventHelper = require('../resources/helper/events.server.helper');
const fs = require('mz/fs');


exports.readEvents = async function (req) {
    console.log('Request to get all Event from the database...');

    const queryParameters = req.query;// 1. filtered: q categoryIds organizerId 2. sorted 3. startIndex and count


}

exports.createEvent = async function (req) {

}