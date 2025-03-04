import jwt, { TokenExpiredError } from 'jsonwebtoken'
export const gTsC = (res, userID) => {

    const token = jwt.sign({userID}, process.env.JWT_SECRET,{
        expiresIn: '7d'
    })
    res.cookie( "token",Token, {
        httpOnly: true,
        secure: process.env.NODE_ENC === "production",
        samsite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return token
}