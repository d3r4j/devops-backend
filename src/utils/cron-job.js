const cron = require("node-cron");
const ConnectionRequestModel = require("../models/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("./sendEmail")

// this will run at 9am everyday
cron.schedule(" 0 9 * * *", async () => {
    // send emails to all users who got requests the previous day
    try {
        const yesterday = subDays(new Date(), 1) // gives yesterdays date
        const yesterdayStart = startOfDay(yesterday); // gives yesterdays time stap of 00:00 am 
        const yesterdayEnd = endOfDay(yesterday) // gives yesterdays end tiem 11:59 pm

        const pendingRequest = await ConnectionRequestModel.find({
            status: "interested",               // gives all user with connection req which are interested
            createdAt: {
                $gte: yesterdayStart,   // greater than yesterday start time
                $lt: yesterdayEnd,     // less than yesterday end day time
            }
        }).populate("fromUserId toUserId") // gives data of from id and to user id also

        // now we need to find all the email id, make set and an array by using ...
        const listOfEmails = [...new Set(pendingRequest.map(req => req.toUserId.emailId))]
        // console.log(listOfEmails)
        for (const email of listOfEmails) {
            // sending emails
            try {
                const res = await sendEmail.run("New Friend Request Pending For : " + email, "There are some request pending, please login to quantqbits.space and accept or reject them")
                // console.log(res);
            }
            catch (err) {
                console.log("error sending email ", err)
            }
        }

    }
    catch (err) {
        console.log(err)
    }
})