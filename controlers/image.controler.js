const Image = require('../models/Image.model');
const Exif = require("simple-exiftool");
const multer = require('multer');
const fs = require('fs');

let name;
let path;
let originaNname;

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/images');
	},
	filename: function (req, file, cb) {
		originalName = file.originalname;
		name =  Date.now() + '-' + originalName;
		cb(null, name);
		path = "./public/images/" + name;
	}
})

const upload = multer({ storage: storage }).array('file')

function addImage(req, res) {
    upload(req, res,  async function (err) {
		console.log(req.body.description);

		if (err instanceof multer.MulterError) {
            return response = { "error": true, "message": err };  // A Multer error occurred when uploading.
		} else if (err) {
			return response = { "error": true, "message": err };   // An unknown error occurred when uploading.
		}
		Exif(path, (error, metadata) => {
			if (error) {
				console.log(error);
			}
			const key = [];
			key[0] = "Author";
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
			});

			if(req.body.description){
				image.description = req.body.description;
			}

			for(let i = 0 ; i < 11; i++) {
				image.metadata[key[i]] = metadata[key[i]];
			}

			image
			.save()
			.then(image => {
                return response = { "error": false, "message": "success" };
			});
		});
		return res.status(200).send(req.file)    // Everything went fine.
	})
}

function findImage(pageNumber, size) {
    const query = {}
    query.skip = (pageNumber - 1) * size;
    query.limit = parseInt(size, 10);//string parse int

    return Image.find({},{},query,async function(err,data) {
    })
    .then(async (data )=> {
        const filesName = [];
        const filesData = [];
        try {
            let response ;
            const filesData_1 = await new Promise((resolve, reject) => {
                for (let i = 0; i < data.length; ++i) {
                    filesName[i] = data[i].metadata.SourceFile;
                    fs.readFile(filesName[i], function (err, fileData) {
                        if (err)
                        return reject(err);
                        filesData[i] = fileData;
                        if (i == 4) {
                        return resolve(filesData);
                        }
                    });
                }
			});

            return response = { "error": false, "message": data, "files": filesData_1 };
        }
        catch (e) {
            return response = { "error": true, "message": "Error fetching data" };
        }
    })
}


module.exports.addImage = addImage;
module.exports.findImage = findImage;
