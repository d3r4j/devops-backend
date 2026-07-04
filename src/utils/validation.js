const validator = require('validator')

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body; // now one by one validate all 

    if (!firstName || !lastName) {
        throw new Error("names are not valid")
    }
    // else if (firstName.length > 50 || firstName.length < 4) {
    //     throw new Error("name length should be in between 4 to 50 characters")
    // } got this in user.js schema validators, but we can use this also.

    // for emails

    else if (!validator.isEmail(emailId)) {
        throw new Error('email is not valid')
    }

    //password
    else if (!validator.isStrongPassword(password)) {
        throw new Error('please enter a strong password!')
    }
}


const validateEditProfileData = (req) => {
    const allowesEditFields = ["firstName", "lastName", "photoUrl", "about", "age", "gender", "skills", "emailId"]
    const isEditAllowed = Object.keys(req.body).every(field => allowesEditFields.includes(field))  //returns boolean
    return isEditAllowed;
}

module.exports = {
    validateSignUpData,
    validateEditProfileData
}