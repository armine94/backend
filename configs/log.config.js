let logLevel = 'debug';

if(process.argv[2]) {
	logLevel = process.argv[2];
}

module.exports = logLevel;

  
