const express = require('express');
const log4js = require('log4js');
const router = express.Router();

const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');
const audio = require('../controlers/audio.controler');
const image = require('../controlers/image.controler');
const user = require('../controlers/user.controler')

const logger = log4js.getLogger();
logger.level = "debug";

//===========================User================================
router.post('/users/register', function (req, res) {

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
    const response = user.addUser(newUser)
    req.session.user = "user.dataValues";
    res.json(response);
});

router.post('/users/login', async (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
        logger.error(errors);
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;
    const response = await user.loginUser(email, password);
    res.json(response);

});

router.post('/users/logout', (req, res) => {
    if (req.session && req.cookies["connect.sid"]) {
        const response = user.logoutUser(req.body.email);
        res.clearCookie('connect.sid').status(200).send(response);
    } else {
        res.status(200).end();
    }
});

//============================Image============================================
router.route('/upload/image').get(function (req, res) {
    if (req.session && req.cookies["connect.sid"]) {
        const { pageNumber, size } = req.query;
        let response;
        if (pageNumber <= 0) {
            logger.error('invalid page number, should start with 1');
            response = { "error": true, "message": "invalid page number, should start with 1" };
        } else {
            logger.info('mages sending')
            response = image.findImage(pageNumber, size);
        }
        response.then(response => {
            return res.json(response);
        })
    } else {
        logger.error(req.session);
        logger.error(req.cookies["connect.sid"]);
        logger.info('status: 403');
        res.status(403);
        res.end();
    }
})
    .post(function (req, res) {    
        if (req.session && req.cookies["connect.sid"]) {
            const response = image.addImage(req, res);
            logger.info('Image successfully save')
            return res.json(response);
        } else {
            logger.error(req.session);
            logger.error(req.cookies["connect.sid"]);
            logger.info('status: 403')
            res.status(403);
            res.end();
        }
    })
    .delete(function (req, res) {
        //delete file

    });

//======================Audio============================================
router.get('/upload/audio', async function (req, res) {
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
});

router.post('/audio', async function (req, res) {
    if (req.session && req.cookies["connect.sid"]) {
        const response = audio.addAudio(req, res);
        logger.info('Audio successfully save')
        return res.json(response);
    } else {
        logger.info('status: 403')
        res.status(403);
        res.end();
    }
});

router.delete('/audio', function (req, res) {
    //delete file
});

module.exports = router;
