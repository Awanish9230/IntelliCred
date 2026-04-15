/**
 * Rule-based risk engine
 * Inputs: income, age, location, LLM output, policy rules
 */
const evaluateRisk = (customerData, llmOutput, bureauData) => {
  const { age: estimatedAge, location, requestedAmount, docVerificationStatus } = customerData;
  const { income, risk_flags, declared_age, verbal_consent } = llmOutput;
  const { credit_score, past_due_days, active_loans } = bureauData;

  const minIncomeThreshold = 20000;
  
  // 1. Hard Rejections
  if (estimatedAge < 18) {
    return { eligible: false, reason: 'Face analysis suggests applicant is underage.', loan_amount: 0, interest_rate: 0 };
  }

  if (docVerificationStatus === 'REJECTED') {
    return { eligible: false, reason: 'High Fraud Signal: Digital ID verification was rejected by AI Forensics.', loan_amount: 0, interest_rate: 0 };
  }

  if (income < minIncomeThreshold) {
    return { eligible: false, reason: `Income ₹${income} is below threshold ₹${minIncomeThreshold}.`, loan_amount: 0, interest_rate: 0 };
  }

  if (past_due_days > 30) {
    return { eligible: false, reason: 'High credit risk: Recent defaults detected in bureau records.', loan_amount: 0, interest_rate: 0 };
  }

  if (!verbal_consent) {
    return { eligible: false, reason: 'Explicit verbal consent was not captured during the call.', loan_amount: 0, interest_rate: 0 };
  }

  // 2. Risk Scoring (0-100)
  let score = 60; // Base score (Lowered base to allow boost)

  // Document Verification Boost
  if (docVerificationStatus === 'SUCCESS') score += 20;

  // Score based on Bureau
  if (credit_score > 750) score += 20;
  else if (credit_score < 600) score -= 30;

  // Score based on Employment/Income
  if (income > 80000) score += 15;

  // Age Consistency Check
  if (declared_age && Math.abs(declared_age - estimatedAge) > 5) {
    score -= 40; // High suspicion of fraud/misrepresentation
  }

  // Risk Flags penalty
  if (risk_flags && risk_flags.length > 0) {
    score -= (risk_flags.length * 15);
  }

  // 3. Final Decision Logic
  if (score < 45) {
    return {
      eligible: false,
      reason: 'Low risk score. Combined signals indicate high probability of fraud or inability to pay.',
      loan_amount: 0,
      interest_rate: 0
    };
  }

  // 4. Offer Generation based on Score & Requested Amount
  const multiplier = score / 12;
  const calculatedMax = income * multiplier;
  const loan_amount = Math.min(requestedAmount, calculatedMax, 1500000); // Max cap 15L
  const interest_rate = Math.max(7.4, 20 - (score / 8)); // Dynamic interest
  const tenure = score > 80 ? [12, 24, 36, 48, 60] : [12, 24, 36];

  // 5. High Amount Guardrail (> 50,000)
  if (requestedAmount > 50000) {
    return {
      eligible: true,
      isPendingAdmin: true,
      status: 'pending_admin',
      loan_amount: Math.round(loan_amount / 1000) * 1000,
      interest_rate: parseFloat(interest_rate.toFixed(2)),
      tenure,
      reason: `Amount ₹${requestedAmount} exceeds auto-approval threshold. PENDING MANUAL ADMIN REVIEW.`,
      score
    };
  }

  return {
    eligible: true,
    status: 'approved',
    loan_amount: Math.round(loan_amount / 1000) * 1000,
    interest_rate: parseFloat(interest_rate.toFixed(2)),
    tenure,
    reason: `Risk assessment successful. Score: ${score}/100. AI Forensics verified.`,
    score
  };
};

module.exports = { evaluateRisk };
