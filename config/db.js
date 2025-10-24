import mongoose from 'mongoose';

const connectDB = async () =>{
  try{
    await mongoose.connect(process.env.DB_URL)
    console.log('connected to database')
  }catch(err){
    console.log('mongoDB connection failed',err)
    process.exit(1)
  }

}

export default connectDB