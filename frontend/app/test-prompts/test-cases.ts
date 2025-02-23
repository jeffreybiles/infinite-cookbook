export type TestCase = {
  text: string;
  expectedCategory: string;
  result: string | null;
}

export const testCases: TestCase[] = [
  {
    text: "I need to update my credit card information",
    expectedCategory: "Billing",
    result: null
  },
  {
    text: "How do I sign up for your service?",
    expectedCategory: "New Customer",
    result: null
  },
  {
    text: "The system is giving me an error code 404",
    expectedCategory: "Report an Issue",
    result: null
  },
  {
    text: "Can I get a refund for last month's charge?",
    expectedCategory: "Billing",
    result: null
  },
  {
    text: "What are your pricing plans?",
    expectedCategory: "New Customer",
    result: null
  },
  {
    text: "The app keeps crashing when I try to login",
    expectedCategory: "Report an Issue",
    result: null
  },
  {
    text: "I'd like to upgrade my subscription",
    expectedCategory: "Billing",
    result: null
  },
  {
    text: "Is there a free trial available?",
    expectedCategory: "New Customer",
    result: null
  }
];