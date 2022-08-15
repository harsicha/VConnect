const mongoose = require('mongoose');

const userDataSchema = mongoose.Schema({
    username: { type: String, required: true },
    friends: { type: Array },
    sentRequests: { type: Array },
    pendingRequests: { type: Array }
});

const UserData = mongoose.model('UserData', userDataSchema);

module.exports = UserData;