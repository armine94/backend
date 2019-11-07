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

1) for development
npm run dev

2) for production
npm start 

The project is preconfigured with a simple development web server. The simplest way to start this server is:

## Project structure
├── backend
|  ├── configs -  Contains application configuration settings such as database configuration
|  |  ├──  log.config.js
|  |  ├──  metadata.config.js
|  |  ├──  mongodb.config.js
|  |  ├──  server.config.js
|  |  └──  session.config.js
|  ├── controllers - Defines app routes logic.
|  |  ├──  audio.controlers.js
|  |  ├──  image.controlers.js
|  |  ├──  text.controlers.js
|  |  └──  user.controlers.js
|  ├── databases - Databases connection.
|  |  └──  mongodb.js
|  ├── log - Loggers connection.
|  |  └──  log4js.js
|  ├── middlwares - Middlwares for all project.
|  |  ├──  corsMiddl.js
|  |  └──  middlware.js
|  ├── models - Contains database models.
|  |  ├──  audio.model.js
|  |  ├──  image.model.js
|  |  ├──  text.model.js
|  |  └──  user.model.js
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
├── .gitignore
├── app.js
├── package.json
└── README.md