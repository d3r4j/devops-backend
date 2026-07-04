const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    isPremium: {
        type: Boolean,
        deafult: false,
    },
    membershipType: {
        type: String,
    },
    // membershipValidity: {
    //     type: Number
    // },
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50,
        index: true,

    },
    lastName: {
        type: String,
        minLength: 4,
        maxLength: 30,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("invalid email address:" + value)
            }
        }
    },
    password: {

        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("invalid PASSWORD :" + value)
            }
        }
    },
    age: {
        type: Number,
        min: 14,
        max: 100,
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female", "others"],
            message: `{VALUE} gender data is not valid`
        },

        // validate(value) { we used enum insead now
        //     if (!["male", "female", "others"].includes(value)) {
        //         throw new Error("Gender data is not valid")

        //     }
        // }
    },
    photoUrl: {
        type: String,
        default: "https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369988.png",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("invalid PHOTO URL:" + value)
            }
        }
    },
    about: {
        type: String,
        default: "tell about yourself"
    },
    skills: {
        type: [String]
    }

}, {
    timestamps: true,
})


userSchema.index({ firstName: 1, lastName: 1 })

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, "secertKey@123", { expiresIn: "6h" });
    return token;

}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password
    const pass = await bcrypt.compare(passwordInputByUser, passwordHash);
    return pass;
}

const userModel = mongoose.model("user", userSchema)
module.exports = userModel;