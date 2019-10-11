const express = require('express');
const router = express.Router();
var multer = require('multer');
const Exif = require("simple-exiftool");
const Audio = require('../models/Audio.model');

var path;
var name;

const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    cb(null, 'public/audios');                  
  },
  filename: function (req, file, cb) { 
    name =  Date.now() + '-' +file.originalname;
    cb(null, name);
    path = "./public/audios/" + name;  
  }
})

const upload = multer({ storage: storage }).array('file')

router.post('/ausio', function(req, res) {        
  upload(req, res,  async function (err) {  
    
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)      // A Multer error occurred when uploading.
    } else if (err) {
        return res.status(500).json(err)      // An unknown error occurred when uploading.
    } 
    
    Exif(path, (error, metadata) => {
      if (error) {
        console.log(error);
      }

      console.log(metadata);
      
      var key = [];
      key[0] = "SourceFile";
      key[1] = "FileName";
      key[2] = "Directory";
      key[3] = "FileSize";
      key[4] = "FilePermissions";
      key[5] = "FileTypeExtension";

      const audio = new Audio({
        name: name,
        src: path,
      });

      if(req.body.description){
        audio.description = req.body.description;
      }

      for(var i = 0 ; i < 6; i++) {
        audio.metadata[key[i]] = metadata[key[i]];
      }

      audio
      .save()
      .then(text => {
         // console.log(image);
      });
    });  
    return res.status(200).send(req.file)    // Everything went fine.
  })
});

module.exports = router;