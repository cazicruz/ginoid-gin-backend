const Transaction = require('../models/Transaction');
const User = require('../models/User');
const DataPlan = require('../models/DataPlan');
const { ApiError } = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');


// In app transfers 
const transferBalance = catchAsync(async (req, res, next) => {
    const { recipientGinId, amount } = req.body;
    const senderId = req.user._id;
    
    if (amount <= 0) {
        return next(new ApiError('Transfer amount must be greater than zero', 400));
    }

    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const sender = await User.findById(senderId).session(session);
        const recipient = await User.findOne({ ginId: recipientGinId }).session(session);

        if (!recipient) {
            throw new ApiError('Recipient not found', 404);
        }

        if (sender.ginId === recipientGinId) {
            throw new ApiError('Cannot transfer to yourself', 400);
        }

        if (sender.wallet.balance < amount) {
            throw new ApiError('Insufficient balance', 400);
        }

        sender.wallet.balance -= amount;
        recipient.wallet.balance += amount;

        await sender.save({ session });
        await recipient.save({ session });

        const senderTransaction = new Transaction({
            user: sender._id,
            channel: 'in_app',
            amount: mongoose.Types.Decimal128.fromString(amount.toString()),
            currency: 'NGN',
            direction: 'debit',
            purpose: `Transfer to ${recipient.ginId}`,
            status: 'completed'
        });
        await senderTransaction.save({ session });

        const recipientTransaction = new Transaction({
            user: recipient._id,
            channel: 'in_app',
            amount: mongoose.Types.Decimal128.fromString(amount.toString()),
            currency: 'NGN',
            direction: 'credit',
            purpose: `Transfer from ${sender.ginId}`,
            status: 'completed'
        });
        await recipientTransaction.save({ session });

        await session.commitTransaction();

        res.status(200).json({
            status: 'success',
            message: 'Transfer completed successfully',
            data: {
                senderTransaction,
                recipientTransaction
            }
        });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        if (session) {
            session.endSession();
        }
    }
});


const transferController = {
    transferBalance
}

module.exports = transferController;