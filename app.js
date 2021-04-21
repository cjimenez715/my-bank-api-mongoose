//IMPORTS
import express from 'express';
import mongoose from 'mongoose';
import { accountsRouter } from './routes/accountsRouter.js';

//Connection to mongoDB through mongoose
(async () => {
  try {
    await mongoose.connect('mongodb+srv://bootcampmongo:bootcampmongo@cluster0.0hgbl.mongodb.net/bank?retryWrites=true&w=majority', {
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

app.listen(3000, () => {
  console.log('my-bank-api is Working!');
})