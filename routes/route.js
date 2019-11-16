const log4js = require('log4js');
const express = require('express');
const logger = log4js.getLogger('logger');
const user = require('../controlers/user.controler');
const image = require('../controlers/image.controler');
const audio = require('../controlers/audio.controler');
const settings = require('../configs/envSettings.json');
const validateLoginInput = require('../validation/login');
const validateRegisterInput = require('../validation/register');
const router = express.Router();

//=========================== User Route ================================
router.post('/users/register', async function (req, res) {
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) {
        logger.error(errors);
        return res.status(400).json(errors);
    }

    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    }
    const response = await user.addUser(newUser)

    logger.info(response);
    if (response.status === 200) {

        logger.info(response);
        res.status(200).end('Ok')
    } else {
        logger.error(response);
        res.status(400).end(response.error);
    }
});

router.post('/users/login', async (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
        logger.error(errors);
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;
    const response = await user.loginUser(email, password)
    if (response.status === 200) {
        logger.info(response);
        res.send(response);
    } else {
        logger.error(response);
        res.status(400).end('Incorrect email or password');
    }
});

router.post('/users/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(error => {
            req.session = null;
            if (error) return next(error);
            user.logoutUser(req.body.email);
            res.clearCookie(settings.session.key);
            res.status(200).send("Ok");
        });
    }
});

//============================ Image Route ============================================
router.route('/upload/image').get(async function (req, res) {
    image.findImage(req, res);
})
.post( function (req, res) {
    image.addImage(req, res);
})
.put(async function (req, res) {
    image.updateImage(req, res)
})
.delete(async function (req, res) {
    image.deleteImage(req.query.originalName);
})

//====================== Audio Route ============================================
router.route('/upload/audio').get(async function (req, res) {
    audio.findAudio(req, res);
})
.post( function (req, res) {
    audio.addAudio(req, res);
})
.put(async function (req, res) {
    audio.updateAudio(req, res);
})
.delete(async function (req, res) {
    audio.deleteAudio(req, res)
})

module.exports = router;
