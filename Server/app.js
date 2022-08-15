require('dotenv').config();
require('./db').connect();

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

//routes
app.use('/', require('./user/userAPI'));

// Socket.io server setup start
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    }
});

require('./socket/socketAPI')(io);
// Socket.io server setup end

server.listen(port, () => {
    console.log('Listening on Port: ' + port);
});
