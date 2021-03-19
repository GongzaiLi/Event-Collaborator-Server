const Users = require('../models/user.server.model');
const fs = require('mz/fs'); //?

exports.createUser = async function (req, res) {
  console.log('Register as a new user.');

  try {
    const response = await Users.createUser(req);
    if (response) {
      res.status(201)
        .send({userId: response.insertId});
    } else {
      res.status(401)
        .send('400: Bad Request'); // need talk what is the error
    }
  } catch (err) {
    res.status(500)
      .send(`500: ERROR getting ${err}`);
  }
} //ok

exports.loginUser = async function (req, res) {
  console.log('User login');

  try {
    const response = await Users.loginUser(req);
    if (response) {
      res.status(200)
        .send(response);
    } else {
      res.status(400)
        .send('400: Bad Request');
    }
  } catch (err) {
    res.status(500)
      .send(`500: ERROR getting ${err}`);
  }
}  //ok

exports.logoutUser = async function (req, res) {
  console.log('User logout checking');

  try {
    const response = await Users.logoutUser(req);
    if (response) {
      res.status(200)
        .send("OK");
    } else {
      res.status(401)
        .send("401: Unauthorized");
    }
  } catch (err) {
    res.status(500)
      .send(`500: ERROR getting ${err}`);
  }
} //ok

exports.getUser = async function (req, res) {
  console.log('Searching a user.')

  try {
    const response = await Users.getUser(req);
    if (response) {
      res.status(200)
        .send(response);
    } else {
      res.status(404)
        .send("404: Not Found");
    }
  } catch (err) {
    res.status(500)
      .send(`500: ERROR getting ${err}`);

  }

} //check

exports.updateUser = async function (req, res) {
  console.log("Change a user's details.");

  try {
    const response = await Users.updateUser(req);

    if (response === 200) {
      res.status(200)
        .send("OK");
    } else if (response === 400) {
      res.status(400)
        .send("400: Bad Request");
    } else if (response === 401) {
      res.status(401)
        .send("401: Unauthorized");
    } else {
      res.status(403)
        .send("404: Forbidden");
    }
  } catch (err) {
    res.status(500)
      .send(`500: ERROR getting ${err}`);

  }
} //check


//----------------------user.Image-----------------------------

exports.getImage = async function (req, res) {
  console.log("get a user's Image.");

  try {
    const response = await Users.getImages(req);
    if (response) {
      fs.readFile('storage/images/'+response.image, function (err, data) {
        res.setHeader("content-type", "image/"+response.type);
        res.status(200)
          .send(data);
      });

    } else {
      res.status(404)
        .send("404: Not Found");
    }

  } catch (err) {
    res.status(500)
      .send(`500: ERROR getting ${err}`);
  }

}

exports.deleteImage = async function (req, res) {


}