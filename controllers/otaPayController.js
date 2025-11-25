const catchAsync = require('../utils/catchAsync');
const {ApiError} = require('../utils/apiError');
const otapayService = require('../services/otapay');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const DataPlanService = require('../services/dataPlanService');

const purchaseDataBundle = catchAsync(async (req, res) => {
  const {phoneNumber, network,data_plan,planObjectId} = req.body;
  const user = req.user || await User.findById(req.userId).lean();
  const plan = await DataPlanService.getPlanByMongoId(planObjectId);
  if(!plan){
    throw new ApiError('Data plan not found',404,'DATA_PLAN_NOT_FOUND');
  }
  if(!user || !user.wallet || Number(user.wallet.balance) < Number(plan.price)){
    throw new ApiError('Insufficient wallet balance',400,'INSUFFICIENT_WALLET_BALANCE');
  }
  const trn = await Transaction.create({
    user: req.userId,
    direction: 'debit',
    status: 'pending',
    purpose: 'data_purchase',
    channel: 'in_app',
    amount: plan.price,
  });
  const result = await otapayService.dataPurchase(plan.network,phoneNumber,trn._id,plan.planId);
  await Transaction.updateOne(
    { _id: trn._id },
    { status: 'completed' }
  );
  await User.updateOne(
    { _id: req.userId },
    { $inc: { 'wallet.balance': -plan.price } }
  );
  res.status(200).json({
    success: true,
    message: 'Data bundle purchased successfully',
    data: result
  });


});


const purchaseAirtime = catchAsync(async (req, res) => {
  const {phoneNumber, network, amount, airtime_type} = req.body;
  const user = req.user || await User.findById(req.userId).lean();
  if(!user || !user.wallet || Number(user.wallet.balance) < Number(amount)){
    throw new ApiError('Insufficient wallet balance',400,'INSUFFICIENT_WALLET_BALANCE');
  }
  const trn = await Transaction.create({
  user: req.userId,
  direction: 'debit',
  status: 'completed',
  purpose: 'airtime_purchase',
  channel: 'in_app',
  amount: amount,
  })
  const result = await otapayService.airtimePurchase(network,phoneNumber,trn._id,amount,airtime_type);
  await User.updateOne(
    { _id: req.userId },
    { $inc: { 'wallet.balance': -amount } }
  );
  await Transaction.updateOne(
    { _id: trn._id },
    { status: 'completed' }
  );
  res.status(200).json({
    success: true,
    message: 'Airtime purchased successfully',
    data: result
  });
});

const getTransactionStatus = catchAsync(async (req, res) => {
  const {transaction_ref} = req.query;
  const result = await otapayService.checkTransactionStatus(transaction_ref);
    res.status(200).json({
      success: true,
      message: 'Transaction status retrieved successfully',
      data: result
    });
});

const getWalletBalance = catchAsync(async (req, res) => {
  const result = await otapayService.getWalletBalance();
    res.status(200).json({
      success: true,
      message: 'Wallet balance retrieved successfully',
      data: result
    });
});

module.exports = {
  purchaseDataBundle,
  purchaseAirtime,
  getTransactionStatus,
  getWalletBalance
};