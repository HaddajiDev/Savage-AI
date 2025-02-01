const express = require('express');
const User = require('../models/user');
const pendingUser = require('../models/pendingUser');

const router = express.Router();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const {loginRules, registerRules, validation, UpdateRules} = require('../middleware/validator');
const isAuth = require('../middleware/passport');
const sendVerificationEmail = require('../utils/SendMail');
const sendForgotPassEmail = require('../utils/SendForgotPassMail');



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

        
        const newPending = new pendingUser({
            token: token,
            email: request.body.email
        })

        await newPending.save();
        
        sendVerificationEmail(request.body.email, token);
        
        result.status(200).send({            
            redirectUrl: `${process.env.FRONT_URL}/verify?sent=true`,
            email: request.body.email
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

        const Pending = await pendingUser.findOne({ email: decoded.email });
        if (!Pending) {
            return result.status(400).send({ error: 'Verification session expired' });
        }


        const newUser = new User({
            username: decoded.username,
            email: decoded.email,
            password: decoded.password,            
        });

        const user = await newUser.save();

        await pendingUser.deleteOne({ email: decoded.email });

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

router.put('/reset', async(req, res) => {
    const { id, newPassword } = req.body;
    try {      

        const user = await User.findOne({_id: id});
        const salt = 10;
        const genSalt = await bcrypt.genSalt(salt);
        const hashed_password = await bcrypt.hash(newPassword, genSalt);
        
        user.password = hashed_password;
        user.save();

        res.send({msg: "all good"});
        
    } catch (error) {
        console.log(error);
    }
})

router.post('/api/resend', async(req, res) => {
    try {
        const pending = await pendingUser.findOne({email: req.body.email});
        sendVerificationEmail(req.body.email, pending.token);
        res.send({status: "Mrigl"});
    } catch (error) {
        console.log(error);
    }
});

router.post('/forgot', async(req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        if(!user){            
            return res.status(400).send({error: "user not found"});
        }

        sendForgotPassEmail(req.body.email, user._id);
        res.status(200).send({msg: "email sent", email: req.body.email});

    } catch (error) {
        res.status(400).send({error: error});
        console.log(error);
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