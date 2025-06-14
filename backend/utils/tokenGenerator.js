import jwt from "jsonwebtoken";

//function to generate tokens
export const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    
    return { accessToken, refreshToken };
};

//function to setCookies
export const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken,{
        httpOnly: true, // prevents XSS attack - cross site scripting attack
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict", // prevents CSRF attack
        maxAge: 15 * 60 * 1000
    });
    res.cookie("refreshToken", refreshToken,{
        httpOnly: true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}

 

