
import { accountsModel } from '../model/accountsModel.js';

const TAX_WITHDRAW = 1;
const TAX_TRANSFER = 8;
const PRIVATE_AGENCY = 99;

//Just for test
const getAllAccounts = async () => {
  const allAccounts = await accountsModel.find();
  return allAccounts;
}

const deleteAll = async () => {
  await accountsModel.deleteMany({});
}

const insertAccount = async (account) => {
  const accountInserted = await accountsModel.insertMany([account]);
  return accountInserted;
}
//-*---------

const getAccountByAgencyAndAccountNumber = async (agency, accountNumber) => {
  const account = await accountsModel.findOne({
    agencia: `${agency}`,
    conta: `${accountNumber}`,
  });
  return account;
}

const validateAccountExists = (account, accountNumber) => {
  if (!account) {
    throw new Error(`Account ${accountNumber} was not found`);
  }
}

const depositByAgencyAccountNumber = async (agency, accountNumber, value) => {
  const account = await getAccountByAgencyAndAccountNumber(agency, accountNumber)
  validateAccountExists(account, accountNumber);
  const accountUpdated = await updateBalanceAccountById(account._id, +value);
  return accountUpdated;
}

const updateBalanceAccountById = async (_id, value) => {
  const accountUpdated = await accountsModel.findByIdAndUpdate({
    _id: `${_id}`,
  }, { $inc: { balance: `${value}` } }, { new: true })
  return accountUpdated;
}

const withdrawByAgencyAccountNumber = async (agency, accountNumber, value) => {
  const account = await getAccountByAgencyAndAccountNumber(agency, accountNumber)

  validateAccountExists(account, accountNumber);

  const { _id, agencia, conta, balance } = account;

  const withdrawValue = (parseInt(value) + TAX_WITHDRAW) * -1;
  if ((balance + withdrawValue) < 0) {
    throw new Error(`Account: ${conta}, Agency:${agencia} does not have enought balance to process this operation`);
  }
  const accountUpdated = await updateBalanceAccountById(_id, withdrawValue);
  return accountUpdated;
}

const getAccountBalanceByAgencyAndAccountNumber = async (agency, accountNumber) => {
  const account = await getAccountByAgencyAndAccountNumber(agency, accountNumber);

  validateAccountExists(account, accountNumber);

  return account.balance.toString();
}

const deleteAccountandRerurnActivesQuantity = async (agency, accountNumber) => {
  const account = await getAccountByAgencyAndAccountNumber(agency, accountNumber);

  validateAccountExists(account, accountNumber);

  await accountsModel.findOneAndDelete({ _id: account._id });

  const accountsCount = await accountsModel.countDocuments({ agencia: `${agency}` });
  return accountsCount.toString();
}

const getAccountByAccountNumber = async (accountNumber) => {
  const account = await accountsModel.findOne({ conta: `${accountNumber}` });
  return account;
}

const transferBetweenAccounts = async (sourceAccountNumber, value, targetAccountNumber) => {
  const sourceAccount = await getAccountByAccountNumber(sourceAccountNumber);
  const targetAccount = await getAccountByAccountNumber(targetAccountNumber);

  validateAccountExists(sourceAccount, sourceAccountNumber);
  validateAccountExists(targetAccount, targetAccountNumber);

  const transferValue = +value;

  const debitValue = sourceAccount.agencia === targetAccount.agencia ?
    (+value) * -1 : (+value + TAX_TRANSFER) * -1;

  if ((sourceAccount.balance + debitValue) < 0) {
    throw new Error(`Account: ${sourceAccount.conta}, Agency:${sourceAccount.agencia} does not have enought balance to process this operation`);
  }

  await updateBalanceAccountById(targetAccount._id, transferValue);
  const sourceAccountUpdated = await updateBalanceAccountById(sourceAccount._id, debitValue);
  return sourceAccountUpdated.balance.toString();
}

const getAvgBalanceByAgency = async (agency) => {
  const avgResult = await accountsModel.aggregate([
    { $match: { agencia: parseInt(agency) } },
    {
      $group: {
        _id: '$agencia',
        avgBalance: { $avg: "$balance" }
      }
    }
  ])
  if (avgResult.length === 0) {
    throw new Error(`Avg of Agency: ${agency}' could not be calculed.`)
  }
  return avgResult[0].avgBalance.toString();
}

const getTopAccountsWithLowerBalance = async (cantResult) => {
  const accountsResult = await accountsModel.find({},
    {
      _id: 0,
      agencia: 1,
      conta: 1,
      balance: 1
    }).sort({ balance: 'asc' }).limit(+cantResult)

  return accountsResult;
}

const getTopAccountsWithHigherBalance = async (cantResult) => {
  const accountsResult = await accountsModel.find({},
    {
      _id: 0,
      agencia: 1,
      conta: 1,
      balance: 1
    }).sort({ balance: 'desc' }).limit(+cantResult);

  return accountsResult;
}

const transferAccountsToPrivateAgency = async () => {
  // const agencyTopAccounts = await accountsModel.aggregate([
  //   {
  //     $sort: {
  //       agencia: 1
  //     }
  //   },
  //   {
  //     $group: {
  //       _id: '$agencia',
  //       balance: { $max: '$balance' },
  //     }
  //   },
  //   {
  //     $sort: {
  //       _id: 1,
  //     }
  //   },
  // ]);

  const topAccountsByAgency = await accountsModel.aggregate([
    {
      $sort: {
        agencia: 1,
        balance: -1
      }
    },
    {
      $group: {
        _id: '$agencia',
        account: { $first: '$$ROOT' },
      }
    },
    {
      $sort: {
        _id: 1,
      }
    },
  ]);


  for (let i = 0; i < topAccountsByAgency.length; i++) {
    const { _id } = topAccountsByAgency[i].account;
    await accountsModel.updateOne({ _id: `${_id}` }, { $set: { agencia: PRIVATE_AGENCY } });
  }

  const priaveAgencyResult = accountsModel.find({ agencia: PRIVATE_AGENCY }, {});

  return priaveAgencyResult;
}

export {
  getAllAccounts,
  deleteAll,
  insertAccount,
  depositByAgencyAccountNumber,
  withdrawByAgencyAccountNumber,
  getAccountBalanceByAgencyAndAccountNumber,
  deleteAccountandRerurnActivesQuantity,
  transferBetweenAccounts,
  getAvgBalanceByAgency,
  getTopAccountsWithLowerBalance,
  getTopAccountsWithHigherBalance,
  transferAccountsToPrivateAgency
}
