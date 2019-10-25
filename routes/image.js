const image = require('../controlers/image.controler');
const express = require('express');
const router = express.Router();

router.get('/image', async function(req, res) {
console.log(req)
	const { pageNumber, size } = req.query;
	let response;
	if(pageNumber <= 0) {
		response = {"error" : true,"message" : "invalid page number, should start with 1"};
	} else {
		response = image.findImage(pageNumber, size);
	}
	response.then(response => {
	    return res.json(response);
	})

});

router.post('/image', function(req, res) {
	const response = image.addImage(req, res);
	 return res.json(response);
});

router.delete('/image',function(req, res){
	  //delete file
});

module.exports = router;
