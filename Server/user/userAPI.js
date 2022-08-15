const express = require('express');
const app = express();
const jwt = require('./token');
const service = require('./userService');

app.post('/register', async (req, res) => {
    if (!req.body) return res.status(400).json({ message: 'Please post a JSON body!' });
    if (!req.body.username) return res.status(400).json({ message: 'Please provide the username!' });
    if (!req.body.password) return res.status(400).json({ message: 'Please provide the password!' });
    if (!await service.isUserPresent(req.body.username)) {
        const token = jwt.generateToken(req.body.username);
        await service.addUser(req.body.username, req.body.password, token);
        res.cookie('authentication', token, { maxAge: 1000 * 60 * 60, httpOnly: true }); // maxAge is in milliseconds
        res.cookie('username', req.body.username, { maxAge: 1000 * 60 * 60, httpOnly: false })
        return res.status(200).json({ message: 'Success' }).end();
    }
    return res.status(400).json({ message: 'User already exists' });
})

app.post('/login', async (req, res) => {
    if (!req.body) return res.status(400).json({ message: 'Please post a JSON body!' });
    if (!req.body.username) return res.status(400).json({ message: 'Please provide the username!' });
    if (!req.body.password) return res.status(400), json({ message: 'Please provide the password!' });
    if (!await service.isUserPresent(req.body.username)) return res.status(400).json({ message: 'Please register!' }); // <-- Check if user is present in db
    if (!await service.validateUser(req.body.username, req.body.password)) return res.status(401).json({ message: 'Incorrect Password!' }); // <-- Check password
    else {
        let user = await service.getUser(req.body.username);
        if (!service.isAuthenticated(user.token)) {
            await service.updateToken(user.username);
        }
        user = await service.getUser(req.body.username);
        res.cookie('authentication', user.token, { maxAge: 1000 * 60 * 60, httpOnly: true });
        res.cookie('username', req.body.username, { maxAge: 1000 * 60 * 60, httpOnly: false })
        return res.status(200).end();
    }
})

// Check whether the auth cookie is present in request if not then ask user to login or register
// If the cookie is present check if the JWT token is valid, if valid then just increase the max age of cookie
// if not then generate a new token, attach it to auth cookie and increase max age
app.get('/checkAuth', async (req, res) => {
    const token = req.cookies.authentication;
    if (token === undefined) return res.status(401).json({ message: 'Please login or register' });
    let isValid = service.isAuthenticated(token);
    if (isValid) {
        res.cookie('authentication', token, { maxAge: 1000 * 60 * 60, httpOnly: true });
        res.cookie('username', jwt.decodeExpiredToken(token).username, { maxAge: 1000 * 60 * 60, httpOnly: false })
    } else {
        res.cookie('authentication', await service.updateToken(jwt.decodeExpiredToken(token).username), { maxAge: 1000 * 60 * 60, httpOnly: true }); // <-- Generate new token if expired
        res.cookie('username', jwt.decodeExpiredToken(token).username, { maxAge: 1000 * 60 * 60, httpOnly: false })
    }
    return res.status(200).json({ message: 'auth cookie is valid' });
})

module.exports = app;