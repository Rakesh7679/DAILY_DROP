import nodemailer from "nodemailer"
import dotenv from "dotenv"
import twilio from "twilio"

dotenv.config()

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

// Twilio client
let twilioClient = null
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

export const sendOtpMail=async (to,otp) => {
    await transporter.sendMail({
        from:process.env.EMAIL,
        to,
        subject:"Reset Your Password",
        html:`<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`
    })
}

export const sendDeliveryOtpMail=async (user,otp) => {
    await transporter.sendMail({
        from:process.env.EMAIL,
        to:user.email,
        subject:"Delivery OTP",
        html:`<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`
    })
}

export const sendDeliveryOtpSms=async (user,otp) => {
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
        console.log("Twilio not configured, skipping SMS")
        return
    }
    
    try {
        await twilioClient.messages.create({
            body: `Your DAILY-DROP delivery OTP is ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: user.mobile.startsWith('+') ? user.mobile : `+91${user.mobile}`
        })
        console.log(`SMS sent to ${user.mobile}: ${otp}`)
    } catch (error) {
        console.log("SMS error:", error.message)
    }
}
