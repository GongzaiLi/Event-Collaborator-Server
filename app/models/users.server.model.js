const password = require('../resources/helpers/password');
const userHelper = require('../resources/helpers/users.server.helper');
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
    return false;
} //ok for register id

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
    return false;
} //ok for login

exports.logoutUser = async function (req) {
    console.log('Request to User logout!');

    const token = req.headers["x-authorization"];
    const findToken = await userHelper.checkToken(token);

    if (findToken) {
        if (findToken.id && findToken.auth_token) {
            return await userHelper.deleteToken(findToken.id);
        }
    }
    return false;
} //ok for logout

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

    return false;
}//ok for retrieve information about a user

exports.updateUser = async function (req) {
    console.log('Request to update User!');

    const token = req.headers["x-authorization"];
    const id = req.params.id;
    let userInfo = req.body;


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
                if (typeof userInfo === 'object' && Object.keys(userInfo).length) {

                    if ('email' in userInfo) {
                        if (userHelper.validateEmailSchema(userInfo)) {
                            if (userHelper.validateEmail(userInfo.email) && !await userHelper.checkUpdateEmail(userInfo.email, id)) { // check the email only check @???
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
                    return 400;
                }

            } else {
                return 403;
            }

        } else {
            return 404; //
        }

    } else {
        return 401;
    }

    if (update.email) await userHelper.updateEmail(userInfo.email, id);
    if (update.password) await userHelper.updatePassword(await password.hashPassword(userInfo.password), id);
    if (update.firstName) await userHelper.updateFirstName(userInfo.firstName, id);
    if (update.lastName) await userHelper.updateLastName(userInfo.lastName, id);
    return 200;
}//ok change a user's details

//---------------------------------------------------Image-------------------------------------------------------------
/**
 exports.getImage = async function (req) {
    const id = req.params.id;
    const image = await userHelper.checkImage(id);
    if (image) {
        if (image.image_filename) { // readFileSync or not.
            try {
                let photo = await fs.readFile('storage/photos/' + image.image_filename);
                let type = image.image_filename.split('.')[1];
                if (userHelper.validateImageRaw(type)) {
                    type = (type === "jpg") ? "image/jpeg" : `image/${type}`;
                    return {image: photo, type: type};
                }
            } catch (err) {
                if (err) throw err;
                return null;
            }
        }
    }

} //ok check
 **/

exports.getImage = async function (req) {
    const id = req.params.id;
    const image = await userHelper.checkImage(id);
    if (image) {
        if (image.image_filename) { // readFileSync or not.
            let photo = fs.readFileSync('storage/photos/' + image.image_filename, (err, data) => {
                if (err) throw err;
                return data;
            });
            let type = image.image_filename.split('.')[1];
            if (userHelper.validateImageRaw(type)) {
                type = (type === "jpg") ? "image/jpeg" : `image/${type}`;
                return {image: photo, type: type};
            }
        }
    }
    return false;
} //ok retrieve a user's profile image.

exports.putImage = async function (req) {

    const token = req.headers["x-authorization"]; // order 200 201 401 403 404
    const contentType = req.headers['content-type'];
    const id = req.params.id;
    const photo = req.body;

    if (!await userHelper.checkId(id)) return 404;
    let fileType = userHelper.checkImageType(contentType);
    if (!fileType || !photo) return 400;//body should in 404 or 400??????????????????????????????????????????

    const responseToken = await userHelper.checkToken(token);
    if (responseToken) {
        if (responseToken.id === parseInt(id)) {

            let path = 'storage/photos/';
            let fileName = `user_${id}.${fileType}`;
            let filePath = `${path}${fileName}`;
            let status = 200
            //write image into the file.
            fs.writeFileSync(filePath, photo, 'binary', function (err) {
                if (err) throw err;
            });
            if (!responseToken.image_filename) status = 201
            await userHelper.updateImage(fileName, id);
            return status;

        } else {
            return 403;
        }
    }

    return 401;

}//ok check status and problem.

exports.deleteImage = async function (req) {
    console.log('Request to delete User image!');

    const token = req.headers["x-authorization"];
    const id = req.params.id;
    const findToken = await userHelper.checkToken(token);

    if (findToken) {
        if (!await userHelper.checkId(id)) return 404;
        if (findToken.id === parseInt(id)) {
            if (!findToken.image_filename) return 404;
            fs.unlinkSync('storage/photos/' + findToken.image_filename, function (err) {
                if (err) throw err;
            });
            await userHelper.deleteImage(id);
            return 200;
        } else {
            return 403;
        }
    }
    return 401;
} // ok check delete a user's profile image.