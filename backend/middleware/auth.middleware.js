import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

//protectRoute middleware function
export const protectRoute =  async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if(!accessToken){
            return res.status(401).json({ message: "Unauthorized, no access token provided"});
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(401).json({ message: "Unauthorized, user not found"});
        }

        req.user = user;
        next();

    } catch (error) {
        console.log("Error protecting route", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

//adminRoute middleware function
export const adminRoute = async (req, res, next) => {
    if (req.user && req.user.role === "admin"){
        next();
    } 
    else{
        res.status(401).json({ message: "Unauthorized, user is not an admin"});
    }
};
