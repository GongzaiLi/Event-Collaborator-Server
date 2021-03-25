const db = require('../../../config/db');

//----------------------------------------------------------Get/events modify--------------------------------------------------
exports.modifyResponse = async function () {
    let response = {
        eventId: -1,
        title: "",
        categories: [],
        organizerFirstName: "",
        organizerLastName: "",
        numAcceptedAttendees: -1,
        capacity: -1
    }
}


//---------------------------------------------------------valid--------------------------------------------------------
exports.validTitle = function (request) { //**
    if ("title" in request) {
        if (typeof request.title === 'string' && request.title.length) {
            return true;
        }
    }
    return false;
}

exports.validDescription = function (request) {//**
    if ("description" in request) {
        if (typeof request.description === 'string' && request.description.length) {
            return true;
        }
    }
    return false;
}

exports.validCategoryIds = function (request) {//**
    if ("categoryIds" in request) {
        if (request.categoryIds.length) {
            for (const categoryId in request.categoryIds) {
                if (!Number.isInteger(categoryId)) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}

exports.validData = function (request) {
    if ("date" in request) {
        if (typeof request.date === 'string' && request.date.length) {
            return true;
        }
    }
    return false;
}

exports.validIsOnline = function (isOnline) {
    return typeof isOnline === "boolean";
}

exports.validUrl = function (url) {
    return typeof url === "string";
}

exports.validVenue = function (venue) {
    return typeof venue === "string";
}

exports.validCapacity = function (capacity) {
    return Number.isInteger(capacity);
}

exports.validRequiresAttendanceControl = function (requiresAttendanceControl) {
    return typeof requiresAttendanceControl === "boolean";
}















