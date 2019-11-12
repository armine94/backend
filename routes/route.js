const log4js = require('log4js');
const express = require('express');
const logger = log4js.getLogger('logger');
const user = require('../controlers/user.controler');
const image = require('../controlers/image.controler');
const audio = require('../controlers/audio.controler');
const video = require('../controlers/video.controler');
const sessionConf = require('../configs/session.config');
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
    console.log(req.body);

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
            res.clearCookie(sessionConf.key);
            res.status(200).send("Ok");
        });
    }
});

//============================ Image Route ============================================
router.route('/upload/image').get(async function (req, res) {
    const { pageNumber, size } = req.query;
    let response;
    if (pageNumber < 1 && size < 1) {
        logger.error('invalid page number or count of files, those should start with 1');
        response = { "error": true, "message": "invalid page number or count of files, those should start with 1" };
    } else {
        logger.info('images sending')
        response = await image.findImage(pageNumber, size);
    }
    res.json(response);
})
    .post(function (req, res) {
        const response = image.addImage(req, res);
        logger.info('Image successfully save')
        res.json(response);
    })
    .put(function (req, res) {
        const data = {
            originalName: req.body.originalName,
            name: req.body.newName,
            description: req.body.newdescription,
        }
        image.updateImage(data)
        res.status(200).end();

    })
    .delete(function (req, res) {
        image.deleteImage(req.query.originalName)
        res.status(200).end();
    })

//====================== Audio Route ============================================
router.route('/upload/audio').get(async function (req, res) {
    const { pageNumber, size } = req.query;
    let response;
    if (pageNumber < 1 && size < 1) {
        logger.error('invalid page number or count of files, those should start with 1');
        response = { "error": true, "message": "invalid page number or count of files, those should start with 1" };
    } else {
        logger.info('Audios sending');
        response = audio.findAudio(pageNumber, size);
    }
    response.then(response => {
        logger.info(response);
        return res.json(response);
    })

})
    .post(async function (req, res) {
        const response = audio.addAudio(req, res);
        logger.info('Audio successfully save')
        return res.json(response);

    })
    .put(function (req, res) {
        const data = {
            originalName: req.body.originalName,
            name: req.body.newName,
            description: req.body.newdescription,
        }
        audio.updateAudio(data)
        res.status(200).end();

    })
    .delete(function (req, res) {
        audio.deleteAudio(req.query.originalName)
        res.status(200).end();
    })

//====================== Video Route ============================================
router.route('/upload/video').get(async function (req, res) {
    const { pageNumber, size } = req.query;
    let response;
    if (pageNumber < 1 && size < 1) {
        logger.error('invalid page number or count of files, those should start with 1');
        response = { "error": true, "message": "invalid page number or count of files, those should start with 1" };
    } else {
        logger.info('Videos sending');
        response = video.findVideo(pageNumber, size);
    }
    response.then(response => {
        logger.info(response);
        return res.json(response);
    })

})
    .post(async function (req, res) {
        const response = video.addVideo(req, res);
        logger.info('Video successfully save')
        return res.json(response);

    })
    .put(function (req, res) {
        const data = {
            originalName: req.body.originalName,
            name: req.body.newName,
            description: req.body.newdescription,
        }
        video.updateVideo(data)
        res.status(200).end();

    })
    .delete(function (req, res) {
        video.deleteVideo(req.query.originalName)
        res.status(200).end();
    })

module.exports = router;
