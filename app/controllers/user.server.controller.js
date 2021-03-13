const user = require('../models/user.server.model');

exports.list = async function(req, res) {
    console.log('testing the using');
    try {
        const result = await user.getAll();
        res.status( 200 )
            .send( result );
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR getting users ${ err }` );
    }
}