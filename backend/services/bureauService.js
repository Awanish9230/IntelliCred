/**
 * Mock Bureau Service
 * Simulates fetching external credit data
 */
const getBureauReport = async (email) => {
  // Simple deterministic mock data based on email
  const isGoodUser = !email.includes('test') && !email.includes('reject');
  
  return {
    credit_score: isGoodUser ? 750 + Math.floor(Math.random() * 100) : 400 + Math.floor(Math.random() * 100),
    active_loans: isGoodUser ? 1 : 4,
    past_due_days: isGoodUser ? 0 : 45,
    bank_statement_verified: true,
    identity_verified: true
  };
};

module.exports = { getBureauReport };
