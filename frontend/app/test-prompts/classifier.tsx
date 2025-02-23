export const classifyPrompt = (text: string) => {
  const keywords = {
    'Billing': ['payment', 'credit card', 'charge', 'refund', 'bill', 'price', 'subscription', 'upgrade'],
    'New Customer': ['sign up', 'new', 'start', 'pricing', 'plans', 'trial'],
    'Report an Issue': ['error', 'issue', 'problem', 'bug', 'wrong', 'broken', 'crash']
  };

  let maxMatches = 0;
  let bestCategory = 'Unknown';

  Object.entries(keywords).forEach(([category, words]) => {
    const matches = words.filter(word =>
      text.toLowerCase().includes(word.toLowerCase())
    ).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  });

  return bestCategory;
};
