const { off } = require('../user/userData');
const socketDAO = require('./socketDAO');

function socketAPI(io) {
    const activeUsers = new Map();

    io.on("connection", (socket) => {
        console.log("New client connected");

        socket.on("new user", (username) => {
            socket.username = username;
            if (!activeUsers.has(username)) {
                activeUsers.set(username, socket.id);
            }
        });

        socket.on("check user active", (username) => {
            if (activeUsers.has(username)) {
                io.to(socket.id).emit("user status", username, true);
            } else {
                io.to(socket.id).emit("user status", username, false);
            }
        });

        socket.on("private message", (resipientUsername, msg) => {
            if (!activeUsers.has(resipientUsername)) {
                io.to(socket.id).emit("private message", "User is Offline!");
            } else {
                //console.log('Message: ' + msg + ", sent to " + resipientUsername);
                io.to(activeUsers.get(resipientUsername)).emit("private message", socket.username, msg);
            }
        });

        function getActiveUsers() {
            let arr = [];
            for (let username of activeUsers.keys()) {
                arr.push(username);
            } console.log(arr);
            return arr;
        }

        socket.on("getActiveUsers", () => {
            io.to(socket.id).emit("getActiveUsers", getActiveUsers());
        });

        socket.on("search user", async (username) => {
            if (username === socket.username) {
                io.to(socket.id).emit("search response", false);
                return;
            }
            const response = await socketDAO.isUserExist(username);
            io.to(socket.id).emit("search response", response);
        });

        socket.on("add request", async (recipientUser) => {
            const response = await socketDAO.addFriendRequest(socket.username, recipientUser);
            io.to(socket.id).emit("add request response", response);
        });

        socket.on("show friends", async () => {
            const result = await socketDAO.getFriends(socket.username);
            if (result && result.friends) {
                let arr = [];
                for (let username of activeUsers.keys()) {
                    arr.push(username);
                }
                const onlineFriends = [];
                const offlineFriends = [];
                for (let friend of result.friends) {
                    if (arr.includes(friend)) onlineFriends.push(friend);
                    else offlineFriends.push(friend);
                }
                const response = {
                    onlineFriends: onlineFriends,
                    offlineFriends: offlineFriends
                };
                io.to(socket.id).emit("show friends response", response);
            }
        });

        socket.on("show requests", async () => {
            const response = await socketDAO.getRequests(socket.username);
            io.to(socket.id).emit("show requests response", response);
        });

        socket.on("accept user", async (friend) => {
            socketDAO.acceptFriendRequest(socket.username, friend);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected");
            activeUsers.delete(socket.username);
        });
    });
}

module.exports = socketAPI;