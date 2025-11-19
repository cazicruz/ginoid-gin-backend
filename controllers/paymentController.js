const {initiatePayment,ChckPstackTrxnStat} = require('../utils/paystack');
const orderServices = require('../services/orderService');
const catchAsync = require('../utils/catchAsync');
const { ApiError } = require('../utils/apiError');


// Initiate payment



const verifyPayment = catchAsync(async (req, res) => {
    const { reference } = req.body;
    if (!reference) {
        
    }
    const {data,status} = await ChckPstackTrxnStat(reference);
    if (status === 'success') {
        await orderServices.updateOrderStatus(reference, 'shipping',data.amount / 100);
        return res.status(200).json({
            status: 'success',
            message: 'Payment verified and order status updated to shipping'
        });
    }
    res.status(400).json({
        status: 'fail',
        message: 'Payment verification failed or payment not successful'
    });

})


module.exports = {
    CreatePaymentOrder,
    verifyPayment
};