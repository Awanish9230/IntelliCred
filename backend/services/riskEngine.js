/**
 * Rule-based risk engine
 * Inputs: income, age, location, LLM output, policy rules
 */
const evaluateRisk = (customerData, llmOutput) => {
  const { age, location } = customerData;
  const { income, risk_flags } = llmOutput;

  const minIncomeThreshold = 20000;
  
  if (age < 21) {
    return {
      eligible: false,
      reason: 'Applicant is below the minimum age of 21.',
      loan_amount: 0,
      interest_rate: 0,
      tenure: []
    };
  }

  if (income < minIncomeThreshold) {
    return {
      eligible: false,
      reason: `Income is below the minimum threshold of ${minIncomeThreshold}.`,
      loan_amount: 0,
      interest_rate: 0,
      tenure: []
    };
  }

  // Calculate Risk Score
  // Base 100, -10 for every risk flag, +10 for income > 50000
  let riskScore = 100;
  if (risk_flags && risk_flags.length > 0) {
    riskScore -= (risk_flags.length * 15);
  }
  if (income > 50000) {
    riskScore += 20;
  }

  if (riskScore < 50) {
    return {
      eligible: false,
      reason: 'Application rejected due to high risk flags in the transcript.',
      loan_amount: 0,
      interest_rate: 0,
      tenure: []
    };
  }

  // Generate Offer
  const amountMultiplier = riskScore >= 100 ? 5 : 3;
  const loan_amount = income * amountMultiplier;
  
  const interest_rate = riskScore >= 100 ? 8.5 : 12.0;
  const tenure = [12, 24, 36, 48];

  return {
    eligible: true,
    loan_amount,
    interest_rate,
    tenure,
    reason: `Approved with a risk score of ${riskScore}.`
  };
};

module.exports = { evaluateRisk };
