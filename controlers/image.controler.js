const fs = require('fs');
const multer = require('multer');
const log4js = require('log4js');
const logger = log4js.getLogger('logger');
const Exif = require("simple-exiftool");
const Image = require('../models/image.model');
const settings = require('../configs/envSettings.json');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		if (!fs.existsSync(settings.path.image)) {
			fs.mkdirSync(settings.path.image);
		}
		cb(null, settings.multerPath.image);
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
			if (err instanceof multer.MulterError) {
				logger.error(`image.controller - line 31: multer.MulterError: ${err}`);
				response = { "error": true, "message": err };  // A Multer error occurred when uploading.
			} else if (err) {
				logger.error(`image.controller - line 34: multer.MulterError: ${err}`);
				response = { "error": true, "message": err };   // An unknown error occurred when uploading.
			}

			//rename uploading image 
			fs.rename(path + originalName, path + newName, function (err) {
				if (err) throw err;
				logger.info('image.controller - line 41: renamed complete');
			})

			//Generate metadata 
			Exif(path + newName, async (error, metadata) => {
				if (error) {
					logger.error(`image.controller - line 47: Exif error: ${error}`);
					response = { error: true, message: error };
				}
				const image = new Image({
					name: originalName,
					author: req.body.author,
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
						logger.info(`image.controller - line 66: image file data successfully save ${image}`);
						return { "error": false, "message": "success" };
					});
				res.send(response);
			});
		} catch (error) {
			logger.error("image.controller - line 72: ", error);
			res.send(error)
		}
	})
}

const findImage = async function (req, res) {
	const { pageNumber, size } = req.query;
	if (pageNumber < 1 && size < 1) {
		logger.error('image.controller - line 81: invalid page number or count of files, those should start with 1');
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
		const count = await Image.countDocuments({});
		const originalName = [];
		const description = [];
		const metadata = [];
		const imageUrl = [];
		const author = [];
		const name = [];
		data && data.length && data.forEach((element) => {
			name.push(element.name);
			author.push(element.author);
			metadata.push(element.metadata);
			imageUrl.push(element.imageUrl);
			description.push(element.description);
			originalName.push(element.metadata.FileName);
		});
		logger.info(`image.controller - line 107: Images data resolved`, originalName);
		result = { error: false, name: name, author: author, originalName: originalName, description: description, metadatas: metadata, imageUrl: imageUrl, count: count };
		res.send(result);
	}
	catch (err) {
		logger.error(`image.controller - line 112: Error fetching data ${err}`);
		result = { error: true, message: "Error fetching data" };
		res.send(result);
	}
}

const updateImage = function (req, res) {
	const data = {
		description: req.body.newdescription,
		originalName: req.body.originalName,
		author: req.body.author
	}
	let result;
	Image.updateOne({
		'metadata.FileName': data.originalName, author: data.author
	}, { description: data.description }, { runValidators: true }).exec()
		.then(result => {
			if (result.nModified) {
				logger.info("image.controller - line 130: Update image data success")
				result = { error: false, message: "success" };
			} else {
				logger.error("image.controller - line 133: Image data not found");
				result = { error: true, message: "data not found" };
			}
			res.send(result);
		})
		.catch(error => {
			logger.error("image.controller - line 139: ", error);
			result = { error: true, message: error };
			res.send(result);
		})
}

const deleteImage = function (req, res) {
	let result;
	const data = req.query.originalName;
	const author = req.query.author;
	Image.deleteOne({ 'metadata.FileName': data, author: author })
		.then(result => {
			if (result.deletedCount) {
				fs.unlink(settings.path.image + data, (err) => {
					if (err) {
						logger.error(`image.controller - line 154: ${err}`);
						result = { error: true, message: err }
					} else {
						logger.info(`image.controller - line 156:  ${settings.path.image}  ${data} was deleted`);
						logger.info("image.controller - line 159: Image data deleted")
						result = { error: false, message: "success" };
					}
				});
			} else {
				logger("image.controller - line 163: Image data nor found");
				result = { error: true, message: "data not found" };
			}
			res.send(result);
		})
		.catch(error => {
			logger.error("image.controller - line 169: ", error);
			result = { error: true, message: error };
			res.send(result);
		})
}

module.exports.addImage = addImage;
module.exports.findImage = findImage;
module.exports.updateImage = updateImage;
module.exports.deleteImage = deleteImage;