const user = require('../controllers/user.controller');
const image = require('../controllers/image.controller');
const audio = require('../controllers/audio.controller');
const express = require('express');
const router = express.Router();

//=========================== User Route ================================
router.post('/users/register', async function (req, res) {
    user.addUser(req, res)
});

router.post('/users/login', async (req, res) => {
    user.loginUser(req, res);
});

router.post('/users/logout', (req, res) => {
    user.logoutUser(req, res);
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
    image.deleteImage(req, res);
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