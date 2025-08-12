import User from "../models/user.model.js";
import { generateTokens, setCookies } from "../utils/tokenGenerator.js";
import { redis } from "../lib/redis.js";
import jwt from "jsonwebtoken";

//store the refreshToken function
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, {ex: 7*24*60*60}); //7 days
};


//signup function
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


//login function
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({ message: "Email not in system, please signup"});
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch){
            return res.status(400).json({ message: "Invalid password"});
        }

        //authentication section
        const { accessToken, refreshToken } = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);

        //setting the Cookies
        setCookies(res, accessToken, refreshToken);
        
        //sending the response
        res.status(200).json({
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            message: "Login successful"
        });

    } catch (error) {
        return res.status(500).json({ message: `Error logging in: ${error.message}`});
    }
};


//logout function
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken){
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logout successful"});

    } catch (error) {
        res.status(500).json({ message: `Error logging out: ${error.message}`});
    }
};

//refresh access token 
export const refreshAccessToken = async (req, res) => {
    try{

    }
    catch(error){
        res.status(500).json({ message: `Error refreshing access token: ${error.message}`});
    }
}