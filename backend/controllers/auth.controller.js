import bcrypt from "bcryptjs"
import crypto from "crypto"
import { generateTokenAndSetCookie } from "../utils/genrateTokenAndSetCookie.js"
import {sendResetSuccessEmail, sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js"
import { User } from "../models/user.model.js"
export const signup = async(req, res) => {
   const {email , password, name} = req.body
   try{
    if(!email || !password || !name){
        throw new Error('All Fields are Required...!')
    }

    const userAlreadyExist = await User.findOne({email})
    if(userAlreadyExist)
        return res.status(400).json({success: false, message: 'User already exists'})

    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()
    const user = new User({
        email,
        password: hashedPassword,
        name,
        verificationToken,
        verificationExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })
    await user.save()
    // jwt
   generateTokenAndSetCookie(res, user._id)

   await sendVerificationEmail(user.email, verificationToken)

   res.status(201).json({
    success: true,
    message: "User created Successfully",
    user: {
        ...user._doc,
        password: undefined 
    }
   })
   }catch(error){
        res.status(400).json({success: false, message: error.message})
   }
   
}

export const verifyEmail = async (req, res) => {
    const { code } = req.body

    try{

        const user = await User.findOne({
            verificationToken: code,
            verificationExpiresAt: {$gt: Date.now()}
        })
        if(!user){
             res.status(400).json({success: false, message: 'Invalid or Expired Verification Code'})
        }
        user.isVerified = true
        user.verificationToken = undefined
        user.verificationExpiresAt = undefined
        await user.save()

        await sendWelcomeEmail(user.email, user.name)

        res.status(201).json({
            success: true,
            message: "User verified Successfully",
            user: {
                ...user._doc,
                password: undefined 
            }
           })
    }catch(error){
        console.log('Error in Email Verification')
        res.status(400).json({success: false, message: `$Server Error Due to: {error.message}`})
    }
}
export const login = async(req, res) => {
    const { email , password} = req.body
    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({success: false, message: "Invalid Credentials"})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid){
            return res.status(400).json({success: false, message: "Invalid Credentials"})
        }
        generateTokenAndSetCookie(res, user._id)
        user.lastLogin = new Date()
        user.save()
        res.status(201).json({
            success: true,
            message: "User Logged In Successfully",
            user: {
                ...user._doc,
                password: undefined 
            }
           })
    }catch(error){
        console.log(`Error User Logging In: ${error}`)
        res.send(`Error occured While user Logging in: ${error}`)
    }
}

export const logout = async(req, res) => {
    res.clearCookie("token")
    res.status(200).json({success: true, message: "Logged Out Successfully!"})
}

export const forgotPassword = async (req, res) => {
    const {email} = req.body
    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({success: false, message: 'Inavalid Email'})
        }
        const resetToken = crypto.randomBytes(20).toString("hex")
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 // 1hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt
        await user.save()

        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password${resetToken}`)
        
        res.status(200).json({success:true, message: 'Password reset Link sent to your email'})
    }catch(error){
        console.log("Error While Reseting Password: ",error )
        res.status(400).json({success: false, message: `Error While sending reset Password email: ${error}`})
    }
}

export const resetPassword = async(req, res) => {
    try{
        const {token} = req.params
        const {password} = req.body

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()}
        })
        if(!user){
            res.status(400).json({success: false, message: 'Invalid or expired reset token'})
        }
        // update password
        const hashed = await bcrypt.hash(password, 10)
        user.password = hashed
        user.resetPasswordToken = undefined
        user.resetPasswordExpiresAt = undefined
        user.save()

        await sendResetSuccessEmail(user.email)
        res.status(200).json({success: true, message: 'Password reset Successfull'})
    }catch(error){
        console.log(`Error sending Reset Success Email ${error}`)
        res.status(400).json({success: false, message: `Error sending Reset Success Email ${error}`})
    }
}