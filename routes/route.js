const log4js = require('log4js');
const express = require('express');
const logger = log4js.getLogger('logger');
const doc = require('../controlers/doc.controler');
const user = require('../controlers/user.controler');
const image = require('../controlers/image.controler');
const audio = require('../controlers/audio.controler');
const video = require('../controlers/video.controler');
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
    const { pageNumber, size } = req.query;
    let result;
    if (pageNumber < 1 && size < 1) {
        logger.error('invalid page number or count of files, those should start with 1');
        result = { "error": true, "message": "invalid page number or count of files, those should start with 1" };
        res.status(400).send(result);
    } else {
        result = await image.findImage(pageNumber, size);
    }
    if (result.error) {
        logger.error(error);
        res.status(404).json(result);
    } else {
        logger.info('Image successfully sending');
        res.status(200).json(result);
    }
})
.post(async function (req, res) {
    image.addImage(req, res);
})
.put(async function (req, res) {
    const data = {
        originalName: req.body.originalName,
        name: req.body.newName,
        description: req.body.newdescription,
    }
    const result = await image.updateImage(data)
    if (!result.error) {
        logger.info('Image successfully update');
        res.status(200).json(result);
    } else {
        logger.error(result.error);
        res.status(404).json(result);
    }
})
.delete(async function (req, res) {
    const result = await image.deleteImage(req.query.originalName)
    if (!result.error) {
        logger.info("Image successfully delete");
        res.status(200).json(result);
    } else {
        logger.error(error);
        res.status(404).json(result);
    }
})

//====================== Audio Route ============================================
router.route('/upload/audio').get(async function (req, res) {
    const { pageNumber, size } = req.query;
    let result;
    if (pageNumber < 1 && size < 1) {
        logger.error('invalid page number or count of files, those should start with 1');
        result = { "error": true, "message": "invalid page number or count of files, those should start with 1" };
    } else {
        result = await audio.findAudio(pageNumber, size);
    }
    if (!result.error) {
        logger.info('Audio successfully sending');
        res.status(200).json(result);
    } else {
        logger.error(error);
        res.status(404).json(result);
    }
})
.post( function (req, res) {
    audio.addAudio(req, res);
})
.put(async function (req, res) {
    const data = {
        originalName: req.body.originalName,
        name: req.body.newName,
        description: req.body.newdescription,
    }
    const result = await audio.updateAudio(data);
    if (!result.error) {
        logger.info('Audio successfully update');
        res.status(200).json(result);
    } else {
        logger.error(result.error);
        res.status(404).json(result);
    }
})
.delete(async function (req, res) {
    const result = await audio.deleteAudio(req.query.originalName)
    if (!result.error) {
        logger.info("Audio successfully delete");
        res.status(200).json(result);
    } else {
        logger.error(error);
        res.status(404).json(result);
    }
})

//====================== Video Route ============================================
router.route('/upload/video').get(async function (req, res) {
    const { pageNumber, size } = req.query;
    let result;
    if (pageNumber < 1 && size < 1) {
        logger.error('invalid page number or count of files, those should start with 1');
        result = { "error": true, "message": "invalid page number or count of files, those should start with 1" };
    } else {
        logger.info('Videos sending');
        result = await video.findVideo(pageNumber, size);
    }
    if (!result.error) {
        logger.info('Video successfully sending');
        res.status(200).json(result);
    } else {
        logger.error(error);
        res.status(404).json(result);
    }    
})
.post(async function (req, res) {
    video.addVideo(req, res);
})
.put(async function (req, res) {
    const data = {
        originalName: req.body.originalName,
        name: req.body.newName,
        description: req.body.newdescription,
    }
    const result = await video.updateVideo(data)
    if (!result.error) {
        logger.info('Video successfully update');
        res.status(200).json(result);
    } else {
        logger.error(result.error);
        res.status(404).json(result);
    }
})
.delete(async function (req, res) {
    const result = await video.deleteVideo(req.query.originalName)
    if (!result.error) {
        logger.info("Video successfully delete");
        res.status(200).json(result);
    } else {
        logger.error(error);
        res.status(404).json(result);
    }
})

//====================== Doc File Route ============================================
router.route('/upload/doc').get(async function (req, res) {
    const { pageNumber, size } = req.query;
    let result;
    if (pageNumber < 1 && size < 1) {
        logger.error('invalid page number or count of files, those should start with 1');
        result = { "error": true, "message": "invalid page number or count of files, those should start with 1" };
    } else {
        logger.info('Docs sending');
        result = await doc.findDocFile(pageNumber, size);
    }
    if (!result.error) {
        logger.info('Doc successfully sending');
        res.status(200).json(result);
    } else {
        logger.error(error);
        res.status(404).json(result);
    }    
})
.post(async function (req, res) {
    doc.addDocFile(req, res);
})
.put(async function (req, res) {
    const data = {
        originalName: req.body.originalName,
        name: req.body.newName,
        description: req.body.newdescription,
    }
    const result = await doc.updateDocFile(data)
    if (!result.error) {
        logger.info('Doc successfully update');
        res.status(200).json(result);
    } else {
        logger.error(result.error);
        res.status(404).json(result);
    }
})
.delete(async function (req, res) {
    const result = await doc.deleteDocFile(req.query.originalName)
    if (!result.error) {
        logger.info("Doc successfully delete");
        res.status(200).json(result);
    } else {
        logger.error(error);
        res.status(404).json(result);
    }
})

module.exports = router;