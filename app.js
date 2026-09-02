const STORAGE_KEY = 'ai-tools-overview-v2';
const BACKUP_PREFIX = `${STORAGE_KEY}-backup-`; // automatic local backups live under this prefix (see listBackups)
const MAX_BACKUPS = 4;
// Bumped whenever the seed catalog is replaced wholesale. A stored library that is still a pristine
// older seed (only seed-### tools, only seed categories, default notes) is upgraded to the new one;
// anything the user added or renamed makes the library non-pristine and it is left alone.
const SEED_VERSION = 2;

const PREVIEW_LIMIT = 5; // tools shown per category before "Show more"

const PRICING = ['Free', 'Freemium', 'Paid', 'Open Source', 'Free / Open Source'];
const FILTERS = ['All', 'Favorites', 'Free', 'Freemium', 'Paid', 'Open Source'];
const KNOWN_WEBSITES = {
  'chatgpt.com': { name: 'ChatGPT', categoryId: 'chat', description: 'General-purpose assistant for writing, analysis, coding, and images.', rating: 5, pricing: 'Freemium', tags: ['general', 'vision'] },
  'claude.ai': { name: 'Claude', categoryId: 'chat', description: 'Thoughtful assistant for analysis, writing, and long documents.', rating: 5, pricing: 'Freemium', tags: ['reasoning', 'writing'] },
  'gemini.google.com': { name: 'Gemini', categoryId: 'chat', description: 'Google’s multimodal AI assistant and workspace companion.', rating: 5, pricing: 'Freemium', tags: ['google', 'multimodal'] },
  'perplexity.ai': { name: 'Perplexity', categoryId: 'research', description: 'Answer engine that searches the web and cites sources.', rating: 5, pricing: 'Freemium', tags: ['search', 'citations'] },
  'midjourney.com': { name: 'Midjourney', categoryId: 'image', description: 'High-quality image generation in a distinctive visual style.', rating: 5, pricing: 'Paid', tags: ['art', 'images'] },
  'runwayml.com': { name: 'Runway', categoryId: 'video', description: 'Runway is building foundational Real-World Intelligence that can understand, simulate and act in the world. We offer products and services built on-top of this intelligence to empower individuals and organizations to do more in the world.', rating: 5, pricing: 'Freemium', tags: ['editing', 'creative'] },
  'elevenlabs.io': { name: 'ElevenLabs', categoryId: 'audio', description: 'Create lifelike speech with our AI voice generator and voice agents platform. Access 5,000+ voices in 70+ languages with secure APIs and SDKs.', rating: 5, pricing: 'Freemium', tags: ['voice', 'speech'] },
  'cursor.com': { name: 'Cursor', categoryId: 'code', description: 'Built to make you extraordinarily productive, agents turn ideas into code. Accelerate development by handing off tasks to Cursor.', rating: 5, pricing: 'Freemium', tags: ['editor', 'agent'] },
  'github.com': { name: 'GitHub Copilot', categoryId: 'code', description: 'GitHub Copilot works alongside you directly in your editor, suggesting whole lines or entire functions for you.', rating: 5, pricing: 'Paid', tags: ['github', 'editor'] },
  'n8n.io': { name: 'n8n', categoryId: 'automation', description: 'n8n is a workflow automation platform that uniquely combines AI capabilities with business process automation, giving technical teams the flexibility of code with the speed of no-code.', rating: 5, pricing: 'Free / Open Source', tags: ['workflows', 'self-hosted'] },
  'zapier.com': { name: 'Zapier', categoryId: 'automation', description: 'Build and scale AI workflows and agents across 9,000+ apps with Zapier—the most connected AI orchestration platform. Trusted by 3 million+ businesses.', rating: 4, pricing: 'Freemium', tags: ['workflows', 'apps'] },
  'make.com': { name: 'Make', categoryId: 'automation', description: 'Visual automation scenarios across services.', rating: 4, pricing: 'Freemium', tags: ['workflows', 'visual'] },
  'notion.so': { name: 'Notion AI', categoryId: 'productivity', description: 'One tool that does it all. Search, generate, analyze, and chat—right inside Notion.', rating: 5, pricing: 'Freemium', tags: ['workspace', 'notes'] },
  'figma.com': { name: 'Figma AI', categoryId: 'design', description: 'Get started faster, find what you’re looking for, and stay in the flow—with AI tools build for your workflows. Sign up for free today and harness the power of Figma AI.', rating: 5, pricing: 'Freemium', tags: ['ui', 'product'] },
  'canva.com': { name: 'Canva AI', categoryId: 'design', description: 'AI-assisted graphics, documents, and presentations.', rating: 5, pricing: 'Freemium', tags: ['design', 'slides'] },
  'comfy.org': { name: 'ComfyUI', categoryId: 'image', description: 'Comfy is the AI creation engine for visual professionals who demand control over every model, every parameter, and every output.', rating: 5, pricing: 'Open Source', tags: ['nodes', 'local'] }
};

const MODEL_QUALITY = {
  // Artificial Analysis Intelligence Index (0-100) and blended cost per task (USD),
  // captured from the LLM API Providers Leaderboard at https://artificialanalysis.ai on 2026-09-01.
  // Consumer products map to the flagship reasoning tier of the model that powers them.
  'chatgpt': { quality: 57, costPerTask: 0.43, poweredBy: 'GPT-5.6 Sol (high) — OpenAI' },
  'claude': { quality: 61, costPerTask: 1.23, poweredBy: 'Claude Opus 5 (high) — Anthropic' },
  'gemini': { quality: 56, costPerTask: 0.40, poweredBy: 'Gemini 3.7 Flash (high) — Google' },
  'grok': { quality: 61, costPerTask: 0.94, poweredBy: 'Grok 4.6 (high) — xAI' },
  'microsoft copilot': { quality: 56, costPerTask: 0.29, poweredBy: 'GPT-5.6 Sol (medium) — via OpenAI' },
  // These two are benchmarked directly as coding agents rather than chat models, on a different
  // suite (DeepSWE, Terminal-Bench, SWE-Atlas-QnA) — see the Coding Agents leaderboard. Scores are
  // not on the same scale as the Intelligence Index above, so they carry their own qualityLabel.
  'cursor': { quality: 38, costPerTask: 0.56, poweredBy: 'Cursor CLI — Composer 2.5 Fast (Cursor’s own model)', qualityLabel: 'Artificial Analysis Coding Agent Index' },
  'github copilot': { quality: 57, costPerTask: 0.43, poweredBy: 'GPT-5.6 Sol (high) — via OpenAI (not agent-benchmarked directly; shown for its default chat model)' }
};

// Star ratings are derived from the AA score where one exists. Each index is scaled against the
// current top of its own leaderboard (captured 2026-09-01), because the two indexes are not on the
// same scale: >=95% of the frontier -> 5 stars, >=85% -> 4, >=70% -> 3, >=55% -> 2, below -> 1.
const QUALITY_FRONTIER = { 'Artificial Analysis Intelligence Index': 63, 'Artificial Analysis Coding Agent Index': 68 };
function starsFromQuality(quality, label) {
  if (quality == null || quality === '' || Number.isNaN(Number(quality))) return null;
  const ratio = Number(quality) / (QUALITY_FRONTIER[label || 'Artificial Analysis Intelligence Index'] || 100);
  return ratio >= 0.95 ? 5 : ratio >= 0.85 ? 4 : ratio >= 0.7 ? 3 : ratio >= 0.55 ? 2 : 1;
}
function syncRating(tool) { const derived = starsFromQuality(tool.quality, tool.qualityLabel); if (derived != null) tool.rating = derived; return tool; }
function ratingIsDerived(tool) { return starsFromQuality(tool.quality, tool.qualityLabel) != null; }

const seedCategories = [
  ['chat', 'AI Chat / Assistants', 'Everyday reasoning, conversations, and multimodal help.', '✦', '#ad67ff', true],
  ['code', 'Code / Development', 'AI-native builders and development companions.', '⌘', '#b16aff', true],
  ['automation', 'Agent Management / Automation / Agents', 'Workflows, orchestration, and autonomous work.', '⚙', '#ff7a45', true],
  ['courses', 'AI Learning Courses', 'AI and IT Learning Ressources', '🎓', '#4fd36b'],
  ['uiux', 'UI/UX Design Inspiration', 'Where should your Agent get inspiration?', '✦', '#e16cff', true],
  ['research', 'Deep Research and Learning-Material', 'Evidence, citations, papers, and deeper discovery.', '⌕', '#4c9dff'],
  ['image', 'Image Generation', 'Visual concepts, images, and creative workflows.', '▧', '#73de37', true],
  ['video', 'Video Generation', 'Video creation, editing, and motion.', '▷', '#f0c51c', true],
  ['creative3d', '3D / Creative', '3D assets, spatial design, and creative experiments.', '◈', '#e16cff'],
  ['audio', 'Audio / Voice', 'Speech, sound, music, and voice synthesis.', '♬', '#f2994a'],
  ['marketing', 'Marketing / SEO', 'Growth, search visibility, and marketing systems.', '⚑', '#f2c827'],
  ['design', 'Design / Presentations', 'Design tools, decks, and visual communication.', '◇', '#f3cb27'],
  ['data', 'Data / Analytics', 'Analysis, dashboards, and business intelligence.', '▥', '#27c7c6'],
  ['writing', 'Writing / Content', 'Drafting, editing, and content systems.', '✎', '#21c9cf'],
  ['productivity', 'Productivity', 'Workspaces, focus, and knowledge management.', '✓', '#79df3f'],
  ['transcription', 'Voice / Transcription', 'Meetings, transcription, and call intelligence.', '◉', '#f4a05b'],
  ['legal', 'Legal / Documents', 'Contracts, document review, and legal research.', '▱', '#59acff']
].map(([id, name, description, icon, color, expanded]) => ({ id, name, description, icon, color, collapsed: false, expanded: Boolean(expanded) }));

