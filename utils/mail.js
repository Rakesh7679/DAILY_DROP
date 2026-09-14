import nodemailer from "nodemailer"
import dotenv from "dotenv"
import twilio from "twilio"

dotenv.config()

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    port: 587,
    secure: false,
    requireTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const sendMailWithRetry = async (mailOptions) => {
    let lastError = null

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            return await transporter.sendMail(mailOptions)
        } catch (error) {
            lastError = error
            if (attempt === 1) {
                await sleep(500)
            }
        }
    }

    throw lastError
}

// Twilio client
let twilioClient = null
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

export const sendOtpMail=async (to,otp) => {
    await sendMailWithRetry({
        from:process.env.EMAIL,
        to,
        subject:"Reset Your Password",
        html:`<p>Your OTP for password reset is <b>${otp}</b>. It expires in 10 minutes.</p>`
    })
}

export const sendOtpSms=async (mobile,otp) => {
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
        throw new Error("Twilio is not configured")
    }

    if (!mobile) {
        throw new Error("Recipient mobile number is missing")
    }

    const to = mobile.startsWith('+') ? mobile : `+91${mobile}`
    await twilioClient.messages.create({
        body: `Your DAILY-DROP password reset OTP is ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
    })
}

export const sendDeliveryOtpMail=async (user,otp) => {
    await sendMailWithRetry({
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
