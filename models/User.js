const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    first_name: { type: String, required: true},
    last_name: { type: String, required: true},
    dob: { type: String, required: true},
    phone: { type: String, required: true, unique: true },
    email : { type: String, required: true, unique: true },
    voter_id: { type: String, unique: true },
    otp_code: { type: String, default: "" },
    password: { type: String },
    wallet_address: { type: String, required: true },
    private_key: { type: String, required: true }
})

const User = mongoose.model('User', userSchema)
module.exports = User