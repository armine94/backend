const fs = require('fs');
const multer = require('multer');
const log4js = require('log4js');
const Exif = require("simple-exiftool");
const Video = require('../models/video.model');
const settings = require('../configs/envSettings.json');
const extractFrames = require('ffmpeg-extract-frames');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const logger = log4js.getLogger('logger');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, settings.multerPath.video);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage }).array('file')

const addVideo = function (req, res) {
    upload(req, res, async function (err) {
        const originalName = req.files[0].originalname;
        const newName = Date.now() + '-' + originalName;
        const path = settings.path.video;
        const pathImg = settings.path.videoImage;
        let response;
        if (err instanceof multer.MulterError) {
            logger.error(`multer.MulterError: ${err}`);
            response = { "error": true, "message": err };  // A Multer error occurred when uploading.
        } else if (err) {
            logger.error(`multer.MulterError: ${err}`);
            response = { "error": true, "message": err };   // An unknown error occurred when uploading.
        }

        //rename uploading video 
        fs.rename(path + originalName, path + newName, function (err) {
            if (err) throw err;
            logger.info('renamed complete');
        })

        const imgName = newName.slice(0, -3) + 'jpg';
        //get image on video
        extractFrames({
            input: path + newName,
            output: pathImg + imgName,
            offsets: [
                1000
            ]
        })
        .then(async result => {
            logger.info('video successfully cat and save :', result);
            //Generate metadata 
            Exif(path + newName, async (error, metadata) => {
                if (error) {
                    logger.error(`Exif error: ${error}`);
                    response = { error: true, message: error };
                }
                const video = new Video({
                    name: originalName,
                    videoUrl: settings.staticPath.video + newName,
                    imageUrl: settings.staticPath.videoImage + imgName,
                })

                if (req.body.description) {
                    video.description = req.body.description;
                }

                for (let i = 0; i < settings.videoMetadataKey.length; i++) {
                    video.metadata[settings.videoMetadataKey[i]] = metadata[settings.videoMetadataKey[i]];
                }
                response = await video
                .save()
                .then(video => {
                    logger.info(`video file data successfully save ${video}`);
                    return { "error": false, "message": "success" };
                });
                res.send(response)
            });
        })
        .catch(err => {
            logger.error(err);
            response = { "error": true, "message": err }
            res.send(response)
        })
    })
}

const findVideo = async function (pageNumber, size) {
    const query = {}
    query.skip = (pageNumber - 1) * size;
    query.limit = parseInt(size, 10);//string parse int
    try {
        const data = await Video.find({}, {}, query);
        const name = [];
        const metadata = [];
        const imageUrl = [];
        const videoUrl = [];
        const originalName = [];
        const description = [];

        data && data.length && data.forEach((element) => {
            description.push(element.description);
            name.push(element.name);
            metadata.push(element.metadata);
            imageUrl.push(element.imageUrl);
            videoUrl.push(element.videoUrl);
            originalName.push(element.metadata.FileName);
        });
        logger.info(`Videos data resolved`);
        return { error: false, name: name, originalName: originalName, description: description, metadatas: metadata, imageUrl: imageUrl, videoUrl: videoUrl };
    }
    catch (err) {
        logger.error(`Error fetching data ${err}`);
        return { error: true, message: "Error fetching data" };
    }
}

const updateVideo = async function (data) {
    return await Video.updateOne({
        'metadata.FileName': data.originalName
    }, { name: data.name, description: data.description }, { runValidators: true }).exec();
}

const deleteVideo = async function (data) {
    fs.unlink(settings.path.video + data, (err) => {
        if (err) throw err;
        logger.info(settings.path.video + data + ' was deleted');
    });
    fs.unlink(settings.path.videoImage + data, (err) => {
        if (err) throw err;
        logger.info(settings.path.videoImage + data + ' was deleted');
    });
    return await Video.deleteOne({ 'metadata.FileName': data })
}

module.exports.addVideo = addVideo;
module.exports.findVideo = findVideo;
module.exports.updateVideo = updateVideo;
module.exports.deleteVideo = deleteVideo;