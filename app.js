const STORAGE_KEY = 'ai-tools-overview-v2';

const PREVIEW_LIMIT = 5; // tools shown per category before "Show more"

const PRICING = ['Free', 'Freemium', 'Paid', 'Open Source', 'Free / Open Source'];
const FILTERS = ['All', 'Favorites', 'Free', 'Freemium', 'Paid', 'Open Source'];
const KNOWN_WEBSITES = {
  'chatgpt.com': { name: 'ChatGPT', categoryId: 'chat', description: 'General-purpose assistant for writing, analysis, coding, and images.', rating: 5, pricing: 'Freemium', tags: ['general', 'vision'] },
  'claude.ai': { name: 'Claude', categoryId: 'chat', description: 'Thoughtful assistant for analysis, writing, and long documents.', rating: 5, pricing: 'Freemium', tags: ['reasoning', 'writing'] },
  'gemini.google.com': { name: 'Gemini', categoryId: 'chat', description: 'Google’s multimodal AI assistant and workspace companion.', rating: 5, pricing: 'Freemium', tags: ['google', 'multimodal'] },
  'perplexity.ai': { name: 'Perplexity', categoryId: 'research', description: 'Answer engine that searches the web and cites sources.', rating: 5, pricing: 'Freemium', tags: ['search', 'citations'] },
  'midjourney.com': { name: 'Midjourney', categoryId: 'image', description: 'High-quality image generation in a distinctive visual style.', rating: 5, pricing: 'Paid', tags: ['art', 'images'] },
  'runwayml.com': { name: 'Runway', categoryId: 'video', description: 'Generative video tools and AI-powered editing.', rating: 5, pricing: 'Freemium', tags: ['editing', 'creative'] },
  'elevenlabs.io': { name: 'ElevenLabs', categoryId: 'audio', description: 'Natural voice generation, dubbing, and sound effects.', rating: 5, pricing: 'Freemium', tags: ['voice', 'speech'] },
  'cursor.com': { name: 'Cursor', categoryId: 'code', description: 'AI-first code editor with agent workflows.', rating: 5, pricing: 'Freemium', tags: ['editor', 'agent'] },
  'github.com': { name: 'GitHub Copilot', categoryId: 'code', description: 'AI pair programmer embedded in developer tools.', rating: 5, pricing: 'Paid', tags: ['github', 'editor'] },
  'n8n.io': { name: 'n8n', categoryId: 'automation', description: 'Flexible workflow automation with self-hosting options.', rating: 5, pricing: 'Free / Open Source', tags: ['workflows', 'self-hosted'] },
  'zapier.com': { name: 'Zapier', categoryId: 'automation', description: 'Connect apps and automate business workflows.', rating: 4, pricing: 'Freemium', tags: ['workflows', 'apps'] },
  'make.com': { name: 'Make', categoryId: 'automation', description: 'Visual automation scenarios across services.', rating: 4, pricing: 'Freemium', tags: ['workflows', 'visual'] },
  'notion.so': { name: 'Notion AI', categoryId: 'productivity', description: 'Writing, search, and knowledge assistance inside Notion.', rating: 5, pricing: 'Freemium', tags: ['workspace', 'notes'] },
  'figma.com': { name: 'Figma AI', categoryId: 'design', description: 'Product design and collaborative visual systems.', rating: 5, pricing: 'Freemium', tags: ['ui', 'product'] },
  'canva.com': { name: 'Canva AI', categoryId: 'design', description: 'AI-assisted graphics, documents, and presentations.', rating: 5, pricing: 'Freemium', tags: ['design', 'slides'] },
  'comfy.org': { name: 'ComfyUI', categoryId: 'image', description: 'Node-based interface for advanced image workflows.', rating: 5, pricing: 'Open Source', tags: ['nodes', 'local'] }
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

const seedCategories = [
  ['chat', 'AI Chat / Assistants', 'Everyday reasoning, conversations, and multimodal help.', '✦', '#ad67ff'],
  ['research', 'Search / Research', 'Evidence, citations, papers, and deeper discovery.', '⌕', '#4c9dff'],
  ['writing', 'Writing / Content', 'Drafting, editing, and content systems.', '✎', '#21c9cf'],
  ['image', 'Image Generation', 'Visual concepts, images, and creative workflows.', '▧', '#73de37'],
  ['video', 'Video Generation', 'Video creation, editing, and motion.', '▷', '#f0c51c'],
  ['audio', 'Audio / Voice', 'Speech, sound, music, and voice synthesis.', '♬', '#f2994a'],
  ['code', 'Code / Development', 'AI-native builders and development companions.', '⌘', '#b16aff'],
  ['automation', 'Automation / Agents', 'Workflows, orchestration, and autonomous work.', '⚙', '#4a9eff'],
  ['data', 'Data / Analytics', 'Analysis, dashboards, and business intelligence.', '▥', '#27c7c6'],
  ['productivity', 'Productivity', 'Workspaces, focus, and knowledge management.', '✓', '#79df3f'],
  ['design', 'Design / Presentations', 'Design tools, decks, and visual communication.', '◇', '#f3cb27'],
  ['transcription', 'Voice / Transcription', 'Meetings, transcription, and call intelligence.', '◉', '#f4a05b'],
  ['learning', 'Education / Learning', 'Study aids, tutoring, and skill-building.', '▰', '#9c70fb'],
  ['legal', 'Legal / Documents', 'Contracts, document review, and legal research.', '▱', '#59acff'],
  ['health', 'Health / Wellness', 'Health education and personal wellbeing tools.', '♡', '#31cfc8'],
  ['finance', 'Finance', 'Finance research, models, and personal money.', '$', '#7bdf44'],
  ['marketing', 'Marketing / SEO', 'Growth, search visibility, and marketing systems.', '⚑', '#f2c827'],
  ['creative3d', '3D / Creative', '3D assets, spatial design, and creative experiments.', '◈', '#e16cff']
].map(([id, name, description, icon, color]) => ({ id, name, description, icon, color, collapsed: false }));

const seedEntries = [
  ['chat','ChatGPT','General-purpose assistant for writing, analysis, coding, and images.','https://chatgpt.com',5,'Freemium','general,vision'],
  ['chat','Claude','Thoughtful assistant for analysis, writing, and long documents.','https://claude.ai',5,'Freemium','reasoning,writing'],
  ['chat','Gemini','Google’s multimodal AI assistant and workspace companion.','https://gemini.google.com',5,'Freemium','google,multimodal'],
  ['chat','Grok','Real-time conversational assistant from xAI.','https://grok.com',4,'Freemium','realtime'],
  ['chat','Microsoft Copilot','AI assistant integrated across Microsoft products.','https://copilot.microsoft.com',4,'Freemium','microsoft,work'],
  ['chat','Poe','One place to compare many leading AI models.','https://poe.com',4,'Freemium','models'],
  ['research','Perplexity','Answer engine that searches the web and cites sources.','https://www.perplexity.ai',5,'Freemium','search,citations'],
  ['research','Consensus','Search scientific research in plain language.','https://consensus.app',4,'Freemium','science,papers'],
  ['research','Elicit','Research assistant for literature reviews and evidence.','https://elicit.com',4,'Freemium','papers,evidence'],
  ['research','NotebookLM','Source-grounded research notebooks with audio overviews.','https://notebooklm.google.com',5,'Free','notes,google'],
  ['research','Semantic Scholar','AI-powered search for academic literature.','https://www.semanticscholar.org',4,'Free','papers,academic'],
  ['research','ResearchRabbit','Visual exploration of scholarly papers and authors.','https://www.researchrabbit.ai',4,'Freemium','papers,discovery'],
  ['writing','Jasper','Content platform for marketing teams.','https://www.jasper.ai',4,'Paid','marketing,brand'],
  ['writing','Grammarly','Writing feedback for clarity, tone, and correctness.','https://www.grammarly.com',4,'Freemium','editing'],
  ['writing','Writer','Enterprise writing and brand governance platform.','https://writer.com',4,'Paid','enterprise,brand'],
  ['writing','Sudowrite','Creative writing companion for fiction authors.','https://www.sudowrite.com',4,'Paid','creative,fiction'],
  ['writing','Copy.ai','AI workflows for sales and marketing copy.','https://www.copy.ai',4,'Freemium','copy,sales'],
  ['image','Midjourney','High-quality image generation in a distinctive visual style.','https://www.midjourney.com',5,'Paid','art,images'],
  ['image','FLUX','A family of powerful image-generation models.','https://blackforestlabs.ai',5,'Open Source','models,local'],
  ['image','Ideogram','Image creation with especially strong typography.','https://ideogram.ai',4,'Freemium','text,design'],
  ['image','ChatGPT Images','Image creation and editing within ChatGPT.','https://chatgpt.com',5,'Freemium','editing,general'],
  ['image','Adobe Firefly','Commercially-oriented creative image generation.','https://firefly.adobe.com',4,'Freemium','adobe,creative'],
  ['image','Stable Diffusion','Open image models with a broad local ecosystem.','https://stability.ai',4,'Free / Open Source','models,local'],
  ['image','ComfyUI','Node-based interface for advanced image workflows.','https://www.comfy.org',5,'Open Source','nodes,local'],
  ['video','Sora','OpenAI video generation and editing experience.','https://sora.com',5,'Paid','video,creative'],
  ['video','Veo','Google’s high-fidelity generative video model.','https://deepmind.google/models/veo/',5,'Paid','video,google'],
  ['video','Runway','Generative video tools and AI-powered editing.','https://runwayml.com',5,'Freemium','editing,creative'],
  ['video','Kling','Text-to-video and image-to-video generation.','https://klingai.com',4,'Freemium','video,animation'],
  ['video','Pika','Fast, playful video generation and effects.','https://pika.art',4,'Freemium','video,effects'],
  ['video','Luma Dream Machine','Generative video and camera motion from Luma.','https://lumalabs.ai/dream-machine',4,'Freemium','video,motion'],
  ['audio','ElevenLabs','Natural voice generation, dubbing, and sound effects.','https://elevenlabs.io',5,'Freemium','voice,speech'],
  ['audio','Suno','Generate songs from a text prompt.','https://suno.com',4,'Freemium','music,generation'],
  ['audio','Udio','Music creation with detailed prompt control.','https://www.udio.com',4,'Freemium','music'],
  ['audio','Whisper','Open-source speech recognition from OpenAI.','https://openai.com/index/whisper/',5,'Open Source','speech,transcription'],
  ['audio','Descript','Edit audio and video like a text document.','https://www.descript.com',4,'Freemium','podcast,editing'],
  ['code','Claude Code','Agentic coding in the terminal.','https://www.anthropic.com/claude-code',5,'Paid','agent,terminal'],
  ['code','Codex','OpenAI’s coding agent for software tasks.','https://openai.com/codex/',5,'Paid','agent,terminal'],
  ['code','Cursor','AI-first code editor with agent workflows.','https://www.cursor.com',5,'Freemium','editor,agent'],
  ['code','GitHub Copilot','AI pair programmer embedded in developer tools.','https://github.com/features/copilot',5,'Paid','github,editor'],
  ['code','Windsurf','Agentic IDE from Codeium.','https://windsurf.com',4,'Freemium','editor,agent'],
  ['code','Replit','Browser-based app building with AI assistance.','https://replit.com',4,'Freemium','apps,cloud'],
  ['code','Cline','Open-source autonomous coding agent for VS Code.','https://cline.bot',4,'Open Source','vscode,agent'],
  ['code','Aider','Terminal pair programming with LLMs.','https://aider.chat',4,'Open Source','terminal,git'],
  ['automation','n8n','Flexible workflow automation with self-hosting options.','https://n8n.io',5,'Free / Open Source','workflows,self-hosted'],
  ['automation','Zapier','Connect apps and automate business workflows.','https://zapier.com',4,'Freemium','workflows,apps'],
  ['automation','Make','Visual automation scenarios across services.','https://www.make.com',4,'Freemium','workflows,visual'],
  ['automation','OpenAI Agents SDK','Framework for building tool-using AI agents.','https://openai.github.io/openai-agents-python/',4,'Open Source','agents,python'],
  ['automation','LangGraph','Framework for controllable, stateful agent workflows.','https://langchain-ai.github.io/langgraph/',4,'Open Source','agents,framework'],
  ['data','ChatGPT Advanced Data Analysis','Analyze spreadsheets, data files, and code in ChatGPT.','https://chatgpt.com',5,'Freemium','data,python'],
  ['data','Tableau AI','Analytics and insights within Tableau.','https://www.tableau.com/products/tableau-ai',4,'Paid','bi,enterprise'],
  ['data','Power BI Copilot','AI assistance for Microsoft business intelligence.','https://www.microsoft.com/power-platform/products/power-bi',4,'Paid','bi,microsoft'],
  ['data','Hex','Collaborative notebooks for data teams.','https://hex.tech',4,'Freemium','notebooks,sql'],
  ['productivity','Notion AI','Writing, search, and knowledge assistance inside Notion.','https://www.notion.so/product/ai',5,'Freemium','workspace,notes'],
  ['productivity','Microsoft 365 Copilot','AI in Word, Excel, PowerPoint, and Teams.','https://www.microsoft.com/microsoft-365/copilot',4,'Paid','microsoft,office'],
  ['productivity','Mem','AI-first notes and knowledge capture.','https://mem.ai',4,'Paid','notes,knowledge'],
  ['productivity','Motion','AI planning for calendar, tasks, and focus.','https://www.usemotion.com',4,'Paid','planning,tasks'],
  ['productivity','Reclaim','Smart scheduling for habits and flexible work.','https://reclaim.ai',4,'Freemium','calendar,focus'],
  ['design','Canva AI','AI-assisted graphics, documents, and presentations.','https://www.canva.com/ai-image-generator/',5,'Freemium','design,slides'],
  ['design','Figma AI','Product design and collaborative visual systems.','https://www.figma.com/ai/',5,'Freemium','ui,product'],
  ['design','FigJam AI','AI help for diagrams, workshops, and whiteboards.','https://www.figma.com/figjam/',4,'Freemium','whiteboard,workshops'],
  ['design','Gamma','AI-native presentations, documents, and sites.','https://gamma.app',4,'Freemium','presentations,docs'],
  ['design','Framer AI','Generate and publish responsive web experiences.','https://www.framer.com/ai',4,'Freemium','web,design'],
  ['transcription','Otter.ai','Meeting transcription and collaborative notes.','https://otter.ai',4,'Freemium','meetings,notes'],
  ['transcription','Fireflies.ai','Record, transcribe, and search conversations.','https://fireflies.ai',4,'Freemium','meetings,search'],
  ['transcription','Granola','AI meeting notes that build from your context.','https://www.granola.ai',4,'Freemium','meetings,notes'],
  ['learning','Khanmigo','Guided learning assistant from Khan Academy.','https://www.khanmigo.ai',4,'Paid','education,tutor'],
  ['learning','Quizlet Q-Chat','Conversational study support and practice.','https://quizlet.com/features/q-chat',4,'Freemium','study,quiz'],
  ['learning','Duolingo Max','AI-powered language practice and explanations.','https://www.duolingo.com',4,'Paid','language,tutor'],
  ['legal','Harvey','Legal AI for professional services teams.','https://www.harvey.ai',4,'Paid','legal,enterprise'],
  ['legal','Spellbook','AI contract review and drafting in Microsoft Word.','https://www.spellbook.legal',4,'Paid','contracts,word'],
  ['health','Wysa','Conversational mental wellbeing support.','https://www.wysa.com',4,'Freemium','mental-health,wellness'],
  ['health','Ada Health','Personal health assessment and guidance.','https://ada.com',4,'Freemium','health,symptoms'],
  ['finance','Ramp Intelligence','AI automation for business spending.','https://ramp.com',4,'Paid','business,expenses'],
  ['finance','Monarch Money','Personal finance planning and tracking.','https://www.monarchmoney.com',4,'Paid','personal-finance'],
  ['finance','Wolfram','Computational intelligence and technical answers.','https://www.wolfram.com',5,'Freemium','math,science'],
  ['marketing','Surfer SEO','Content optimization based on search data.','https://surferseo.com',4,'Paid','seo,content'],
  ['marketing','HubSpot AI','AI capabilities in a customer platform.','https://www.hubspot.com/artificial-intelligence',4,'Freemium','crm,marketing'],
  ['marketing','Ahrefs','Search intelligence and SEO research.','https://ahrefs.com',5,'Paid','seo,research'],
  ['creative3d','Meshy','Text and image to 3D asset generation.','https://www.meshy.ai',4,'Freemium','3d,assets'],
  ['creative3d','Tripo','Create production-ready 3D models with AI.','https://www.tripo3d.ai',4,'Freemium','3d,models'],
  ['creative3d','Spline AI','Prompt-to-3D experiments for interactive scenes.','https://spline.design/ai',4,'Freemium','3d,interactive']
];

const NAME_LIBRARY = new Map(seedEntries.map(([categoryId, name, description, url, rating, pricing, tags]) => [
  name.toLowerCase(),
  { name, categoryId, description, url, rating, pricing, tags: tags.split(',').filter(Boolean), ...(MODEL_QUALITY[name.toLowerCase()] || {}) }
]));

function makeSeed() {
  const now = Date.now();
  return {
    categories: structuredClone(seedCategories),
    tools: seedEntries.map(([categoryId, name, description, url, rating, pricing, tags], index) => ({
      id: `seed-${String(index + 1).padStart(3, '0')}`,
      categoryId, name, description, url, rating, pricing,
      tags: tags.split(',').filter(Boolean), notes: '',
      favorite: ['ChatGPT', 'Claude', 'Perplexity', 'Cursor', 'n8n'].includes(name),
      addedAt: now - (seedEntries.length - index) * 3600000,
      ...(MODEL_QUALITY[name.toLowerCase()] || {})
    })),
    notes: 'A few things to explore:\n• Build a repeatable research workflow with NotebookLM + Perplexity\n• Test an n8n agent for weekly industry summaries\n• Compare image workflows: Midjourney, FLUX, and ComfyUI',
    favoritesOrder: ['seed-001', 'seed-002', 'seed-007', 'seed-038', 'seed-045'],
    preferences: { pricing: 'All', category: 'All', view: 'grid', sort: 'manual' }
  };
}

function safeLoad() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (validData(parsed)) return { ...parsed, preferences: { ...makeSeed().preferences, ...parsed.preferences } };
  } catch { /* localStorage or malformed data falls back safely */ }
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

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
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

