const User = require('../models/user.model');
const Store = require('../models/store.model');
const bcrypt = require('bcryptjs');
const log4js = require('log4js');

const logger = log4js.getLogger('logger');

function addUser(user) {
    try {
        return User.findOne({
            email: user.email
        }).then( res => {
            if (res) {
                logger.error('Email already exists');
                return { status: 400, error: 'Email already exists' }
            }
            else {
                const newUser = new User({
                    name: user.name,
                    email: user.email,
                    password: user.password,
                });
                return bcrypt.genSalt(10, (err, salt) => {
                    if (err) console.error('There was an error', err);
                    else {
                        return bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) console.error('There was an error', err);
                            else {
                                newUser.password = hash;
                                newUser
                                    .save()
                                    .then( user => {
                                        logger.info('User already added')
                                        return user;
                                    });
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        return { status: 400, error: error};
    }
}

const loginUser = function (email, password) {
    try {
        return User.findOne({ email })
            .then(user => {

                logger.info(user)
                if (!user) {
                    logger.error('User not found');
                    return { status: 404, error: 'User not found' };
                }
                return bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            logger.info('Login successful');
                            return { status: 200, email: user.email };
                        }
                        else {
                            logger.error('Incorrect Password');
                            return { status: 400, error: 'Incorrect Password' };
                        }
                    });
            });
    } catch (error) {
        return { status: 400, err: error };
    }

}

function logoutUser(email) {
    Store.deleteOne({ 'session.email': "gevorgyan.armine@inbox.ru" }).exec();
    User.updateOne({ email }, { token: "" }, { runValidators: true }).exec();
    logger.info('Logout successful');
    return true;
}
module.exports.addUser = addUser;
module.exports.loginUser = loginUser;
module.exports.logoutUser = logoutUser;