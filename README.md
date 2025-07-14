# TechMate

TechMate is your grandparent’s favorite new tech companion — a voice-first AI assistant and support platform built specifically to empower seniors to use modern technology with confidence.

## Motivation

Watching our grandparents struggle with modern technology sparked the idea for TechMate. The generation that taught us life skills now needs our help navigating the digital world. Their frustration with confusing interfaces and vulnerability to tech-related scams motivated us to create a bridge between generations using technology.

## What It Does

TechMate empowers seniors with:

- **Voice-first AI assistance** for instant tech help
- **Human-in-the-loop support** from family and global volunteers
- **Interactive tutorials** tailored for senior learners with low digital literacy

## Project Development

**Frontend:**
- Built with **React + TypeScript + Vite**
- Senior-friendly UI with Bootstrap 5.3
- Voice input using `react-speech-kit` and Web Speech API

**Backend:**
- **Flask** Python server for AI step generation and video recommendations
- **OpenAI GPT-4** for transcription, simplification, and tutorial generation
- **Firebase (Auth + Firestore)** for secure data storage and authentication

## AI Capabilities

- Real-time LLM-powered transcription and tech support steps
- Adaptive prompt engineering for elderly users
- Video category summarizer and YouTube tutor link generation
- Summary endpoint for conversation clarity and ticket escalation

## Challenges We Overcame

- Selecting optimal LLMs for transcription and tutoring
- Seamlessly integrating voice/video uploads into the UI
- Creating an efficient escalation system for human support
- Balancing usability with strong data privacy for seniors

## Accomplishments

- Fully integrated voice-based assistant tailored for elders
- Successfully handled real-time transcription and GPT-based suggestions
- Implemented fallback video tutorials categorized by device/OS
- Designed human escalation and feedback summarization pipeline
- ß
## Scripts

```bash
npm run dev       # Start local Vite development server
npm run build     # Build frontend for production
npm run preview   # Preview production build locally
npm run lint      # Run ESLint for code quality
````

## Dependencies

* React 19 + TypeScript
* Firebase 9 (Auth + Firestore)
* Flask + OpenAI
* Vite + ESLint + Bootstrap
* React Speech Kit

#### [Link to Live Demo](https://www.youtube.com/watch?v=OivQJb1afGA&t=1s)

---

Made with ❤️ for our elders.
