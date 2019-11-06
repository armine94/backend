const metadataKey = require('../configs/metadata.config');
const Audio = require('../models/audio.model');
const Exif = require("simple-exiftool");
const multer = require('multer');
const log4js = require('log4js');
const logger = log4js.getLogger('logger');

let path;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/audios');
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
        path = "./public/audios/" + name;
    }
})

const upload = multer({ storage: storage }).array('file')


const addAudio = function (req, res) {

    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            logger.error(`multer.MulterError: ${err}`);
            return res.status(500).json(err)      // A Multer error occurred when uploading.
        } else if (err) {
            logger.error(`multer.MulterError: ${err}`);
            return res.status(500).json(err)      // An unknown error occurred when uploading.
        }

        Exif(path, (error, metadata) => {
            if (error) {
                logger.error(`Exif error: ${error}`);
                return res.status(500).json(error)
            }

            const audio = new Audio({
                name: req.files[0].originalname,
            });

            if (req.body.description) {
                audio.description = req.body.description;
            }
            const {audioMetadataKey} = metadataKey
            for (let i = 0; i < audioMetadataKey.length; i++) {
                audio.metadata[audioMetadataKey[i]] = metadata[audioMetadataKey[i]];
            }

            audio
                .save()
                .then(audio => {
                    logger.info(`audio file data successfully save ${audio}`);
					return response = { "error": false, "message": "success" };
                });
        });
    })
};

module.exports.addAudio = addAudio;
