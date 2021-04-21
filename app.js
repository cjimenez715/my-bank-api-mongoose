//IMPORTS


import express from 'express';
import mongoose from 'mongoose';
import { accountsRouter } from './routes/accountsRouter.js';

import dotenv from 'dotenv';
dotenv.config();
//Connection to mongoDB through mongoose
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connection with mongoDB established')
  } catch (error) {
    console.log('Error trying to connect to MongoDB')
  }
})();

//This code deletes warnings of mongoose 
mongoose.set('useFindAndModify', false);

const app = express();

app.use(express.json());

app.use('/accounts', accountsRouter);

app.get('/', (_, res) => {
  res.send('Hi heroku !');
})

app.get('/say-hello/:message', (req, res) => {
  const { message } = req.params;
  res.send(`Hello ${message}!`);
})

app.listen(process.env.PORT, () => {
  console.log('my-bank-api is Working!');
})