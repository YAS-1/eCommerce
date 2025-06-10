import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
 
export const signup = async (req, res) => {
    try {
        const { email, password, name} = req.body //object destructing

        const userExists = await User.findOne({ email });

        if (userExists){
            return res.status(400).json({ message: "User already exists"});
        }

        //authentication


        const user = await User.create({ name, email, password });
        res.status(201).json({
            user,
            message: "User created successfully"
        });

        console.log(`User created: ${user}`);

    } catch (error) {
        return res.status(500).json({ message: `Error creating user: ${error.message}`})
    }
};


export const login = async () => {
    try {
        
    } catch (error) {
        
    }
};


export const logout = async () => {
    try {
        
    } catch (error) {
        
    }
};