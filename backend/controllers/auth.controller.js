import User from "../models/user.model.js";
import { generateTokens, setCookies } from "../utils/tokenGenerator.js";
import { redis } from "../lib/redis.js";

//store the refreshToken function
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token: ${userId}`, refreshToken, "EX",7*24*60*60); //7 days
};

export const signup = async (req, res) => {
    try {
        const { email, password, name} = req.body //object destructing

        const userExists = await User.findOne({ email });

        if (userExists){
            return res.status(400).json({ message: "User already exists"});
        }

        //creating the user
        const user = await User.create({ name, email, password });

        //authentication section
        const { accessToken, refreshToken } = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);

        //setting the Cookies
        setCookies(res, accessToken, refreshToken);
        
        //sending the response
        res.status(201).json({
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            message: "User created successfully"
        });

        console.log(`User created successfully: Name: ${user.name}, Email: ${user.email}`);

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