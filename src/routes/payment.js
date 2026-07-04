const express = require("express");
const paymentRouter = express.Router()
const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay")
const Payment = require("../models/payments");
const User = require("../models/user");
const { membershipAmount } = require("../utils/constants");
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
    try {
        const { membershipType } = req.body;  // taking from api to backend what type
        const { firstName, lastName, emailId } = req.user

        const order = await razorpayInstance.orders.create({
            "amount": membershipAmount[membershipType] * 100,        // never passs amount from frontend , use backend
            "currency": "INR", // WHEN currency is INR this 50,000 is paisa = 500 rupees
            "receipt": "receipt#1",
            "notes": {                  // notes are meta data for payment
                firstName,
                lastName,
                emailId,
                membershipType: membershipType, // dynamic type from user button click
            }
        })
        // we save the order to db
        // console.log(order)

        const payment = new Payment({
            userId: req.user._id,  // comes from userAuth
            orderId: order.id,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes
        });
        const savePayment = await payment.save()

        // return back order details to frontend
        res.json({ ...savePayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID })



    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }

})

// never write userAuth inside webhooks,
paymentRouter.post("/payment/webhook", async (req, res) => {
    try {
        const webhookSignature = req.get("X-Razorpay-Signature"); //manually add a header, can also use req.get[]
        const isWebhookValid = validateWebhookSignature(JSON.stringify(req.body), webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET)

        if (!isWebhookValid) {
            return res.status(400).json({ msg: "webhook signature is invalid" })
        }
        // update my payment status in DB
        const paymentDetails = req.body.payload.payment.entity
        const payment = await Payment.findOne({ orderId: paymentDetails.order_id })
        payment.status = paymentDetails.status
        await payment.save()
        // user membership updated using user id
        const user = await User.findOne({ _id: payment.userId })
        user.isPremium = true;
        user.membershipType = payment.notes.membershipType

        await user.save();
        // update the user as premium
        // return success response to razorpay , very important
        // if (req.body.event == "payment.captured") {
        // }
        // if (req.body.event == "payment.failed") {
        // }

        return res.status(200).json({ msg: "webhook received successfully" })

    }
    catch (err) {
        return res.status(500).json({ msg: err.message })
    }


})

paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
    const user = req.user.toJSON();
    if (user.isPremium) {
        return res.json({ ...user })
    }
    return res.json({ ...user })
})
module.exports = paymentRouter; 