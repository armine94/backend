const fs = require('fs');
const multer = require('multer');
const log4js = require('log4js');
const Exif = require("simple-exiftool");
const TextFile = require('../models/text.model');
const metadataKey = require('../configs/metadata.config');

const logger = log4js.getLogger('logger');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/texts');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
})

const upload = multer({ storage: storage }).array('file')

const addTextFile = function (req, res) {
	upload(req, res, function (err) {
		const originalName = req.files[0].originalname;
		const newName = Date.now() + '-' + originalName;
		const path = './public/texts/';

		if (err instanceof multer.MulterError) {
			logger.error(`multer.MulterError: ${err}`);
			return response = { "error": true, "message": err };  // A Multer error occurred when uploading.
		} else if (err) {
			logger.error(`multer.MulterError: ${err}`);
			return response = { "error": true, "message": err };   // An unknown error occurred when uploading.
		}

		//rename uploading text 
		fs.rename(path + originalName, path + newName, function (err) {
			if (err) throw err;
			logger.info('renamed complete');
		})

		//Generate metadata 
		let ii = path + newName;
		Exif(ii, (error, metadata) => {
			if (error) {
				logger.error(`Exif error: ${error}`);
				return { error: true, message: error };
			}
			const text = new TextFile({
				name: originalName,
			})

			if (req.body.description) {
				text.description = req.body.description;
			}
			const { textMetadataKey } = metadataKey;
			for (let i = 0; i < textMetadataKey.length; i++) {
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
}

const findTextFile = async function (pageNumber, size) {
	const query = {}
	query.skip = (pageNumber - 1) * size;
	query.limit = parseInt(size, 10);//string parse int

	try {
		const data = await TextFile.find({}, {}, query, async function (err, data) {
		});
		const description = [];
		const textName = [];
		const metadata = [];
		const path = [];
		data && data.length && data.forEach((element) => {
			description.push(element.description);
			textName.push(element.name);
			metadata.push(element.metadata);
			const pathFile = "http://localhost:54545/static/texts/" + element.metadata.FileName;
			path.push(pathFile);
		});
		logger.info(`Texts data resolved`);
		return { error: false, name: textName, description: description, metadatas: metadata, path: path };
	}
	catch (err) {
		logger.error(`Error fetching data ${err}`);
		return { error: true, message: "Error fetching data" };
	}
}

module.exports.addTextFile = addTextFile;
module.exports.findTextFile = findTextFile;
