import express from 'express'
import  dotenv  from 'dotenv'
import cookieParser from 'cookie-parser'
import { connectDB } from './db/connectDb.js'
import authRoutes from './routes/auth.route.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json()) // allow us to parse incoming requests: req.body
app.use(cookieParser()) // allow us to parse icoming cookies)
app.use('/api/auth', authRoutes)
app.listen(PORT, () => {
    connectDB();
    console.log('Server is running on port: ', PORT)
})