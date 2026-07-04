const socket = require('socket.io')
const crypto = require('crypto')
const { Chat } = require('../models/chat')
const ConnectionRequestModel = require('../models/connectionRequest')

//2. crytpo hashed room id creation
const getSecretRoom = (userId, targetUserId) => {
    return crypto.createHash("sha256").update([userId, targetUserId].sort().join("_")).digest("hex")
}

// 1.
const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:4200",
            credentials: true,
        },
    })

    //code to handel socket connections
    io.on("connection", (socket) => {
        // handle events , like joining chat
        // console.log("⚡ New client connected with socket ID: ", socket.id);
        socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
            const roomId = getSecretRoom(userId, targetUserId);
            // console.log(firstName + " has joined the room with id" + roomId)
            socket.join(roomId);
        })

        socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {

            try {

                // const roomId = [userId, targetUserId].sort().join("_")
                const roomId = getSecretRoom(userId, targetUserId);
                // console.log(">" + firstName + ":" + text)
                // checking if userID and targerUserId are friends only then make a socket connection
                ConnectionRequestModel.findOne({
                    fromUserId: userId,
                    toUserId: targetUserId,
                    status: 'accepted'
                })


                // saving message in database
                let chat = await Chat.findOne({
                    participants: { $all: [userId, targetUserId] }
                })

                if (!chat) {
                    chat = await new Chat({
                        participants: [userId, targetUserId],
                        messages: [],
                    })
                }
                chat.messages.push({
                    senderId: userId,
                    text,
                })
                await chat.save();


                io.to(roomId).emit("messageReceived", { firstName, lastName, text })

            }

            catch (err) {
                console.log(err)
            }


        })

        socket.on("disconnect", () => {

        })

    })

}

module.exports = initializeSocket;