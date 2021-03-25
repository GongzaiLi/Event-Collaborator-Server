const eventHelper = require('../resources/helper/events.server.helper');
const fs = require('mz/fs');


exports.readEvents = async function (req) {
    console.log('Request to get all Event from the database...');

    const queryParameters = req.query;// 1. filtered: q categoryIds organizerId 2. sorted 3. startIndex and count
    let response = [];
    let sql = `select event.id as eventId, 
    event.title as title, 
    user.first_name as organizerFirstName, 
    user.last_name as organizerLastName, 
    `;

    // {
    //     startIndex: '1',
    //         count: '1',
    //     q: 'a',
    //     organizerId: '1',
    //     categoryIds: [ '1', '2', '3' ],
    //     sortBy: '1'
    // }
}

exports.createEvent = async function (req) {

}