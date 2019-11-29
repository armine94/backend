const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');
const settings = require('../configs/envSettings.json');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const log4js = require('log4js');

const logger = log4js.getLogger('logger');
const addUser = function(req, res) {
    const { errors, isValid } = validateRegisterInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }
    User.findOne({
        email: req.body.email
    }).then(user => {
        if(user) {
            logger.error("user.controller - line 19: Email already exists");
            return res.status(400).json({
                email: 'Email already exists'
            });
        }
        else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
            });

            bcrypt.genSalt(10, (err, salt) => {
                if(err) logger.error('user.controller - line 32: There was an error', err);
                else {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) logger.error('user.controller - line 35: There was an error', err);
                        else {
                            newUser.password = hash;
                            newUser
                            .save()
                            .then(user => {
                                logger.info('user.controller - line 41: User already added', user);
                                res.json('User already added');
                            });
                        }
                    });
                }
            });
        }
    });
}

const loginUser = function (req, res) {
    const { errors, isValid } = validateLoginInput(req.body);
    if(!isValid) {
        logger.error("user.controller - line 55: Invalid login or password");
        return res.json({error: true, message: errors});
    }

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email})
    .then(user => {
        if(!user) {
            errors.email = 'User not found';
            logger.error("user.controller - line 66: User not found");
            return res.json({error: true, message: errors});
        }
        bcrypt.compare(password, user.password)
        .then(isMatch => {
            if (isMatch) {
                req.session.email = user.email;
                logger.info('user.controller - line 73: Login successful');
                res.json({
                    success: true,
                    email: user.email
                });
            }
            else {
                logger.error('user.controller - line 80: Incorrect Password or Email');
                errors.password = 'Incorrect Password or Email';
                return res.json({error: true, message: errors});
            }
        });
    });
}

const logoutUser = function (req, res) {
    res.clearCookie(settings.session.name);
    logger.info('user.controller - line 90: Logout successful');
    res.status(200).send("Ok");
}

module.exports.addUser = addUser;
module.exports.loginUser = loginUser;
module.exports.logoutUser = logoutUser;