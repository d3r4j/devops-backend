const express = require("express")
const authRouter = express.Router()
const { validateSignUpData } = require("../utils/validation")
const bcrypt = require('bcrypt')
const User = require("../models/user")

//signup 
authRouter.post("/signup", async (req, res) => {
    try {
        // validation of data  
        validateSignUpData(req);

        const { firstName, lastName, emailId, password } = req.body;
        // encrypting passwords using bcrypt library
        const passwordHash = await bcrypt.hash(password, 10) // 10 is salt rounds for hashing
        console.log(passwordHash)

        // creating a new instance of a user model 

        const user = new User({
            firstName, lastName, emailId, password: passwordHash,
        })
        const savedUser = await user.save();

        const token = await savedUser.getJWT()
        // creating token hiding user ID inside it. >> added in schema method now
        // ADD TOKEN TO COOKIE AND SEND IT BACK TO USER
        res.cookie("token", token, {
            httpOnly: true, // cannot access from JS (safer)
            sameSite: "Lax", // adjust to "None" if needed
            secure: false,   // true if using HTTPS
            expires: new Date(Date.now() + 8 * 3600000) //8 hours
        });

        res.json({ message: "user added successfully", data: savedUser })
    }
    catch (err) {
        res.status(400).send("ERROR >>  " + err.message)
    }

})


// login 
authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body
        const user = await User.findOne({ emailId: emailId }) //verfiy email exists in the DB or not
        if (!user) {
            throw new Error("no account is registered with entered email")
        }

        const isPasswordValid = await user.validatePassword(password) //password is nidhi123, user.password is hash eofb5r54e35fd3
        if (isPasswordValid) {
            //CREATE JWT TOKEN HERE 
            const token = await user.getJWT()
            // creating token hiding user ID inside it. >> added in schema method now


            // ADD TOKEN TO COOKIE AND SEND IT BACK TO USER
            res.cookie("token", token, {
                httpOnly: true, // cannot access from JS (safer)
                sameSite: "Lax", // adjust to "None" if needed
                secure: false,   // true if using HTTPS

                expires: new Date(Date.now() + 8 * 3600000)
            });

            res.send(user);
        } else {
            throw new Error("invalid password!")
        }
    }
    catch (err) {
        res.status(400).send("ERROR :" + ' ' + err.message)
    }

})

//logout 
authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    });
    res.send("logout sucessfull");
})


module.exports = authRouter; 0