const password = require('../resources/helper/password');
const userHelper = require('../resources/helper/user.server.helper');
const fs = require('mz/fs');

exports.createUser = async function (req) {
    console.log('Request to Register as a new user into the database...');

    let userInfo = req.body;

    if (userHelper.validateFirstNameSchema(userInfo) && userHelper.validateLastNameSchema(userInfo) &&
        userHelper.validateEmailSchema(userInfo) && userHelper.validatePasswordSchema(userInfo)) {
        if (userHelper.validateEmail(userInfo.email) && !await userHelper.checkEmail(userInfo.email)) {
            userInfo.password = await password.hashPassword(userInfo.password);
            return await userHelper.insertRegister(userInfo);
        }
    }
    return null;
}

exports.loginUser = async function (req) {
    console.log('Request to User login!');

    const userInfo = req.body;

    if (userHelper.validateEmailSchema(userInfo) && userHelper.validatePasswordSchema(userInfo)) {
        const response = await userHelper.checkEmail(userInfo.email);
        if (response) {
            if (await password.loadPassword(userInfo.password, response.password)) {
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

    const responseToken = await userHelper.checkToken(token);
    const responseId = await userHelper.checkId(userId);
    if (responseId) {//console.log(response); if the sql not the data will return "undefined"
        if (responseToken) {
            if (responseToken.id.toString() === userId) { // row.id type is number
                return {
                    firstName: responseToken.first_name,
                    lastName: responseToken.last_name,
                    email: responseToken.email
                };
            }
        }
        return {firstName: responseId.first_name, lastName: responseId.last_name};
    }

    return null;
}

exports.updateUser = async function (req) {
    console.log('Request to update User!');

    const token = req.headers["x-authorization"];
    const id = req.params.id;
    let userInfo = req.body; // check when the userInfo is empty. is 200 or 400?????

    let status = 200;
    let update = {
        email: false,
        password: false,
        firstName: false,
        lastName: false
    }

    const loginUser = await userHelper.checkToken(token);

    if (loginUser) {
        if (await userHelper.checkId(id)) {
            if (loginUser.id === parseInt(id)) {
                if (Object.keys(userInfo).length) {

                    if ('email' in userInfo) {
                        if (userHelper.validateEmailSchema(userInfo)) {
                            if (userHelper.validateEmail(userInfo.email) && !await userHelper.checkEmail(userInfo.email)) { // check the email only check @???
                                update.email = true;

                            } else {
                                return 400;
                            }
                        } else {
                            return 400;
                        }
                    }

                    if ('password' in userInfo) {
                        if (userHelper.validatePasswordSchema(userInfo) && userHelper.validateCurrentPasswordSchema(userInfo)) {
                            if (await password.loadPassword(userInfo.currentPassword, loginUser.password)) {
                                update.password = true;
                            } else {
                                return 400; //400 or 403 not sure ???????
                            }
                        } else {
                            return 400;
                        }
                    }

                    if ('firstName' in userInfo) {
                        if (userHelper.validateFirstNameSchema(userInfo)) {
                            update.firstName = true;
                        } else {
                            return 400;
                        }
                    }

                    if ('lastName' in userInfo) {
                        if (userHelper.validateLastNameSchema(userInfo)) {
                            update.lastName = true;
                        } else {
                            return 400;
                        }
                    }

                } else {
                    return 400; //// check when the userInfo is empty. is 200 or 400?????
                }

            } else {
                return 403;
            }

        } else {
            return 404; // not sutr
        }

    } else {
        return 401;
    }

    if (update.email) await userHelper.updateEmail(userInfo.email, id);
    if (update.password) await userHelper.updatePassword(await password.hashPassword(userInfo.password), id);
    if (update.firstName) await userHelper.updateFirstName(userInfo.firstName, id);
    if (update.lastName) await userHelper.updateLastName(userInfo.lastName, id);
    return status;
}

//---------------------------------------------------Image-------------------------------------------------------------
exports.getImage = async function (req) {
    const id = req.params.id;
    const responseId = await userHelper.checkId(id);
    if (responseId) {
        if (responseId.image_filename) {
            let photo = fs.readFileSync('storage/photos/' + responseId.image_filename, (err, data) => {
                if (err) throw err;
                return data;
            });
            const type = responseId.image_filename.split('.')[1];
            if (userHelper.validateImageRaw(type)) {
                return {image: photo, type: type};
            }
        }
    }
    return null;
} // check

exports.putImage = async function (req) {

    const token = req.headers["x-authorization"];
    const id = req.params.id;
    const contentType = req.headers['content-type'];
    const photo = req.body;//======================================??????????????????????????????????
    //200 201 400

    const responseToken = await userHelper.checkToken(token);

    if (responseToken) {
        if (responseToken.id === parseInt(id)) {
            let path = 'storage/photos/';
            let fileType = userHelper.checkImageType(contentType);

            if (!fileType) return 400;
            let fileName = `user_${id}`;

            let filePath = `${path}${fileName}.${fileType}`;
            let status = 200
            console.log(photo); // is {} why no idea.
            //write image into the file.
                fs.writeFileSync(filePath, photo, 'binary', function (err) {
                console.log(3);
                if (err) throw err;
            });
            console.log(2);
            if (!responseToken.image_filename) status = 201
            await userHelper.updateImage(fileName, id);
            return status;

        } else {
            return 403;
        }
    }
    return 401;

}// check and problem.



