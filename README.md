To get you started you can simply clone the repository

git clone https://github.com/armine94/backend

## Attention
if you use `Mozilla Firefox`, you need install `gecko driver` 
ypu can `download` here [https://github.com/mozilla/geckodriver/releases]

## Prerequisites
you need `git` to `clone` the repository. You can get git from [http://git-scm.com/].
you need `node`, you can `download` here [https://nodejs.org/en/download/]
you need `npm`, you can `install`  npm install npm@latest -g

A number of node.js tools is necessary to initialize the project. You must have node.js and its package manager (npm) installed. You can get them from http://nodejs.org/. The tools/modules used in this project are listed in package.json and include express, mongodb and mongoose.

and install the dependencies
npm ci

## MongoDB

The project uses MongoDB as a database.
you need `mongodb`, you can `download` here  [https://docs.mongodb.com/manual/installation/]

about what starts mongo  `https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes/`

## Run the Application

The program use `command line arguments - process.argv` to determine in which mode the program works, for internal configuration. The values of these variables are set in the package.json file - in property 'start'. 
`PROD` means that the program runs in `production mode`, while in `DEV development mode` .

1) The program run for development
npm run dev

2) The program run for production
npm start 

The project is preconfigured with a simple development web server. The simplest way to start this server is:

## Project structure
├── backend
|  ├── configs -  Contains application configuration settings such as database configuration, logger configuration,cors                      configuration,session configuration,static path and metadata configurations 
|  |  └──  envSettings.json.js
|  ├── controllers - Defines app routes logic.
|  |  ├──  audio.controlers.js - add, update, find, delete audio file
|  |  ├──  doc.controlers.js -   add, update, find, delete doc   file
|  |  ├──  image.controlers.js - add, update, find, delete image file
|  |  ├──  video.controlers.js - add, update, find, delete video file
|  |  └──  user.controlers.js -  user registration, login , logout 
|  ├── databases - Databases connection.
|  |  └──  mongodb.js 
|  ├── log - Loggers connection.
|  |  └──  log4js.js
|  ├── middlwares - Middlwares for all project.
|  |  ├──  corsMiddl.js - cors middlware
|  |  └──  middlware.js - check authorization
|  ├── models - Contains database models.
|  |  ├──  audio.model.js - define audio file model
|  |  ├──  doc.model.js   - define doc   file model
|  |  ├──  image.model.js - define image file model
|  |  ├──  video.model.js - define video file model
|  |  └──  user.model.js  - define user model
|  ├── public - Directory for save and sending files.
|  |  ├──  audios
|  |  ├──  images
|  |  ├──  docs
|  |  └──  videos
|  ├── routes - All routes for different entities in different files.
|  |  └──  routes.js
|  ├── validation - Defines requests validation logic.
|  |  ├──  is-empty.js
|  |  ├──  login.js
|  |  └──  register.js
├── .gitignore
├── app.js
├── package-lock.json
├── package.json
└── README.md