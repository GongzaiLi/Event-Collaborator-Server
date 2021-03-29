const userHelper = require('../resources/helpers/users.server.helper');
const eventHelper = require('../resources/helpers/events.server.helper');
const eventImageHelper = require('../resources/helpers/events.images.server.helper');
const fs = require('mz/fs');

exports.getImage = async function (req) {
    const eventId = req.params.id;
    const image = await eventImageHelper.checkImage(eventId);
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
    return null;
} // pass need check

exports.putImage = async function (req) {
    const token = req.headers["x-authorization"]; //
    const contentType = req.headers['content-type'];
    const eventId = req.params.id;
    const photo = req.body;

    const findToken = await userHelper.checkToken(token);
    if (!findToken) return 401;

    const findEventId = await eventHelper.checkEventId(eventId);
    if (!findEventId) return 404;

    if (findToken.id !== findEventId.organizer_id) return 403;


    let fileType = userHelper.checkImageType(contentType);
    if (!fileType || !photo) return 400;//body should in 404 or 400??????????????????????????????????????????


    let path = 'storage/photos/';
    let fileName = `event_${eventId}.${fileType}`;
    let filePath = `${path}${fileName}`;
    let status = 200
    //write image into the file.
    fs.writeFileSync(filePath, photo, 'binary', function (err) {
        if (err) throw err;
    });

    if (!findEventId.image_filename) status = 201
    await eventImageHelper.updateImage(fileName, eventId);
    return status;
} // pass need check