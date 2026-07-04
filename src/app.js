const express = require("express");
const connectDB = require("./config/database")
const app = express();
const User = require("./models/user");
const userModel = require("./models/user");
const cookies = require("cookie-parser");
const cors = require('cors');
const http = require('http')

require("dotenv").config();
require("./utils/cron-job")

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));
app.use(express.json());
// create new user  / signup API 
app.use(cookies()) // midddleware to read cookies


const authRouter = require("./routes/auth")
const profileRouter = require("./routes/profile")
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/", userRouter)
app.use("/", paymentRouter)
app.use("/", chatRouter)
const server = http.createServer(app);
initializeSocket(server)

connectDB()
    .then(() => {
        console.log("database connection successful ")
        server.listen(process.env.PORT, () => {
            console.log("server is listening to port 7777")
        })

    })
    .catch(err => {
        console.error("Database connection failed:", err.message);
        // res.status(400).send("ERROR >>  " + err.message)
    })





// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// find all users  having email id
app.get("/user", async (req, res) => {
    const userEmail = req.body.emailId;

    try {
        const users = await User.find({ emailId: userEmail });
        if (users.length === 0) {
            res.status(404).send("user not found")
        } else {

            res.send(users)
        }
    }
    catch (err) {
        res.status(400).send("something went wrong")
    }
})

// finding user having specific email
app.get("/userEmail", async (req, res) => {
    try {
        const email = req.body.emailId;
        const user = await userModel.findOne({ emailId: email });
        res.send(user);

    }
    catch (err) {
        res.status(400).send("something went wrong")
    }
})
// find user by user id
app.get("/userId", async (req, res) => {
    const id = req.body._id;
    try {
        console.log(id);
        const user = await userModel.findById(id)
        res.send(user);

    }
    catch (err) {
        res.status(400).send("something went wrong")
    }
})

// feed api to GET all users from DB
app.get("/feed", async (req, res) => {
    try {
        const user = await User.find({}); //empty obj means all users are selected
        res.send(user)

    }
    catch (err) {
        res.status(400).send("something went wrong")
    }

})

// delete a user by user id
app.delete("/user", async (req, res) => {
    const deleteID = req.body.userId;
    try {
        // console.log(deleteID)
        const user = await userModel.findOneAndDelete(deleteID);
        res.send("user deleted successfully")
    }
    catch (err) {
        res.status(400).send("something went wrong")
    }

})

// update data of user
app.patch("/user/:userId", async (req, res) => {
    const userId = req.params?.userId;   // doing _id was giving error , see why?

    const data = req.body; //if its not present in schema it will not be added to db. as userID was passed but not updated in db.


    try {

        const ALLOWED_UPDATES = [
            "photoUrl", "age", "gender", "about", "password", "skills",
        ] // things we allow for user to update here.

        const isUpdateAllowed = Object.keys(data).every(key => ALLOWED_UPDATES.includes(key)) //loops through all keys to check of it has our allowed updates field to edit

        if (!isUpdateAllowed) {
            throw new Error("cannot update this section")
        }

        if (data?.skills.length > 10) {
            throw new Error("skills cannnot be more than 10") // validation for skills length
        }

        // console.log("id", userId, data)
        await userModel.findByIdAndUpdate({ _id: userId }, data, {

            returnDocument: "after",
            runValidators: true,
        })
        console.log(User);

        // res.status(200).json(updatedUser)
        res.send("user updated successfully");

    }
    catch (err) {
        res.status(400).send("update failed:" + err.message)
    }

})