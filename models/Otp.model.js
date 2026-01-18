import mongoose from "mongoose"

const otpSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    otp:{
        type: String,
        required: true
    },
    expiresAt:{
        type: DataTransfer,
        required: true,
        default: () => Date(Date.now() + 10 * 60 * 1000)
    }
}, {timestamps: true})

otpSchema.index({ expiresAt: 1 }, {expireAfterSeconds: 0 })

const OTPModel = mongoose.models.OTP || mongoose.model('OTP', otpSchema, 'otps')

export default OTPModel

