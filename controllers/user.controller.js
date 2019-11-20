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
            logger.error("Email already exists");
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
                if(err) logger.error('There was an error', err);
                else {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) logger.error('There was an error', err);
                        else {
                            newUser.password = hash;
                            newUser
                            .save()
                            .then(user => {
                                logger.info('User already added', user);
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
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email})
    .then(user => {
        if(!user) {
            errors.email = 'User not found'
            return res.status(404).json(errors);
        }
        bcrypt.compare(password, user.password)
        .then(isMatch => {
            if (isMatch) {
                logger.info('Login successful');
                res.json({
                    success: true,
                    email: user.email
                });
            }
            else {
                logger.error('Incorrect Password or Email');
                errors.password = 'Incorrect Password or Email';
                return res.status(400).json(errors);
            }
        });
    });
}

const logoutUser = function (req, res) {
    if (req.session) {
        req.session.destroy(error => {
            req.session = null;
            if (error) {
                logger.error(error);
                return next(error);
            }
            res.clearCookie(settings.session.key);
            logger.info('Logout successful');
            res.status(200).send("Ok");
        });
    }
}

module.exports.addUser = addUser;
module.exports.loginUser = loginUser;
module.exports.logoutUser = logoutUser;