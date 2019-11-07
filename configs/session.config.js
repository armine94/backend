module.exports = {
    name: "connect.sid",
    secret: "somerandonstuffs",
    resave: true,
    httpOnly: true,
    saveUninitialized: true,
    maxAge: 1000 * 60 * 60 * 5,  //5 hour
}