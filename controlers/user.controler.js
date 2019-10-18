const User = require('../models/User.model');

function addUser(user) {
    const newUser = new User(user);
    return newUser.save();
}

module.exports.addUser = addUser;