const seedEntries = [
  ['chat','Claude','Thoughtful assistant for analysis, writing, and long documents.','https://claude.ai',5,'Freemium','reasoning,writing'],
  ['chat','ChatGPT','General-purpose assistant for writing, analysis, coding, and images.','https://chatgpt.com',5,'Freemium','general,vision'],
  ['chat','Gemini','Google’s multimodal AI assistant and workspace companion.','https://gemini.google.com',5,'Freemium','google,multimodal'],
  ['chat','Grok','Grok is an AI assistant built by SpaceXAI. Chat, create images, write code, and get real-time answers from the web and X.','https://grok.com',4,'Freemium','realtime'],
  ['chat','Kimi','Try Kimi K3 to build playable multiplayer and 3D games, create consulting grade slides, and run parallel tasks with Swarm and Goal to get more work done.','https://www.kimi.com',4,'Freemium','kimi'],
  ['chat','DeepSeek','DeepSeek’s free chat assistant, running its openly released DeepSeek models.','https://chat.deepseek.com',4,'Freemium','chat,deepseek'],
  ['chat','Mistral Vibe','Vibe (formerly Le Chat) is your AI agent for work and code.','https://chat.mistral.ai',4,'Freemium','chat,mistral'],
  ['chat','Qwen','Qwen Studio offers comprehensive functionality spanning chatbot, image and video understanding, image generation, document processing, web search integration, tool utilization, and artifacts.','https://qwen.ai',4,'Freemium','qwen'],
  ['code','Claude Code','Anthropic\'s agentic coding tool for developers. Claude Code understands your codebase, edits files, runs commands, and helps you ship faster.','https://www.anthropic.com/claude-code',5,'Paid','agent,terminal'],
  ['code','Codex','OpenAI’s coding agent for software tasks.','https://openai.com/codex/',5,'Paid','agent,terminal'],
  ['code','Grok build','Grok is an AI assistant built by SpaceXAI. Chat, create images, write code, and get real-time answers from the web and X.','https://grok.com/build',4,'Freemium','grok'],
  ['code','Kimi Code','K3 is now live! Supports up to 1M context tokens. Optimized for coding, 3D gaming, and complex knowledge tasks. Try Kimi K3 in Kimi Code (KFC), the ultimate AI toolkit for developers.','https://www.kimi.com/code',4,'Freemium','kimi'],
  ['code','Cursor','Built to make you extraordinarily productive, agents turn ideas into code. Accelerate development by handing off tasks to Cursor.','https://www.cursor.com',5,'Freemium','editor,agent'],
  ['code','GitHub Copilot','GitHub Copilot works alongside you directly in your editor, suggesting whole lines or entire functions for you.','https://github.com/features/copilot',5,'Paid','github,editor'],
  ['code','Opencode','OpenCode - The open source coding agent.','https://opencode.ai',4,'Freemium','opencode'],
  ['automation','n8n','n8n is a workflow automation platform that uniquely combines AI capabilities with business process automation, giving technical teams the flexibility of code with the speed of no-code.','https://n8n.io',5,'Free / Open Source','workflows,self-hosted'],
  ['automation','Make','Visual automation scenarios across services.','https://www.make.com',4,'Freemium','workflows,visual'],
  ['automation','Zapier','Build and scale AI workflows and agents across 9,000+ apps with Zapier—the most connected AI orchestration platform. Trusted by 3 million+ businesses.','https://zapier.com',4,'Freemium','workflows,apps'],
  ['automation','OpenAI Agents SDK','Framework for building tool-using AI agents.','https://openai.github.io/openai-agents-python/',4,'Open Source','agents,python'],
  ['automation','LangGraph','Framework for controllable, stateful agent workflows.','https://langchain-ai.github.io/langgraph/',4,'Open Source','agents,framework'],
  ['automation','Paperclip','Manage a team of AI agents to run your business. Org charts, budgets, governance, and goals — all in one deployment.','https://paperclip.ing',4,'Freemium','paperclip,ing'],
  ['automation','Hivementality','Build teams of AI agents that collaborate, delegate, and get real work done. 70+ tools, 150+ templates, 13 messaging channels. MCP support, Live Canvas, voice, agent self-evolution. Self-hosted, fully sandboxed, open source.','https://hivementality.ai',4,'Freemium','hivementality'],
  ['courses','Huggingface','We’re on a journey to advance and democratize artificial intelligence through open source and open science.','https://huggingface.co',4,'Freemium','huggingface'],
  ['courses','Google Cloud AI and Machine Learning','Take machine learning & AI classes with Google experts. Grow your ML skills with interactive labs. Deploy the latest AI technology. Start learning!','https://cloud.google.com/learn/training/machinelearning-ai',4,'Freemium','cloud,google'],
  ['courses','Coursera','Learn job-ready skills with online courses, Professional Certificates, Specializations, and degrees from Google, Meta, Anthropic, DeepLearning.AI, Stanford, and more. Start learning today.','https://www.coursera.org',4,'Freemium','coursera'],
  ['courses','Claude Academy','Free AI education from Anthropic. Learn how AI works, how to use it with intention, and how to get more from Claude, organized around the problems you actually face.','https://academy.claude.com',4,'Freemium','academy,claude'],
  ['uiux','Awwwards','Awwwards are the Website Awards that recognize and promote the talent and effort of the best developers, designers and web agencies in the world.','https://www.awwwards.com',4,'Freemium','awwwards'],
  ['uiux','Dribbble','Design Tool','https://dribbble.com',4,'Freemium','dribbble'],
  ['uiux','Magicui','Beautiful UI components and templates to make your landing page look stunning.','https://magicui.design',4,'Freemium','magicui,design'],
  ['uiux','Reactbits','An open source collection of high quality, animated, interactive & fully customizable React components for building stunning, memorable user interfaces.','https://reactbits.dev',4,'Freemium','reactbits'],
  ['uiux','Daisyui','Tailwind CSS component library by daisyUI. Build faster with semantic components, built-in themes, and reusable UI blocks.','https://daisyui.com',4,'Freemium','daisyui'],
  ['uiux','Heroui','Beautiful, accessible React UI components built on React Aria and Tailwind CSS v4. The modern alternative to MUI, Chakra UI, and shadcn/ui for building production-ready applications.','https://www.heroui.com',4,'Freemium','heroui'],
  ['uiux','Motion Primitives','Ready-to-use animated React components built on Motion, for landing pages and product UI.','https://motion-primitives.com',4,'Freemium','motion,primitives'],
  ['uiux','Animate Ui','Fully animated, open-source component distribution built with React, TypeScript, Tailwind CSS, Motion and Shadcn CLI. Browse a list of components you can install, modify, and use in your projects.','https://animate-ui.com',4,'Freemium','animate'],
  ['uiux','Cult Ui','Copy-paste React and Tailwind components and blocks in the shadcn/ui style.','https://cult-ui.com',4,'Freemium','cult'],
  ['uiux','Preline','Build faster with Preline UI, a free and open-source Tailwind CSS UI component library with Pro blocks, templates, plugins, framework guides, and Figma.','https://preline.co',4,'Freemium','preline'],
  ['uiux','Headlessui','Completely unstyled, fully accessible UI components, designed to integrate beautifully with Tailwind CSS.','https://headlessui.com',4,'Freemium','headlessui'],
  ['uiux','Watermelon UI','A collection of high-quality React components, dashboards, and UI blocks. Copy and paste production-ready UI with ease.','https://ui.watermelon.sh',4,'Freemium','watermelon'],
  ['uiux','Styles Refero','Browse a curated DESIGN.md library for AI agents: colors, typography, spacing, components, and design rules from leading product websites.','https://styles.refero.design',4,'Freemium','styles,refero'],
  ['uiux','Motionsites','即复即用的提示词，用 AI 构建惊艳的网站','https://motionsites.dev',4,'Freemium','motionsites'],
  ['uiux','Pinterest','Discover recipes, home ideas, style inspiration and other ideas to try.','https://at.pinterest.com',4,'Freemium','pinterest'],
  ['research','Perplexity','Answer engine that searches the web and cites sources.','https://www.perplexity.ai',5,'Freemium','search,citations'],
  ['research','NotebookLM','Source-grounded research notebooks with audio overviews.','https://notebooklm.google.com',5,'Free','notes,google'],
  ['image','Midjourney','High-quality image generation in a distinctive visual style.','https://www.midjourney.com',5,'Paid','art,images'],
  ['image','FLUX','Black Forest Labs is building visual intelligence: models that understand, reason, and act in the world. Use FLUX models via our API.','https://blackforestlabs.ai',5,'Open Source','models,local'],
  ['image','Ideogram','Image creation with especially strong typography.','https://ideogram.ai',4,'Freemium','text,design'],
  ['image','ChatGPT Images','Image creation and editing within ChatGPT.','https://chatgpt.com',5,'Freemium','editing,general'],
  ['image','Adobe Firefly','Firefly gives you the speed, control, and creative freedom to go from idea to high-quality content. Generate images, video, audio and more with 30+ AI models, all in one place.','https://firefly.adobe.com',4,'Freemium','adobe,creative'],
  ['image','Stable Diffusion','Stability AI is the enterprise-ready creative partner for teams and creators, delivering professional-grade generative AI tools and solutions for content production at scale.','https://stability.ai',4,'Free / Open Source','models,local'],
  ['image','ComfyUI','Comfy is the AI creation engine for visual professionals who demand control over every model, every parameter, and every output.','https://www.comfy.org',5,'Open Source','nodes,local'],
  ['video','Sora','OpenAI video generation and editing experience.','https://sora.com',5,'Paid','video,creative'],
  ['video','Veo','Google’s high-fidelity generative video model.','https://deepmind.google/models/veo/',5,'Paid','video,google'],
  ['video','Runway','Runway is building foundational Real-World Intelligence that can understand, simulate and act in the world. We offer products and services built on-top of this intelligence to empower individuals and organizations to do more in the world.','https://runwayml.com',5,'Freemium','editing,creative'],
  ['video','Kling','Create high-quality AI videos and images with Kling AI. Turn text, images, and references into multimodal creative content in one studio.','https://klingai.com',4,'Freemium','video,animation'],
  ['video','Pika','The idea-to-video platform that sets your creativity in motion.','https://pika.art',4,'Freemium','video,effects'],
  ['video','Luma Dream Machine','Plan, generate, iterate, and refine, keeping full context across every stage of creative work.','https://lumalabs.ai/dream-machine',4,'Freemium','video,motion'],
  ['creative3d','Meshy','Meshy\'s AI 3D model generator turns text and images into production-ready 3D models in 20-30 seconds. Export to FBX, OBJ, GLB, and STL formats. Try Meshy free.','https://www.meshy.ai',4,'Freemium','3d,assets'],
  ['creative3d','Tripo','Create production-ready 3D models with AI.','https://www.tripo3d.ai',4,'Freemium','3d,models'],
  ['creative3d','Spline AI','Generate 3D models from a text prompt or an image. Pick from four looks, choose the engine, and open the textured result straight in Spline.','https://spline.design/ai',4,'Freemium','3d,interactive'],
  ['creative3d','Bookofshapes','A curated gallery of generative patterns. Discover, customize, and download unique algorithmic art.','https://www.bookofshapes.com',4,'Freemium','bookofshapes'],
  ['creative3d','Contentcore','Create content in one place. Incredibly fast. Save as images or videos.','https://contentcore.xyz',4,'Freemium','contentcore,xyz'],
  ['audio','ElevenLabs','Create lifelike speech with our AI voice generator and voice agents platform. Access 5,000+ voices in 70+ languages with secure APIs and SDKs.','https://elevenlabs.io',5,'Freemium','voice,speech'],
  ['audio','Suno','Create stunning original music for free in seconds using our AI generator. Make your own masterpieces, share with friends, and discover music from artists worldwide.','https://suno.com',4,'Freemium','music,generation'],
  ['audio','Udio','Discover, create, and share music with the world. Use the latest technology to create AI music in seconds.','https://www.udio.com',4,'Freemium','music'],
  ['audio','Whisper','Open-source speech recognition from OpenAI.','https://openai.com/index/whisper/',5,'Open Source','speech,transcription'],
  ['audio','Descript','Descript is the AI video and audio editor that makes editing as easy as editing text. Record, transcribe, edit, and publish in one tool. Try it free.','https://www.descript.com',4,'Freemium','podcast,editing'],
  ['marketing','Surfer SEO','Track and improve your brand\'s visibility across Google and AI search engines like ChatGPT, Gemini, and Perplexity. Surfer is built for marketing & SEO teams ready for the AI era.','https://surferseo.com',4,'Paid','seo,content'],
  ['marketing','HubSpot AI','HubSpot','https://www.hubspot.com/artificial-intelligence',4,'Freemium','crm,marketing'],
  ['marketing','Ahrefs','We help marketers drive visibility across AI search, SEO, content, and social – with the largest AI and search databases online.','https://ahrefs.com',5,'Paid','seo,research'],
  ['design','Canva AI','AI-assisted graphics, documents, and presentations.','https://www.canva.com/ai-image-generator/',5,'Freemium','design,slides'],
  ['design','Figma AI','Get started faster, find what you’re looking for, and stay in the flow—with AI tools build for your workflows. Sign up for free today and harness the power of Figma AI.','https://www.figma.com/ai/',5,'Freemium','ui,product'],
  ['design','FigJam AI','A visual collaborative whiteboard where teams can diagram, brainstorm, and organize ideas together.','https://www.figma.com/figjam/',4,'Freemium','whiteboard,workshops'],
  ['design','Gamma','Gamma is your free-to-use AI design partner for creating effortless presentations, websites, and more. No coding or design skills required.','https://gamma.app',4,'Freemium','presentations,docs'],
  ['design','Framer AI','Framer is an AI website builder for designers and teams. Generate editable pages, refine every detail on canvas, and publish with CMS, hosting, SEO, and analytics.','https://www.framer.com/ai',4,'Freemium','web,design'],
  ['data','ChatGPT Advanced Data Analysis','Analyze spreadsheets, data files, and code in ChatGPT.','https://chatgpt.com',5,'Freemium','data,python'],
  ['data','Tableau AI','Tableau AI brings the future into today’s decisions. Our approach to AI is driven by practical applications to help people and organizations answer pressing questions.','https://www.tableau.com/products/tableau-ai',4,'Paid','bi,enterprise'],
  ['data','Power BI Copilot','AI assistance for Microsoft business intelligence: ask questions of your data and draft reports in Power BI.','https://www.microsoft.com/power-platform/products/power-bi',4,'Paid','bi,microsoft'],
  ['data','Hex','Finally — anyone can get data insights grounded in the facts of their business. Hex has a flexible approach to context that earns trust without slowing you down.','https://hex.tech',4,'Freemium','notebooks,sql'],
  ['writing','Jasper','Orchestrate intelligent agents to run end-to-end marketing workflows delivering speed, control, and measurable impact.','https://www.jasper.ai',4,'Paid','marketing,brand'],
  ['writing','Grammarly','Grammarly makes AI writing convenient. Work smarter with personalized AI guidance and text generation on any app or website.','https://www.grammarly.com',4,'Freemium','editing'],
  ['writing','Writer','WRITER is the enterprise AI agent platform trusted by Fortune 500 companies, built to help teams execute and scale on-brand, compliant work.','https://writer.com',4,'Paid','enterprise,brand'],
  ['writing','Sudowrite','Write your novel faster with the best AI tool for fiction. Start for free today and see why The New Yorker calls it "a salvation" for writers and why The New York Times, The Verge, and many more love Sudowrite.','https://www.sudowrite.com',4,'Paid','creative,fiction'],
  ['writing','Copy.ai','Introducing the first-ever GTM AI platform. Automate hundreds of tedious, repetitive tasks and empower your team to scale success like never before.','https://www.copy.ai',4,'Freemium','copy,sales'],
  ['productivity','Notion AI','One tool that does it all. Search, generate, analyze, and chat—right inside Notion.','https://www.notion.so/product/ai',5,'Freemium','workspace,notes'],
  ['productivity','Microsoft 365 Copilot','AI in Word, Excel, PowerPoint, Outlook, and Teams, grounded in your organisation’s documents and mail.','https://www.microsoft.com/microsoft-365/copilot',4,'Paid','microsoft,office'],
  ['productivity','Mem','Let AI organize your team','https://mem.ai',4,'Paid','notes,knowledge'],
  ['productivity','Motion','Motion is the #1 Rated Productivity Platform for the AI Era. AI Projects, AI Tasks, AI Calendar, AI Meetings, AI Docs, AI Notes, AI Reports, AI Workflows, and more.','https://www.usemotion.com',4,'Paid','planning,tasks'],
  ['productivity','Reclaim','Reclaim is an AI-powered app that creates 40% more time for teams — auto-schedule tasks, habits, meeting & breaks – free on Google Calendar & Outlook Calendar.','https://reclaim.ai',4,'Freemium','calendar,focus'],
  ['transcription','Otter.ai','Otter AI Meeting Agent supports real-time transcription, live chat, automated summaries, insights, and action items.','https://otter.ai',4,'Freemium','meetings,notes'],
  ['transcription','Fireflies.ai','Fireflies takes notes, manages tasks, and automates workflows across meetings, email, chat, CRM, and your apps. Build a searchable knowledge base of your team’s work in one place.','https://fireflies.ai',4,'Freemium','meetings,search'],
  ['transcription','Granola','The AI notepad for back-to-back meetings. Notes, actions and memory. Without a meeting bot.','https://www.granola.ai',4,'Freemium','meetings,notes'],
  ['legal','Harvey','Harvey is the platform built to meet the standards of the world’s leading professional service firms.','https://www.harvey.ai',4,'Paid','legal,enterprise'],
  ['legal','Spellbook','Spellbook is the #1 AI contract review platform for transactional lawyers. It uses GPT-5, Claude, and other LLMs to help legal teams draft and review contracts 10x faster, with greater precision—right in Microsoft Word','https://www.spellbook.legal',4,'Paid','contracts,word']
];

