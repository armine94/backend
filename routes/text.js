const express = require('express');
const router = express.Router();
var multer = require('multer');
const Exif = require("simple-exiftool");
const TextFile = require('../models/TextFile.model');
const fs = require('fs');

PDFParser = require("pdf2json");

var path;
var name;


// fs.readFile("./public/texts/1.pdf", (err, pdfBuffer) => {
//   // pdfBuffer contains the file content
//    PdfReader().parseBuffer(pdfBuffer, function(err, item) {
//     if (err) callback(err);
//     else if (!item) callback();
//     else if (item.text) console.log(item.text);
//   });
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    cb(null, 'public/texts');                  
  },
  filename: function (req, file, cb) { 
    name =  Date.now() + '-' +file.originalname;
    cb(null, name);
    path = "./public/texts/" + name;  
  }
})

const upload = multer({ storage: storage }).array('file')


router.get('/text', function(req, res) {

  const {pageNumber,size} = req.query;
  if(pageNumber < 0 || pageNumber === 0) {
    response = {"error" : true,"message" : "invalid page number, should start with 1"};
    return res.json(response)
  }
  var query = {}
  query.skip = (pageNumber - 1) * size;
  query.limit = parseInt(size, 10);;

  TextFile.find({},{},query,async function(err,data) {

  }).then(async (data )=> {
    console.log("aaaaaaaaaaaaaaaaaaaa");
    const filesName = [];
    const filesData = [];
    let i = 0;
    let response = "aaa";
 let p = 0;

     try {
      const filesData_1 = await new Promise((resolve, reject) => {
        for (i = 0; i < 1; ++i) {
          filesName[i] = data[i].metadata.SourceFile;
          console.log(filesName[i]);
          pdfParser.loadPDF(filesName[0]);
          var file = fs.createReadStream('./public/texts/1.pdf');
          var stat = fs.statSync('./public/texts/1.pdf');
          console.log(stat);
          resolve(file);
          // fs.readFile("../public/texts/1.pdf",  function (err, data1) {
          //   console.log(err);
          //        filesData[p] = data1;
          //        p++;
          //         if(p == 5){
          //           resolve(filesData);
          //         }ole.log(response);    
          //     })
        }
      });
      console.log(filesData_1.length);
      response = { "error": false, "message": data, "files": filesData_1 };
      res.json(response);
    }
    catch (e) {
      response = { "error": true, "message": "Error fetching data" };
      console.log("ccccccccccccccccccccccccccc");
    }
  })
})

router.post('/text', function(req, res) {          
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

      const text = new TextFile({
        name: name,
        src: path,
      });

      if(req.body.description){
        text.description = req.body.description;
      }

      for(var i = 0 ; i < 6; i++) {
        text.metadata[key[i]] = metadata[key[i]];
      }

      text
      .save()
      .then(text => {
         // console.log(image);
      });
    });  
    return res.status(200).send(req.file)    // Everything went fine.
  })
});

module.exports = router;