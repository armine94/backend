const log4js = require('log4js');
const express = require('express');
const logger = log4js.getLogger('logger');
const doc = require('../controlers/doc.controller');
const user = require('../controlers/user.controller');
const image = require('../controlers/image.controller');
const audio = require('../controlers/audio.controller');
const video = require('../controlers/video.controller');
const router = express.Router();

//=========================== User Route ================================
router.post('/users/register', function (req, res) {
    user.addUser(req, res)
});

router.post('/users/login', (req, res) => {
    user.loginUser(req, res);
});

router.post('/users/logout', (req, res) => {
    user.logoutUser(req, res);
});

router.post('/users/forgot', (req, res) => {
    user.forgotEmail(req, res);
});

router.post('/users/forgotPassword', (req, res) => {
    user.forgotPassword(req, res);
});

//============================ Image Route ============================================
router.route('/asset/image').get(function (req, res) {
    image.findImage(req, res);
})
.post( function (req, res) {
    image.addImage(req, res);
})
.put(function (req, res) {
    image.updateImage(req, res)
})
.delete(function (req, res) {
    image.deleteImage(req, res);
})

//====================== Audio Route ============================================
router.route('/asset/audio').get(function (req, res) {
    audio.findAudio(req, res);
})
.post( function (req, res) {
    audio.addAudio(req, res);
})
.put(function (req, res) {
    audio.updateAudio(req, res);
})
.delete(function (req, res) {
    audio.deleteAudio(req, res)
})

//====================== Video Route ============================================
router.route('/asset/video').get(function (req, res) {
    video.findVideo(req, res);   
})
.post(function (req, res) {
    video.addVideo(req, res);
})
.put(function (req, res) {
    video.updateVideo(req, res);
})
.delete(function (req, res) {
    video.deleteVideo(req, res);   
})

//====================== Doc File Route ============================================
router.route('/asset/doc').get( function (req, res) {
    doc.findDocFile(req, res);   
})
.post( function (req, res) {
    doc.addDocFile(req, res);
})
.put( function (req, res) {
    doc.updateDocFile(req, res);
})
.delete( function (req, res) {
    doc.deleteDocFile(req, res);
})

module.exports = router;
