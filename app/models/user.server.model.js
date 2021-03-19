const password = require('../resources/helper/password');
const userHelper = require('../resources/helper/user.server.helper');


exports.createUser = async function (req) {
    console.log('Request to Register as a new user into the database...');

    let registerInfo = req.body;

    if (registerInfo.email && registerInfo.firstName && registerInfo.lastName && registerInfo.password) {
        if (userHelper.validateEmail(registerInfo.email)) {
            registerInfo.password = await password.hashPassword(registerInfo.password);
            return await userHelper.insertRegister(registerInfo);
        }
    }
    return null;
};

exports.loginUser = async function (req) {
    console.log('Request to User login!');

    const user = req.body;

    const response = await userHelper.checkEmail(user.email);

    if (response) {
        if (response.email && !response.auth_token) {// ???????????????????????????????????????? can login many time???
            if (await password.loadPassword(user.password, response.password)) {
                const token = await password.hashPassword(response.id.toString())
                await userHelper.updateToken(token, response.id);
                return {userId: response.id, token: token};
            }
        }
    }
    return null;
}

exports.logoutUser = async function (req) {
    console.log('Request to User logout!');

    const token = req.headers["x-authorization"];
    const response = await userHelper.checkToken(token);

    if (response) {
        if (response.id && response.auth_token) {
            return await userHelper.deleteToken(response.id);
        }
    }
    return null;
}

exports.getUser = async function (req) {
    console.log('Retrieve information about a user.');

    const token = req.headers["x-authorization"];
    const userId = req.params.id;

    let result = {
        firstName: '',
        lastName: '',
        email: ''
    }

    const responseToken = await userHelper.checkToken(token);

    if (responseToken) {
        if (responseToken.id.toString() === userId) { // row.id type is number
            result.firstName = responseToken.first_name;
            result.lastName = responseToken.last_name;
            result.email = responseToken.email;
            return result;
        } else {
            const responseId = await userHelper.checkId(userId);//console.log(response); if the sql not the data will return "undefined"
            if (responseId) {
                result.firstName = responseId.first_name;
                result.lastName = responseId.last_name;
                return result;
            }
        }
    }
    return null;
}

exports.updateUser = async function (req) {
    console.log('Request to update User!');

    const token = req.headers["x-authorization"];
    const id = req.params.id;
    let user = req.body;
    let status = 400;//400 401 403

    const loginUser = await userHelper.checkToken(token);

    if (loginUser) {
        if (loginUser.id === parseInt(id)) {
            if (user.currentPassword) { //0, "", null, undefined, is false
                if (await password.loadPassword(user.currentPassword, loginUser.password)) {
                    await userHelper.updatePassword(await password.hashPassword(user.password), loginUser.id);
                    status = 200;
                } else {
                    return 400; // ??????if current password is not right ?????------------------------------------
                }
            }
            if (user.firstName) {
                await userHelper.updateFirstName(user.firstName, id);
                status = 200;
            } else {
                status = 400;
            }
            if (user.lastName) {
                await userHelper.updateFirstName(user.lastName, id);
                status = 200;
            } else {
                status = 400;
            }
            if (userHelper.validateEmail(user.email) && !await userHelper.checkEmail(user.email)) {
                await userHelper.updateFirstName(user.email, id);
                status = 200;
            } else {
                status = 400;// first Name change and lastName change passWord error. so now I need 400 or 200?????
            }
        } else {
            status = 403;
        }

    } else {
        status = 401;
    }

    return status;
}




