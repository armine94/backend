const express = require('express');
const router = express.Router();
const multer = require('multer');
const Exif = require("simple-exiftool");
const Image = require('../models/Image.model');
const fs = require('fs');

let name;
let path;


const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    cb(null, 'public/images');                  
  },
  filename: function (req, file, cb) { 
    name =  Date.now() + '-' +file.originalname;
    cb(null, name);
    path = "./public/images/" + name;  
  }
})

const upload = multer({ storage: storage }).array('file')

router.get('/image', function(req, res) {
  const {pageNumber,size} = req.query;

  if(pageNumber < 0 || pageNumber === 0) {
    response = {"error" : true,"message" : "invalid page number, should start with 1"};
    return res.json(response)
  }

  const query = {}
  query.skip = (pageNumber - 1) * size;
  query.limit = parseInt(size, 10);//string parse int

  Image.find({},{},query,async function(err,data) {
  }).then(async (data )=> {
    const filesName = [];
    const filesData = [];
    try {
      let response ;
      const filesData_1 = await new Promise((resolve, reject) => {
        for (let i = 0; i < data.length; ++i) {
          filesName[i] = data[i].metadata.SourceFile;
          fs.readFile(filesName[i], function (err, data1) {
            if (err)
              reject(err);
            filesData[i] = data1;
            if (i == 4) {
              resolve(filesData);
            }
          });
        }
      });
      response = { "error": false, "message": data, "files": filesData_1 };
      res.json(response);
    }
    catch (e) {
      response = { "error": true, "message": "Error fetching data" };
    }
  })
})

router.delete('/image',function(req, res){

  console.log("router.delete");
  
  //delete file
  // fs.unlink('./2.jpg', (err) => {
  //   if (err) throw err;
  //   console.log('successfully deleted /tmp/hello');
  // });
})

router.post('/image', function(req, res) {      
  upload(req, res,  async function (err) {  
    console.log(req.body.description);
    
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)      // A Multer error occurred when uploading.
    } else if (err) {
        return res.status(500).json(err)      // An unknown error occurred when uploading.
    } 
    Exif(path, (error, metadata) => {
      if (error) {
        console.log(error);
      }
      var key = [];
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
        name: name,
        src: path,
      });

      if(req.body.description){
        image.description = req.body.description;
      }

      for(var i = 0 ; i < 11; i++) {
        image.metadata[key[i]] = metadata[key[i]];
      }

      image
      .save()
      .then(image => {
         // console.log(image);
      });
    });
  
    return res.status(200).send(req.file)    // Everything went fine.
  })
});

module.exports = router;