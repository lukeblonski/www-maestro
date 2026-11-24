// Product name lives here so the working name can be changed in one place.
export const PRODUCT_NAME = "Maestro";

// Page copy follows the mockup accepted by the owner
// (context/changes/poprawki-tresci-strony/makieta/makieta.html, version 2), built on
// the layout of context/changes/przebudowa-strony/makieta/makieta.html.

export type ChapterPoint = { title: string; text: string; next?: string };
export type Chapter = {
  id: string;
  label: string;
  indexLabel: string;
  quiet: string;
  heading: string;
  lead?: string;
  soon?: boolean;
  points: ChapterPoint[];
};
export type FaqItem = { question: string; answer: string; emphasis?: string };
export type ComparisonRow = { label: string; builders: string; maestro: string; soon?: boolean };

const chapters: Chapter[] = [
  {
    id: "observer",
    label: "Your partner",
    indexLabel: "Your partner",
    quiet: "This is not another code monkey.",
    heading: "This is your partner in building meaningful things.",
    lead: `${PRODUCT_NAME} offloads you from everything AI does better, so you can focus on what only humans do best.`,
    points: [
      {
        title: "You decide what gets built.",
        text: `${PRODUCT_NAME} helps you describe how your idea should work, then helps you choose the technology, the infrastructure and everything else it takes.`,
      },
      {
        title: "Your idea, translated for the AI agents that build it.",
        text: `You and ${PRODUCT_NAME} agree on what you want to build. ${PRODUCT_NAME} turns that into precise work for AI agents and keeps them on track until it is done.`,
      },
      {
        title: "Autonomy whenever it makes sense.",
        text: `${PRODUCT_NAME} gathers everything it needs for the build up front, so it involves you as little as possible once the work starts. It can even configure the external services your product needs, once you give it access.`,
      },
      {
        title: "Plain language, always.",
        text: `${PRODUCT_NAME} talks to you in everyday words, so you understand everything and know exactly what is happening.`,
      },
      {
        title: "It remembers.",
        text: `${PRODUCT_NAME} remembers your decisions and the reasons behind them for as long as you want. Its entire memory is stored on your server, so nothing gets lost between sessions.`,
      },
    ],
  },
  {
    id: "control",
    label: "You decide",
    indexLabel: "You decide",
    quiet: `${PRODUCT_NAME} does the work.`,
    heading: "You make the calls.",
    points: [
      {
        title: "Nothing important without your approval.",
        text: "Installations, spending, sharing data, publishing, new accounts and anything that cannot be undone wait for your yes.",
      },
      {
        title: "Every question comes with a recommendation.",
        text: `${PRODUCT_NAME} explains what you are agreeing to in plain language and tells you which answer it recommends and why, so you can make informed decisions.`,
      },
      {
        title: "Questions come to your phone.",
        text: `When ${PRODUCT_NAME} needs your decision, you get a notification in the Claude app, on your computer or phone.`,
      },
      {
        title: "Guardrails built in.",
        text: `${PRODUCT_NAME} works inside built-in safeguards. It keeps away from your passwords and keys, never changes files you protect, and never bends a test just to make a change pass.`,
        next: "Setting your own guardrails coming soon",
      },
    ],
  },
  {
    id: "deploy",
    label: "From build to deploy",
    indexLabel: "Build to deploy",
    quiet: "Building is half the job.",
    heading: `${PRODUCT_NAME} puts your product in front of your users.`,
    points: [
      {
        title: "See it working first.",
        text: "As each part is finished, you can open a private preview and try your product before anyone else does.",
      },
      {
        title: "Deployed for you.",
        text: `${PRODUCT_NAME} not only helps you build your product. It deploys it, so your users can reach it.`,
      },
      {
        title: "Released when you say so.",
        text: "Nothing goes public without your approval.",
      },
      {
        title: "What works keeps working.",
        text: `Before any change reaches your users, ${PRODUCT_NAME} checks that the main things your product already does still work, the way your users use them.`,
      },
    ],
  },
  {
    id: "after-launch",
    label: "After launch",
    indexLabel: "After launch",
    quiet: "A product is never finished,",
    heading: `so ${PRODUCT_NAME} stays.`,
    soon: true,
    points: [
      {
        title: "It looks after your product.",
        text: `${PRODUCT_NAME} keeps watching your product and, when something goes wrong, proactively fixes it, and lets you know every time it does.`,
      },
      {
        title: "It helps your product grow.",
        text: `${PRODUCT_NAME} helps you shape a product strategy, gathers feedback from your users and your tools, and implements changes, improvements and new features, while asking as little of your time as possible.`,
      },
    ],
  },
  {
    id: "ownership",
    label: "On your terms",
    indexLabel: "On your terms",
    quiet: "Your product.",
    heading: "On your terms.",
    points: [
      {
        title: "You never touch the code.",
        text: "You don’t need to know what a PR, a merge, a ticket, an API, a skill or an md file is. All you need is the will to create!",
      },
      {
        title: `${PRODUCT_NAME} is always on.`,
        text: `${PRODUCT_NAME} runs 24/7 on a separate server, so it has no access to the data on your computer. Your product is built there too. The code, the documentation and ${PRODUCT_NAME}’s knowledge stay with you and are always yours.`,
      },
      {
        title: "No new app to learn.",
        text: `You talk to ${PRODUCT_NAME} in the Claude app on your computer or phone. Not another clunky drag-and-drop tool or cluttered interface.`,
        next: "Codex and others coming soon",
      },
      {
        title: "Your own subscription.",
        text: `${PRODUCT_NAME} runs the official Claude Code on your own server, signed in with your own Claude plan. No extra AI fees: ${PRODUCT_NAME} only uses what your Claude subscription already includes.`,
        next: "Codex and OpenCode coming soon",
      },
    ],
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    label: "Made for",
    builders: "Anyone who wants to build an app by chatting with AI",
    maestro: "Anyone who has an idea for a product but doesn’t want to deal with the build details",
  },
  {
    label: "What you need to know",
    builders: "How to prompt, maintain and grow",
    maestro: `The thing you want to build. ${PRODUCT_NAME} helps you with the rest`,
  },
  {
    label: "Who steers the build",
    builders: "You, prompt by prompt",
    maestro: `${PRODUCT_NAME}. You decide what your product does`,
  },
  {
    label: "How it talks to you",
    builders: "Prompt, answer, prompt",
    maestro: "Like a partner who remembers everything you agreed, discussed and decided, in plain language without technical jargon",
  },
  {
    label: "Where your product lives",
    builders: "Often on the builder’s platform",
    maestro: "On your own server. The code, documentation and knowledge are yours",
  },
  {
    label: "After launch",
    builders: "Optional monitoring and AI fixes on some plans, which you need to oversee on your own",
    maestro: "Fixes issues and helps your product grow. You approve its decisions and add your input when you want",
    soon: true,
  },
];

