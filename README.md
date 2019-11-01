To get you started you can simply clone the repository

git clone https://github.com/armine94/backend

and install the dependencies

npm ci

Prerequisites
you need git to clone the repository. You can get git from http://git-scm.com/.

A number of node.js tools is necessary to initialize the project. You must have node.js and its package manager (npm) installed. You can get them from http://nodejs.org/. The tools/modules used in this project are listed in package.json and include express, mongodb and mongoose.

MongoDB

The project uses MongoDB as a database.

Run the Application

The project is preconfigured with a simple development web server. The simplest way to start this server is:

npm start

├── backend
|  ├── configs -  Contains application configuration settings such as database configuration
|  |  ├──  config.js
|  |  └──  mongodb.js
|  ├── controllers - Defines app routes logic.
|  |  ├──  audio.controlers.js
|  |  ├──  image.controlers.js
|  |  ├──  text.controlers.js
|  |  └──  user.controlers.js
|  ├── models - Contains database models.
|  |  ├──  Audio.model.js
|  |  ├──  Image.model.js
|  |  ├──  Text.model.js
|  |  └──  User.model.js
|  ├── public - Directory for save  files and sending.
|  |  ├──  audios
|  |  ├──  images
|  |  └──  texts
|  ├── routes - All routes for different entities in different files.
|  |  └──  routes.js
|  ├── validation - Defines requests validation logic.
|  |  ├──  is-empty.js
|  |  ├──  login.js
|  |  └──  register.js
├── package.json
├── README.md
└── app.js


