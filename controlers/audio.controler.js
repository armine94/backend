const fs = require('fs');
const multer = require('multer');
const log4js = require('log4js');
const Exif = require("simple-exiftool");
const Audio = require('../models/audio.model');
const metadataKey = require('../configs/metadata.config');

const logger = log4js.getLogger('logger');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/audios');
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
		const path = './public/audios/';

		if (err instanceof multer.MulterError) {
			logger.error(`multer.MulterError: ${err}`);
			return response = { "error": true, "message": err };  // A Multer error occurred when uploading.
		} else if (err) {
			logger.error(`multer.MulterError: ${err}`);
			return response = { "error": true, "message": err };   // An unknown error occurred when uploading.
		}

		//rename uploading audio 
		fs.rename(path + originalName, path + newName, function (err) {
			if (err) throw err;
			logger.info('renamed complete');
		})

		//Generate metadata 
		Exif( path + newName, (error, metadata) => {
			if (error) {
				logger.error(`Exif error: ${error}`);
				return { error: true, message: error };
			}
			const audio = new Audio({
				name: originalName,
			})

			if (req.body.description) {
				audio.description = req.body.description;
			}
			const { audioMetadataKey } = metadataKey;
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
}

const findAudio = async function (pageNumber, size) {
	const query = {}
	query.skip = (pageNumber - 1) * size;
	query.limit = parseInt(size, 10);//string parse int

	try {
		const data = await Audio.find({}, {}, query, async function (err, data) {
		});
		const originalName = [];
		const description = [];
		const audioName = [];
		const metadata = [];
		const path = [];
		data && data.length && data.forEach((element) => {
			description.push(element.description);
			audioName.push(element.name);
			metadata.push(element.metadata);
			originalName.push(element.metadata.FileName);
			path.push(element.imgUrl);
		});
		logger.info(`Audios data resolved`);
		return { error: false, name: audioName, originalName: originalName, description: description, metadatas: metadata, path: path };
	}
	catch (err) {
		logger.error(`Error fetching data ${err}`);
		return { error: true, message: "Error fetching data" };
	}
}

const updateAudio = async function (data) {
	return await Audio.updateOne({
		'metadata.FileName': data.originalName
	}, { name: data.name, description: data.description }, { runValidators: true }).exec();
}

const deleteAudio = async function (data) {
	fs.unlink('./public/audios/' + data, (err) => {
		if (err) throw err;
		logger.info('./public/audios/ ' + data + ' was deleted');
	});
	return await Audio.deleteOne({ 'metadata.FileName': data })
}

module.exports.addAudio = addAudio;
module.exports.findAudio = findAudio;
module.exports.updateAudio = updateAudio;
module.exports.deleteAudio = deleteAudio;
