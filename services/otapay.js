const apiError = require('../utils/apiError');
const axios = require('axios');


const OTAPAY_PATHS={
    getWalletBalance:`/user/`,
    airtimePurchase:`/airtime/`,
    dataPurchase:`/data/`,  
    checkTransactionStatus:`/transaction/status/`,
}

const otapay = axios.create({
  baseURL: process.env.OTAPAY_API_URI,
  headers: {
    Authorization: `Bearer ${process.env.OTAPAY_PUBLIC_KEY}`,
    'Content-Type': 'application/json'
  }
})


const dataPurchase = async (network,phone,ref,data_plan,ported_number=true)=>{
    if(!network||!phone||!ref||!data_plan){
        throw apiError("credentials for data purchase in-complete",400,'KEY_PARAMETERS_MISSING');  
    }
    const response = await otapay.post(OTAPAY_PATHS.dataPurchase,{
        network,
        phone,
        ref,
        data_plan,
        ported_number
    });
    return response.data;
}

const checkTransactionStatus = async (transaction_ref)=>{
    if(!transaction_ref){
        throw apiError("transaction reference is missing",400,'KEY_PARAMETERS_MISSING');  
    }
    const response = await otapay.get(`${OTAPAY_PATHS.checkTransactionStatus}?reference=${transaction_ref}`);
    return response.data;
}

const getWalletBalance = async ()=>{
    const response = await otapay.get(OTAPAY_PATHS.getWalletBalance);
    return response.data;
}

const airtimePurchase = async (network,phone,ref,amount,airtime_type='VTU',ported_number=true)=>{
    if(!network||!phone||!ref||!amount){
        throw apiError("credentials for airtime purchase in-complete",400,'KEY_PARAMETERS_MISSING');  
    }
    const response = await otapay.post(OTAPAY_PATHS.airtimePurchase,{
        network,
        phone,
        ref,
        amount:`${amount}`,
        airtime_type,
        ported_number
    });
    return response.data;
}



const otapayService = {
    dataPurchase,
    airtimePurchase,
    getWalletBalance,
    checkTransactionStatus
}
module.exports = otapayService;