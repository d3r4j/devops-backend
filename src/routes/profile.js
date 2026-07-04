const express = require("express")
const profileRouter = express.Router()
const { userAuth } = require("../middlewares/auth") // add this to any  api to make it strong
const { validateEditProfileData } = require("../utils/validation")
//profile view
profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        // VALIDATE  TOKEN using auth middleware now  
        const user = req.user // as we put user data in it from auth code 
        res.send(user)
    }
    catch (err) {
        res.status(400).send("ERROR >>  " + err.message)
    }


})

// profile edit

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {     // create this function in utils.
            throw new Error("invalid edit request")
        }

        const loggedInUser = req.user;  // auth middleware has attached this user data
        // console.log(loggedInUser);
        Object.keys(req.body).forEach(key => loggedInUser[key] = req.body[key])
        // console.log(loggedInUser);  // this will give user details of loggedin user
        await loggedInUser.save()

        res.json({
            message: `${loggedInUser.firstName} ,your profile was updated successfully`,
            data: loggedInUser
        })
    }


    catch (err) {
        res.status(400).send("ERROR" + err.message)
    }
})

module.exports = profileRouter;