const fs = require('fs');
const multer = require('multer');
const log4js = require('log4js');
const Exif = require("simple-exiftool");
const Audio = require('../models/audio.model');
const settings = require('../configs/envSettings.json');

const logger = log4js.getLogger('logger');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, settings.multerPath.audio);
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
})

const upload = multer({ storage: storage }).array('file')

const addAudio = function (req, res) {
	upload(req, res, function (err) {
		const originalName = req.files[0].originalname;
		const newName = Date.now() + '-' + originalName;
		const path = settings.path.audio;
		let response;
		if (err instanceof multer.MulterError) {
			logger.error(`audio.controller - line 27: multer.MulterError: ${err}`);
			response = { "error": true, "message": err };  // A Multer error occurred when uploading.
		} else if (err) {
			logger.error(`audio.controller - line 30: multer.MulterError: ${err}`);
			response = { "error": true, "message": err };   // An unknown error occurred when uploading.
		}

		//rename uploading audio 
		fs.rename(path + originalName, path + newName, function (err) {
			if (err) throw err;
			logger.info('audio.controller - line 37: renamed complete');
		})

		//Generate metadata 
		Exif( path + newName,async (error, metadata) => {
			if (error) {
				logger.error(`audio.controller - line 43: Exif error: ${error}`);
				response = { error: true, message: error };
			}
			const audio = new Audio({
				name: originalName,
				author: req.body.author,
				audioUrl: settings.staticPath.audio + newName, 
			})

			if (req.body.description) {
				audio.description = req.body.description;
			}

			for (let i = 0; i < settings.audioMetadataKey.length; i++) {
				audio.metadata[settings.audioMetadataKey[i]] = metadata[settings.audioMetadataKey[i]];
			}

			response = await audio
			.save()
			.then(audio => {
				logger.info(`audio.controller - line 63: audio file data successfully save ${audio}`);
				return { "error": false, "message": "success" };
			});
			res.send(response);
		});
	})
}

const findAudio = async function (req, res) {
	const { pageNumber, size } = req.query;
	let result;
    if (pageNumber < 1 && size < 1) {
        logger.error('audio.controller - line 75: invalid page number or count of files, those should start with 1');
		result = { "error": true, "message": "invalid page number or count of files, those should start with 1" };
		res.status(400).send(result);
		return;
	}
	const query = {}
	query.skip = (pageNumber - 1) * size;
	query.limit = parseInt(size, 10);//string parse int
	try {
		const data = await Audio.find({}, {}, query);
		const count = await Audio.countDocuments({});
		const originalName = [];
		const description = [];
		const audioName = [];
		const audioUrl = [];
		const imageUrl = [];
		const metadata = [];
		const author = [];
		data && data.length && data.forEach((element) => {
			audioName.push(element.name);
			author.push(element.author);
			metadata.push(element.metadata);
			audioUrl.push(element.audioUrl);
			imageUrl.push(element.imageUrl);
			description.push(element.description);
			originalName.push(element.metadata.FileName);

		});
		logger.info(`audio.controller - line 103: Audios data resolved`);
		result = { error: false, name: audioName, author: author, originalName: originalName, description: description, metadatas: metadata, imageUrl: imageUrl, audioUrl: audioUrl, count: count };
		res.status(200).send(result);
	}
	catch (err) {
		logger.error(`audio.controller - line 108: Error fetching data ${err}`);
		result = { error: true, message: "Error fetching data" };
		res.status(400).send(result);
	}
}

const updateAudio = function (req, res ) {
	const data = {
        author: req.body.author,
        originalName: req.body.originalName,
        description: req.body.newdescription,
    }
	let result;
	Audio.updateOne({
		'metadata.FileName': data.originalName, author: data.author
	}, { description: data.description }, { runValidators: true }).exec()
	.then(result => {
		if(result.nModified) {
			logger.info("audio.controller - line 126: Update audio data success");
			result = {error: false, message: "success"};
		} else {
			logger.error("audio.controller - line 129: Audio data not found");
			result = {error: true, message: "data not found"};
		}
		res.send(result);
	})
	.catch(error => {
		logger.error("audio.controller - line 135: ", error)		
		result = {error: true, message: error};
		res.send(result);
	})
}

const deleteAudio = function (req, res) {
	const data = req.query.originalName;
	const author = req.query.author;
	let result;

	Audio.deleteOne({ 'metadata.FileName': data, author: author})
	.then(result => {
		if(result.deletedCount) {
			fs.unlink(settings.path.audio + data, (err) => {
				if (err) {
					logger.error(`audio.controller - line 151: ${err}`);
					result = {error: true, message: err};
				} else {
					logger.info(`audio.controller - line 154: ${settings.path.audio} ${data} was deleted`);
					logger.info("audio.controller - line 155: Audio data deleted success");
					result = {error: false, message: "success"};
				}
			});
		} else {
			logger.error("audio.controller - line 160: Audio data  not found");
			result = {error: true, message: "data not found"};
		}
		res.send(result);
	})
	.catch(error => {
		logger.error("audio.controller - line 166: ", error);
		result = {error: true, message: error};
		res.send(result);
	})
}

module.exports.addAudio = addAudio;
module.exports.findAudio = findAudio;
module.exports.updateAudio = updateAudio;
module.exports.deleteAudio = deleteAudio;