const NAME_LIBRARY = new Map(seedEntries.map(([categoryId, name, description, url, rating, pricing, tags]) => [
  name.toLowerCase(),
  syncRating({ name, categoryId, description, url, rating, pricing, tags: tags.split(',').filter(Boolean), ...(MODEL_QUALITY[name.toLowerCase()] || {}) })
]));

function makeSeed() {
  const now = Date.now();
  return {
    categories: structuredClone(seedCategories),
    tools: seedEntries.map(([categoryId, name, description, url, rating, pricing, tags], index) => syncRating({
      id: `seed-${String(index + 1).padStart(3, '0')}`,
      categoryId, name, description, url, rating, pricing,
      tags: tags.split(',').filter(Boolean), notes: '',
      favorite: false,
      addedAt: now - (seedEntries.length - index) * 3600000,
      ...(MODEL_QUALITY[name.toLowerCase()] || {})
    })),
    notes: 'A few things to explore:\n• Build a repeatable research workflow with NotebookLM + Perplexity\n• Test an n8n agent for weekly industry summaries\n• Compare image workflows: Midjourney, FLUX, and ComfyUI',
    favoritesOrder: [],
    preferences: { pricing: 'All', category: 'All', view: 'grid', sort: 'manual' },
    seedVersion: SEED_VERSION
  };
}

function isPristineOldSeed(data) {
  if ((data.seedVersion || 1) >= SEED_VERSION) return false;
  // The previous seed shipped exactly 81 seed-### tools in seed categories (user-made categories get
  // 'category-…' ids). Any addition, deletion, or renamed notes makes the library non-pristine.
  const seed = makeSeed();
  const onlySeedTools = data.tools.length === 81 && data.tools.every(t => /^seed-\d+$/.test(t.id));
  const onlySeedCategories = data.categories.every(c => !String(c.id).startsWith('category-'));
  const defaultNotes = !data.notes || data.notes === seed.notes;
  return onlySeedTools && onlySeedCategories && defaultNotes;
}

let restoredFromBackup = null;
function safeLoad() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (validData(parsed)) {
      if (isPristineOldSeed(parsed)) return makeSeed();
      parsed.tools.forEach(syncRating); return { ...parsed, preferences: { ...makeSeed().preferences, ...parsed.preferences } };
    }
  } catch { /* localStorage or malformed data falls back safely */ }
  try {
    const newest = listBackups()[0];
    if (newest) { restoredFromBackup = newest; newest.data.tools.forEach(syncRating); return { ...newest.data, preferences: { ...makeSeed().preferences, ...newest.data.preferences } }; }
  } catch { /* no usable backup */ }
  return makeSeed();
}

function validData(data) {
  return !!data && Array.isArray(data.categories) && Array.isArray(data.tools) &&
    data.categories.every(c => c && typeof c.id === 'string' && typeof c.name === 'string') &&
    data.tools.every(t => t && typeof t.id === 'string' && typeof t.name === 'string' && typeof t.categoryId === 'string');
}

let state = safeLoad();
let query = '';
let openMenuId = null;
let activeModal = null;
let dragToolId = null;
let dragCategoryId = null;
let draggedFavoriteId = null;
let toastTimer;

const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
const importInput = document.querySelector('#import-file');

