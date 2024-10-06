import mongoose from 'mongoose';
import { DB_NAME, log } from '../contants.js';

// Define an asynchronous function to connect to the MongoDB database
const connectDB = async () => {
  try {
    // Try to establish a connection using mongoose
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    log(
      'MONGODB Conncetion SUCCESSFULL ! MongoDB Host : ',
      connectionInstance.connection.host
    );

    // console.log('Connection Instance : ', connectionInstance.connection.host);
  } catch (error) {
    log(`MONGODB Conncetion FAILED : ${error.message}`);
    // Exit the process with failure status
    process.exit(1);
  }
};

export default connectDB;
