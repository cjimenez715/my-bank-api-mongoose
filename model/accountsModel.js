import mongoose from 'mongoose';

const accountsSchema = mongoose.Schema({
  agencia: {
    type: Number,
    require: true,
  },
  conta: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  balance: {
    type: Number,
    require: true,
    validate: (balance) => {
      if (balance < 0) {
        throw new Error(`Balance must be greater than 0`);
      }
    }
  },
});

const accountsModel = mongoose.model('accounts', accountsSchema, 'accounts');

export { accountsModel }