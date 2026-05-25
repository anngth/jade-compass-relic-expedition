![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/nguyenthanhan/jade-compass-relic-expedition?utm_source=oss&utm_medium=github&utm_campaign=nguyenthanhan%2Fjade-compass-relic-expedition&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
[![Release and Deploy](https://github.com/nguyenthanhan/jade-compass-relic-expedition/workflows/Deploy%20and%20Release/badge.svg)](https://github.com/nguyenthanhan/jade-compass-relic-expedition/actions/workflows/deploy-and-release.yml)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy%20on-Vercel-black)](https://vercel.com/heimers-projects/jade-compass-relic-expedition)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# 🎮 Jade Compass: Relic Expedition

A retro 2D pixel-art treasure hunting adventure game built with Next.js, React, and TypeScript. Navigate through perilous choices to find the legendary Jade Compass!

## 🚀 Quick Start

**Prerequisites**: Node.js 18+ (recommended: 20+), pnpm/yarn/npm

1. **Clone & Install**:

```bash
git clone https://github.com/nguyenthanhan/jade-compass-relic-expedition.git
cd jade-compass-relic-expedition
pnpm install
```

2. **Run Development Server**:

```bash
pnpm run dev
```

3. **Open** [http://localhost:3000](http://localhost:3000) in your browser

**Features**: Hot reload, TypeScript, ESLint, Tailwind CSS

## 🎯 How to Play

1. **Configure**: Set rounds (2-10), choices per round (2-5), and content language (English/Vietnamese)
2. **Choose Provider**: Select an AI provider and enter your API key
3. **Make Choices**: Each round has multiple choices, but only one leads forward
4. **Find Treasure**: Survive all rounds to claim the Jade Compass

**Controls**: Mouse clicks, number keys (1-5), or Tab/Enter for accessibility

## 🤖 LLM Provider Configuration

### API Providers

**Setup**: Get API key → Select provider → Enter key → (Optional) Choose model

**Supported Providers**:

- **OpenAI**: GPT-5, GPT-4, GPT-3.5 models with custom model support
- **OpenRouter**: DeepSeek, Kimi, Qwen, Llama, Mistral, Gemini variants
- **Anthropic**: Claude Opus 4, Claude Sonnet 4, Claude Haiku models
- **Google**: Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 2.0 models
- **Mistral**: Mistral Large, Medium, Small models (with proper JSON format templates)
- **Vercel AI SDK**: Unified interface for multiple providers (OpenAI, Anthropic, Google, Groq, Mistral, OpenRouter)

**AI SDK Variants**: Enhanced functionality available for all providers

## 🎨 Features

**Visual**: Retro pixel-art style with custom animations  
**Gameplay**: Multiple endings, choice-based progression  
**Accessibility**: Full keyboard navigation, ARIA labels, focus management  
**Language**: Content generation in English or Vietnamese  
**Technical**: Responsive design, sessionStorage for API keys, server-side LLM proxy, Next.js 16 + React 19+

## 📝 Scripts

**Development**: `pnpm dev` (start), `pnpm build` (build), `pnpm start` (production)  
**Quality**: `pnpm lint` (ESLint), `pnpm type-check` (TypeScript)  
**Release**: `pnpm release` (auto-version), `pnpm changelog` (extract)

## 🔒 Security

**API Keys**: Stored in browser sessionStorage; synced once to an encrypted httpOnly cookie via `/api/session`  
**LLM Requests**: Proxied server-side; keys are never included in generate/test request bodies  
**Session**: Requires `SESSION_SECRET` in production (see `.env.example`)  
**Rate Limiting**: Per-session (or per-IP fallback) via middleware  
**Headers**: CSP, X-Frame-Options, and related security headers enabled  
**Production**: HTTPS required for secure cookies

---

**Ready for adventure?** Start your treasure hunt now! 🗺️💎