// --- Automatic backups ---------------------------------------------------------------------
// The library lives in one localStorage key, so one bad write (a migration, an import, a script
// clearing the key) used to be unrecoverable. Now the last few full copies are kept under separate
// keys: one is taken daily, one before any import, and one whenever a save would shrink the
// library by half or more. If the main key is ever empty on load, the newest backup is restored.
function listBackups() {
  const out = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i); if (!key?.startsWith(BACKUP_PREFIX)) continue;
    try { const data = JSON.parse(localStorage.getItem(key)); if (validData(data)) out.push({ key, savedAt: Number(key.slice(BACKUP_PREFIX.length)), tools: data.tools.length, categories: data.categories.length, data }); } catch { /* skip unreadable backup */ }
  }
  return out.sort((a, b) => b.savedAt - a.savedAt);
}
function snapshot(reason = 'manual') {
  const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null;
  try { if (!validData(JSON.parse(raw))) return null; } catch { return null; }
  const key = `${BACKUP_PREFIX}${Date.now()}`;
  try { localStorage.setItem(key, raw); } catch { return null; }
  listBackups().slice(MAX_BACKUPS).forEach(b => localStorage.removeItem(b.key));
  return { key, reason };
}
function persist() {
  try {
    const previous = (() => { try { const d = JSON.parse(localStorage.getItem(STORAGE_KEY)); return validData(d) ? d : null; } catch { return null; } })();
    if (previous) {
      const shrinking = previous.tools.length >= 10 && state.tools.length < previous.tools.length / 2;
      const newest = listBackups()[0];
      if (shrinking || !newest || Date.now() - newest.savedAt > 24 * 3600000) snapshot(shrinking ? 'shrink' : 'daily');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  catch { showToast('Your browser could not save this change locally.'); }
}

function uid(prefix) { return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`; }
function esc(value = '') { return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]); }
function initials(name = '') { const words = name.trim().split(/[\s/-]+/).filter(Boolean); return (words.map(word => word[0]).join('').slice(0, 2) || 'AI').toUpperCase(); }
function hashHue(text) { return [...text].reduce((a, char) => ((a << 5) - a + char.charCodeAt(0)) | 0, 0) % 360; }
function toolIcon(tool, extraClass = '') { const hue = Math.abs(hashHue(tool.name)); const favicon = tool.favicon ? `<img src="${esc(tool.favicon)}" alt="" onerror="this.remove()" />` : ''; return `<span class="tool-icon ${extraClass}" style="background:linear-gradient(135deg,hsl(${hue} 52% 49%),hsl(${(hue + 38) % 360} 38% 24%))" aria-hidden="true"><span class="tool-initials">${esc(initials(tool.name))}</span>${favicon}</span>`; }
function pricingClass(pricing) { return `price-${pricing.toLowerCase().replaceAll(' / ', '-').replaceAll(' ', '-')}`; }
function prettyPrice(pricing) { return pricing === 'Free / Open Source' ? 'Free + OSS' : pricing; }
function categoryById(id) { return state.categories.find(c => c.id === id); }
function toolById(id) { return state.tools.find(t => t.id === id); }
function normalizedUrl(input) { if (!input) return ''; const candidate = input.trim(); if (!candidate) return ''; const url = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`); if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Please enter a valid http(s) website URL.'); return url.href; }
function nameInfo(input) {
  const query = String(input || '').trim().toLowerCase();
  if (query.length < 2) return null;
  let match = NAME_LIBRARY.get(query);
  if (!match) {
    const candidates = [...NAME_LIBRARY.entries()].filter(([key]) => key.startsWith(query) || key.includes(query));
    if (candidates.length === 1) match = candidates[0][1];
  }
  if (!match) return null;
  let favicon = '';
  try { favicon = match.url ? `${new URL(match.url).origin}/favicon.ico` : ''; } catch { /* keep default favicon */ }
  return { ...match, favicon, source: `Matched “${match.name}” in your tool library — details filled in.` };
}
function websiteInfo(input) {
  const url = new URL(normalizedUrl(input));
  const hostname = url.hostname.replace(/^www\./, '').toLowerCase();
  const match = Object.entries(KNOWN_WEBSITES).find(([domain]) => hostname === domain || hostname.endsWith(`.${domain}`));
  const favicon = `${url.origin}/favicon.ico`;
  if (match) return { ...match[1], favicon, source: 'Known tool detected — details filled from the local tool library.' };
  const readable = hostname.split('.')[0].split(/[-_]/).filter(Boolean).map(word => word[0]?.toUpperCase() + word.slice(1)).join(' ') || hostname;
  const tags = hostname.split(/[.-]/).filter(part => part.length > 2 && !['www', 'com', 'ai', 'app', 'io', 'co', 'dev', 'net', 'org'].includes(part)).slice(0, 3);
  return { name: readable, description: `AI tool and resources from ${hostname}.`, categoryId: '', rating: 3, pricing: 'Freemium', tags, favicon, source: 'Smart defaults created from the website address. You can refine any field.' };
}
function fieldFiller(form) {
  return (field, value, formatter = value => value) => { const control = form.elements[field]; if (control && !control.dataset.manual && (!control.value || control.dataset.auto === 'true' || !form.dataset.enriched)) { control.value = formatter(value); control.dataset.auto = 'true'; } };
}

function applyWebsiteInfo(form) {
  const urlField = form.elements.url; const status = form.querySelector('#autofill-status');
  if (!urlField?.value.trim()) { if (!form.dataset.enriched && status) status.textContent = 'Type a tool name above, or paste a website here to auto-fill details.'; return; }
  let info; try { info = websiteInfo(urlField.value); } catch { if (status) status.textContent = 'Enter a complete website address to auto-fill details.'; return; }
  const fill = fieldFiller(form);
  fill('name', info.name); fill('description', info.description); fill('tags', info.tags, value => value.join(', ')); fill('rating', info.rating, String); fill('pricing', info.pricing);
  const category = form.elements.categoryId; if (category && info.categoryId && (!category.dataset.manual || category.dataset.auto === 'true')) { category.value = info.categoryId; category.dataset.auto = 'true'; }
  const favicon = form.querySelector('[name="favicon"]'); if (favicon) favicon.value = info.favicon;
  form.dataset.enriched = 'true';
  if (status) status.textContent = info.source;
}

function lockRatingToQuality(form) {
  const rating = form.elements.rating; const quality = form.querySelector('[name="quality"]')?.value; const label = form.querySelector('[name="qualityLabel"]')?.value;
  const derived = starsFromQuality(quality, label || null);
  const note = form.querySelector('#rating-note');
  if (derived != null) { rating.value = String(derived); rating.disabled = true; if (note) note.textContent = `Derived from AA score ${quality}`; }
  else { rating.disabled = false; if (note) note.textContent = ''; }
}

function applyNameInfo(form) {
  const nameField = form.elements.name; const status = form.querySelector('#autofill-status');
  const info = nameInfo(nameField?.value);
  const quality = form.querySelector('[name="quality"]'); const costPerTask = form.querySelector('[name="costPerTask"]'); const poweredBy = form.querySelector('[name="poweredBy"]'); const qualityLabel = form.querySelector('[name="qualityLabel"]');
  if (!info) {
    if (quality) quality.value = ''; if (costPerTask) costPerTask.value = ''; if (poweredBy) poweredBy.value = ''; if (qualityLabel) qualityLabel.value = '';
    lockRatingToQuality(form);
    if (status && !form.dataset.enriched) status.textContent = 'Type a known tool name to auto-fill its details, or paste a website below.';
    return;
  }
  const fill = fieldFiller(form);
  fill('description', info.description); fill('url', info.url); fill('tags', info.tags, value => value.join(', ')); fill('rating', info.rating, String); fill('pricing', info.pricing);
  const category = form.elements.categoryId; if (category && info.categoryId && (!category.dataset.manual || category.dataset.auto === 'true')) { category.value = info.categoryId; category.dataset.auto = 'true'; }
  const favicon = form.querySelector('[name="favicon"]'); if (favicon && info.favicon) favicon.value = info.favicon;
  if (quality) quality.value = info.quality ?? ''; if (costPerTask) costPerTask.value = info.costPerTask ?? ''; if (poweredBy) poweredBy.value = info.poweredBy ?? ''; if (qualityLabel) qualityLabel.value = info.qualityLabel ?? '';
  lockRatingToQuality(form);
  form.dataset.enriched = 'true';
  if (status) status.textContent = info.quality != null ? `${info.source} Rated ${info.quality}/100 quality · ~$${info.costPerTask.toFixed(2)}/task (artificialanalysis.ai).` : info.source;
}

// --- Online description lookups (only ever called from the Add/Edit tool form) ---
// Homepage metadata via microlink.io (CORS-enabled, free tier), falling back to r.jina.ai;
// bare names via DuckDuckGo's instant-answer API, which can return the official site and a one-liner.
function tidyDescription(text, max = 240) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max); const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return (end > 60 ? cut.slice(0, end + 1) : cut.slice(0, cut.lastIndexOf(' ')) + '…').trim();
}
function firstSentence(text) { const clean = String(text || '').replace(/\s+/g, ' ').trim(); const m = clean.match(/^.+?[.!?](\s|$)/); return tidyDescription(m ? m[0] : clean); }
async function fetchJson(url, init = {}, timeoutMs = 12000) {
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try { const res = await fetch(url, { ...init, signal: ctrl.signal }); return res.ok ? await res.json() : null; } catch { return null; } finally { clearTimeout(timer); }
}
async function lookupWebsite(url) {
  const target = new URL(url); const host = target.hostname.replace(/^www\./, '');
  const ml = await fetchJson(`https://api.microlink.io/?url=${encodeURIComponent(target.href)}`);
  if (ml?.status === 'success' && ml.data && (ml.data.description || ml.data.title)) return { description: tidyDescription(ml.data.description), title: ml.data.title || '', favicon: ml.data.logo?.url || '', host };
  const jina = await fetchJson(`https://r.jina.ai/${target.href}`, { headers: { Accept: 'application/json' } }, 20000);
  const data = jina?.data; if (!data) return null;
  const description = tidyDescription(data.description) || firstSentence(String(data.content || '').replace(/^#.*$/gm, '').replace(/\[[^\]]*\]\([^)]*\)/g, ''));
  return description || data.title ? { description, title: data.title || '', favicon: '', host } : null;
}
async function lookupName(name) {
  // Pin region/language so the summary comes back in English, and disambiguate "X" vs "X (software)":
  // try the bare name, and if that yields neither a site nor a software-ish summary, try "X software".
  const ask = async q => {
    const ddg = await fetchJson(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&no_redirect=1&skip_disambig=1&kl=us-en&kad=en_US`);
    if (!ddg) return null;
    const site = ddg.Results?.[0]?.FirstURL || (ddg.Infobox?.content || []).find(c => /web ?site/i.test(c.label || ''))?.value || '';
    let url = ''; try { url = site ? normalizedUrl(site) : ''; } catch { url = ''; }
    const description = firstSentence(ddg.AbstractText);
    const softwareish = /\b(app|application|software|platform|tool|service|assistant|editor|generator|model|program|company|startup|AI|website|browser|extension|plugin|API|framework|library|engine)\b/i.test(description);
    return { url, description, softwareish };
  };
  const plain = await ask(name);
  if (plain?.url) return plain;
  const specific = await ask(`${name} software`);
  if (specific?.url) return specific;
  const pick = [specific, plain].find(r => r?.softwareish);
  return pick ? { url: '', description: pick.description } : null;
}

let lookupToken = 0;
async function fetchDescription(form, { force = false } = {}) {
  const status = form.querySelector('#autofill-status'); const urlField = form.elements.url; const descField = form.elements.description;
  let url; try { url = normalizedUrl(urlField?.value); } catch { url = ''; }
  const canFill = force || !descField.value.trim() || descField.dataset.auto === 'true';
  if (!url || !canFill) return;
  const token = ++lookupToken; const host = new URL(url).hostname.replace(/^www\./, '');
  if (status) status.textContent = `Fetching the description from ${host}…`;
  const info = await lookupWebsite(url);
  if (token !== lookupToken || !form.isConnected) return;
  if (!info?.description) { if (status) status.textContent = `${host} didn’t offer a description — write a line yourself.`; return; }
  descField.value = info.description; descField.dataset.auto = 'true'; delete descField.dataset.manual;
  const favicon = form.querySelector('[name="favicon"]'); if (favicon && !favicon.value && info.favicon) favicon.value = info.favicon;
  form.dataset.enriched = 'true';
  if (status) status.textContent = `Description taken from ${host}. Edit it freely.`;
}
async function resolveByName(form) {
  const name = form.elements.name?.value.trim(); const status = form.querySelector('#autofill-status');
  if (!name || name.length < 3) return;
  const token = ++lookupToken;
  if (status) status.textContent = `Looking “${name}” up online…`;
  const found = await lookupName(name);
  if (token !== lookupToken || !form.isConnected) return;
  const fill = fieldFiller(form);
  if (found?.url) fill('url', found.url);
  if (found?.description) fill('description', found.description);
  if (found?.url || found?.description) form.dataset.enriched = 'true';
  if (form.elements.url.value.trim()) { lookupToken--; await fetchDescription(form); return; }
  if (status) status.textContent = found?.description ? `Found a summary for “${name}”. Add the website to pull its own description.` : `Nothing found online for “${name}” — add its website and the description will follow.`;
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.append(toast); }
  toast.textContent = message; requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function allVisibleTools() {
  const lower = query.trim().toLowerCase();
  let items = state.tools.filter(tool => {
    const text = [tool.name, tool.description, tool.notes, tool.tags?.join(' '), categoryById(tool.categoryId)?.name].join(' ').toLowerCase();
    const priceMatch = state.preferences.pricing === 'All' || (state.preferences.pricing === 'Favorites' ? tool.favorite : state.preferences.pricing === 'Open Source' ? tool.pricing.includes('Open Source') : tool.pricing === state.preferences.pricing);
    const categoryMatch = state.preferences.category === 'All' || tool.categoryId === state.preferences.category;
    return priceMatch && categoryMatch && (!lower || text.includes(lower));
  });
  if (state.preferences.sort === 'name') items = [...items].sort((a, b) => a.name.localeCompare(b.name));
  if (state.preferences.sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
  if (state.preferences.sort === 'recent') items = [...items].sort((a, b) => b.addedAt - a.addedAt);
  if (state.preferences.sort === 'favorites') items = [...items].sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name));
  if (state.preferences.sort === 'quality') items = [...items].sort((a, b) => (b.quality ?? -1) - (a.quality ?? -1) || a.name.localeCompare(b.name));
  return items;
}

function render() {
  const visible = allVisibleTools();
  const categoryOptions = state.categories.map(c => `<option value="${esc(c.id)}" ${state.preferences.category === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  const totalFavorites = state.tools.filter(t => t.favorite).length;
  const freeCount = state.tools.filter(t => t.pricing === 'Free' || t.pricing === 'Free / Open Source').length;
  const ossCount = state.tools.filter(t => t.pricing.includes('Open Source')).length;

  app.innerHTML = `
    <header class="topbar">
      <section>
        <p class="eyebrow"><span class="status-dot"></span> Personal AI operating dashboard</p>
        <h1>AI TOOLS <span class="gradient-text">OVERVIEW</span></h1>
        <p class="subtitle">Your personal map of the AI ecosystem. Find details about the models and tools online here: <a href="https://artificialanalysis.ai/" target="_blank" rel="noopener noreferrer">artificialanalysis.ai</a></p>
      </section>
      <label class="search-wrap" aria-label="Search tools">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
        <input id="global-search" autocomplete="off" value="${esc(query)}" placeholder="Search tools, tags, notes, categories…" />
        <span class="shortcut">/</span>
      </label>
      <div class="top-actions">
        <button class="btn ghost" id="import-btn" title="Restore a JSON backup"><span>↥</span><span class="label">Import</span></button>
        <button class="btn ghost" id="export-btn" title="Download a JSON backup"><span>⇩</span><span class="label">Export</span></button>
        <button class="btn ghost" id="backups-btn" title="Automatic local backups"><span>⟲</span><span class="label">Backups</span></button>
        <button class="btn ghost" id="add-category-top-btn" title="Create a new category"><span>＋</span><span class="label">Add category</span></button>
        <button class="btn primary" id="add-tool-btn"><span>＋</span><span class="label">Add tool</span></button>
      </div>
    </header>
    <section class="overview" aria-label="Dashboard overview">
      <div class="stats-panel">
        <div class="stat"><strong>${state.tools.length}</strong><span>Tools tracked</span></div>
        <div class="stat"><strong>${state.categories.length}</strong><span>Categories</span></div>
        <div class="stat"><strong>${totalFavorites}</strong><span>Favorites</span></div>
        <div class="stat"><strong>${freeCount}</strong><span>Free access</span></div>
        <div class="stat"><strong>${ossCount}</strong><span>Open source</span></div>
      </div>
      <aside class="legend-panel" aria-label="Pricing legend">
        <span class="legend-title">Pricing legend</span>
        ${PRICING.map(price => `<span class="legend-item"><i class="pricing-dot ${pricingClass(price)}"></i>${esc(prettyPrice(price))}</span>`).join('')}
      </aside>
    </section>
    <section class="toolbar" aria-label="Filters and sorting">
      <div class="filters">${FILTERS.map(filter => `<button class="filter ${state.preferences.pricing === filter ? 'active' : ''}" data-filter="${esc(filter)}">${esc(filter)}</button>`).join('')}</div>
      <select id="category-filter" class="select" aria-label="Filter by category"><option value="All">All categories</option>${categoryOptions}</select>
      <select id="sort-select" class="select" aria-label="Sort tools"><option value="manual" ${state.preferences.sort === 'manual' ? 'selected' : ''}>Custom order</option><option value="name" ${state.preferences.sort === 'name' ? 'selected' : ''}>Name</option><option value="rating" ${state.preferences.sort === 'rating' ? 'selected' : ''}>Rating</option><option value="recent" ${state.preferences.sort === 'recent' ? 'selected' : ''}>Recently added</option><option value="favorites" ${state.preferences.sort === 'favorites' ? 'selected' : ''}>Favorites first</option><option value="quality" ${state.preferences.sort === 'quality' ? 'selected' : ''}>Quality (artificialanalysis.ai)</option></select>
      <div class="view-toggle" aria-label="View mode"><button title="Dashboard view" data-view="grid" class="${state.preferences.view === 'grid' ? 'active' : ''}">▦</button><button title="Compact list" data-view="list" class="${state.preferences.view === 'list' ? 'active' : ''}">☷</button></div>
    </section>
    ${visible.length || (!query && state.preferences.pricing === 'All' && state.preferences.category === 'All') ? renderCategories(visible) : `<section class="empty-search"><strong>No tools match those filters.</strong>Try another search term, clear a filter, or add a tool to your library.</section>`}
    <section class="lower-grid">
      ${renderNotes()}
      ${renderFavorites()}
    </section>`;
  bindAppEvents();
}

function renderCategories(visible) {
  const cards = state.categories.map(category => {
    const total = state.tools.filter(t => t.categoryId === category.id).length;
    const tools = visible.filter(t => t.categoryId === category.id);
    const narrowed = Boolean(query || state.preferences.pricing !== 'All' || state.preferences.category !== 'All');
    if (narrowed && !tools.length) return '';
    return renderCategory(category, tools, total);
  }).join('');
  return `<section class="category-grid" aria-label="AI tool categories">${cards}<button class="add-category" id="add-category-btn"><span class="plus-circle">＋</span><span>Add a category</span></button></section>`;
}

function renderCategory(category, tools, total) {
  const index = state.categories.findIndex(c => c.id === category.id);
  const menu = openMenuId === category.id ? `<div class="category-menu" role="menu"><button data-category-action="edit" data-category-id="${category.id}">Edit category</button><button data-category-action="collapse" data-category-id="${category.id}">${category.collapsed ? 'Expand category' : 'Collapse category'}</button><button data-category-action="move-earlier" data-category-id="${category.id}" ${index <= 0 ? 'disabled' : ''}>Move earlier</button><button data-category-action="move-later" data-category-id="${category.id}" ${index === state.categories.length - 1 ? 'disabled' : ''}>Move later</button><button data-category-action="delete" data-category-id="${category.id}" class="danger-text">Delete category</button></div>` : '';
  const showAll = category.expanded || Boolean(query.trim()) || tools.length <= PREVIEW_LIMIT;
  const shown = showAll ? tools : tools.slice(0, PREVIEW_LIMIT);
  const hidden = tools.length - shown.length;
  const list = shown.map(tool => renderTool(tool, state.preferences.view === 'list')).join('');
  const more = tools.length > PREVIEW_LIMIT && !query.trim() ? `<button class="show-more" data-toggle-more="${category.id}" aria-expanded="${category.expanded ? 'true' : 'false'}">${category.expanded ? '▴ Show less' : `▾ Show ${hidden} more`}</button>` : '';
  return `<article class="category-card ${category.collapsed ? 'collapsed' : ''}" style="--accent:${esc(category.color)}" data-category-drop="${category.id}" data-category-id="${category.id}" draggable="true">
    <header class="category-header">
      <span class="category-grip" aria-hidden="true" title="Drag to reorder categories">⠿</span><span class="category-icon" aria-hidden="true">${esc(category.icon)}</span><div class="category-heading"><div class="category-title-row"><span class="category-title">${esc(category.name)}</span><span class="tool-count">${total}</span></div><p class="category-description">${esc(category.description)}</p></div>
      <div class="category-menu-wrap"><button class="menu-trigger" aria-label="Manage ${esc(category.name)}" aria-expanded="${openMenuId === category.id}" data-menu-id="${category.id}">•••</button>${menu}</div>
    </header>
    ${category.collapsed ? '' : `<div class="tools-list">${list || `<p class="category-description" style="padding:7px 4px">No matching tools here yet.</p>`}<div class="tools-footer">${more}<button class="add-tool" data-add-tool-category="${category.id}">＋ Add tool</button></div></div>`}
  </article>`;
}

function renderTool(tool, isList = false) {
  const stars = '★'.repeat(Math.max(0, Math.min(5, Number(tool.rating) || 0))) + '☆'.repeat(Math.max(0, 5 - Math.min(5, Number(tool.rating) || 0)));
  const tags = (tool.tags || []).slice(0, 2).map(tag => `<span class="tag">${esc(tag)}</span>`).join('');
  const quality = tool.quality != null ? `<span class="quality-badge" title="${esc(tool.qualityLabel || 'Artificial Analysis Intelligence Index')}${tool.poweredBy ? ' — ' + esc(tool.poweredBy) : ''}">AA ${tool.quality}</span><span class="cost-badge" title="Blended cost per task">$${Number(tool.costPerTask).toFixed(2)}/task</span>` : '';
  return `<article class="tool-card ${isList ? 'list-card' : ''}" draggable="true" data-tool-id="${tool.id}" data-category-id="${tool.categoryId}" tabindex="0" aria-label="${esc(tool.name)}, rating ${tool.rating} out of 5">
    ${toolIcon(tool)}<div class="tool-main"><div class="tool-name">${esc(tool.name)}</div><div class="tool-description">${esc(tool.description)}</div>${tags ? `<div class="tool-tags">${tags}</div>` : ''}</div>
    <div class="tool-meta"><span class="stars ${ratingIsDerived(tool) ? 'derived' : ''}" aria-label="${tool.rating} out of 5 stars${ratingIsDerived(tool) ? ', derived from the Artificial Analysis score' : ''}" title="${ratingIsDerived(tool) ? `Derived from AA score ${tool.quality}` : 'Personal rating'}">${stars}</span><span class="price-label"><i class="pricing-dot ${pricingClass(tool.pricing)}"></i>${esc(prettyPrice(tool.pricing))}</span>${quality ? `<span class="quality-row">${quality}</span>` : ''}</div>
    <button class="favorite-toggle ${tool.favorite ? 'is-favorite' : ''}" data-favorite-id="${tool.id}" title="${tool.favorite ? 'Remove from favorites' : 'Add to favorites'}" aria-label="${tool.favorite ? 'Remove from favorites' : 'Add to favorites'}">${tool.favorite ? '★' : '☆'}</button>
  </article>`;
}

function renderNotes() {
  return `<section class="notes-panel"><div class="panel-head"><span class="panel-title">✦ Notes / ideas / to-do</span><span id="notes-status" class="notes-status">Saved locally</span></div><textarea id="notes-area" class="notes-area" placeholder="Capture prompts, experiments, workflows, or tools to explore…">${esc(state.notes || '')}</textarea></section>`;
}

function renderFavorites() {
  const favoriteIds = new Set(state.tools.filter(t => t.favorite).map(t => t.id));
  const ordered = [...(state.favoritesOrder || []).filter(id => favoriteIds.has(id)), ...state.tools.filter(t => t.favorite && !(state.favoritesOrder || []).includes(t.id)).map(t => t.id)];
  const cards = ordered.map((id, index) => { const tool = toolById(id); return `<article class="favorite-card" draggable="true" data-favorite-id="${tool.id}" title="Drag to reorder favorites"><span class="favorite-rank">${String(index + 1).padStart(2, '0')}</span>${toolIcon(tool, 'favorite-icon')}<div class="favorite-name">${esc(tool.name)}</div></article>`; }).join('');
  return `<section class="favorites-panel"><div class="panel-head"><span class="panel-title">★ My tool stack</span><span class="notes-status">Drag to order</span></div>${cards ? `<div id="favorites-stack" class="favorites-stack">${cards}</div>` : `<div class="favorites-empty">Star the tools you reach for most. They’ll appear here as your personal stack.</div>`}</section>`;
}

function bindAppEvents() {
  document.querySelector('#global-search')?.addEventListener('input', event => { query = event.target.value; render(); document.querySelector('#global-search')?.focus(); });
  document.querySelector('#global-search')?.addEventListener('keydown', event => { if (event.key === 'Escape') { query = ''; render(); } });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { state.preferences.pricing = button.dataset.filter; persist(); render(); }));
  document.querySelector('#category-filter')?.addEventListener('change', event => { state.preferences.category = event.target.value; persist(); render(); });
  document.querySelector('#sort-select')?.addEventListener('change', event => { state.preferences.sort = event.target.value; persist(); render(); });
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { state.preferences.view = button.dataset.view; persist(); render(); }));
  document.querySelector('#add-tool-btn')?.addEventListener('click', () => openToolForm());
  document.querySelectorAll('[data-add-tool-category]').forEach(button => button.addEventListener('click', () => openToolForm(null, button.dataset.addToolCategory)));
  document.querySelector('#add-category-btn')?.addEventListener('click', () => openCategoryForm());
  document.querySelector('#add-category-top-btn')?.addEventListener('click', () => openCategoryForm());
  document.querySelector('#export-btn')?.addEventListener('click', exportData);
  document.querySelector('#backups-btn')?.addEventListener('click', openBackups);
  document.querySelector('#import-btn')?.addEventListener('click', () => importInput.click());
  document.querySelectorAll('[data-menu-id]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); openMenuId = openMenuId === button.dataset.menuId ? null : button.dataset.menuId; render(); }));
  document.querySelectorAll('[data-category-action]').forEach(button => button.addEventListener('click', () => handleCategoryAction(button.dataset.categoryAction, button.dataset.categoryId)));
  document.querySelectorAll('[data-toggle-more]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); const category = categoryById(button.dataset.toggleMore); if (!category) return; category.expanded = !category.expanded; persist(); render(); }));
  document.querySelectorAll('[data-favorite-id]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); toggleFavorite(button.dataset.favoriteId); }));
  document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', event => { if (!event.target.closest('.favorite-toggle')) openToolDetail(card.dataset.toolId); });
    card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openToolDetail(card.dataset.toolId); } });
    card.addEventListener('dragstart', event => { dragToolId = card.dataset.toolId; card.classList.add('dragging'); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', dragToolId); });
    card.addEventListener('dragend', () => { dragToolId = null; document.querySelectorAll('.dragging,.drag-over').forEach(el => el.classList.remove('dragging', 'drag-over')); });
    card.addEventListener('dragover', event => { event.preventDefault(); event.stopPropagation(); if (dragToolId && dragToolId !== card.dataset.toolId) card.closest('.category-card')?.classList.add('drag-over'); });
    card.addEventListener('drop', event => { event.preventDefault(); event.stopPropagation(); if (dragToolId && dragToolId !== card.dataset.toolId) moveTool(dragToolId, card.dataset.categoryId, card.dataset.toolId); });
  });
  document.querySelectorAll('[data-category-drop]').forEach(card => {
    card.addEventListener('dragstart', event => {
      if (event.target.closest('.tool-card')) return;
      dragCategoryId = card.dataset.categoryId; card.classList.add('dragging-category');
      event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/x-ai-category', dragCategoryId);
    });
    card.addEventListener('dragend', () => { dragCategoryId = null; clearDropHints(); });
    card.addEventListener('dragover', event => {
      if (dragToolId) { event.preventDefault(); card.classList.add('drag-over'); return; }
      if (!dragCategoryId || dragCategoryId === card.dataset.categoryId) return;
      event.preventDefault();
      const box = card.getBoundingClientRect();
      const after = event.clientX > box.left + box.width / 2;
      card.classList.toggle('drop-after', after); card.classList.toggle('drop-before', !after);
    });
    card.addEventListener('dragleave', event => { if (!card.contains(event.relatedTarget)) card.classList.remove('drag-over', 'drop-before', 'drop-after'); });
    card.addEventListener('drop', event => {
      event.preventDefault();
      if (dragToolId) { moveTool(dragToolId, card.dataset.categoryDrop); return; }
      if (dragCategoryId && dragCategoryId !== card.dataset.categoryId) moveCategory(dragCategoryId, card.dataset.categoryId, card.classList.contains('drop-after'));
    });
  });
  document.querySelector('#notes-area')?.addEventListener('input', event => { state.notes = event.target.value; persist(); const status = document.querySelector('#notes-status'); if (status) status.textContent = 'Saved just now'; });
  bindFavoriteDnD();
}

function bindFavoriteDnD() {
  document.querySelectorAll('.favorite-card').forEach(card => {
    card.addEventListener('dragstart', event => { draggedFavoriteId = card.dataset.favoriteId; card.classList.add('dragging'); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/x-ai-favorite', draggedFavoriteId); });
    card.addEventListener('dragend', () => { draggedFavoriteId = null; document.querySelectorAll('.favorite-card.dragging').forEach(el => el.classList.remove('dragging')); });
    card.addEventListener('dragover', event => { if (draggedFavoriteId) event.preventDefault(); });
    card.addEventListener('drop', event => { if (!draggedFavoriteId || draggedFavoriteId === card.dataset.favoriteId) return; event.preventDefault(); const ids = favoriteOrder(); const from = ids.indexOf(draggedFavoriteId); const to = ids.indexOf(card.dataset.favoriteId); ids.splice(from, 1); ids.splice(to, 0, draggedFavoriteId); state.favoritesOrder = ids; persist(); render(); });
  });
}

function favoriteOrder() { const favIds = state.tools.filter(t => t.favorite).map(t => t.id); return [...(state.favoritesOrder || []).filter(id => favIds.includes(id)), ...favIds.filter(id => !(state.favoritesOrder || []).includes(id))]; }
function toggleFavorite(id) { const tool = toolById(id); if (!tool) return; tool.favorite = !tool.favorite; state.favoritesOrder = favoriteOrder().filter(item => item !== id); if (tool.favorite) state.favoritesOrder.unshift(id); persist(); render(); showToast(tool.favorite ? `${tool.name} added to your stack.` : `${tool.name} removed from your stack.`); }

function moveTool(toolId, categoryId, beforeId = null) {
  const tool = toolById(toolId); if (!tool || !categoryById(categoryId)) return;
  const without = state.tools.filter(t => t.id !== toolId); tool.categoryId = categoryId;
  let insertAt;
  if (beforeId) insertAt = without.findIndex(t => t.id === beforeId);
  else { const matching = without.map((t, index) => [t, index]).filter(([t]) => t.categoryId === categoryId); insertAt = matching.length ? matching.at(-1)[1] + 1 : without.length; }
  without.splice(insertAt < 0 ? without.length : insertAt, 0, tool); state.tools = without; dragToolId = null; clearDropHints();
  revealTool(tool);
  const resorted = state.preferences.sort !== 'manual';
  if (resorted) state.preferences.sort = 'manual';
  persist(); render(); showToast(resorted ? 'Switched to custom order so your arrangement stays visible.' : 'Tool placement saved.');
}

// Expand a category's "Show more" if the tool would otherwise sit in the hidden tail.
function revealTool(tool) {
  const category = categoryById(tool.categoryId); if (!category || category.expanded) return;
  const siblings = state.tools.filter(t => t.categoryId === tool.categoryId);
  if (siblings.length > PREVIEW_LIMIT && siblings.indexOf(tool) >= PREVIEW_LIMIT) category.expanded = true;
}

function clearDropHints() { document.querySelectorAll('.dragging-category,.drop-before,.drop-after,.drag-over').forEach(el => el.classList.remove('dragging-category', 'drop-before', 'drop-after', 'drag-over')); }

function reorderCategories(id, targetIndex) {
  const list = [...state.categories];
  const from = list.findIndex(c => c.id === id);
  if (from < 0 || targetIndex < 0 || targetIndex >= list.length || targetIndex === from) return;
  const [moved] = list.splice(from, 1);
  list.splice(targetIndex, 0, moved);
  state.categories = list; dragCategoryId = null; clearDropHints(); persist(); render(); showToast(`${moved.name} moved.`);
}

function moveCategory(id, targetId, after = false) {
  const without = state.categories.filter(c => c.id !== id);
  const anchor = without.findIndex(c => c.id === targetId);
  if (anchor < 0) return;
  reorderCategories(id, anchor + (after ? 1 : 0));
}

function handleCategoryAction(action, id) {
  const category = categoryById(id); if (!category) return;
  openMenuId = null;
  if (action === 'edit') openCategoryForm(category);
  if (action === 'collapse') { category.collapsed = !category.collapsed; persist(); render(); }
  if (action === 'move-earlier') reorderCategories(id, state.categories.indexOf(category) - 1);
  if (action === 'move-later') reorderCategories(id, state.categories.indexOf(category) + 1);
  if (action === 'delete') { const amount = state.tools.filter(t => t.categoryId === id).length; openConfirm({ title: `Delete ${category.name}?`, text: amount ? `This category has ${amount} tool${amount === 1 ? '' : 's'}. Deleting it will also remove those tools. This cannot be undone.` : 'This empty category will be removed.', confirmLabel: 'Delete category', danger: true, onConfirm: () => { state.categories = state.categories.filter(c => c.id !== id); state.tools = state.tools.filter(t => t.categoryId !== id); state.favoritesOrder = favoriteOrder(); if (state.preferences.category === id) state.preferences.category = 'All'; persist(); closeModal(); render(); showToast('Category deleted.'); } }); }
}

function openToolDetail(id) {
  const tool = toolById(id); const category = categoryById(tool?.categoryId); if (!tool || !category) return;
  const tags = (tool.tags || []).length ? tool.tags.map(tag => `<span class="detail-pill">#${esc(tag)}</span>`).join('') : '<span class="detail-pill">No tags yet</span>';
  activeModal = 'detail';
  modalRoot.innerHTML = `<div class="modal-backdrop" data-close-backdrop><section class="modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><header class="modal-header"><div><h2 id="detail-title">Tool details</h2><p>Keep the useful context close to the tool.</p></div><button class="modal-close" data-close-modal aria-label="Close">×</button></header><div class="modal-body"><div class="detail-hero">${toolIcon(tool, 'detail-icon')}<div class="detail-info"><h3>${esc(tool.name)}</h3><p>${esc(category.name)} · <span class="stars">${'★'.repeat(tool.rating)}${'☆'.repeat(5 - tool.rating)}</span></p></div></div><div class="detail-section"><h4>Description</h4><p>${esc(tool.description || 'No description added.')}</p></div><div class="detail-section"><h4>Pricing</h4><div class="detail-meta"><span class="detail-pill"><i class="pricing-dot ${pricingClass(tool.pricing)}"></i> ${esc(tool.pricing)}</span><span class="detail-pill">★ ${tool.rating}/5 ${ratingIsDerived(tool) ? 'derived from AA score' : 'personal rating'}</span>${tool.favorite ? '<span class="detail-pill">★ In my tool stack</span>' : ''}</div></div>${tool.quality != null ? `<div class="detail-section"><h4>Quality &amp; cost</h4><div class="detail-meta"><span class="detail-pill">${tool.quality}/100 ${esc((tool.qualityLabel || 'Artificial Analysis Intelligence Index').replace('Artificial Analysis ', '').toLowerCase())}</span><span class="detail-pill">~$${Number(tool.costPerTask).toFixed(2)} per task</span></div><p class="detail-source">${tool.poweredBy ? `Powered by ${esc(tool.poweredBy)}. ` : ''}Source: <a class="tool-url" href="https://artificialanalysis.ai" target="_blank" rel="noopener noreferrer">artificialanalysis.ai ↗</a></p></div>` : ''}<div class="detail-section"><h4>Tags</h4><div class="detail-meta">${tags}</div></div>${tool.notes ? `<div class="detail-section"><h4>Personal notes</h4><p>${esc(tool.notes)}</p></div>` : ''}<div class="detail-section"><h4>Website</h4><p>${tool.url ? `<a class="tool-url" href="${esc(tool.url)}" target="_blank" rel="noopener noreferrer">${esc(tool.url.replace(/^https?:\/\//, ''))} ↗</a>` : 'No website added.'}</p></div><div class="detail-actions"><button class="btn primary" data-open-tool-url="${tool.id}" ${tool.url ? '' : 'disabled'}>Open website ↗</button><button class="btn" data-edit-tool="${tool.id}">Edit</button><button class="btn" data-detail-favorite="${tool.id}">${tool.favorite ? '★ Unfavorite' : '☆ Favorite'}</button><button class="btn danger" data-delete-tool="${tool.id}">Delete</button></div></div></section></div>`;
  bindModalEvents();
}

function openToolForm(tool = null, preselectedCategory = null) {
  activeModal = 'tool-form'; const isEdit = Boolean(tool); const defaultCategory = tool?.categoryId || preselectedCategory || state.categories[0]?.id || '';
  modalRoot.innerHTML = `<div class="modal-backdrop" data-close-backdrop><section class="modal" role="dialog" aria-modal="true" aria-labelledby="tool-form-title"><header class="modal-header"><div><h2 id="tool-form-title">${isEdit ? 'Edit tool' : 'Add a tool'}</h2><p>${isEdit ? 'Update this entry in your library.' : 'Add a useful AI tool to your personal map.'}</p></div><button class="modal-close" data-close-modal aria-label="Close">×</button></header><form id="tool-form"><div class="modal-body"><div class="form-grid"><div class="field full"><label for="tool-name">Tool name *</label><input id="tool-name" name="name" required maxlength="70" value="${esc(tool?.name || '')}" placeholder="e.g. ComfyUI — known tools fill in the rest" autocomplete="off" /></div><div class="field"><label for="tool-category">Category *</label><select id="tool-category" name="categoryId" required>${state.categories.map(c => `<option value="${esc(c.id)}" ${c.id === defaultCategory ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div><div class="field full"><div class="label-row"><label for="tool-description">Description *</label><button type="button" class="link-btn" id="fetch-description-btn" title="Replace the description with the one on the tool’s website">↻ From website</button></div><textarea id="tool-description" name="description" required maxlength="240" placeholder="What is this tool useful for?">${esc(tool?.description || '')}</textarea></div><div class="field full"><label for="tool-url">Website URL (optional)</label><input id="tool-url" name="url" maxlength="500" type="text" value="${esc(tool?.url || '')}" placeholder="https://example.com" /></div><div class="field"><div class="label-row"><label for="tool-rating">Rating</label><span id="rating-note" class="rating-note"></span></div><select id="tool-rating" name="rating">${[5,4,3,2,1].map(n => `<option value="${n}" ${Number(tool?.rating || 5) === n ? 'selected' : ''}>${n} / 5</option>`).join('')}</select></div><div class="field"><label for="tool-pricing">Pricing</label><select id="tool-pricing" name="pricing">${PRICING.map(p => `<option value="${esc(p)}" ${tool?.pricing === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select></div><div class="field full"><label for="tool-tags">Tags</label><input id="tool-tags" name="tags" maxlength="160" value="${esc((tool?.tags || []).join(', '))}" placeholder="e.g. image, local, workflow" /></div><div class="field full"><label for="tool-notes">Personal notes</label><textarea id="tool-notes" name="notes" maxlength="1000" placeholder="Why is this useful to you?">${esc(tool?.notes || '')}</textarea></div><label class="check-field"><input name="favorite" type="checkbox" ${tool?.favorite ? 'checked' : ''}/> Add to my tool stack</label></div><p id="form-error" class="form-error" role="alert"></p></div><footer class="modal-footer"><button type="button" class="btn" data-close-modal>Cancel</button><button type="submit" class="btn primary">${isEdit ? 'Save changes' : 'Add tool'}</button></footer></form></section></div>`;
  bindModalEvents();
  const toolForm = document.querySelector('#tool-form');
  const urlField = toolForm?.elements.url;
  const faviconField = document.createElement('input');
  faviconField.name = 'favicon'; faviconField.type = 'hidden'; faviconField.value = tool?.favicon || '';
  toolForm?.append(faviconField);
  [['quality', tool?.quality], ['costPerTask', tool?.costPerTask], ['poweredBy', tool?.poweredBy], ['qualityLabel', tool?.qualityLabel]].forEach(([field, value]) => {
    const hidden = document.createElement('input'); hidden.name = field; hidden.type = 'hidden'; hidden.value = value ?? ''; toolForm?.append(hidden);
  });
  lockRatingToQuality(toolForm);
  const nameField = toolForm?.elements.name;
  nameField?.insertAdjacentHTML('afterend', '<p id="autofill-status" class="autofill-status">Type a tool name from your library — the rest fills in automatically. New tools still need their own details.</p>');
  let enrichmentTimer;
  nameField?.addEventListener('input', () => { clearTimeout(enrichmentTimer); enrichmentTimer = setTimeout(() => { const matched = nameInfo(nameField.value); applyNameInfo(toolForm); if (!matched && !toolForm.elements.url.value.trim()) resolveByName(toolForm); }, 700); });
  urlField?.addEventListener('input', () => { clearTimeout(enrichmentTimer); enrichmentTimer = setTimeout(() => { applyWebsiteInfo(toolForm); fetchDescription(toolForm); }, 700); });
  document.querySelector('#fetch-description-btn')?.addEventListener('click', () => { if (!toolForm.elements.url.value.trim()) { const status = document.querySelector('#autofill-status'); if (status) status.textContent = 'Add the website URL first, then fetch its description.'; toolForm.elements.url.focus(); return; } fetchDescription(toolForm, { force: true }); });
  if (isEdit) { const status = document.querySelector('#autofill-status'); if (status) status.textContent = tool.quality != null ? `Rated ${tool.quality}/100 quality · ~$${Number(tool.costPerTask).toFixed(2)}/task (artificialanalysis.ai).` : 'Edit any field — matching a catalog name will refresh the rest.'; }
  ['name', 'description', 'tags', 'rating', 'pricing'].forEach(field => ['input', 'change'].forEach(type => toolForm?.elements[field]?.addEventListener(type, event => { event.currentTarget.dataset.manual = 'true'; event.currentTarget.dataset.auto = 'false'; })));
  toolForm?.elements.categoryId?.addEventListener('change', event => { event.currentTarget.dataset.manual = 'true'; event.currentTarget.dataset.auto = 'false'; });
  document.querySelector('#tool-form')?.addEventListener('submit', event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const error = document.querySelector('#form-error');
    const name = form.get('name').trim(); const categoryId = form.get('categoryId'); const description = form.get('description').trim();
    if (!name || !description || !categoryById(categoryId)) { error.textContent = 'Please complete the name, category, and description.'; return; }
    const duplicate = state.tools.find(item => item.name.toLowerCase() === name.toLowerCase() && item.id !== tool?.id); if (duplicate) { error.textContent = 'A tool with this name is already in your library.'; return; }
    let url; try { url = normalizedUrl(form.get('url')); } catch (err) { error.textContent = err.message; return; }
    const quality = form.get('quality') ? Number(form.get('quality')) : null; const costPerTask = form.get('costPerTask') ? Number(form.get('costPerTask')) : null; const poweredBy = String(form.get('poweredBy') || '').trim() || null; const qualityLabel = String(form.get('qualityLabel') || '').trim() || null;
    const rating = starsFromQuality(quality, qualityLabel) ?? Number(event.currentTarget.elements.rating.value);
    const data = { name, categoryId, description, url, favicon: String(form.get('favicon') || (url ? `${new URL(url).origin}/favicon.ico` : '')), rating, pricing: form.get('pricing'), tags: String(form.get('tags')).split(',').map(t => t.trim()).filter(Boolean).slice(0, 8), notes: String(form.get('notes')).trim(), favorite: form.get('favorite') === 'on', quality, costPerTask, poweredBy, qualityLabel };
    if (tool) { Object.assign(tool, data); } else { const entry = { id: uid('tool'), ...data, addedAt: Date.now() }; state.tools.push(entry); tool = entry; }
    revealTool(tool);
    state.favoritesOrder = favoriteOrder().filter(id => id !== tool.id); if (tool.favorite) state.favoritesOrder.unshift(tool.id); persist(); closeModal(); render(); showToast(isEdit ? 'Tool updated.' : 'Tool added to your library.');
  });
  setTimeout(() => document.querySelector('#tool-name')?.focus(), 0);
}

function openCategoryForm(category = null) {
  activeModal = 'category-form'; const isEdit = Boolean(category);
  modalRoot.innerHTML = `<div class="modal-backdrop" data-close-backdrop><section class="modal small-modal" role="dialog" aria-modal="true" aria-labelledby="category-form-title"><header class="modal-header"><div><h2 id="category-form-title">${isEdit ? 'Edit category' : 'Add a category'}</h2><p>Give a new area of your library its own identity.</p></div><button class="modal-close" data-close-modal aria-label="Close">×</button></header><form id="category-form"><div class="modal-body"><div class="form-grid"><div class="field full"><label for="category-name">Category name *</label><input id="category-name" name="name" required maxlength="45" value="${esc(category?.name || '')}" placeholder="e.g. Local AI" /></div><div class="field"><label for="category-icon">Icon</label><input id="category-icon" name="icon" maxlength="4" value="${esc(category?.icon || '✦')}" placeholder="✦" /></div><div class="field"><label for="category-color">Accent color</label><input id="category-color" name="color" type="color" value="${esc(category?.color || '#4b9cff')}" /></div><div class="field full"><label for="category-description">Description *</label><textarea id="category-description" name="description" required maxlength="160" placeholder="What belongs in this category?">${esc(category?.description || '')}</textarea></div></div><p id="category-form-error" class="form-error" role="alert"></p></div><footer class="modal-footer"><button type="button" class="btn" data-close-modal>Cancel</button><button type="submit" class="btn primary">${isEdit ? 'Save changes' : 'Create category'}</button></footer></form></section></div>`;
  bindModalEvents();
  document.querySelector('#category-form')?.addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); const name = form.get('name').trim(); const description = form.get('description').trim(); const error = document.querySelector('#category-form-error'); if (!name || !description) { error.textContent = 'Please add a name and description.'; return; } const duplicate = state.categories.find(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== category?.id); if (duplicate) { error.textContent = 'A category with this name already exists.'; return; } const values = { name, description, icon: form.get('icon').trim() || '✦', color: form.get('color') || '#4b9cff' }; if (category) Object.assign(category, values); else state.categories.push({ id: uid('category'), ...values, collapsed: false }); persist(); closeModal(); render(); showToast(isEdit ? 'Category updated.' : 'Category created.'); });
  setTimeout(() => document.querySelector('#category-name')?.focus(), 0);
}

function openBackups() {
  const backups = listBackups();
  const rows = backups.map(b => `<div class="backup-row"><div><strong>${new Date(b.savedAt).toLocaleString()}</strong><span>${b.tools} tools · ${b.categories} categories</span></div><button class="btn small" data-restore-backup="${b.key}">Restore</button></div>`).join('');
  activeModal = 'backups';
  modalRoot.innerHTML = `<div class="modal-backdrop" data-close-backdrop><section class="modal small-modal" role="dialog" aria-modal="true" aria-labelledby="backups-title"><header class="modal-header"><div><h2 id="backups-title">Local backups</h2><p>Kept automatically in this browser: daily, before imports, and before any large deletion.</p></div><button class="modal-close" data-close-modal aria-label="Close">×</button></header><div class="modal-body">${rows || '<p class="confirm-text">No backups yet — one is taken on the next save.</p>'}<p class="detail-source">Current library: ${state.tools.length} tools · ${state.categories.length} categories. Backups live in this browser only; use Export for a copy you can keep elsewhere.</p></div><footer class="modal-footer"><button class="btn" data-close-modal>Close</button><button class="btn primary" id="snapshot-now">Save a backup now</button></footer></section></div>`;
  bindModalEvents();
  document.querySelector('#snapshot-now')?.addEventListener('click', () => { persist(); const made = snapshot('manual'); showToast(made ? 'Backup saved.' : 'Nothing to back up yet.'); openBackups(); });
  modalRoot.querySelectorAll('[data-restore-backup]').forEach(button => button.addEventListener('click', () => {
    const backup = backups.find(b => b.key === button.dataset.restoreBackup); if (!backup) return;
    openConfirm({ title: 'Restore this backup?', text: `It holds ${backup.tools} tools and ${backup.categories} categories from ${new Date(backup.savedAt).toLocaleString()}. Your current library (${state.tools.length} tools) is backed up first, then replaced.`, confirmLabel: 'Restore', onConfirm: () => { persist(); snapshot('before-restore'); backup.data.tools.forEach(syncRating); state = { ...backup.data, preferences: { ...makeSeed().preferences, ...backup.data.preferences } }; query = ''; closeModal(); persist(); render(); showToast('Backup restored.'); } });
  }));
}

function openConfirm({ title, text, confirmLabel, danger = false, onConfirm }) {
  activeModal = 'confirm'; modalRoot.innerHTML = `<div class="modal-backdrop" data-close-backdrop><section class="modal small-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><header class="modal-header"><div><h2 id="confirm-title">${esc(title)}</h2><p>Confirmation required</p></div><button class="modal-close" data-close-modal aria-label="Close">×</button></header><div class="modal-body"><p class="confirm-text">${esc(text)}</p></div><footer class="modal-footer"><button class="btn" data-close-modal>Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" id="confirm-action">${esc(confirmLabel)}</button></footer></section></div>`; bindModalEvents(); document.querySelector('#confirm-action').addEventListener('click', onConfirm); }

function bindModalEvents() {
  modalRoot.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeModal));
  modalRoot.querySelector('[data-close-backdrop]')?.addEventListener('click', event => { if (event.target === event.currentTarget) closeModal(); });
  modalRoot.querySelector('[data-open-tool-url]')?.addEventListener('click', event => { const tool = toolById(event.currentTarget.dataset.openToolUrl); if (tool?.url) window.open(tool.url, '_blank', 'noopener,noreferrer'); });
  modalRoot.querySelector('[data-edit-tool]')?.addEventListener('click', event => openToolForm(toolById(event.currentTarget.dataset.editTool)));
  modalRoot.querySelector('[data-detail-favorite]')?.addEventListener('click', event => { toggleFavorite(event.currentTarget.dataset.detailFavorite); openToolDetail(event.currentTarget.dataset.detailFavorite); });
  modalRoot.querySelector('[data-delete-tool]')?.addEventListener('click', event => { const tool = toolById(event.currentTarget.dataset.deleteTool); if (tool) openConfirm({ title: `Delete ${tool.name}?`, text: 'This tool will be removed from your library and any favorite stack. This cannot be undone.', confirmLabel: 'Delete tool', danger: true, onConfirm: () => { state.tools = state.tools.filter(item => item.id !== tool.id); state.favoritesOrder = favoriteOrder(); persist(); closeModal(); render(); showToast('Tool deleted.'); } }); });
}

function closeModal() { activeModal = null; modalRoot.innerHTML = ''; }

function exportData() { const payload = { version: 1, exportedAt: new Date().toISOString(), ...state }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `ai-tools-overview-backup-${new Date().toISOString().slice(0, 10)}.json`; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(link.href); showToast('Backup downloaded.'); }

importInput.addEventListener('change', event => { const [file] = event.target.files; event.target.value = ''; if (!file) return; if (file.size > 5 * 1024 * 1024) { showToast('That backup is larger than 5 MB and was not imported.'); return; } const reader = new FileReader(); reader.onload = () => { try { const imported = JSON.parse(reader.result); if (!validData(imported)) throw new Error('This does not look like an AI Tools Overview backup.'); const normalized = { categories: imported.categories.map(c => ({ id: String(c.id), name: String(c.name).slice(0, 45), description: String(c.description || '').slice(0, 160), icon: String(c.icon || '✦').slice(0, 4), color: /^#[0-9a-f]{6}$/i.test(c.color || '') ? c.color : '#4b9cff', collapsed: Boolean(c.collapsed), expanded: Boolean(c.expanded) })), tools: imported.tools.map(t => ({ id: String(t.id), categoryId: String(t.categoryId), name: String(t.name).slice(0, 70), description: String(t.description || '').slice(0, 240), url: (() => { try { return normalizedUrl(String(t.url || '')); } catch { return ''; } })(), favicon: String(t.favicon || ''), rating: Math.max(1, Math.min(5, Number(t.rating) || 3)), pricing: PRICING.includes(t.pricing) ? t.pricing : 'Freemium', tags: Array.isArray(t.tags) ? t.tags.map(x => String(x).slice(0, 30)).slice(0, 8) : [], notes: String(t.notes || '').slice(0, 1000), favorite: Boolean(t.favorite), addedAt: Number(t.addedAt) || Date.now(), quality: Number.isFinite(Number(t.quality)) ? Math.max(0, Math.min(100, Number(t.quality))) : null, costPerTask: Number.isFinite(Number(t.costPerTask)) ? Number(t.costPerTask) : null, poweredBy: t.poweredBy ? String(t.poweredBy).slice(0, 120) : null, qualityLabel: t.qualityLabel ? String(t.qualityLabel).slice(0, 60) : null })).map(syncRating).filter(t => imported.categories.some(c => String(c.id) === t.categoryId)), notes: String(imported.notes || '').slice(0, 5000), favoritesOrder: Array.isArray(imported.favoritesOrder) ? imported.favoritesOrder.map(String) : [], preferences: { ...makeSeed().preferences, ...(imported.preferences || {}) } }; openConfirm({ title: 'Restore this backup?', text: `It contains ${normalized.tools.length} tools and ${normalized.categories.length} categories. Restoring will replace the current local library.`, confirmLabel: 'Restore backup', onConfirm: () => { persist(); snapshot('before-import'); state = normalized; query = ''; closeModal(); persist(); render(); showToast('Backup restored successfully.'); } }); } catch { showToast('That file is not a valid backup. Nothing changed.'); } }; reader.readAsText(file); });

window.addEventListener('pagehide', persist);
if (restoredFromBackup) { persist(); setTimeout(() => showToast(`Library was empty — restored the automatic backup from ${new Date(restoredFromBackup.savedAt).toLocaleString()}.`), 300); }
document.addEventListener('keydown', event => { if (event.key === '/' && !activeModal && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) { event.preventDefault(); document.querySelector('#global-search')?.focus(); } if (event.key === 'Escape' && activeModal) closeModal(); });
document.addEventListener('click', event => { if (openMenuId && !event.target.closest('.category-menu-wrap')) { openMenuId = null; render(); } });

render();
