const User = require('../models/User.model');
const Store = require('../models/Store.model');

const bcrypt = require('bcryptjs');
const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = "debug";

function addUser(user) {
    User.findOne({
        email: user.email
    }).then(async res => {
        if (res) {
            logger.error('Email already exists');
            return { status: 400, email: 'Email already exists' }
        }
        else {
            const newUser = new User({
                name: user.name,
                email: user.email,
                password: user.password,
            });
            bcrypt.genSalt(10, (err, salt) => {
                if (err) console.error('There was an error', err);
                else {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) console.error('There was an error', err);
                        else {
                            newUser.password = hash;
                            newUser
                                .save()
                                .then(async user => {
                                    logger.info('User already added')
                                    return user;
                                });
                        }
                    });
                }
            });
        }
    });
}

async function loginUser(email, password) {
    User.findOne({ email })
        .then(async user => {
            if (!user) {
                errors.email = 'User not found';
                logger.error('User not found');
                return {status: 404, errors};
            }
            bcrypt.compare(password, user.password)
                .then(async isMatch => {
                    if (isMatch) {
                        logger.info('Login successful');
                        return {status: 200, email: user.email};
                    }
                    else {
                        errors.password = 'Incorrect Password';
                        logger.error('Incorrect Password');
                        return {status: 400, errors };
                    }
                });
        });
}

function logoutUser(email) {
    console.log("aaaaaaaaaaaaaaaaaaaaaaa");
    
    Store.deleteOne({ 'session.email': email }, { runValidators: true }).exec();
    User.updateOne({ email }, { token: "" }, { runValidators: true }).exec();
    logger.info('Logout successful');
    return true;
}
module.exports.addUser = addUser;
module.exports.loginUser = loginUser;
module.exports.logoutUser = logoutUser;
