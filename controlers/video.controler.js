const fs = require('fs');
const multer = require('multer');
const log4js = require('log4js');
const Exif = require("simple-exiftool");
const Video = require('../models/video.model');
const metadataKey = require('../configs/metadata.config');
const extractFrames = require('ffmpeg-extract-frames');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const logger = log4js.getLogger('logger');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/videos');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage }).array('file')

const addVideo = function (req, res) {
    upload(req, res, function (err) {
        const originalName = req.files[0].originalname;
        const newName = Date.now() + '-' + originalName;
        const path = './public/videos/';
        const pathImg = './public/videos/images/';
        if (err instanceof multer.MulterError) {
            logger.error(`multer.MulterError: ${err}`);
            return response = { "error": true, "message": err };  // A Multer error occurred when uploading.
        } else if (err) {
            logger.error(`multer.MulterError: ${err}`);
            return response = { "error": true, "message": err };   // An unknown error occurred when uploading.
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
            .then(result => {
                logger.info('image successfully cat and save :', result);
                //Generate metadata 
                Exif(path + newName, (error, metadata) => {
                    if (error) {
                        logger.error(`Exif error: ${error}`);
                        return { error: true, message: error };
                    }
                    const video = new Video({
                        name: originalName,
                        imgUrl: 'http://localhost:54545/static/videos/images/' + imgName,
                    })

                    if (req.body.description) {
                        video.description = req.body.description;
                    }
                    const { videoMetadataKey } = metadataKey;
                    for (let i = 0; i < videoMetadataKey.length; i++) {
                        video.metadata[videoMetadataKey[i]] = metadata[videoMetadataKey[i]];
                    }
                    video
                        .save()
                        .then(video => {
                            logger.info(`video file data successfully save ${video}`);
                            return { "error": false, "message": "success" };
                        });
                });
            })
            .catch(err => {
                logger.error(err);
                return { "error": true, "message": err }
            })
    })
}

const findVideo = async function (pageNumber, size) {
    const query = {}
    query.skip = (pageNumber - 1) * size;
    query.limit = parseInt(size, 10);//string parse int

    try {
        const data = await Video.find({}, {}, query, async function (err, data) {
        });
        const originalName = [];
        const description = [];
        const videoName = [];
        const metadata = [];
        const path = [];
        data && data.length && data.forEach((element) => {
            description.push(element.description);
            videoName.push(element.name);
            metadata.push(element.metadata);
            originalName.push(element.metadata.FileName);
            path.push(element.imgUrl);
        });
        logger.info(`Videos data resolved`);
        return { error: false, name: videoName, originalName: originalName, description: description, metadatas: metadata, path: path };
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
    fs.unlink('./public/videos/' + data, (err) => {
        if (err) throw err;
        logger.info('./public/videos/' + data + ' was deleted');
    });
    fs.unlink('./public/videos/images' + data, (err) => {
        if (err) throw err;
        logger.info('./public/videos/images' + data + ' was deleted');
    });
    return await Video.deleteOne({ 'metadata.FileName': data })
}

module.exports.addVideo = addVideo;
module.exports.findVideo = findVideo;
module.exports.updateVideo = updateVideo;
module.exports.deleteVideo = deleteVideo;
