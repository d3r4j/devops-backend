const express = require("express")
const requestRouter = express.Router()
const { userAuth } = require("../middlewares/auth"); // add this to any  api to make it strong
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user")
const sendEmail = require("../utils/sendEmail")

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;   //logged in user from userAuth will have it we just take it
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        const allowedStatus = ["ignored", "interested"]
        // 01 status validation
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "invalid status type:" + status }) //code will not run further when we write return
        }

        //02 if existing connection request is already there. 
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [                              // $or is mongodb keyword for OR condition which takes array of objs
                { fromUserId, toUserId }, // checks if fromuser and touser both are in db or not  or
                { fromUserId: toUserId, toUserId: fromUserId } // checks fromuser>touser or tosuer>fromuser req are already present
            ]
        });

        if (existingConnectionRequest) {  //if any req is pending/exists already then we give this message
            return res.status(400).json({ message: "connection request already pending" })
        }


        //03 validation to prevent sending connection req to random ID not even in DB
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(400).json({ message: "invalid user ID" })
        }


        const connectionRequest = new ConnectionRequest({     //creating new instance of the connection request
            fromUserId,
            toUserId,
            status
        });

        const data = await connectionRequest.save() // .save will save it in the DB 

        // sending email

        // const emailRes = await sendEmail.run("A New Friend Request From " + req.user.firstName,
        //     req.user.firstName + " reacted " + status + " on " + toUser.firstName
        // )
        // console.log(emailRes)

        res.json({
            message: req.user.firstName + " reacted " + status + " on " + toUser.firstName,
            data      /// this will send the data of connection req along with message
        })

    }


    catch (err) {
        res.status(400).send("Error:" + err.message)
    }
})


requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;   //by user AUTH
        const { status, requestId } = req.params; //getting from link

        //01 allowed status id
        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "status is not valid" })
        }
        //02 check request id is present in db or not
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,                 //finding a request in the database which has the req id , touser = loggedin user and
            toUserId: loggedInUser._id,         // status should be interested 
            status: "interested"
        })

        if (!connectionRequest) {
            return res.status(404).json({ message: "connection request not found" });
        }

        connectionRequest.status = status; // if all things are right then
        const data = await connectionRequest.save()
        res.json({ message: "connection request " + status, data })


        //03 if we dont find su


    }
    catch (err) {
        res.status(400).send("Error:" + err.message)
    }

})

module.exports = requestRouter;