const mongoose = require("mongoose")
//2
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    text: {
        type: String,
        required: true,
    }
}, { timestamps: true })
//1
const chatSchema = new mongoose.Schema({
    // this cannot be one so its an array
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }

    ],
    messages: [messageSchema]
})

const Chat = mongoose.model("Chat", chatSchema)
module.exports = { Chat }