import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({

    fullName: { type: String, required: true, trim: true, index: true },
    userName: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, unique: true, lowercase: true, trim: true },
    avatar: { type: String, required: true }, //cloudanary url
    coverImage: { type: String }, //cloudanary url
    password: { type: String, required: [true, 'password is required'] },
    refreshToken: { type: String, required: false },
    watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]

}, { timestamps: true })


userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES
        }
    )
}

export const User = mongoose.model('User', userSchema)