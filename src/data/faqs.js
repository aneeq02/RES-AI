export const FAQ_GROUPS = [
  {
    title: "Getting started",
    items: [
      {
        q: "How do res agents integrate with my tools?",
        a: "Our agents connect directly with your existing stack, Slack, Gmail, HubSpot, Notion and more. Setup takes less than 5 minutes and needs no engineering help.",
      },
      {
        q: "Do I need to know how to code?",
        a: "Zero coding required. If you can send a message or a voice note, you can manage a res agent.",
      },
      {
        q: "Can I customize the agent's personality?",
        a: "Yes. You define the tone of voice, strictness, and creativity levels, and add examples of your best work so every output matches your brand.",
      },
    ],
  },
  {
    title: "Security & data",
    items: [
      {
        q: "Is my data secure?",
        a: "Absolutely. We use enterprise-grade encryption in transit and at rest, and we never train public models on your proprietary business data.",
      },
      {
        q: "Who can see what my agents produce?",
        a: "Only people you invite to your workspace. You can set approval steps so nothing is sent or published without a human sign-off.",
      },
    ],
  },
  {
    title: "Plans & billing",
    items: [
      {
        q: "Which agents are included in my plan?",
        a: "Every plan includes each specialist as they launch. Buddy, our business strategist, is live now, and the rest of the team follows one at a time at no extra cost. Longer plans simply lower the monthly price and add onboarding extras.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. Every plan comes with a 14-day money-back guarantee, and you can cancel renewal from your account at any time.",
      },
      {
        q: "Do you offer CRM or website work separately?",
        a: "Yes, our CRM and Website Management services can be bought on their own or alongside an agent plan. Contact us for a quote.",
      },
    ],
  },
];

// Flat list for places that just need a few questions.
export const FAQS = FAQ_GROUPS.flatMap((g) => g.items);
