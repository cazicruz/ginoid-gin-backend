const {initiatePayment,ChckPstackTrxnStat} = require('../utils/paystack');
const orderServices = require('../services/orderService');
const catchAsync = require('../utils/catchAsync');
const { ApiError } = require('../utils/apiError');


// Initiate payment
const CreatePaymentOrder = catchAsync(async (req, res, next) => {
    const cartId = req.body.cartId || req.user.cartId;
    const orderDetails ={
        contactInfo: req.body.contactInfo,
        deliveryInfo: req.body.deliveryInfo,
        billingAddress: req.body.billingAddress,
    }
    const {order, paymentLink } = await orderServices.createOrderFromCart(cartId, req.user._id, orderDetails, initiatePayment);
    if (!order) {
        return next(new ApiError(400, 'Could not create order'));
    }

    res.status(201).json({
        status: 'success',
        data: {
            order,
            paymentLink
        }
    });
});


const verifyPayment = catchAsync(async (req, res) => {
    const { reference } = req.body;
    if (!reference) {
        reference = await orderServices.getUserOrders(req.user.id);
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