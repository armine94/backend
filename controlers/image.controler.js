const fs = require('fs');
const multer = require('multer');
const log4js = require('log4js');
const Exif = require("simple-exiftool");
const Image = require('../models/image.model');
const metadataKey = require('../configs/metadata.config');

const logger = log4js.getLogger('logger');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/images');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
})

const upload = multer({ storage: storage }).array('file')

const addImage = function (req, res) {
	upload(req, res, function (err) {
		const originalName = req.files[0].originalname;
		const newName = Date.now() + '-' + originalName;
		const path = './public/images/';

		if (err instanceof multer.MulterError) {
			logger.error(`multer.MulterError: ${err}`);
			return response = { "error": true, "message": err };  // A Multer error occurred when uploading.
		} else if (err) {
			logger.error(`multer.MulterError: ${err}`);
			return response = { "error": true, "message": err };   // An unknown error occurred when uploading.
		}

		//rename uploading image 
		fs.rename(path + originalName, path + newName, function (err) {
			if (err) throw err;
			logger.info('renamed complete');
		})

		//Generate metadata 
		let ii = path + newName;
		Exif(ii, (error, metadata) => {
			if (error) {
				logger.error(`Exif error: ${error}`);
		        return {error: true, message: error};
			}
			const image = new Image({
				name: originalName,
			})

			if (req.body.description) {
				image.description = req.body.description;
			}
			const {imageMetadataKey} = metadataKey;
			for (let i = 0; i < imageMetadataKey.length; i++) {
				image.metadata[imageMetadataKey[i]] = metadata[imageMetadataKey[i]];
			}
			image
				.save()
				.then(image => {
					logger.info(`image file data successfully save ${image}`);
					return response = { "error": false, "message": "success" };
				});
		});

	})
}

const findImage = async function (pageNumber, size) {
	const query = {}
	query.skip = (pageNumber - 1) * size;
	query.limit = parseInt(size, 10);//string parse int

	try {
		const data = await Image.find({}, {}, query, async function (err, data) {
		});
		const description = [];
		const imageName = [];
		const metadata = [];
		const path = [];
		data && data.length && data.forEach((element) => {
			description.push(element.description);
			imageName.push(element.name);
			metadata.push(element.metadata);
			const pathFile = "http://localhost:54545/static/images/" + element.metadata.FileName;
			path.push(pathFile);
		});
		logger.info(`Images data resolved`);
		return { error: false, name: imageName, description: description, metadatas: metadata, path: path };
	}
	catch (err) {
		logger.error(`Error fetching data ${err}`);
		return { error: true, message: "Error fetching data" };
	}
}

module.exports.addImage = addImage;
module.exports.findImage = findImage;
