const mongoose = require("mongoose")

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // reference to the user collection
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is invalid status type`
        }
    },

},
    { timestamps: true }
)

//compound indexing 
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 })

connectionRequestSchema.pre("save", function (next) {   //always write normal function n not arrow func inside schema    
    const connectionRequest = this;  //save is like an event handler.  // we can do all kind of checks n validations inside it
    // CHECK OUR FROM-USER-ID IS SAME AS TO-USER-ID
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error("cannot send a connection request to yourself!");
    }
    next(); // VERY IMPORTANT TO CALL NEXT OR CODE I WILL NOT MOVE FURTHER 
})

const ConnectionRequestModel = new mongoose.model("connectionRequest", connectionRequestSchema)

module.exports = ConnectionRequestModel