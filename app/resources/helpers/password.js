const bcrypt = require('bcrypt');// encode the passwords.// encrypt
const saltRounds = 10;


exports.hashPassword = async function(password) {
    //Hash the password
    return await bcrypt.hash(password, saltRounds);
}

exports.loadPassword = async function(password, hashPassword) {
     // it will return true or false
    return await bcrypt.compare(password, hashPassword);
}