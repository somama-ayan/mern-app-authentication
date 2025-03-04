import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from "../utils/genrateTokenAndSetCookie.js"
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js"
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
    res.send('login')
}

export const logout = async(req, res) => {
    res.send('logout ')
}