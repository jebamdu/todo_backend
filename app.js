import express from 'express';
import cors from 'cors'
import functionsServer from './routes/function.js'
import mongoose from "mongoose";
import 'dotenv/config'

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', functionsServer);

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017'

try {
  await mongoose.connect(MONGODB_URL)
  console.log('Connected to MongoDB')
} catch (err) {
  console.error(err)
  throw Error("Couldn't connect to Mongo DB")
}

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log("server running on ", PORT)
})
