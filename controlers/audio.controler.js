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
			logger.error(`multer.MulterError: ${err}`);
			response = { "error": true, "message": err };  // A Multer error occurred when uploading.
		} else if (err) {
			logger.error(`multer.MulterError: ${err}`);
			response = { "error": true, "message": err };   // An unknown error occurred when uploading.
		}

		//rename uploading audio 
		fs.rename(path + originalName, path + newName, function (err) {
			if (err) throw err;
			logger.info('renamed complete');
		})

		//Generate metadata 
		Exif( path + newName,async (error, metadata) => {
			if (error) {
				logger.error(`Exif error: ${error}`);
				response = { error: true, message: error };
			}
			const audio = new Audio({
				name: originalName,
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
				logger.info(`audio file data successfully save ${audio}`);
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
        logger.error('invalid page number or count of files, those should start with 1');
		result = { "error": true, "message": "invalid page number or count of files, those should start with 1" };
		res.status(400).send(result);
		return;
	}
	const query = {}
	query.skip = (pageNumber - 1) * size;
	query.limit = parseInt(size, 10);//string parse int
	try {
		const data = await Audio.find({}, {}, query);
		const originalName = [];
		const description = [];
		const audioName = [];
		const audioUrl = [];
		const imageUrl = [];
		const metadata = [];
		data && data.length && data.forEach((element) => {
			audioName.push(element.name);
			metadata.push(element.metadata);
			audioUrl.push(element.audioUrl);
			imageUrl.push(element.imageUrl);
			description.push(element.description);
			originalName.push(element.metadata.FileName);

		});
		logger.info(`Audios data resolved`);
		result = { error: false, name: audioName, originalName: originalName, description: description, metadatas: metadata, imageUrl: imageUrl, audioUrl: audioUrl };
		res.status(200).send(result);
	}
	catch (err) {
		logger.error(`Error fetching data ${err}`);
		result = { error: true, message: "Error fetching data" };
		res.status(400).send(result);
	}
}

const updateAudio = async function (req, res ) {
	const data = {
        originalName: req.body.originalName,
        name: req.body.newName,
        description: req.body.newdescription,
    }
	let result;
	Audio.updateOne({
		'metadata.FileName': data.originalName
	}, { name: data.name, description: data.description }, { runValidators: true }).exec()
	.then(result => {
		if(result.ok) {
			logger.info("Update audio data success");
			result = {error: false, message: "success"};
		} else {
			logger.error("Audio data not found");
			result = {error: true, message: "data not found"};
		}
		res.send(result);
	})
	.catch(error => {
		logger.error(error)		
		result = {error: true, message: error};
		res.send(result);
	})
}

const deleteAudio = async function (req, res) {
	const data = req.query.originalName;
	let result;
	fs.unlink(settings.path.audio + data, (err) => {
		if (err) throw err;
		logger.info(settings.path.audio  + data + ' was deleted');
	});
	return await Audio.deleteOne({ 'metadata.FileName': data })
	.then(result => {
		if(result.ok) {
			logger.info("Audio data deleted success");
			result = {error: false, message: "success"};
		} else {
			logger.error("Audio data  not found");
			result = {error: true, message: "data not found"};
		}
		res.send(result);
	})
	.catch(error => {
		logger.error(error);
		result = {error: true, message: error};
		res.send(result);
	})
}

module.exports.addAudio = addAudio;
module.exports.findAudio = findAudio;
module.exports.updateAudio = updateAudio;
module.exports.deleteAudio = deleteAudio;