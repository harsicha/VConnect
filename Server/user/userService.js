const jwt = require('./token');
const store = require('./userDAO');
const bcrypt = require('bcryptjs');

module.exports.isAuthenticated = (token) => {
    //const token = req.headers['authorization'];
    if (!token) return false;
    const result = jwt.validateToken(token);
    //const fullURL = req.protocol + '://' + req.get('host') + req.originalUrl;
    //console.log(req.originalUrl);
    //console.log('Inside middleware!!');
    return result != null;
}

module.exports.isUserPresent = async (username) => {
    let obj = await store.findUser(username);
    return obj !== undefined && obj !== null;
}

module.exports.addUser = async (username, password, token) => {
    let salt = await bcrypt.genSalt(10);
    let passwordHash = await bcrypt.hash(password, salt);
    const user = {
        username: username,
        password: passwordHash,
        token: token,
    }
    await store.saveUser(user);
}

module.exports.getUser = async (username) => {
    return await store.findUser(username);
}

module.exports.updateToken = async (username) => {
    const token = jwt.generateToken(username);
    await store.updateToken(username, token);
    return token;
}

module.exports.validateUser = async (username, password) => {
    const user = await store.findUser(username);
    if (user === undefined) return false;
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    return isPasswordMatching;
}