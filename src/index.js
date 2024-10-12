import dotenv from 'dotenv';

// import express from 'express';
// import mongoose from 'mongoose';
// import DB_NAME from './contants';
import connectDB from './db/index.js';
import { app } from './app.js';
import { log } from './contants.js';

dotenv.config({
  path: './.env',
});
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      log(`Server is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    log(`Server Connection Failed : ${error.message}`);
    process.exit(1);
  });

// const app = express();
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

//     app.on('error', (error) => {
//       log(`ERR : ${error}`);
//       throw error;
//     });

//     app.listen(process.env.PORT || 3000, () => {
//       log(`Server is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//      log(error);
//     throw error;
//   }
// })();
