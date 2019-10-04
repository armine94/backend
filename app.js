const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const Exif = require("simple-exiftool");
const app = express();
const multer = require('multer');
const users = require('./routes/user');

const Image = require('./models/Image.model');
var desc;
mongoose.connect('mongodb://' + "localhost" + ':' + 27017 + '/' + "asset", {
  useNewUrlParser: true
});
 
app.use(passport.initialize());
require('./passport')(passport);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/users', users);
var fname;

const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    switch (file.mimetype) {
      case "image/jpeg":
        cb(null, 'public/images');        
        break;
      case "audio/x-m4a":
        cb(null, 'public/audios');        
        break;
      case "application/pdf":
        cb(null, 'public/pdfs');        
        break;
      case "application/vnd.oasis.opendocument.text":
        cb(null, 'public/texts');        
        break;
      case "application/octet-stream":
        cb(null, 'public/texts');        
        break;
      case "text/css":
        cb(null, 'public/texts');        
        break;
      default:
        break;
    }              
  },
  filename: function (req, file, cb) {    
    fname =  Date.now() + '-' +file.originalname;
    cb(null, fname);
    switch (file.mimetype) {
      case "image/jpeg":
        name = "./public/images/" + fname;        
        break;
      case "audio/x-m4a":
        name = "./public/audios/" + fname;   
        break;
      case "application/pdf":
          name = "./public/pdfs/" + fname;        
          break;
      case "application/vnd.oasis.opendocument.text":
          name = "./public/pdfs/" + fname;        
          break;
      case "text/css":
          name = "./public/pdfs/" + fname;        
          break;
      case "application/octet-stream":
        name = "./public/pdfs/" + fname;        
        break;
      default:
        break;
    }
  }
})

const upload = multer({ storage: storage }).array('file')

app.post('/upload', function(req, res) {    
  upload(req, res,  async function (err) {  
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)
      // A Multer error occurred when uploading.
    } else if (err) {
        return res.status(500).json(err)
      // An unknown error occurred when uploading.
    } 
    Exif(name, (error, metadata) => {
      if (error) {
        console.log(error);
      }
      var key = [];
      key[0] = "SourceFile";
      key[1] = "FileName";
      key[2] = "Directory";
      key[3] = "FileSize";
      key[4] = "FilePermissions";
      key[5] = "FileTypeExtension";
      key[6] = "ImageWidth";
      key[7] = "ImageHeight";
      key[8] = "ImageSize";
      key[9] = "Megapixels";

      const image = new Image({
        name: fname,
        src: name,
      });

      for(var i = 0 ; i < 10; i++) {
        image.metadata[key[i]] = metadata[key[i]];
        console.log(metadata[key[i]]);
        
      }

      image
      .save()
      .then(image => {
         // console.log(image);
      });
    });
  
    return res.status(200).send(req.file)
    // Everything went fine.
  })
});

console.log("Server Run")
app.listen(5000);
