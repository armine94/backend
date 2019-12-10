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
			logger.error(`doc.controller - line 27: multer.MulterError: ${err}`);
			response = { "error": true, "message": err };  // A Multer error occurred when uploading.
		} else if (err) {
			logger.error(`doc.controller - line 30: multer.MulterError: ${err}`);
			response = { "error": true, "message": err };   // An unknown error occurred when uploading.
		}

		//rename uploading docFile 
		fs.rename(path + originalName, path + newName, function (err) {
			if (err) throw err;
			logger.info('doc.controller - line 37: renamed complete');
		})

		//Generate metadata 
		Exif( path + newName,async (error, metadata) => {
			if (error) {
				logger.error(`doc.controller - line 43: Exif error: ${error}`);
				return { error: true, message: error };
			}
			const docFile = new DocFile({
				name: originalName,
				author: req.body.author,
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
				logger.info(`doc.controller - line 62: docFile file data successfully save ${docFile}`);
				return { "error": false, "message": "success" };
			});
			res.send(response);
		});

	})
}

const findDocFile = async function (req, res) {
	const { pageNumber, size } = req.query;
	let result;
    if (pageNumber < 1 && size < 1) {
        logger.error('doc.controller - line 75: invalid page number or count of files, those should start with 1');
		result = { "error": true, "message": "invalid page number or count of files, those should start with 1" };
		res.status(400).send(result);
		return;
	}
	const query = {}
	query.skip = (pageNumber - 1) * size;
	query.limit = parseInt(size, 10);//string parse int

	try {
		const data = await DocFile.find({}, {}, query);
		const count = await DocFile.countDocuments({});
		const docUrl = [];
		const author = [];
		const docName = [];
		const imageUrl = [];
		const metadata = [];
		const description = [];
		const originalName = [];

		data && data.length && data.forEach((element) => {
			docName.push(element.name);
			docUrl.push(element.docUrl);
			author.push(element.author);
			metadata.push(element.metadata);			
			imageUrl.push(element.imageUrl);
			description.push(element.description);
			originalName.push(element.metadata.FileName);

		});
		logger.info(`doc.controller - line 105: DocFiles data resolved`, docName);
		result = { error: false, name: docName, author: author, originalName: originalName, description: description, metadatas: metadata, imageUrl: imageUrl, docUrl: docUrl, count: count };
		res.status(200).send(result);
	}
	catch (err) {
		logger.error(`doc.controller - line 110: Error fetching data ${err}`);
		result = { error: true, message: "Error fetching data" };
		res.status(400).send(result);
	}
}

const updateDocFile = async function (req, res) {
	const data = {
        author: req.body.author,
        originalName: req.body.originalName,
        description: req.body.newdescription,
    }
	let result;
	DocFile.updateOne({
		'metadata.FileName': data.originalName, author: data.author
	}, { description: data.description }, { runValidators: true }).exec()
	.then(data => {
		if(result.nModified) {
			logger.info("doc.controller - line 128: Update docFile data success");
			result = {error: false, message: "success"};
		} else {
			logger.error("doc.controller - line 131: DocFile data not found");
			result = {error: true, message: "data not found"};
		}
		res.send(result);
	})
	.catch(error => {		
		logger.error("doc.controller - line 137: ",error)		
		result = {error: true, message: error};
		res.send(result);
	})
}

const deleteDocFile = function (req, res) {
	const data = req.query.originalName;
	const author = req.query.author;
	let result;

	DocFile.deleteOne({ 'metadata.FileName': data,  author: author })
	.then(result => {
		if(result.deletedCount) {
			fs.unlink(settings.path.doc + data, (err) => {
				if (err) {
					logger.error(`doc.controller - line 153: ${err}`);
					result = {error: true, message: err};
				} else {
				logger.info(`doc.controller - line 156: ${settings.path.doc}${data} was deleted`);
					logger.info("doc.controller - line 157: DocFile data deleted success");
					result = {error: false, message: "success"};
				}
			});
		} else {
			logger.error("doc.controller - line 162: Doc file data  not found");
			result = {error: true, message: "data not found"};
		}
		res.send(result);
	})
	.catch(error => {
		logger.error("doc.controller - line 168: ", error);
		result = {error: true, message: error};
		res.send(result);
	})
}

module.exports.addDocFile = addDocFile;
module.exports.findDocFile = findDocFile;
module.exports.updateDocFile = updateDocFile;
module.exports.deleteDocFile = deleteDocFile;