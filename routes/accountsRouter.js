import express from 'express';
import * as api from '../controller/accountsController.js';

const accountsRouter = express.Router();

//Just for Test
accountsRouter.get('/', async (_, res, next) => {
  try {
    const result = await api.getAllAccounts();
    res.send(result);
  } catch (error) {
    next(error);
  }
})

accountsRouter.delete('/delete-all', async (_, res, next) => {
  try {
    await api.deleteAll();
    res.send('all deleted');
  } catch (error) {
    next(error);
  }
})

accountsRouter.post('/insert-account', async (req, res, next) => {
  try {
    const result = await api.insertAccount(req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
//---------------------------

accountsRouter.put('/deposit/:agency/:accountNumber/:value', async (req, res, next) => {
  try {
    const { agency, accountNumber, value } = req.params;
    const result = await api.depositByAgencyAccountNumber(agency,
      accountNumber,
      value);
    res.send(result.balance.toString());
  } catch (error) {
    next(error);
  }
})

accountsRouter.put('/withdraw/:agency/:accountNumber/:value', async (req, res, next) => {
  try {
    const { agency, accountNumber, value } = req.params;
    const result = await api.withdrawByAgencyAccountNumber(agency,
      accountNumber,
      value);
    res.send(result.balance.toString());
  } catch (error) {
    next(error);
  }
})

accountsRouter.get('/get-balance-by-agency-account', async (req, res, next) => {
  try {
    const { agency, accountNumber } = req.query;
    const result = await api.getAccountBalanceByAgencyAndAccountNumber(agency,
      accountNumber)
    res.send(result);
  } catch (error) {
    next(error);
  }
})

accountsRouter.delete('/delete-by-agency-account/:agency/:accountNumber', async (req, res, next) => {
  try {
    const { agency, accountNumber } = req.params;
    const result = await api.deleteAccountandRerurnActivesQuantity(agency,
      accountNumber)
    res.send(result);
  } catch (error) {
    next(error);
  }
})

accountsRouter.put('/transfer-between-accounts/:sourceAccountNumber/:value/:targetAccountNumber'
  , async (req, res, next) => {
    try {
      const { sourceAccountNumber, value, targetAccountNumber } = req.params;
      const result = await api.transferBetweenAccounts(sourceAccountNumber,
        value,
        targetAccountNumber);
      res.send(result);
    } catch (error) {
      next(error);
    }
  })

accountsRouter.get('/get-avg-balance-by-agency', async (req, res, next) => {
  try {
    const { agency } = req.query;
    const result = await api.getAvgBalanceByAgency(agency);
    res.send(result);
  } catch (error) {
    next(error);
  }
})

accountsRouter.get('/get-top-accounts-with-lower-balance', async (req, res, next) => {
  try {
    const { cantResult } = req.query;
    const result = await api.getTopAccountsWithLowerBalance(cantResult);
    res.send(result);
  } catch (error) {
    next(error);
  }
})

accountsRouter.get('/get-top-accounts-with-higher-balance', async (req, res, next) => {
  try {
    const { cantResult } = req.query;
    const result = await api.getTopAccountsWithHigherBalance(cantResult);
    res.send(result);
  } catch (error) {
    next(error);
  }
})

accountsRouter.post('/transfer-accounts-to-private-agency', async (_, res, next) => {
  try {
    const result = await api.transferAccountsToPrivateAgency();
    res.send(result);
  } catch (error) {
    next(error);
  }
})

accountsRouter.use((err, _, res, _next) => {
  res.status(400).send({ error: err.message });
})


export { accountsRouter }