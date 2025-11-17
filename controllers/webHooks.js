const crypto = require('crypto');
const mongoose= require('mongoose');
const User = require('../models/User');
// const Transaction = require('../models/Transaction');
// const {ValidateTransferRequest} = require('../services/walletService')
const catchAsync = require('../utils/catchAsync');
const apiError = require('../utils/apiError');

const secret = process.env.WEBHOOK_SECRET_KEY;

const validatePaystackSignature = (req) => {
  const generatedHash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  return generatedHash === req.headers['x-paystack-signature'];
};

// const processWalletFunding = async ({ userId, amount, reference, data, message }) => {
//   const session = await mongoose.startSession();
//     try {
      
//       session.startTransaction();
//       const opts = { session, new: true };
  
//       const [user, existingTx] = await Promise.all([
//         User.findById(userId).session(session),
//         Transaction.findOne({ paymentReference: reference }).session(session)
//       ]);
  
//       if (!user) throw new Error('User not found');
  
//       if (existingTx) {
//         if ((existingTx.status === 'success') ||existingTx.resolved) {
//           await session.commitTransaction();
//           session.endSession();
//           return 'Already processed';
//         }
  
//         if (existingTx.totalAmount !== amount) {
//           throw new Error('Amount mismatch');
//         }
  
//         existingTx.status = 'success';
//         existingTx.providerResponse = {
//           success: true,
//           message,
//           reference,
//           data
//         };
//         existingTx.resolved=true;
//         existingTx.completedAt = new Date();
//         await existingTx.save(opts);
//       } else {
//         await Transaction.create([{
//           user: user._id,
//           paymentReference: reference,
//           totalAmount: amount,
//           status: 'success',
//           providerResponse: {
//             success: true,
//             message,
//             reference,
//             data
//           },
//           resolved:true,
//           completedAt: new Date()
//         }], opts);
//       }
  
//       // Atomic wallet update
//       await User.updateOne(
//         { _id: user._id },
//         { $inc: { 'wallet.balance': Number((amount / 100).toFixed(2)) } },
//         { session }
//       ); //converting from kobo to naira  
//       await session.commitTransaction();
//       session.endSession();
//       return {
//         status: 'success',
//         deta :{message: 'Wallet funded',
//         amount: numericAmount / 100,
//         reference}
//       };
//     } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
//       throw new Error('Error updating Transaction');
//     }
//   };
  

// const dvaHook = async (req, res) => {
//   try {
//     if (!validatePaystackSignature(req)) {
//       return res.status(401).json({ message: 'Invalid signature' });
//     }

//     const { event, data } = req.body;

//     if (['transfer.success', 'dedicatedaccount.received'].includes(event)) {
//       let userId = data.metadata?.userId;
//       const amount = data.amount / 100;

//       if (!userId && data.account_number) {
//         const user = await User.findOne({ 'bankDetails.accountNumber': data.account_number });
//         userId= user._id;
//       } else if (data.customer?.customer_code) {
//         const user = await User.findOne({ 'paystackCustomerData.customer_code': data.customer.customer_code });
//         userId= user._id;
//       }
      

//       await processWalletFunding({
//         userId,
//         amount,
//         reference: data.reference,
//         data,
//         message: 'DVA funding successful'
//       });
//     }

//     res.sendStatus(200);
//   } catch (err) {
//     console.error('❌ DVA Hook Error:', err.message || err);
//     res.sendStatus(500);
//   }
// };

const transactionHook = catchAsync(async (req, res) => {
  try {
    if (!validatePaystackSignature(req)) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (event === 'charge.success' && data.metadata?.purpose === 'Order_Payment') {
      const userId = data.metadata.userId;
      const orderId= data.matadata.orderId
      const amount = data.amount / 100;

      if (!userId) {
        console.warn('❗ Missing userId in metadata');
        return res.status(400).json({ message: 'Missing userId' });
      }

    }

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Transaction Hook Error:', err.message || err);
    res.sendStatus(500);
  }
});

// const transferApprovalHook = catchAsync(async (req, res)=>{
//   if (!validatePaystackSignature(req)) {
//     return res.status(400).json({ message: 'Invalid signature' });
//   }
//   await ValidateTransferRequest(req.body);
//   try{await Transaction.findOneAndUpdate(
//     { _id: req.body.transactionId },
//     { resolved: true }
//   );}catch(err){
//     console.error('error updating Transaction record',err.message||err)
//     throw apiError('error updating transaction record', 400,'mongoose error',{})
//   }
//   res.sendStatus(200);
// })

module.exports = {
  transactionHook,
  // transferApprovalHook
};
