const express = require('express');
const User = require('../models/user');

const router = express.Router();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const {loginRules, registerRules, validation, UpdateRules} = require('../middleware/validator');
const isAuth = require('../middleware/passport');

router.post("/signup", registerRules(), validation, async (request, result) => {
    try {
        const search = await User.findOne({ username: request.body.username });
        if (search) {
            return result.status(400).send({error :'username already exists'});
        }
        const salt = 10;
        const genSalt = await bcrypt.genSalt(salt);
        const hashed_password = await bcrypt.hash(request.body.password, genSalt);		

        let newUser = new User({
            ...request.body,
            password: hashed_password
        });

        let res = await newUser.save();

		const payload = {
			_id: res._id
		}
		const token = await jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: '7d'
		});
        
        result.status(200).send({ user: res, token: `bearer ${token}` });
   

    } catch (error) {
        console.error(error);
        result.status(500).send({error :'Something went wrong'});
    }
});

router.post('/login', loginRules(), validation, async (request, result) => {
    const { email, password } = request.body;
    try {

        const searchedUser = await User.findOne({ email });
        if (!searchedUser) {
            result.status(500).send({error: "User not found"});
            return;
        }


        const match = await bcrypt.compare(password, searchedUser.password);

        if (!match) {
            result.status(500).send({error: "Invalid credentials"});
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