const faqItems: FaqItem[] = [
  {
    question: "Do I need to know how to code?",
    answer: `No. To set up ${PRODUCT_NAME}, paste an installation command into your server provider’s browser terminal and sign in to your own accounts. The installer provides checks and guidance.`,
  },
  {
    question: "What do I need to start?",
    answer: "The Claude app, an active Claude subscription and a server. The installer guides you through setting up the server.",
  },
  {
    question: "What will it cost?",
    answer:
      "You pay for your own server and Claude subscription directly with their providers. Your application may need additional paid services, which require your approval and an agreed limit. Your Claude plan’s usage limits apply.",
    emphasis: `We don’t charge you anything for ${PRODUCT_NAME}.`,
  },
  {
    question: "When can I start?",
    answer: "Join the waiting list and we’ll email you as soon as the first release is ready.",
  },
  {
    question: `Does ${PRODUCT_NAME} do anything without asking me?`,
    answer: `No. Installations, spending, sharing data, publishing, new accounts and anything that cannot be undone need your approval first. ${PRODUCT_NAME} explains what you are agreeing to.`,
  },
  {
    question: "Where are my data, code and project history?",
    answer: `Your application data and ${PRODUCT_NAME}’s memory live on your server. Your code and project history live in your own private repository. If a feature needs to send data to an AI or other external service, ${PRODUCT_NAME} asks for your approval and explains what will be shared.`,
  },
  {
    question: `Can ${PRODUCT_NAME} work on a product I already have?`,
    answer: `Yes. ${PRODUCT_NAME} can take over an existing project: it learns how your product works, protects what already works with checks, and then keeps building with you.`,
  },
  {
    question: "What’s under the hood?",
    answer: `${PRODUCT_NAME} is the official Claude Code running on your own server. Behind it, a set of steps turns what you agree on into a written plan, builds it with AI agents, reviews and tests every change, and deploys it. ${PRODUCT_NAME} is the one you talk to: it keeps your project’s memory, asks you only what needs your decision, and explains everything in plain language.`,
  },
  {
    question: `What happens if I stop using ${PRODUCT_NAME}?`,
    answer:
      "Your code, application data, memory and decision history remain yours. Your server and other services are in your accounts, so you can keep using or developing your application. Their ongoing charges remain your responsibility.",
  },
  {
    question: "Will it tell me whether my idea is worth building?",
    answer:
      "The first release includes a focused conversation and questions that challenge your assumptions. Full Discovery, with deeper research, assumption tests and a reasoned build, change or stop recommendation, is planned for a later release.",
  },
  {
    question: "Does the first release maintain my application automatically?",
    answer:
      "Not yet. Looking after your product and helping it grow are coming soon. The first release focuses on taking your idea through to a working application.",
  },
];

export const content = {
  meta: {
    title: `${PRODUCT_NAME} — You bring the idea. ${PRODUCT_NAME} builds it.`,
    description: `Your partner in building the right product, the right way. You agree on what to build. ${PRODUCT_NAME} takes care of the rest.`,
  },
  hero: {
    mission: "Everyone can build their moonshot.",
    heading: ["You bring the idea.", `${PRODUCT_NAME} builds it.`],
    lead: `Your partner in building the right product, the right way. You agree on what to build. ${PRODUCT_NAME} takes care of the rest.`,
    primary: "Join the first release",
    secondary: "See how it’s different",
  },
  chapters,
  comparison: {
    label: `Why ${PRODUCT_NAME}`,
    title: "A different approach to building.",
    lead: "Writing code is solved. Solving problems is not.",
    ariaLabel: `${PRODUCT_NAME} compared with prompt-to-app builders`,
    columns: { builders: "Prompt-to-app builders", maestro: PRODUCT_NAME },
    rows: comparisonRows,
  },
  faq: {
    label: "FAQ",
    title: ["A few things", "you might be wondering."],
    items: faqItems,
  },
  waitlist: {
    title: "What will your moonshot be?",
    description:
      "Join the waiting list for the first release. Bring the problem you understand and the idea you want to explore.",
    label: "Email address",
    placeholder: "you@example.com",
    button: "Join the first release",
    sending: "Joining…",
    success: "You're on the waiting list for the first release. Thank you!",
    failure: "Your sign-up didn't go through. Please try again.",
    error: "Enter a valid email address to join the waiting list.",
  },
  footer: {
    tagline: "Everyone can build their moonshot.",
    backToTop: "Back to top",
  },
  ui: {
    skipLink: "Skip to main content",
    chapters: "Chapters",
    comingSoon: "Coming soon",
    brandHome: `${PRODUCT_NAME}, back to top`,
  },
};
