const bcrypt = require('bcrypt');// encode the passwords.// encrypt
const saltRounds = 10;


exports.hashPassword = async function(password) {
    //Hash the password
    const hashPassword = await bcrypt.hash(password, saltRounds);
    console.log(hashPassword);
    return hashPassword;
}

exports.loadPassword = async function(password, hashPassword) {
    const isMatch = await bcrypt.compare(password, hashPassword); // it will return true or false
    return isMatch;
}