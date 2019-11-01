const multer = require('multer');
const Exif = require("simple-exiftool");
const Audio = require('../models/Audio.model');
const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = "debug";
let path;
let name;
let originalName;


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/audios');
    },
    filename: function (req, file, cb) {
        originalName = file.originalname;
        name = Date.now() + '-' + originalName;
        cb(null, name);
        path = "./public/audios/" + name;
    }
})

const upload = multer({ storage: storage }).array('file')


function addAudio(req, res) {

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
            }

            const key = [];
            key[0] = "SourceFile";
            key[1] = "FileName";
            key[2] = "Directory";
            key[3] = "FileSize";
            key[4] = "FilePermissions";
            key[5] = "FileTypeExtension";

            const audio = new Audio({
                name: originalName,
                src: path,
            });

            if (req.body.description) {
                audio.description = req.body.description;
            }

            for (let i = 0; i < 6; i++) {
                audio.metadata[key[i]] = metadata[key[i]];
            }

            audio
                .save()
                .then(text => {
                });
        });
        logger.info("File uploaded");
        return res.status(200).send(req.file)    // Everything went fine.
    })
};

module.exports.addAudio = addAudio;
