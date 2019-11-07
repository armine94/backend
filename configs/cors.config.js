let url = 'http://localhost:3000';

if (process.argv[2] == 'off') {
    url = 'http://localhost:5000';
}

module.exports = url;