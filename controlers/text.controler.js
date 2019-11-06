const metadataKey = require('../configs/metadata.config');
const TextFile = require('../models/textFile.model');
const Exif = require("simple-exiftool");
const multer = require('multer');
const log4js = require('log4js');
const logger = log4js.getLogger('logger');

let path;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/texts');
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalName;
        cb(null, name);
        path = "./public/texts/" + name;
    }
})

const upload = multer({ storage: storage }).array('file')


const addTextFile = function (req, res) {

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

            const text = new TextFile({
                name: originalName,
                src: path,
            });

            if (req.body.description) {
                text.description = req.body.description;
            }
            const {textMetadataKey} = metadataKey;
            for (let i = 0; i < 6; i++) {
                text.metadata[textMetadataKey[i]] = metadata[textMetadataKey[i]];
            }

            text
                .save()
                .then(text => {
                    logger.info(`text file data successfully save ${text}`);
                    return response = { "error": false, "message": "success" };
                });
        });
    })
};

module.exports.addTextFile = addTextFile;
