const audio = require('../controlers/audio.controler');
const express = require('express');
const router = express.Router();

router.get('/audio', async function(req, res) {  
	const { pageNumber, size } = req.query;
	let response;
	if(pageNumber <= 0) {
		response = {"error" : true,"message" : "invalid page number, should start with 1"};
	} else {
		response = audio.findAudio(pageNumber, size);
	}
	response.then(response => {
	return res.json(response); 
		
	})
	
});

router.post('/audio',async function(req, res) {
	const response =await audio.addAudio(req, res);  
	res.json(response); 
			
});

router.delete('/audio',function(req, res){
	  //delete file
});

module.exports = router;
