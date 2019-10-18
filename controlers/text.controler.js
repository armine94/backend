const express = require('express');
const router = express.Router();
const multer = require('multer');
const Exif = require("simple-exiftool");
const TextFile = require('../models/TextFile.model');
const fs = require('fs');

let path;
let name;
let originalName;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/texts');
  },
  filename: function (req, file, cb) {
    originalName = file.originalname;
    name =  Date.now() + '-' + originalName;
    cb(null, name);
    path = "./public/texts/" + name;
  }
})

const upload = multer({ storage: storage }).array('file')


function addAudio(req, res) {

  upload(req, res,  async function (err) {
    console.log("upload");
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)      // A Multer error occurred when uploading.
    } else if (err) {
        return res.status(500).json(err)      // An unknown error occurred when uploading.
    }

    Exif(path, (error, metadata) => {
      if (error) {
        console.log(error);
      }

      const key = [];
      key[0] = "SourceFile";
      key[1] = "FileName";
      key[2] = "Directory";
      key[3] = "FileSize";
      key[4] = "FilePermissions";
      key[5] = "FileTypeExtension";

      const text = new TextFile({
        name: originalName,
        src: path,
      });

      if(req.body.description){
        text.description = req.body.description;
      }

      for(let i = 0 ; i < 6; i++) {
        text.metadata[key[i]] = metadata[key[i]];
      }

      text
      .save()
      .then(text => {
      });
    });
    return res.status(200).send(req.file)    // Everything went fine.
  })
};

module.exports.addAudio = addAudio;
