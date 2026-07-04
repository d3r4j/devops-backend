const jwt = require("jsonwebtoken")
const User = require("../models/user")

const userAuth = async (req, res, next) => {
    // read the token from the request cookies
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("please login!");
        }
        const decodedObj = await jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY)  // line 79 of app.js
        const { _id } = decodedObj;

        const user = await User.findById(_id)
        if (!user) {
            throw new Error("user not found")
        }
        // validate the token 
        // find  the username
        req.user = user; // user found in line 13 will be attached with the request  
        next();
    }

    catch (err) {
        res.status(400).send("ERROR:" + err.message)
    }




}



module.exports = {
    userAuth
}