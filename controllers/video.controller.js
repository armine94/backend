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
        if (!fs.existsSync(settings.path.video)){
            fs.mkdirSync(settings.path.video);
        }
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
            logger.error(`video.controller - line 35: multer.MulterError: ${err}`);
            response = { "error": true, "message": err };  // A Multer error occurred when uploading.
        } else if (err) {
            logger.error(`video.controller - line 38: multer.MulterError: ${err}`);
            response = { "error": true, "message": err };   // An unknown error occurred when uploading.
        }

        //rename uploading video 
        fs.rename(path + originalName, path + newName, function (err) {
            if (err) throw err;
            logger.info('video.controller - line 45: renamed complete');
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
            logger.info('video.controller - line 58: video successfully cat and save :', result);
            //Generate metadata 
            Exif(path + newName, async (error, metadata) => {
                if (error) {
                    logger.error(`video.controller - line 62: Exif error: ${error}`);
                    response = { error: true, message: error };
                }
                const video = new Video({
                    name: originalName,
                    author: req.body.author,
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
                    logger.info(`video.controller - line 82: video file data successfully save ${video}`);
                    return { "error": false, "message": "success" };
                });
                res.send(response)
            });
        })
        .catch(err => {
            logger.error("video.controller - line 89: ", err);
            response = { "error": true, "message": err }
            res.send(response)
        })
    })
}

const findVideo = async function (req, res) {
	const { pageNumber, size } = req.query;
	let result;
    if (pageNumber < 0 && size < 0) {
        logger.error('video.controller - line 100: invalid page number or count of files, those should start with 1');
		result = { "error": true, "message": "invalid page number or count of files, those should start with 1" };
		res.status(400).send(result);
		return;
    }
    
    const query = {}
    query.skip = pageNumber > 0 ? (pageNumber - 1) * size: (pageNumber) * size;
    query.limit = parseInt(size, 10);//string parse int
    try {
        const data = await Video.find({}, {}, query);
		const count = await Video.countDocuments({});
        const originalName = [];
        const description = [];
        const metadata = [];
        const imageUrl = [];
        const videoUrl = [];
        const author = [];
        const name = [];

        data && data.length && data.forEach((element) => {
            description.push(element.description);
            name.push(element.name);
            author.push(element.author);
            metadata.push(element.metadata);
            imageUrl.push(element.imageUrl);
            videoUrl.push(element.videoUrl);
            originalName.push(element.metadata.FileName);
        });
        logger.info(`video.controller - line 129: Videos data resolved`);
        result = { error: false, name: name, author: author, originalName: originalName, description: description, metadatas: metadata, imageUrl: imageUrl, videoUrl: videoUrl, count: count };
		res.status(200).send(result);
    }
    catch (err) {
        logger.error(`video.controller - line 134: Error fetching data ${err}`);
		result = { error: true, message: "Error fetching data" };
		res.status(400).send(result);
    }
}

const updateVideo = function (req, res) {
    const data = {
        author: req.body.author,
        originalName: req.body.originalName,
        description: req.body.newdescription,
    }
	let result;
    Video.updateOne({
        'metadata.FileName': data.originalName, 
        author: data.author
    }, { description: data.description }, { runValidators: true }).exec()
    .then(result => {
		if(result.nModified) {
			logger.info("video.controller - line 153: Update video data success");
			result = {error: false, message: "success"};
		} else {
			logger.error("video.controller - line 156: Video data not found");
			result = {error: true, message: "data not found"};
		}
		res.send(result);
	})
	.catch(error => {
		logger.error("video.controller - line 162: ", error)		
		result = {error: true, message: error};
		res.send(result);
	})
}

const deleteVideo = function (req, res) {
    let result;
    const data = req.query.originalName;
    const author = req.query.author;
    Video.deleteOne({ 'metadata.FileName': data, author: author })
    .then(result => {
		if(result.deletedCount) {
            fs.unlink(settings.path.video + data, (err) => {
                if (err) {
                    logger.error("video.controller - line 177: ", err);
                    res.send({error: true, message: err});
                }
                logger.info(`video.controller - line 180: ${settings.path.video}${data} was deleted`);
            });
            fs.unlink(settings.path.videoImage + data.slice(0, -3) + 'jpg', (err) => {
                if (err) {
                    logger.error("video.controller - line 184: ", err);
                    res.send({error: true, message: err});
                }
                logger.info(`video.controller - line 187: ${settings.path.videoImage}${data} was deleted`);
            });
			logger.info("video.controller - line 189: Video data deleted")
			result = {error: false, message: "success"};
		} else {
			logger("video.controller - line 192: Video data nor found");
			result = {error: true, message: "data not found"};
		}
		res.send(result);
	})
	.catch(error => {
		logger.error("video.controller - line 198: ", error);
		result = {error: true, message: error};
		res.send(result);
	})
}

module.exports.addVideo = addVideo;
module.exports.findVideo = findVideo;
module.exports.updateVideo = updateVideo;
module.exports.deleteVideo = deleteVideo;