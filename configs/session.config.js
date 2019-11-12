module.exports = {
    key: "assetManager",
    secret: "somerandonstuffs",
    resave: true,
    httpOnly: true,
    saveUninitialized: true,
    maxAge: 1000 * 60 * 60 * 24,  //5 hour
}