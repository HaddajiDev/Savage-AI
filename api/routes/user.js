const express = require('express');
const User = require('../models/user');

const router = express.Router();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const {loginRules, registerRules, validation, UpdateRules} = require('../middleware/validator');
const isAuth = require('../middleware/passport');
const sendVerificationEmail = require('../utils/SendMail');


router.post("/api/verify", registerRules(), validation, async(request, result) => {
    try {

        const search_username = await User.findOne({ username: request.body.username });
        if (search_username) {
            return result.status(400).send({error :'username already exists'});
        }
        const search_email = await User.findOne({ email: request.body.email });
        if (search_email) {
            return result.status(400).send({error :'email already exists'});
        }

        const salt = 10;
        const genSalt = await bcrypt.genSalt(salt);
        const hashed_password = await bcrypt.hash(request.body.password, genSalt);

        const payload = {
            username : request.body.username,
            email : request.body.email,
            password : hashed_password
        }
        const token = await jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: '7d'
		});

        sendVerificationEmail(request.body.email, token);

        result.status(200).send({            
            redirectUrl: `${process.env.FRONT_URL}/verify?sent=true` 
        });

    } catch (error) {
        console.log(error);
    }
});


router.get("/api/signup", async (request, result) => {
    try {
        const token = request.query.token;        
        if (!token) {
            return result.status(400).send({ error: 'Verification token is missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const newUser = new User({
            username: decoded.username,
            email: decoded.email,
            password: decoded.password,            
        });

        const user = await newUser.save();

        const payload = {
            _id : user._id
        }

        const authtoken = await jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: '7d'
		});

        const authString = `bearer ${authtoken}`

        result.redirect(`${process.env.FRONT_URL}/verify?token=${authString}`);

    } catch (error) {
        console.error(error);        
        result.status(500).send({ error: 'Server error during verification' });
    }
});



router.post('/login', loginRules(), validation, async (request, result) => {
    const { email, password } = request.body;
    try {

        const searchedUser = await User.findOne({ email });
        if (!searchedUser) {
            result.status(400).send({error: "User not found"});
            return;
        }
        
        const match = await bcrypt.compare(password, searchedUser.password);

        if (!match) {
            result.status(400).send({error: "Invalid credentials"});
            return;
        }       

		const payload = {
			_id: searchedUser._id
		}
		const token = await jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: '7d'
		});        
        result.status(200).send({ user: searchedUser, token: `bearer ${token}` });
    } catch (error) {
        console.error("Error during login:", error);
        result.status(500).send({error: "Login Failed"});
    }
});

router.get('/current', isAuth(), (request, result) => {    
    result.status(200).send({user: request.user});
});


module.exports = router;