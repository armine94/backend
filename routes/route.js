const express = require('express');
const log4js = require('log4js');
const router = express.Router();

const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');
const audio = require('../controlers/audio.controler');
const image = require('../controlers/image.controler');
const user = require('../controlers/user.controler');
const logger = log4js.getLogger('logger');

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
    const response = await user.addUser(newUser);
    res.json(response);
});

router.post('/users/login', async (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
        logger.error(errors);
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    req.session.email = email;
    const password = req.body.password;
    const response = await user.loginUser(email, password)
    if (response.status === 200) {
        logger.info(response);
        res.status(200).end('Ok')
    } else {
        logger.error(response);
        res.status(400).end('Incorrect email or password');
    }
});

router.post('/users/logout', (req, res) => {
    const response = user.logoutUser(req.body.email);
    res.status(200).json(response);
});

//============================ Image Route ============================================
router.route('/upload/image').get(function (req, res) {
    const { pageNumber, size } = req.query;
    let response;
    if (pageNumber <= 0) {
        logger.error('invalid page number, should start with 1');
        response = { "error": true, "message": "invalid page number, should start with 1" };
    } else {
        logger.info('images sending')
        response = image.findImage(pageNumber, size);
    }
    response.then(response => {
        return res.json(response);
    })
})
    .post(function (req, res) {
        const response = image.addImage(req, res);
        logger.info('Image successfully save')
        return res.json(response);
    })
    .delete(function (req, res) {
        //delete file

    });

//====================== Audio Route ============================================
router.route('/upload/audio').get(async function (req, res) {
    if (req.session && req.cookies["connect.sid"]) {
        const { pageNumber, size } = req.query;
        let response;
        if (pageNumber <= 0) {
            logger.error('invalid page number, should start with 1');
            response = { "error": true, "message": "invalid page number, should start with 1" };
        } else {
            logger.info('Audios sending')
            response = audio.findAudio(pageNumber, size);
        }
        response.then(response => {
            return res.json(response);
        })
    } else {
        logger.info('status: 403')
        res.status(403);
        res.end();
    }
})
    .post(async function (req, res) {
        if (req.session && req.cookies["connect.sid"]) {
            const response = audio.addAudio(req, res);
            logger.info('Audio successfully save')
            return res.json(response);
        } else {
            logger.info('status: 403')
            res.status(403);
            res.end();
        }
    })
    .delete(function (req, res) {
        //delete file
    });

module.exports = router;
