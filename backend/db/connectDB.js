import mongoose from "mongoose"

export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected ${conn.connection.host}`)
        
    }catch(error){
        console.log(`Error Connecting to MongoDB: ${error.message}`)
        process.exit(1) // status code 1 is failure , & 0 is success
    }
}