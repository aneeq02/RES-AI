// AI specialists. `img` is optional — an agent without artwork renders a role-icon avatar.
// `icon` is a lucide-react icon name resolved in components/agents/AgentAvatar.jsx.
export const members = [
  {
    id: "soshie",
    name: "Soshie",
    role: "Social Media Manager",
    img: "/agents/soshie.webp",
    icon: "Megaphone",
    color: "from-fuchsia-500 to-pink-500",
    description:
      "Soshie automates your content calendar, engages with followers, and analyzes trends to grow your brand's presence 24/7.",
    skills: ["Content calendars", "Captions & hashtags", "Trend reports"],
    prompt: "Plan my next 14 days of Instagram content",
  },
  {
    id: "cassie",
    name: "Cassie",
    role: "Customer Support",
    img: "/agents/cassie.webp",
    icon: "Headphones",
    color: "from-blue-500 to-indigo-500",
    description:
      "Cassie crafts expertly tailored responses to customer queries while protecting your brand's voice and customer relationships.",
    skills: ["Inbox triage", "Brand-safe replies", "Help-center drafts"],
    prompt: "Reply to today's unanswered customer emails",
  },
  {
    id: "dexter",
    name: "Dexter",
    role: "Data Analyst",
    img: "/agents/dexter.webp",
    icon: "ChartLine",
    color: "from-orange-400 to-red-500",
    description:
      "Dexter processes complex data sets to provide actionable business intelligence and growth forecasts.",
    skills: ["KPI summaries", "Forecasting", "Anomaly alerts"],
    prompt: "Summarize last week's KPIs and flag what changed",
  },
  {
    id: "emmie",
    name: "Emmie",
    role: "Email Marketer",
    img: "/agents/emmie.webp",
    icon: "Mail",
    color: "from-amber-400 to-orange-600",
    description:
      "Emmie designs high-converting email sequences and manages subscriber segments to maximize ROI.",
    skills: ["Drip sequences", "Segmentation", "A/B subject lines"],
    prompt: "Write a 3-email welcome sequence for new subscribers",
  },
  {
    id: "gigi",
    name: "Gigi",
    role: "Personal Growth Coach",
    img: "/agents/gigi.webp",
    icon: "Sprout",
    color: "from-green-400 to-emerald-600",
    description:
      "Gigi helps optimize your daily routines and focuses on personal productivity and mindset coaching.",
    skills: ["Habit plans", "Weekly reviews", "Focus blocks"],
    prompt: "Build me a focused morning routine",
  },
  {
    id: "penn",
    name: "Penn",
    role: "Copywriter",
    img: "/agents/penn.webp",
    icon: "PenLine",
    color: "from-emerald-400 to-green-600",
    description:
      "Penn writes persuasive copy for ads, websites, and blogs that resonates with your target audience.",
    skills: ["Ad copy", "Landing pages", "Blog posts"],
    prompt: "Write three ad headlines for our summer sale",
  },
  {
    id: "buddy",
    name: "Buddy",
    role: "Business Strategist",
    img: "/agents/buddy.webp",
    icon: "Compass",
    color: "from-sky-400 to-cyan-500",
    description:
      "Buddy provides deep business insights, market analysis, and growth strategies to keep you a step ahead.",
    skills: ["Market analysis", "Competitor research", "Growth plans"],
    prompt: "Compare our pricing against three competitors",
  },
  {
    id: "milli",
    name: "Milli",
    role: "Sales Strategist",
    img: "/agents/milli.webp",
    icon: "Handshake",
    color: "from-pink-500 to-rose-600",
    description:
      "Milli turns business insights into cold-call scripts, outreach sequences, and persuasive closing tactics.",
    skills: ["Cold outreach", "Call scripts", "Objection handling"],
    prompt: "Draft a cold email for B2B SaaS founders",
  },
  {
    id: "seomi",
    name: "Seomi",
    role: "SEO Specialist",
    img: "/agents/seomi.webp",
    icon: "Search",
    color: "from-lime-400 to-green-500",
    description:
      "Seomi boosts your search rankings through keyword research, on-page optimization, and backlink strategy.",
    skills: ["Keyword research", "On-page SEO", "Content briefs"],
    prompt: "Find 10 keywords we can rank for this quarter",
  },
  {
    id: "commet",
    name: "Commet",
    role: "eCommerce Specialist",
    img: "/agents/commet.webp",
    icon: "ShoppingBag",
    color: "from-orange-500 to-orange-700",
    description:
      "Commet optimizes your online store, manages inventory alerts, and analyzes buyer behavior.",
    skills: ["Product listings", "Inventory alerts", "Cart recovery"],
    prompt: "Rewrite our top 5 product descriptions",
  },
  {
    id: "scouty",
    name: "Scouty",
    role: "Recruiter",
    img: "/agents/scouty.webp",
    icon: "UserSearch",
    color: "from-teal-400 to-blue-500",
    description:
      "Scouty identifies top talent and automates the initial screening process for your open positions.",
    skills: ["CV screening", "Job posts", "Interview scheduling"],
    prompt: "Shortlist the best 5 applicants for our designer role",
  },
  {
    id: "vizzy",
    name: "Vizzy",
    role: "Virtual Assistant",
    img: "/agents/vizzy.webp",
    icon: "CalendarCheck",
    color: "from-yellow-300 to-orange-400",
    description:
      "Vizzy handles your scheduling, emails, and administrative tasks so you can focus on big-picture goals.",
    skills: ["Scheduling", "Inbox zero", "Meeting notes"],
    prompt: "Build my schedule for tomorrow",
  },
];

export const getMember = (id) => members.find((m) => m.id === id);
