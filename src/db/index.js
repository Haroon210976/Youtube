import mongoose from 'mongoose';
import { DB_NAME } from '../contants.js';

const connectDB = async () => {
  try {
    const connectionIstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    // console.log(
    //   `MongoDB Connected Successfully !! DB HOST ${connectionIstance.connection.host}`
    // );
    console.log(`Connection Istance ${connectionIstance}`);

    process.exit(0);
  } catch (error) {
    console.log(`MONGODB Conncetion FAILED : ${error}`);
    process.exit(1);
  }
};

export default connectDB;
