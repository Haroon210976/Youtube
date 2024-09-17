import dotenv from 'dotenv';

// import express from 'express';
// import mongoose from 'mongoose';
// import DB_NAME from './contants';
import connectDB from './db/index.js';

dotenv.config({
  path: './env',
});
connectDB();

// const app = express();
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

//     app.on('error', (error) => {
//       console.log(`ERR : ${error}`);
//       throw error;
//     });

//     app.listen(process.env.PORT || 3000, () => {
//       console.log(`Server is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// })();
