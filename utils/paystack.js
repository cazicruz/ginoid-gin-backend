const axios = require('axios');
const { response } = require('../app');
const {redisClient}= require('../config/redisClient');
const { ApiError } = require('../utils/apiError');
// const { verifyBankAccount } = require('../controllers/walletController');

const PAYSTACK_SECRET_KEY =
  process.env.NODE_ENV == 'development'
    ? process.env.PAYSTACK_SECRET_KEY
    : process.env.PAYSTACK_LIVE_KEY;
const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Initialize a payment
 * @param {number} amount - Amount in kobo (e.g., 1000 = ₦10.00)
 * @param {string} email
 * @param {string} userId
 * @param {string} purpose
 */
const initiatePayment = async (amount, email, userId, orderId, purpose = 'Order_Payment') => {
  const subaccount= process.env.PAYSTACK_SUB_ACCOUNT;
  const response = await paystack.post('/transaction/initialize', {
    email,
    amount,
    subaccount:subaccount?subaccount:null,
    reference:orderId,
    metadata: {
      userId,
      orderId,
      purpose
    }
  });

  return response.data.data;
};

/**
 * Create a Paystack Customer
 * @param {object} param0 - email, first_name, last_name, phone
 */
const createCustomer = async ({ email, first_name, last_name, phone }) => {
  const response = await paystack.post('/customer', {
    email,
    first_name,
    last_name,
    phone
  });

  return response.data.data; // e.g. customer_code, id, email, etc.
};

/**
 * Validate customer KYC via BVN or Bank account
 * @param {object} user - must include paystackCustomerData.customer_code
 */
// const validateCustomerDetails = async (user) => {
//   const {
//     kycData: { country, verification_type, bank_acount, bvn, bank_code },
//     firstName,
//     lastName,
//     _id,
//     paystackCustomerData: { customer_code }
//   } = user;

//   const payload = {
//     country,
//     type: verification_type,
//     account_number: bank_acount,
//     bvn,
//     bank_code,
//     first_name: firstName,
//     last_name: lastName,
//     metadata: {
//       userId: _id,
//       purpose: 'customer_validation'
//     }
//   };

//   const response = await paystack.post(`/customer/${customer_code}/identification`, payload);
//   return response.data.data;
// };

/**
 * Assign a Dedicated Virtual Account to customer
 * @param {string} customer_code - Paystack customer_code
 * @param {string} preferred_bank - 'wema-bank' by default
 */
// const assignDedicatedAccount = async (customer_code, preferred_bank = 'wema-bank') => {
//   const response = await paystack.post('/dedicated_account', {
//     customer: customer_code,
//     preferred_bank
//   });

//   return response.data.data;
// };

// const verifyBankAccount= async (bankCode,accountNumber )=>{
//     const response = await paystack.post(`/bank/resolve`, {
//         params:{
//             account_number: accountNumber,
//             bank_code: bankCode
//         }
//     });
//     return response.data.data;
// }

const getAllowedBanks = async (country = 'nigeria') => {
    const key = `supported_${country}_banks`;
    
    const cached = await redisClient.get(key);
    if (!cached) {
      const response = await paystack.get(`/bank`, {
        params: { country }
      });
  
      const bankList = response.data.data;
      
      // Cache it for 12 hours (optional)
      await redisClient.set(key, JSON.stringify(bankList), 'EX', 60 * 60 * 12); // 12 hours expiry
  
      console.log('used api call');
      return bankList;
    }
  
    console.log('used redis');
    return JSON.parse(cached);
};

// const createTransferRecipient = async (type, name, account_number, bank_code, currency, user) => {
//     if (!user || !user._id || !user.email) {
//       throw new Error('Invalid user object');
//     }
  
//     try {
//       const response = await paystack.post('/transferrecipient', {
//         type, // e.g. "nuban"
//         name,
//         account_number,
//         bank_code,
//         currency, // e.g. "NGN"
//         description: 'User payout/withdrawal',
//         metadata: {
//           userId: user._id,
//           email: user.email,
//           first_name: user.firstName || '',
//           last_name: user.lastName || ''
//         }
//       });
  
//       return response.data?.data;
//     } catch (error) {
//       console.error('Error creating transfer recipient:', error?.response?.data || error.message);
//       throw new Error('Failed to create transfer recipient');
//     }
//   };

/**
 * Manually check Paystack transaction status by reference
 * @param {string} reference - The transaction reference to verify
 * @returns {Promise<'successful'|'failed'|'pending'>} - The transaction status
 */
const ChckPstackTrxnStat = async (reference) => {
  if (!reference) throw new Error('reference is needed at ChckPstackTrxnStat function');
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    const data = response.data?.data
    console.log(data.amount/100)
    const status = data?.status;
    const retries= data?.log?.attempts;
    return {data,status,retries};
  } catch (error) {
    console.error('error checking transaction status', error?.response?.data || error.message);
    throw new ApiError(`failed to check transaction Status`,404,{message:`${error?.response?.data?.message||error.message}`});
  }
};
  
  

module.exports = {
  createCustomer,
  initiatePayment,
  getAllowedBanks,
  ChckPstackTrxnStat
};
