require('../app');

const mongoose = require('mongoose');
const userModel = require('./user');

const saveUser = async (user) => {
    const userDoc = new userModel(user);
    await userDoc.save();
}

const findUser = async (username) => {
    return await userModel.findOne({ username: username });
}

const updateToken = async (username, token) => {
    return await userModel.updateOne({ username: username }, { token: token });
}

module.exports = {
    saveUser,
    findUser,
    updateToken,
};