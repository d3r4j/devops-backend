const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const { compareSync } = require("bcrypt");
const userRouter = express.Router();
const User = require("../models/user")


const USER_SAFE_DATA = "firstName lastName age gender about skills photoUrl"
// to get all the pending connection request for logged in users
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {

        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequestModel.find({
            toUserId: loggedInUser._id,
            status: "interested",       // interested means requests are pending hence

        }).populate("fromUserId", ["firstName", "lastName", "photoUrl", "about"])


        res.json({ message: "pending requests data fetched successfully", data: connectionRequest, })
    }
    catch (err) {
        res.status(400).send("Error" + err.message)
    }
})

// connection api i.e info about our accepted connections / my-friends list people 
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequestModel.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" }
            ]
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA)

        const datas = connectionRequests.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId
            }
            return row.fromUserId;
        })

        res.json({ message: "friendlist fetch successfully", data: datas })
    }
    catch (err) {
        res.status(400).send({ message: err.message })
    }
})
// feed api to get user feed
userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        // 1. user should see all user profiles except this own profile
        // 2. his connections  
        // 3. ignored people 
        // 4. already sent the connection request

        // 5. adding api pagination
        const page = parseInt(req.query.page) || 1 //numbers in url will be strings so we make them int.
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        limit = limit > 50 ? 50 : limit;


        const loggedInUser = req.user;
        // finde connection req that are sent + recieved
        const connectionRequests = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }]
        }).select("fromUserId toUserId")
        //.populate("fromUserId", "firstName").populate("toUserId", "firstName")

        // set data structure is like an array which only has unique elements  
        const hideUsersFromFeed = new Set()
        connectionRequests.forEach(req => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString())
        })
        // console.log(hideUsersFromFeed)

        const users = await User.find({
            $and: [                                                                     // $and means and querry
                { _id: { $nin: Array.from(hideUsersFromFeed) }, }, // all user which are not in the array we made from set using Array.from
                { _id: { $ne: loggedInUser._id } } //  all users from except own profile. $ne means not equal to, $nin means not in this arrray
            ]

        }).select(USER_SAFE_DATA).skip(skip).limit(limit)

        res.send(users);


    }
    catch (err) {
        res.status(400).json({ message: err.message })

    }
})
module.exports = userRouter;