function applyNameInfo(form) {
  const nameField = form.elements.name; const status = form.querySelector('#autofill-status');
  const info = nameInfo(nameField?.value);
  const quality = form.querySelector('[name="quality"]'); const costPerTask = form.querySelector('[name="costPerTask"]'); const poweredBy = form.querySelector('[name="poweredBy"]'); const qualityLabel = form.querySelector('[name="qualityLabel"]');
  if (!info) {
    if (quality) quality.value = ''; if (costPerTask) costPerTask.value = ''; if (poweredBy) poweredBy.value = ''; if (qualityLabel) qualityLabel.value = '';
    if (status && !form.dataset.enriched) status.textContent = 'Type a known tool name to auto-fill its details, or paste a website below.';
    return;
  }
  const fill = fieldFiller(form);
  fill('description', info.description); fill('url', info.url); fill('tags', info.tags, value => value.join(', ')); fill('rating', info.rating, String); fill('pricing', info.pricing);
  const category = form.elements.categoryId; if (category && info.categoryId && (!category.dataset.manual || category.dataset.auto === 'true')) { category.value = info.categoryId; category.dataset.auto = 'true'; }
  const favicon = form.querySelector('[name="favicon"]'); if (favicon && info.favicon) favicon.value = info.favicon;
  if (quality) quality.value = info.quality ?? ''; if (costPerTask) costPerTask.value = info.costPerTask ?? ''; if (poweredBy) poweredBy.value = info.poweredBy ?? ''; if (qualityLabel) qualityLabel.value = info.qualityLabel ?? '';
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
    <div class="tool-meta"><span class="stars" aria-label="${tool.rating} out of 5 stars">${stars}</span><span class="price-label"><i class="pricing-dot ${pricingClass(tool.pricing)}"></i>${esc(prettyPrice(tool.pricing))}</span>${quality ? `<span class="quality-row">${quality}</span>` : ''}</div>
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
  modalRoot.innerHTML = `<div class="modal-backdrop" data-close-backdrop><section class="modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><header class="modal-header"><div><h2 id="detail-title">Tool details</h2><p>Keep the useful context close to the tool.</p></div><button class="modal-close" data-close-modal aria-label="Close">×</button></header><div class="modal-body"><div class="detail-hero">${toolIcon(tool, 'detail-icon')}<div class="detail-info"><h3>${esc(tool.name)}</h3><p>${esc(category.name)} · <span class="stars">${'★'.repeat(tool.rating)}${'☆'.repeat(5 - tool.rating)}</span></p></div></div><div class="detail-section"><h4>Description</h4><p>${esc(tool.description || 'No description added.')}</p></div><div class="detail-section"><h4>Pricing</h4><div class="detail-meta"><span class="detail-pill"><i class="pricing-dot ${pricingClass(tool.pricing)}"></i> ${esc(tool.pricing)}</span><span class="detail-pill">★ ${tool.rating}/5 rating</span>${tool.favorite ? '<span class="detail-pill">★ In my tool stack</span>' : ''}</div></div>${tool.quality != null ? `<div class="detail-section"><h4>Quality &amp; cost</h4><div class="detail-meta"><span class="detail-pill">${tool.quality}/100 ${esc((tool.qualityLabel || 'Artificial Analysis Intelligence Index').replace('Artificial Analysis ', '').toLowerCase())}</span><span class="detail-pill">~$${Number(tool.costPerTask).toFixed(2)} per task</span></div><p class="detail-source">${tool.poweredBy ? `Powered by ${esc(tool.poweredBy)}. ` : ''}Source: <a class="tool-url" href="https://artificialanalysis.ai" target="_blank" rel="noopener noreferrer">artificialanalysis.ai ↗</a></p></div>` : ''}<div class="detail-section"><h4>Tags</h4><div class="detail-meta">${tags}</div></div>${tool.notes ? `<div class="detail-section"><h4>Personal notes</h4><p>${esc(tool.notes)}</p></div>` : ''}<div class="detail-section"><h4>Website</h4><p>${tool.url ? `<a class="tool-url" href="${esc(tool.url)}" target="_blank" rel="noopener noreferrer">${esc(tool.url.replace(/^https?:\/\//, ''))} ↗</a>` : 'No website added.'}</p></div><div class="detail-actions"><button class="btn primary" data-open-tool-url="${tool.id}" ${tool.url ? '' : 'disabled'}>Open website ↗</button><button class="btn" data-edit-tool="${tool.id}">Edit</button><button class="btn" data-detail-favorite="${tool.id}">${tool.favorite ? '★ Unfavorite' : '☆ Favorite'}</button><button class="btn danger" data-delete-tool="${tool.id}">Delete</button></div></div></section></div>`;
  bindModalEvents();
}

function openToolForm(tool = null, preselectedCategory = null) {
  activeModal = 'tool-form'; const isEdit = Boolean(tool); const defaultCategory = tool?.categoryId || preselectedCategory || state.categories[0]?.id || '';
  modalRoot.innerHTML = `<div class="modal-backdrop" data-close-backdrop><section class="modal" role="dialog" aria-modal="true" aria-labelledby="tool-form-title"><header class="modal-header"><div><h2 id="tool-form-title">${isEdit ? 'Edit tool' : 'Add a tool'}</h2><p>${isEdit ? 'Update this entry in your library.' : 'Add a useful AI tool to your personal map.'}</p></div><button class="modal-close" data-close-modal aria-label="Close">×</button></header><form id="tool-form"><div class="modal-body"><div class="form-grid"><div class="field full"><label for="tool-name">Tool name *</label><input id="tool-name" name="name" required maxlength="70" value="${esc(tool?.name || '')}" placeholder="e.g. ComfyUI — known tools fill in the rest" autocomplete="off" /></div><div class="field"><label for="tool-category">Category *</label><select id="tool-category" name="categoryId" required>${state.categories.map(c => `<option value="${esc(c.id)}" ${c.id === defaultCategory ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div><div class="field full"><div class="label-row"><label for="tool-description">Description *</label><button type="button" class="link-btn" id="fetch-description-btn" title="Replace the description with the one on the tool’s website">↻ From website</button></div><textarea id="tool-description" name="description" required maxlength="240" placeholder="What is this tool useful for?">${esc(tool?.description || '')}</textarea></div><div class="field full"><label for="tool-url">Website URL (optional)</label><input id="tool-url" name="url" maxlength="500" type="text" value="${esc(tool?.url || '')}" placeholder="https://example.com" /></div><div class="field"><label for="tool-rating">Rating</label><select id="tool-rating" name="rating">${[5,4,3,2,1].map(n => `<option value="${n}" ${Number(tool?.rating || 5) === n ? 'selected' : ''}>${n} / 5</option>`).join('')}</select></div><div class="field"><label for="tool-pricing">Pricing</label><select id="tool-pricing" name="pricing">${PRICING.map(p => `<option value="${esc(p)}" ${tool?.pricing === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select></div><div class="field full"><label for="tool-tags">Tags</label><input id="tool-tags" name="tags" maxlength="160" value="${esc((tool?.tags || []).join(', '))}" placeholder="e.g. image, local, workflow" /></div><div class="field full"><label for="tool-notes">Personal notes</label><textarea id="tool-notes" name="notes" maxlength="1000" placeholder="Why is this useful to you?">${esc(tool?.notes || '')}</textarea></div><label class="check-field"><input name="favorite" type="checkbox" ${tool?.favorite ? 'checked' : ''}/> Add to my tool stack</label></div><p id="form-error" class="form-error" role="alert"></p></div><footer class="modal-footer"><button type="button" class="btn" data-close-modal>Cancel</button><button type="submit" class="btn primary">${isEdit ? 'Save changes' : 'Add tool'}</button></footer></form></section></div>`;
  bindModalEvents();
  const toolForm = document.querySelector('#tool-form');
  const urlField = toolForm?.elements.url;
  const faviconField = document.createElement('input');
  faviconField.name = 'favicon'; faviconField.type = 'hidden'; faviconField.value = tool?.favicon || '';
  toolForm?.append(faviconField);
  [['quality', tool?.quality], ['costPerTask', tool?.costPerTask], ['poweredBy', tool?.poweredBy], ['qualityLabel', tool?.qualityLabel]].forEach(([field, value]) => {
    const hidden = document.createElement('input'); hidden.name = field; hidden.type = 'hidden'; hidden.value = value ?? ''; toolForm?.append(hidden);
  });
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
    const data = { name, categoryId, description, url, favicon: String(form.get('favicon') || (url ? `${new URL(url).origin}/favicon.ico` : '')), rating: Number(form.get('rating')), pricing: form.get('pricing'), tags: String(form.get('tags')).split(',').map(t => t.trim()).filter(Boolean).slice(0, 8), notes: String(form.get('notes')).trim(), favorite: form.get('favorite') === 'on', quality, costPerTask, poweredBy, qualityLabel };
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

importInput.addEventListener('change', event => { const [file] = event.target.files; event.target.value = ''; if (!file) return; if (file.size > 5 * 1024 * 1024) { showToast('That backup is larger than 5 MB and was not imported.'); return; } const reader = new FileReader(); reader.onload = () => { try { const imported = JSON.parse(reader.result); if (!validData(imported)) throw new Error('This does not look like an AI Tools Overview backup.'); const normalized = { categories: imported.categories.map(c => ({ id: String(c.id), name: String(c.name).slice(0, 45), description: String(c.description || '').slice(0, 160), icon: String(c.icon || '✦').slice(0, 4), color: /^#[0-9a-f]{6}$/i.test(c.color || '') ? c.color : '#4b9cff', collapsed: Boolean(c.collapsed), expanded: Boolean(c.expanded) })), tools: imported.tools.map(t => ({ id: String(t.id), categoryId: String(t.categoryId), name: String(t.name).slice(0, 70), description: String(t.description || '').slice(0, 240), url: (() => { try { return normalizedUrl(String(t.url || '')); } catch { return ''; } })(), favicon: String(t.favicon || ''), rating: Math.max(1, Math.min(5, Number(t.rating) || 3)), pricing: PRICING.includes(t.pricing) ? t.pricing : 'Freemium', tags: Array.isArray(t.tags) ? t.tags.map(x => String(x).slice(0, 30)).slice(0, 8) : [], notes: String(t.notes || '').slice(0, 1000), favorite: Boolean(t.favorite), addedAt: Number(t.addedAt) || Date.now(), quality: Number.isFinite(Number(t.quality)) ? Math.max(0, Math.min(100, Number(t.quality))) : null, costPerTask: Number.isFinite(Number(t.costPerTask)) ? Number(t.costPerTask) : null, poweredBy: t.poweredBy ? String(t.poweredBy).slice(0, 120) : null, qualityLabel: t.qualityLabel ? String(t.qualityLabel).slice(0, 60) : null })).filter(t => imported.categories.some(c => String(c.id) === t.categoryId)), notes: String(imported.notes || '').slice(0, 5000), favoritesOrder: Array.isArray(imported.favoritesOrder) ? imported.favoritesOrder.map(String) : [], preferences: { ...makeSeed().preferences, ...(imported.preferences || {}) } }; openConfirm({ title: 'Restore this backup?', text: `It contains ${normalized.tools.length} tools and ${normalized.categories.length} categories. Restoring will replace the current local library.`, confirmLabel: 'Restore backup', onConfirm: () => { state = normalized; query = ''; closeModal(); persist(); render(); showToast('Backup restored successfully.'); } }); } catch { showToast('That file is not a valid backup. Nothing changed.'); } }; reader.readAsText(file); });

window.addEventListener('pagehide', persist);
document.addEventListener('keydown', event => { if (event.key === '/' && !activeModal && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) { event.preventDefault(); document.querySelector('#global-search')?.focus(); } if (event.key === 'Escape' && activeModal) closeModal(); });
document.addEventListener('click', event => { if (openMenuId && !event.target.closest('.category-menu-wrap')) { openMenuId = null; render(); } });

render();
