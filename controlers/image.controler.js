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
		try {
			const originalName = req.files[0].originalname;
			const newName = Date.now() + '-' + originalName;
			const path = settings.path.image;
			let response;
			if( !(err instanceof multer.MulterError) ){
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
		} catch (error) {
			logger.error(error);
			res.send(error)
		}
	})
}

const findImage = async function (req, res) {
    const { pageNumber, size } = req.query;
    if (pageNumber < 1 && size < 1) {
        logger.error('invalid page number or count of files, those should start with 1');
        result = { "error": true, "message": "invalid page number or count of files, those should start with 1" };
		res.status(400).send(result);
		return;
	} 
	let result;
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
		result = { error: false, name: name, originalName: originalName, description: description, metadatas: metadata, imageUrl: imageUrl };
		res.send(result);
	}
	catch (err) {
		logger.error(`Error fetching data ${err}`);
		result = { error: true, message: "Error fetching data" };
		res.send(result);
	}
}

const updateImage = function (req, res) {
	const data = {
        originalName: req.body.originalName,
        name: req.body.newName,
        description: req.body.newdescription,
	}
	let result;
	Image.updateOne({
		'metadata.FileName': data.originalName
	}, { name: data.name, description: data.description }, { runValidators: true }).exec()
	.then(result => {
		if(result.ok) {
			logger.info("Update image data success")
			result = {error: false, message: "success"};
		} else {
			logger.error("Image data not found");
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

const deleteImage = function (req, res) {
	let result;
	const data = req.query.originalName;
	fs.unlink(settings.path.image + data, (err) => {
		if (err) throw err;
		logger.info(settings.path.image + data + ' was deleted');
	});
	Image.deleteOne({ 'metadata.FileName': data })
	.then(result => {
		if(result.ok) {
			logger.info("Image data deleted")
			result = {error: false, message: "success"};
		} else {
			logger("Image data nor found");
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

module.exports.addImage = addImage;
module.exports.findImage = findImage;
module.exports.updateImage = updateImage;
module.exports.deleteImage = deleteImage;