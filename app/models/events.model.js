const db = require('../../config/db');


exports.readAllEvents = async function (req) {
    console.log('Request to get all Event from the database...');
    const queryParameters = req.query;

    const conn = await db.getPool().getConnection(); //CONNECTING

    const sql = await readParameter(queryParameters);

    //console.log(sql, typeof sql);

    const [raws] = await conn.query(sql); //query from database.

    const result = await filterEvents(raws, queryParameters);
    conn.release(); // release space
    return result;

}

async function readParameter(queryParameters) {

    let query = {
        select: "*",
        from: "event",
        where: "",
        groupBy: "",
        sortBy: ""
    }
    let querySql = `select ${query.select}`;

    // if (Object.keys(queryParameters).length) {

    if (queryParameters.q) {
        query.where += ` title like '%${queryParameters.q}%' or description like '%${queryParameters.q}%' `;
    }

    if (queryParameters.organizerId) {
        query.where += (query.where.length) ? ' and ' : '';
        query.where += ` organizer_id=${queryParameters.organizerId} `;
    }
    if (queryParameters.categoryIds) {
        let categoryIdArray = (queryParameters.categoryIds.startsWith('[') && queryParameters.categoryIds.endsWith(']')) ?
            queryParameters.categoryIds.slice(1, -1).split(',') : queryParameters.categoryIds.split(',');

        //console.log(categoryIdArray);
        query.from += ' inner join event_category on event.id=event_category.event_id '; // join question
        query.groupBy = 'group by event.id'
        query.where += (query.where.length) ? ' and (' : ' (';

        for (const index in categoryIdArray) {
            query.where += (index === '0') ?
                `category_id=${categoryIdArray[index]}` : ` or category_id=${categoryIdArray[index]}`;// ?????????????? using or || and
        }
        query.where += ') ';
    }
    if (queryParameters.sortBy) {
        switch (queryParameters.sortBy) {
            case 'ALPHABETICAL_ASC' :
                query.sortBy = " title asc";
                break; // asc a-z desc z-a
            case 'ALPHABETICAL_DESC' :
                query.sortBy = " title desc";
                break;
            case 'DATE_ASC' :
                query.sortBy = " date asc";
                break;
            case 'DATE_DESC' :
                query.sortBy = " date desc";
                break;
            case 'ATTENDEES_ASC' :
                query.sortBy = " requires_attendance_control asc";
                break;
            case 'ATTENDEES_DESC' :
                query.sortBy = " requires_attendance_control desc";
                break;
            case 'CAPACITY_ASC' :
                query.sortBy = " capacity asc";
                break;
            case 'CAPACITY_DESC' :
                query.sortBy = " capacity desc";
                break;
        }
    }


    querySql += ` from ${query.from}`;
    querySql += (query.where.length) ? ` where${query.where}` : '';
    querySql += query.groupBy;
    querySql += (query.where.sortBy) ? ` order by ${query.sortBy}` : ' order by date desc ';

    // } else {
    //     querySql = 'select * from event order by date desc'; // string // can delete
    // }
    console.log(querySql);
    return querySql;

}

async function filterEvents(raws, queryParameters) {
    let result = raws;
    if (queryParameters.count) {
        result = result.slice(0, parseInt(queryParameters.count));
    }
    if (queryParameters.startIndex) {
        result = result.slice(parseInt(queryParameters.startIndex));
    }
    return result;
}