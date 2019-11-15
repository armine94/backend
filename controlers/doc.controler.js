const fs = require('fs');
const multer = require('multer');
const log4js = require('log4js');
const Exif = require("simple-exiftool");
const DocFile = require('../models/docFile.model');
const settings = require('../configs/envSettings.json');

const logger = log4js.getLogger('logger');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, settings.multerPath.doc);
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
})

const upload = multer({ storage: storage }).array('file')

const addDocFile = function (req, res) {
	upload(req, res, function (err) {
		const originalName = req.files[0].originalname;
		const newName = Date.now() + '-' + originalName;
		const path = settings.path.doc;
		let response;
		if (err instanceof multer.MulterError) {
			logger.error(`multer.MulterError: ${err}`);
			response = { "error": true, "message": err };  // A Multer error occurred when uploading.
		} else if (err) {
			logger.error(`multer.MulterError: ${err}`);
			response = { "error": true, "message": err };   // An unknown error occurred when uploading.
		}

		//rename uploading docFile 
		fs.rename(path + originalName, path + newName, function (err) {
			if (err) throw err;
			logger.info('renamed complete');
		})

		//Generate metadata 
		Exif( path + newName,async (error, metadata) => {
			if (error) {
				logger.error(`Exif error: ${error}`);
				return { error: true, message: error };
			}
			const docFile = new DocFile({
				name: originalName,
				docUrl: settings.staticPath.doc + newName, 
			})

			if (req.body.description) {
				docFile.description = req.body.description;
			}

			for (let i = 0; i < settings.docMetadataKey.length; i++) {
				docFile.metadata[settings.docMetadataKey[i]] = metadata[settings.docMetadataKey[i]];
			}
			response = await docFile
			.save()
			.then(doc => {
				logger.info(`docFile file data successfully save ${docFile}`);
				return { "error": false, "message": "success" };
			});
			res.send(response);
		});

	})
}

const findDocFile = async function (pageNumber, size) {
	const query = {}
	query.skip = (pageNumber - 1) * size;
	query.limit = parseInt(size, 10);//string parse int

	try {
		const data = await DocFile.find({}, {}, query);
		const originalName = [];
		const description = [];
		const docName = [];
		const docUrl = [];
		const imageUrl = [];
		const metadata = [];
		data && data.length && data.forEach((element) => {
			docName.push(element.name);
			metadata.push(element.metadata);
			docUrl.push(element.docUrl);
			imageUrl.push(element.imageUrl);
			description.push(element.description);
			originalName.push(element.metadata.FileName);

		});
		logger.info(`DocFiles data resolved`);
		return { error: false, name: docName, originalName: originalName, description: description, metadatas: metadata, imageUrl: imageUrl, docUrl: docUrl };
	}
	catch (err) {
		logger.error(`Error fetching data ${err}`);
		return { error: true, message: "Error fetching data" };
	}
}

const updateDocFile = async function (data) {
	return await DocFile.updateOne({
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

const deleteDocFile = async function (data) {
	fs.unlink(settings.path.doc + data, (err) => {
		if (err) throw err;
		logger.info(settings.path.doc  + data + ' was deleted');
	});
	return await DocFile.deleteOne({ 'metadata.FileName': data })
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

module.exports.addDocFile = addDocFile;
module.exports.findDocFile = findDocFile;
module.exports.updateDocFile = updateDocFile;
module.exports.deleteDocFile = deleteDocFile;