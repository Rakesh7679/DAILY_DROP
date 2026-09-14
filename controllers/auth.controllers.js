import User from "../models/user.model.js"
import bcrypt, { hash } from "bcryptjs"
import genToken from "../utils/token.js"
import { sendOtpMail, sendOtpSms } from "../utils/mail.js"

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production"
    return {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}

export const signUp=async (req,res) => {
    try {
        const {fullName,email,password,mobile,role}=req.body
        let user=await User.findOne({email})
        if(user){
            return res.status(400).json({message:"User Already exist."})
        }
        if(password.length<6){
            return res.status(400).json({message:"password must be at least 6 characters."})
        }
        if(mobile.length<10){
            return res.status(400).json({message:"mobile no must be at least 10 digits."})
        }
     
        const hashedPassword=await bcrypt.hash(password,10)
        user=await User.create({
            fullName,
            email,
            role,
            mobile,
            password:hashedPassword
        })

        const token=await genToken(user._id)
        res.cookie("token",token,getCookieOptions())
  
        const userObj = user.toObject ? user.toObject() : user
        return res.status(201).json({ ...userObj, authToken: token })

    } catch (error) {
        return res.status(500).json(`sign up error ${error}`)
    }
}

export const signIn=async (req,res) => {
    try {
        const {email,password}=req.body
        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"User does not exist."})
        }
        
     const isMatch=await bcrypt.compare(password,user.password)
     if(!isMatch){
         return res.status(400).json({message:"incorrect Password"})
     }

        const token=await genToken(user._id)
        res.cookie("token",token,getCookieOptions())
  
        const userObj = user.toObject ? user.toObject() : user
        return res.status(200).json({ ...userObj, authToken: token })

    } catch (error) {
        return res.status(500).json(`sign In error ${error}`)
    }
}

export const signOut=async (req,res) => {
    try {
        const cookieOptions = getCookieOptions()
        res.clearCookie("token", {
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite,
            httpOnly: true
        })
        return res.status(200).json({message:"log out successfully"})
    } catch (error) {
        return res.status(500).json(`sign out error ${error}`)
    }
}

export const sendOtp=async (req,res) => {
  try {
    const {email}=req.body
     if(!email){
         return res.status(400).json({message:"Email is required"})
     }
    const user=await User.findOne({email})
    if(!user){
       return res.status(400).json({message:"User does not exist."})
    }
    const otp=Math.floor(1000 + Math.random() * 9000).toString()
    user.resetOtp=otp
    // Keep reset OTP valid a bit longer to account for email delivery delays.
    user.otpExpires=Date.now()+10*60*1000
    user.isOtpVerified=false
    await user.save()

        const [mailResult, smsResult] = await Promise.allSettled([
            sendOtpMail(email, otp),
            sendOtpSms(user.mobile, otp)
        ])

        const mailSent = mailResult.status === "fulfilled"
        const smsSent = smsResult.status === "fulfilled"

        if (!mailSent && !smsSent) {
            console.log("OTP delivery failed", {
                email,
                mailError: mailResult.reason?.message,
                smsError: smsResult.reason?.message
            })
            return res.status(503).json({
                message: "Unable to deliver OTP right now. Please try again in a moment.",
                mailSent: false,
                smsSent: false
            })
        }

        return res.status(200).json({
            message: `OTP sent successfully via ${[mailSent ? "email" : null, smsSent ? "sms" : null].filter(Boolean).join(" and ")}`,
            mailSent,
            smsSent
        })
  } catch (error) {
         return res.status(500).json({message:`send otp error ${error.message || error}`})
  }  
}

export const verifyOtp=async (req,res) => {
    try {
        const {email,otp}=req.body
        const user=await User.findOne({email})
        if(!user || user.resetOtp!=otp || user.otpExpires<Date.now()){
            return res.status(400).json({message:"invalid/expired otp"})
        }
        user.isOtpVerified=true
        user.resetOtp=undefined
        user.otpExpires=undefined
        await user.save()
        return res.status(200).json({message:"otp verify successfully"})
    } catch (error) {
         return res.status(500).json(`verify otp error ${error}`)
    }
}

export const resetPassword=async (req,res) => {
    try {
        const {email,newPassword}=req.body
        const user=await User.findOne({email})
    if(!user || !user.isOtpVerified){
       return res.status(400).json({message:"otp verification required"})
    }
    const hashedPassword=await bcrypt.hash(newPassword,10)
    user.password=hashedPassword
    user.isOtpVerified=false
    await user.save()
     return res.status(200).json({message:"password reset successfully"})
    } catch (error) {
         return res.status(500).json(`reset password error ${error}`)
    }
}

export const googleAuth=async (req,res) => {
    try {
        const {fullName,email,mobile,role}=req.body
        if(!email){
            return res.status(400).json({message:"Email is required for Google authentication."})
        }

        const normalizedName = fullName?.trim() || email.split("@")[0]
        const normalizedMobile = mobile?.trim() || "0000000000"
        const normalizedRole = role || "user"

        let user=await User.findOne({email})
        if(!user){
            user=await User.create({
                fullName: normalizedName,
                email,
                mobile: normalizedMobile,
                role: normalizedRole
            })
        }

        const token=await genToken(user._id)
        res.cookie("token",token,getCookieOptions())
  
        const userObj = user.toObject ? user.toObject() : user
        return res.status(200).json({ ...userObj, authToken: token })


    } catch (error) {
         return res.status(500).json(`googleAuth error ${error}`)
    }
}