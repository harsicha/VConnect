const userDataModel = require('../user/userData');
const userModel = require('../user/user');

async function isUserExist(username) {
    const result = await userModel.findOne({ username: username });
    return result != null;
}

async function addFriendRequest(username, recipeintUsername) {
    try {
        isSentRequestExist = await userDataModel.findOne({ username: username, sentRequests: { $elemMatch: { $eq: recipeintUsername } } });
        isFriendExist = await userDataModel.findOne({ username: username, friends: { $elemMatch: { $eq: recipeintUsername } } });
        if (isSentRequestExist || isFriendExist) return false;
        await userDataModel.updateOne({ username: username },
            { $push: { sentRequests: recipeintUsername } },
            { upsert: true });
        await userDataModel.updateOne({ username: recipeintUsername },
            { $push: { pendingRequests: username } },
            { upsert: true });
        return true;
    }
    catch (ex) {
        console.log(ex);
        return false;
    }
}

async function getFriends(username) {
    return await userDataModel.findOne({ username: username }).select({ friends: 1 });
}

async function getRequests(username) {
    return await userDataModel.findOne({ username: username }).select({ pendingRequests: 1, sentRequests: 1 });
}

async function acceptFriendRequest(username, friend) {
    // remove friend from sentRequests and add in friends array of this users document
    await userDataModel.updateOne({ username: username }, { $pull: { pendingRequests: friend } });
    await userDataModel.updateOne({ username: username }, { $push: { friends: friend } });

    // remove friend from sentRequests and add in friends array of this friend's document
    await userDataModel.updateOne({ username: friend }, { $pull: { sentRequests: username } });
    await userDataModel.updateOne({ username: friend }, { $push: { friends: username } });
}

module.exports = {
    isUserExist,
    addFriendRequest,
    getFriends,
    getRequests,
    acceptFriendRequest
}