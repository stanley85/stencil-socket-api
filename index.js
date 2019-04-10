/**
 * globals
 */
var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    session = require("express-session")({
        secret: "my-secret",
        resave: true,
        saveUninitialized: true
    }),
    sharedsession = require("express-socket.io-session");

/**
 * port call fallback
 */
app.get('/', (req, res) => {
    res.send('<script>window.location = "http://localhost:3333/"</script>');
});

/**
 * session provider
 */
app.use(session);
io.use(sharedsession(session));

/**
 * connection based events
 */
io.on('connection', (socket) => {    
    
    /**
     * debug
     */
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    /**
     * session handling
     */
    socket.on("login", (userdata) => {
        socket.handshake.session.userdata = userdata;
        socket.handshake.session.save();
    });
    socket.on("logout", (userdata) => {
        if (socket.handshake.session.userdata) {
            delete socket.handshake.session.userdata;
            socket.handshake.session.save();
        }
    });

    /**
     * chat messaging
     */
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
    socket.on('application:loaded', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });    
});

/**
 * with arms wide open
 */
http.listen(3000, () => {
    console.log('listening on *:3000');
});