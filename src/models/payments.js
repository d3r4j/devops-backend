const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({


    userId: {  // every payment must be attached with user ID , important
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    paymentId: {
        type: String, // payment can also fail so we dont need required true
    },
    orderId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    receipt: {
        type: String,
        required: true,
    },
    notes: {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        membershipType: {
            type: String
        },
    }

}, { timestamps: true })

module.exports = mongoose.model("Payment", paymentSchema)