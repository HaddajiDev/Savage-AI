const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const user = require('../models/user');

var jwt = require('jsonwebtoken');

router.post('/signup', async(req, res) => {
    const {username, email, password} = req.body;
    try {
        const searchedUser = await user.find({email: email});
        if(searchedUser){
            return res.send({error: "email already exist"});
        }

        const salt = 10;
        const genSalt = await bcrypt.genSalt(salt);
        const hashed_password = await bcrypt.hash(password, genSalt);

        const new_user = new user({
            username: username,
            email: email,
            password: hashed_password
        });
        
        await new_user.save();

        const payload = {
            _id: res._id
        }

        const token = await jwt.sign(payload, process.env.SESSION_SECRET, {
            expiresIn: '7d'
        });

        res.send({user: new_user, token: `bearer ${token}`});

    } catch (error) {
        res.send({error: "something bad happen"})
        console.log(error)
    }
})


router.post('/login', async(req, res) => {
    const { email, password } = req.body;
    try {
        const searchedUser = await user.find({ email: email });        
        if(!searchedUser){
            return res.send({error: "user not found"});
        }

        const match = await bcrypt.compare(password, searchedUser.password);
        if(!match){
            return res.send({error: "wrong password"});
        }

        const payload = {
            _id: res._id
        }

        const token = await jwt.sign(payload, process.env.SESSION_SECRET, {
            expiresIn: '7d'
        });

        res.send({user: searchedUser, token: `bearer ${token}`});

    } catch (error) {
        
    }
})

module.exports = router;