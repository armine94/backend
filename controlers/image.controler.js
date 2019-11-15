const fs = require('fs');
const multer = require('multer');
const log4js = require('log4js');
const logger = log4js.getLogger('logger');
const Exif = require("simple-exiftool");
const Image = require('../models/image.model');
const settings = require('../configs/envSettings.json');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null,  settings.multerPath.image);
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
		const path = settings.path.image;
		let response;
		if (err instanceof multer.MulterError) {
			logger.error(`multer.MulterError: ${err}`);
			response = { "error": true, "message": err };  // A Multer error occurred when uploading.
		} else if (err) {
			logger.error(`multer.MulterError: ${err}`);
			response = { "error": true, "message": err };   // An unknown error occurred when uploading.
		}

		//rename uploading image 
		fs.rename(path + originalName, path + newName, function (err) {
			if (err) throw err;
			logger.info('renamed complete');
		})

		//Generate metadata 
		Exif(path + newName, async (error, metadata) => {
			if (error) {
				logger.error(`Exif error: ${error}`);
				return { error: true, message: error };
			}
			const image = new Image({
				name: originalName,
				imageUrl: settings.staticPath.image + newName,
			})

			if (req.body.description) {
				image.description = req.body.description;
			}
			
			for (let i = 0; i < settings.imageMetadataKey.length; i++) {
				image.metadata[settings.imageMetadataKey[i]] = metadata[settings.imageMetadataKey[i]];
			}
			response = await image
			.save()
			.then(image => {
				logger.info(`image file data successfully save ${image}`);
				return { "error": false, "message": "success" };
			});
			res.send(response);
		});
	})
}

const findImage = async function (pageNumber, size) {
	const query = {}
	query.skip = (pageNumber - 1) * size;
	query.limit = parseInt(size, 10);//string parse int

	try {
		const data = await Image.find({}, {}, query);
		const originalName = [];
		const description = [];
		const name = [];
		const metadata = [];
		const imageUrl = [];
		data && data.length && data.forEach((element) => {
			name.push(element.name);
			metadata.push(element.metadata);
			imageUrl.push(element.imageUrl);
			description.push(element.description);
			originalName.push(element.metadata.FileName);
		});
		logger.info(`Images data resolved`, originalName);
		return { error: false, name: name, originalName: originalName, description: description, metadatas: metadata, imageUrl: imageUrl };
	}
	catch (err) {
		logger.error(`Error fetching data ${err}`);
		return { error: true, message: "Error fetching data" };
	}
}

const updateImage = async function (data) {
	return await Image.updateOne({
		'metadata.FileName': data.originalName
	}, { name: data.name, description: data.description }, { runValidators: true }).exec()
	.then(result => {
		if(result.ok) {
			return {error: false, message: "success"};
		} else {
			return {error: true, message: "data not found"};
		}
	})
	.catch(error => {
		return {error: true, message: error};
	})
}

const deleteImage = async function (data) {
	fs.unlink(settings.path.image + data, (err) => {
		if (err) throw err;
		logger.info(settings.path.image + data + ' was deleted');
	});
	return await Image.deleteOne({ 'metadata.FileName': data })
	.then(result => {
		if(result.ok) {
			return {error: false, message: "success"};
		} else {
			return {error: true, message: "data not found"};
		}
	})
	.catch(error => {
		return {error: true, message: error};
	})
}

module.exports.addImage = addImage;
module.exports.findImage = findImage;
module.exports.updateImage = updateImage;
module.exports.deleteImage = deleteImage;