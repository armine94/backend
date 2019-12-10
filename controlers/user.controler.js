const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');
const settings = require('../configs/envSettings.json');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const log4js = require('log4js');
const multer = require('multer');
const fs = require('fs');

const logger = log4js.getLogger('logger');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
        if (!fs.existsSync(settings.path.user)) {
			fs.mkdirSync(settings.path.user);
		}
		cb(null,  settings.multerPath.user);
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
})

const upload = multer({ storage: storage }).array('file');

addUser = function(req, res) {
    upload(req, res, function (err) {
        const { errors, isValid } = validateRegisterInput(req.body);
        const originalName = req.files[0].originalname;
        const newName = Date.now() + '-' + originalName;
        const path = settings.path.user;
        fs.rename(path + originalName, path + newName, function (err) {
            if (err) {
                logger.error('user.controller - line 33: ',err)
            } else {
                logger.info('user.controller - line 35: renamed complete');
            }
        })
        if(!isValid) {
            return res.status(400).json(errors);
        }
        User.findOne({
            email: req.body.email
        }).then(user => {
            if(user) {
                logger.error("user.controller - line 45: Email already exists");
                return res.status(400).json({
                    email: 'Email already exists'
                });
            }
            else {
                const newUser = new User({
                    name: req.body.name,
                    bDay: req.body.bDay,
                    email: req.body.email,
                    gender: req.body.gender,
                    surname: req.body.surname,
                    password: req.body.password,
                    imageUrl: settings.staticPath.user + newName,
                });

                bcrypt.genSalt(10, (err, salt) => {
                    if(err) logger.error('user.controller - line 62: There was an error', err);
                    else {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) logger.error('user.controller - line 65: There was an error', err);
                            else {
                                newUser.password = hash;
                                newUser
                                .save()
                                .then(user => {
                                    logger.info('user.controller - line 71: User already added', user);
                                    res.json("User already added");
                                });
                            }
                        });
                    }
                });
            }
        });
        
    })
}

const loginUser = function (req, res) {
    const { errors, isValid } = validateLoginInput(req.body);
    if(!isValid) {
        logger.error("user.controller - line 87: Invalid login or password");
        return res.json({error: true, message: errors});
    }

    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email})
    .then(user => {
        if(!user) {
            errors.email = 'User not found';
            logger.error("user.controller - line 97: User not found");
            return res.json({error: true, message: errors});
        }
        bcrypt.compare(password, user.password)
        .then(isMatch => {
            if (isMatch) {
                req.session.email = user.email;
                logger.info('user.controller - line 104: Login successful');
                req.session.email = user.email;
                res.json({
                    success: true,
                    email: user.email,
                    name: user.name,
                    surname: user.surname,
                    bDay: user.bDay.slice(0,10),
                    imageUrl: user.imageUrl
                });
            }
            else {
                logger.error('user.controller - line 116: Incorrect Password or Email');
                errors.password = 'Incorrect Password or Email';
                return res.json({error: true, message: errors});
            }
        });
    });
}

const logoutUser = function (req, res) {
    res.clearCookie(settings.session.name);
    logger.info('user.controller - line 126: Logout successful');
    res.status(200).send("Ok");
}

const forgotEmail = function(req, res) {
    const email = req.body.email;
    User.findOne({email})
    .then(user => {
        if(!user) {
            logger.info('user.controller - line 135: User not found');
            errors.email = 'User not found';
            return res.json({error: true, message: errors});
        }
        logger.info('user.controller - line 139: forgot - ok')
        res.json({error: false, message: "error"});

    })
    .catch(error => {
        logger.error('user.controller - line 144: ', error)
        res.json({error: true, message: error});
    })
}

const forgotPassword = function(req, res) {
    const { errors, isValid } = validateLoginInput(req.body);
    if(!isValid) {
        logger.error('user.controller - line 152: ', errors);
        return res.status(400).json(errors);
    }
    bcrypt.genSalt(10, (err, salt) => {
        if(err) logger.error('user.controller - line 156: There was an error', err);
        else {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                if(err) logger.error('user.controller - line 159: There was an error', err);
                else {
                    User.updateOne({
                        email: req.body.email
                    }, { password: hash }, { runValidators: true }).exec()
                    .then(result => { 
                        if(result.nModified) {
                            res.status(200).json({error: false, message: "Ok"});
                        } else {
                            res.json({error: true, message: "User not found"});
                        }
                    })
                    .catch(error => {
                        logger.error('user.controller - line 172: ', error);
                        res.json({error: true, message: error});

                    })                        
                }
            });
        }
    });
}

module.exports.addUser = addUser;
module.exports.loginUser = loginUser;
module.exports.logoutUser = logoutUser;
module.exports.forgotEmail = forgotEmail;
module.exports.forgotPassword = forgotPassword;