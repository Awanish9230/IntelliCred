const axios = require('axios');

/**
 * MOCK RazorpayX Payout Service (Sandbox Mode)
 */
const executePayout = async (payoutData) => {
  const { amount, accountNumber, ifsc, name, sessionId } = payoutData;
  console.log(`[PAYOUT] Initializing disbursement for Session: ${sessionId}`);

  // In a real production app, use actual RazorpayX API endpoints
  // const RAZORPAYX_API = 'https://api.razorpay.com/v1/payouts';
  
  // Simulating network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate in sandbox
      
      if (success) {
        resolve({
          success: true,
          payoutID: `payout_${Math.random().toString(36).substr(2, 9)}`,
          status: 'processed',
          utr: `UTR${Math.random().toString(10).substr(2, 12)}`,
          amount_credited: amount,
          recipient: name
        });
      } else {
        resolve({
          success: false,
          error: 'INSUFFICIENT_FUNDS',
          reason: 'Escrow account below threshold for this payout.'
        });
      }
    }, 2000);
  });
};

module.exports = { executePayout };
