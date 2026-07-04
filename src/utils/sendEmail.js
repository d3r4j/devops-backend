const { SendEmailCommand } = require("@aws-sdk/client-ses")
const { sesClient } = require("./sesClient.js")


const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
    return new SendEmailCommand({
        Destination: {

            CcAddresses: [],
            ToAddresses: [
                toAddress,
            ],
        },
        Message: {
            Body: {

                Html: {
                    Charset: "UTF-8",
                    Data: `<h1>${body}</h1>`, // sending fancy ui emails here using html tags
                },
                Text: {
                    Charset: "UTF-8",
                    Data: "this is a test email format",
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: fromAddress,
        ReplyToAddresses: [

        ],
    });
};


const run = async (subject, body) => {
    const sendEmailCommand = createSendEmailCommand(
        "dhirajc1337@gmail.com", // to address
        "dhiraj@quantqbits.space",   // from address
        subject,
        body
    );

    try {
        return await sesClient.send(sendEmailCommand);
    } catch (caught) {
        if (caught instanceof Error && caught.name === "MessageRejected") {
            const messageRejectedError = caught;
            return messageRejectedError;
        }
        throw caught;
    }
};

// snippet-end:[ses.JavaScript.email.sendEmailV3]
module.exports = { run };