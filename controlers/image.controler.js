const Image = require('../models/Image.model');
const Exif = require("simple-exiftool");
const multer = require('multer');
const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = "debug";

let name;
let path;
let originalName;

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/images');
	},
	filename: function (req, file, cb) {
		originalName = file.originalname;
		name = Date.now() + '-' + originalName;
		cb(null, name);
		path = "./public/images/" + name;
	}
})

const upload = multer({ storage: storage }).array('file')

function addImage(req, res) {
	upload(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			logger.error(`multer.MulterError: ${err}`);
			return response = { "error": true, "message": err };  // A Multer error occurred when uploading.
		} else if (err) {
			logger.error(`multer.MulterError: ${err}`);
			return response = { "error": true, "message": err };   // An unknown error occurred when uploading.
		}
		Exif(path, (error, metadata) => {
			if (error) {
				logger.error(`Exif error: ${error}`);
			}

			const key = [];
			key[1] = "SourceFile";
			key[2] = "FileName";
			key[3] = "Directory";
			key[4] = "FileSize";
			key[5] = "FilePermissions";
			key[6] = "FileTypeExtension";
			key[7] = "ImageWidth";
			key[8] = "ImageHeight";
			key[9] = "ImageSize";
			key[10] = "Megapixels";

			const image = new Image({
				name: originalName,
				src: path,
			})

			if (req.body.description) {
				image.description = req.body.description;
			}

			for (let i = 1; i < 11; i++) {
				image.metadata[key[i]] = metadata[key[i]];
			}
			image
				.save()
				.then(image => {
					return response = { "error": false, "message": "success" };
				});
		});

		logger.info("File uploaded");
		return res.status(200).send(req.file)    // Everything went fine.
	})
}

function findImage(pageNumber, size) {
	const query = {}
	query.skip = (pageNumber - 1) * size;
	query.limit = parseInt(size, 10);//string parse int

	return Image.find({}, {}, query, async function (err, data) {
	})
		.then(async (data) => {
			const description = [];
			const imageName = [];
			const metadata = [];
			const path = [];
			data && data.length && data.forEach((element, index) => {
				description.push(element.description);
				imageName.push(element.name);
				metadata.push(element.metadata);
				const pathFile = "http://localhost:54545/static/images/" + element.metadata.FileName;
				path.push(pathFile);
			});
			logger.info(`Images data resolved`)
			return { error: false, name: imageName, description: description, metadatas: metadata, path: path };
		})
		.catch(err => {
			logger.error(`Error fetching data ${err}`)
			return { error: true, message: "Error fetching data" };
		})
}

module.exports.addImage = addImage;
module.exports.findImage = findImage;
