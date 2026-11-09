// Product name lives here so the working name can be changed in one place.
export const PRODUCT_NAME = "Maestro";

// Public copy is grounded in source-materials/01–07. Example conversations are
// adapted illustrations, not customer quotations or evidence of medical results.
export const content = {
  meta: { title: `${PRODUCT_NAME} — Build your next moonshot` },
  nav: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Your partner", href: "#observer" },
    { label: "Your ownership", href: "#ownership" },
    { label: "First release", href: "#first-release" },
  ],
  hero: {
    mission: "Everyone can build their moonshot.",
    heading: ["Build the right product,", "the right way.", "Autonomously."],
    description: `${PRODUCT_NAME} is your partner in turning an idea into a working application. Talk through the problem, decide what matters, and let it take care of the build.`,
    vision:
      "Our ambition: anyone who can describe a problem can build a product they understand and own.",
    primary: "Join the first release",
    secondary: "See how it works",
    releaseNote: "First release planned for 30 November 2026",
    proofs: [
      "No coding required",
      "Built on your server",
      "Your knowledge stays yours",
    ],
  },
  heroDemo: {
    title: "Your idea, moving forward.",
    caption: "Illustrative conversation · based on a real project",
    observerLabel: "Observer",
    userLabel: "You",
    recommendationLabel: "Recommended",
    yourDecision: "Your decision",
    projectLabel: "Video claim checker",
    previewLabel: "Illustrative preview",
    readyLabel: "Works, ready to use",
    resetLabel: "Replay the conversation",
    approvalLabel: "Direction approved",
    buildMessage: "Direction approved. Planning next.",
    labels: {
      you: "You",
      observer: "Observer",
      project: "Your project",
      status: "Build status",
      action: "Your decision",
    },
    user: "I want to help people check the claims in YouTube videos.",
    observer:
      "What would help them most: a quick answer beside the video, or a detailed report elsewhere?",
    recommendation:
      "Start with a short answer beside the video, with evidence they can explore.",
    reply: "Yes. Keep it simple.",
    approved: "Direction agreed. I’ll work out the details.",
    statuses: ["Conversation", "Shape", "Build", "Check"],
    phase: "Your direction, ready to review",
  },
  problem: {
    title: "Building software is solved. Solving problems is not.",
    items: [
      {
        title: "Is this the right thing to build?",
        description:
          "An idea is a starting point. Getting clear on the problem, the person and the smallest useful version takes a different kind of conversation.",
      },
      {
        title: "How does a prototype become a product?",
        description:
          "A promising first screen can leave you with a long list of fixes, unfamiliar decisions and no clear path to something people can use.",
      },
      {
        title: "Will it really belong to me?",
        description:
          "Your product should not depend on keeping everything inside someone else’s platform. Your work, your data and your decisions should remain yours.",
      },
    ],
  },
  example: {
    title: "From “I have an idea” to “it works.”",
    description:
      "Follow a real founder project: a tool that helps people check claims in YouTube videos without leaving the video to read a long report.",
    caption:
      "An illustrated walkthrough of the first-release workflow. Conversations are adapted from the project; screens are illustrative.",
    stepLabel: "Step",
    next: "Next step",
    previous: "Previous step",
    steps: [
      {
        title: "Start with the problem",
        description:
          "The Observer asks who needs this, what they have tried and what a useful result would look like. It challenges the idea, too: would an existing chat tool be enough?",
        role: "You",
        message:
          "They want a short answer while watching, not another tool and a long report.",
      },
      {
        title: "Decide what people will see",
        description: `${PRODUCT_NAME} works out the details and brings the visible choices to you: a small set of claims, clear verdicts and a spending limit. You approve or change them.`,
        role: "Observer",
        message:
          "I recommend a short verdict panel beside the video. People can open the evidence when they want more detail.",
      },
      {
        title: "Try the shape of your idea",
        description:
          "Open a private, clickable mockup. Explore the video page, the check button and the verdict panel. Comment on what should change before the build begins.",
        role: "You",
        message:
          "This is the experience I had in mind. Let’s build this version.",
      },
      {
        title: "Approve a clear proposal",
        description:
          "Review what will be built, where it will run, what it may cost and the trade-offs. The decisions that matter are explained in everyday language.",
        role: "Observer",
        message:
          "Here is the plan, the running cost and what needs your approval — all in one place.",
      },
      {
        title: "Let the preparation happen",
        description: `${PRODUCT_NAME} records the product’s intent, plans the work, prepares the application and its safeguards, and creates a private home for your code.`,
        role: "Observer",
        message:
          "The preparation is under way. Your plan and decisions are saved with your project.",
      },
      {
        title: "Set the boundaries once",
        description:
          "Approve access, a public address if needed, any data sent to an AI service and permitted spending. Private service keys go directly onto your server, never into the conversation.",
        role: "Observer",
        message:
          "Before I connect a paid service, here is what it needs, what data it receives and the limit you can set.",
      },
      {
        title: "Build, review and check",
        description:
          "The application is built piece by piece. Each piece goes through research, planning, independent reviews and automatic tests, including checks in a real browser.",
        role: "Observer",
        message:
          "The next piece is being checked. I’ll come back if a decision needs you.",
      },
      {
        title: "Works, ready to use",
        description: `${PRODUCT_NAME} checks the whole application before handing it over. You start using it and report anything you notice; you do not have to run a manual test checklist.`,
        role: "Observer",
        message:
          "Works, ready to use. Your application is on your server, with the decisions and work behind it saved for you.",
      },
    ],
    preview: {
      title: "A clearer answer, beside the video.",
      caption: "Illustrative mockup · no real video or claim is being checked",
      button: "Check this video",
      resultTitle: "A short verdict. Evidence you can explore.",
      resultDescription:
        "The planned experience brings the main claims and supporting sources into one panel, so people can see what an answer is based on.",
      sourceLabel: "Supporting sources · preview only",
      reset: "Reset the preview",
    },
  },
  observer: {
    title: "A partner who remembers the whole story.",
    memoryExample:
      "You wanted the short answer beside the video. I’ve kept that at the heart of this version.",
    memoryLabel: "Your earlier decision, remembered",
    notificationTitle: "Your decision is needed",
    notificationMessage:
      "The preview is ready. I recommend keeping the verdict beside the video.",
    plainExample: "“Here’s what matters. Here’s what I recommend.”",
    description:
      "Meet the Observer: your point of contact from the first conversation to the finished application. Talk in the Claude app on your computer or phone. It keeps the work understandable and your intent in view.",
    features: [
      {
        title: "Plain language. Useful answers.",
        description:
          "The conclusion comes first. You see what is happening, what it means and whether anything needs your attention.",
      },
      {
        title: "A recommendation, not homework.",
        description:
          "When a decision needs you, the Observer explains the choice, recommends a direction and offers a reply you can accept or change.",
      },
      {
        title: "Your context, kept with you.",
        description:
          "Its lasting memory lives on your server. Your reasons, preferences and decisions stay available for the next conversation.",
      },
      {
        title: "A nudge when you are needed.",
        description:
          "A question that needs your decision can reach your phone as a notification. You can step away while the work continues.",
      },
    ],
  },
  principles: {
    title: "Less to manage. More to make possible.",
    description:
      "Focus on the outcome, not the output. These are the boundaries your partner works within.",
    items: [
      {
        title: "Show what matters to the decision.",
        description:
          "See the choices that shape your application and a clear account of progress. The underlying details are worked out and recorded for you.",
      },
      {
        title: "Ask before crossing a boundary.",
        description:
          "Installations, spending, sharing data, publishing, accounts and irreversible actions require your approval. You know what you are agreeing to.",
      },
      {
        title: "Check the whole thing.",
        description: `${PRODUCT_NAME} reviews and tests the application before saying it is ready. Your job is to use it and tell your partner what you notice.`,
      },
      {
        title: "Leave a trail you can return to.",
        description:
          "The original intent, research, plans, reviews and decisions are kept with your project. You can ask why something was done and revisit it later.",
      },
      {
        title: "First, find out whether it is worth building.",
        description:
          "Planned for a later release: deeper research and assumption tests, with a reasoned recommendation to build, change direction or stop. Choosing not to build can be a useful result.",
        planned: true,
      },
    ],
  },
  ownership: {
    title: "Your moonshot. On your terms.",
    description:
      "Your proprietary knowledge belongs to you. Your application, its history and the knowledge behind it should be yours to keep — even if you stop using our product.",
    items: [
      {
        title: "Your server",
        description:
          "Your application and the Observer’s memory run on a server you control, paid for directly with your provider.",
      },
      {
        title: "Your code and decisions",
        description:
          "The code and project history live in your private repository. The plans, research and reasons behind each change remain available to you.",
      },
      {
        title: "Your subscription",
        description:
          "You sign in with your own Claude plan and pay your provider directly. Any additional paid services need your approval.",
      },
      {
        title: "Your freedom to leave",
        description:
          "Keep your code, data, memory and decision history when you leave. The server and services you choose remain in your own accounts.",
      },
    ],
    claudeNote: `${PRODUCT_NAME} runs the official Claude Code on your own server, signed in with your own Claude plan. Your plan’s usage limits apply.`,
  },
  comparison: {
    title: "A different starting point.",
    description:
      "The relationship is the difference: a partner that keeps your intent in view and carries the work through to an application you own.",
    note: "A comparison of typical approaches, not every product in each category. Individual tools vary.",
    columns: ["Prototype builders", "Agents for developers", PRODUCT_NAME],
    rows: [
      {
        label: "Who it starts with",
        values: [
          "Someone exploring an app idea",
          "Someone comfortable with software development",
          "A nontechnical person with a problem to solve",
        ],
      },
      {
        label: "How you work",
        values: [
          "Prompt, preview and refine",
          "Guide an agent through a development workflow",
          "Talk to a partner; decide what matters to your product",
        ],
      },
      {
        label: "The path to use",
        values: [
          "A quick prototype, then further work",
          "Development tools and automation",
          "A planned build, reviews and checks before handover",
        ],
      },
      {
        label: "Where it belongs",
        values: [
          "Often starts on the provider’s platform",
          "Depends on your development setup",
          "Your server, private code and decision history",
        ],
      },
      {
        label: "Before the build",
        values: [
          "Explore the idea through a preview",
          "Define or supply the work to be done",
          "A focused product conversation and a mockup to approve",
        ],
      },
    ],
  },
  release: {
    title: "The first chapter of your next idea.",
    date: "30 November 2026",
    label: "Planned first release",
    description:
      "Designed for nontechnical people ready to take an idea through to a working application. These are the capabilities planned to be available in the first release.",
    items: [
      "One-command installation on your own server, with guided sign-ins and setup checks.",
      "The Observer as your conversational partner, with memory on your server and phone notifications.",
      "A focused product conversation that challenges assumptions and clarifies the first version.",
      "Visible product choices and a private, clickable mockup for your approval.",
      "Clear approval of the plan, costs, access and any sharing of data.",
      "Building in stages, with research, independent reviews and automatic browser checks.",
      "A working application handed over without asking you to run manual tests.",
      "Your own server, private code, Claude plan, memory and full decision history.",
    ],
  },
  roadmap: {
    title: "A clear first step. A bigger direction.",
    nextTitle: "Coming next",
    nextDescription:
      "The next improvements will follow the friction owners encounter. These are directions, without committed dates.",
    next: [
      "Make it easier to explain what you have in mind.",
      "Close the gap between your intent and the result.",
      "Make questions and progress easier to understand.",
      "Make changes after handover feel less daunting.",
      "Make running your own server more approachable.",
    ],
    laterTitle: "Further ahead",
    laterDescription:
      "Planned directions, not first-release capabilities. The deeper Discovery process and autonomous upkeep belong here.",
    later: [
      "Deeper Discovery: real experiences, alternatives, risks and tests, ending in a reasoned build, change or stop recommendation.",
      "A shorter path for simple ideas that do not need a full strategy.",
      "Autonomous maintenance after your application is handed over.",
      "Support for product managers and their teams.",
      "Improve your application against a goal you set, by examining use, testing ideas and checking the outcome.",
      `Help ${PRODUCT_NAME} improve automatically across projects while respecting owners’ control of project data.`,
    ],
  },
  audience: {
    title: "You know your world. Bring that.",
    forTitle: "Made for you if…",
    for: [
      "You are a solo founder with an idea you want to bring to life.",
      "You know a field well and see a problem software could help solve.",
      "You run a small business and need an application shaped around your work.",
      "You want to make the product decisions and own what gets built.",
    ],
    notTitle: "Consider another approach if…",
    not: [
      "Your priority is the fastest possible first screen.",
      "You want a drag-and-drop editor for building every part yourself.",
      "You want us to host and own the application’s infrastructure.",
      "You are looking for a developer’s coding workspace.",
    ],
  },
  faq: {
    title: "A few things you might be wondering.",
    items: [
      {
        question: "Do I need to know how to code?",
        answer:
          "No. You do not need to know what a PR, Node, TypeScript or VPS is. You describe the problem and make the choices that affect your product. Setup does involve pasting an installation command into your server provider’s browser terminal and signing in to your own accounts; the installer provides checks and guidance.",
      },
      {
        question: "What will it cost?",
        answer: `You pay for your own server and Claude subscription directly with their providers. Your application may need additional paid services, which require your approval and an agreed limit. ${PRODUCT_NAME} pricing is to be announced. Your Claude plan’s usage limits apply.`,
      },
      {
        question: "Where are my data, code and project history?",
        answer:
          "Your application data and the Observer’s memory live on your server. Your code and project history live in your own private repository. If a feature needs to send data to an AI or other external service, the Observer asks for your approval and explains what will be shared.",
      },
      {
        question: `What happens if I stop using ${PRODUCT_NAME}?`,
        answer:
          "Your code, application data, memory and decision history remain yours. Your server and other services are in your accounts, so you can keep using or developing your application. Their ongoing charges remain your responsibility.",
      },
      {
        question: "How long does it take to start a project?",
        answer:
          "Think in terms of an evening to get a project started. In the founder’s example, the initial product conversation took about 20 minutes, followed by shaping, a mockup and approvals. That is an example, not a promised turnaround. The time to finish an application depends on what you are building.",
      },
      {
        question: "Will it tell me whether my idea is worth building?",
        answer:
          "The first release includes a focused conversation and questions that challenge your assumptions. Full Discovery — deeper research, assumption tests and a reasoned build, change or stop recommendation — is planned for a later release.",
      },
      {
        question:
          "Does the first release maintain my application automatically?",
        answer:
          "No. Autonomous maintenance and improving an application based on how people use it are future directions. The first release focuses on taking your idea through to a checked, working application.",
      },
    ],
  },
  waitlist: {
    title: "What will your moonshot be?",
    description:
      "Join the waiting list for the first release. Bring the problem you understand and the idea you want to explore.",
    label: "Email address",
    placeholder: "you@example.com",
    button: "Join the first release",
    demoNote:
      "Form preview only. Sign-ups are not open here yet; nothing is sent or saved.",
    success:
      "Preview complete. No details were sent or saved. The waiting list still needs to be connected before you can join.",
    error: "Enter a valid email address to preview the form.",
    todos: [
      "[TODO: Connect the waiting list before accepting sign-ups.]",
      "[TODO: Add the privacy notice and data controller details before collecting email addresses.]",
    ],
  },
  footer: {
    tagline: "Everyone can build their moonshot.",
    backToTop: "Back to top",
  },
  ui: {
    mainNav: "Main navigation",
    mobileNav: "Mobile navigation",
    skipLink: "Skip to main content",
    menuOpen: "Open navigation",
    menuClose: "Close navigation",
    themeLight: "Switch to light theme",
    themeDark: "Switch to dark theme",
    firstRelease: "First release",
    planned: "Planned for later",
    allYours: "All yours",
    previewDemo: "Illustrative demo",
    showAnswer: "Show answer",
    hideAnswer: "Hide answer",
    emailInvalid: "Enter a valid email address.",
    emailRequired: "Enter your email address.",
    loading: "Checking…",
    themeToggle: "Switch color theme",
    backToTop: "Back to top",
    stepOf: "of",
  },
};
