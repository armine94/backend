const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const Exif = require("simple-exiftool");
const app = express();
const multer = require('multer');
const cors = require('cors');
const exif = require('exif-parser');
const fs = require('fs');
const users = require('./routes/user');

mongoose.connect('mongodb://' + "localhost" + ':' + 27017 + '/' + "asset", {
  useNewUrlParser: true
});
 
app.use(passport.initialize());
require('./passport')(passport);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/users', users);
var name;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public')
    },
    filename: function (req, file, cb) {
      name =  Date.now() + '-' +file.originalname;
      cb(null, name);
      name = "./public/" + name;
      metadata(name);
    }
})
  
const upload = multer({ storage: storage }).array('file')
app.post('/upload',function(req, res) {    
    upload(req, res, function (err) {     
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
          // A Multer error occurred when uploading.
        } else if (err) {
            return res.status(500).json(err)
          // An unknown error occurred when uploading.
        } 
        //console.log(req);
        return res.status(200).send(req.file)
        // Everything went fine.
      })
});

function metadata(path) {
  Exif(path, (error, metadata) => {
    
    if (error) {
      console.log(error);
    }
   // console.log(metadata);
  });
}

console.log("Server Run")
app.listen(5000);
