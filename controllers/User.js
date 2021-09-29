import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import user from '../models/UserDetails.js';

export const signin = async (req,res) => {
    const {username, password} = req.body;

    try {
        
        const existingUser = await user.findOne({username});
        
        if(!existingUser) return res.status(404).json({message: 'User does not exists'});
        
        const isPasswordCorrect = await bcrypt.compare(password,existingUser.password);
        
        if(!isPasswordCorrect) return res.status(400).json({message: 'Invalid Password '});
        
        
        const token = jwt.sign({ username: existingUser.username, id: existingUser._id}, 'test',{expiresIn : "1h"});
        
        res.status(200).json({result: existingUser, token});
        
    } catch (error) {
        res.status(500).json({message: 'Something Went Wrong'});
    }
}

export const signup = async (req,res) => {
    //console.log(req);
    const {username,password} = req.body;
    try {
        const existingUser = await user.findOne({username});
        //console.log('Hello');
        
        if(existingUser) return res.status(400).json({message: 'User already exists'});
    //console.log('Hello');
        //console.log(username);
        //console.log(email);
        ///console.log(password);
        const hashedPassword = await bcrypt.hash(password,12);
        //console.log('Hello');

        const result = await user.create({username, password : hashedPassword});
        //console.log('Hello');

        const token = jwt.sign({ username:result.username, id: result._id}, 'test',{expiresIn : "1h"});
        //console.log('Hello');

        res.status(200).json({result, token});
    //console.log('Hello');

    } catch (error) {
        res.status(500).json({message: error.message});
    }
}