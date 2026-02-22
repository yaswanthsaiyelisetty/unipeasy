<div align="center">

# 🎓 UniPeasy

### Your Complete Academic Success Platform

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-unipeasy.com-7c3aed?style=for-the-badge)](https://unipeasy.com)
[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Everything you need to excel in engineering — topper-verified study materials, AI-powered learning tools, and personalized exam strategies. All in one place.**

[Live Website](https://unipeasy.com) · [Report Bug](https://github.com/yaswanthsaiyelisetty/unipeasy/issues) · [Request Feature](https://github.com/yaswanthsaiyelisetty/unipeasy/issues)

</div>

---

## ✨ Features

### 🤖 AI-Powered Learning Suite

| Feature | Description |
|---------|-------------|
| **🧠 AI Learning Assistant** | Breaks down complex topics into simple explanations, real-world analogies, visual mind maps, and adaptive quizzes |
| **📅 AI Exam Strategist** | Generates personalized, Pomodoro-based study timetables tailored to your syllabus and exam schedule |
| **⚡ AI Skill Accelerator** | Structured skill tracks (Python, Web Dev, DSA, Soft Skills) with instant AI-powered feedback |

### 📚 Resource Hub

| Feature | Description |
|---------|-------------|
| **📖 Study Materials** | Topper-verified notes organized by branch, year, and subject — across 8 engineering branches |
| **📁 My Documents** | Upload, store, and access your personal PDFs and notes from anywhere |
| **🏛️ Memory Palace** | Save AI-generated insights and mind maps for spaced repetition learning |

### 🛡️ Trust & Career

| Feature | Description |
|---------|-------------|
| **💼 Verified Internships** | Every listing manually verified to protect students from fake postings and scams |
| **🏆 Verified Hackathons** | Curated hackathon opportunities with verified organizer details and deadlines |
| **🤝 Community Suggestions** | Students can suggest internships & hackathons — vetted and added by our team |

---

## 🏗️ Tech Stack

<div align="center">

| Technology | Purpose |
|:---:|:---|
| ![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js) | High-performance React framework with App Router |
| ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) | Component-based UI library |
| ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black) | Authentication, Firestore database & cloud storage |
| ![Gemini](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white) | Advanced AI reasoning for all learning features |
| ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | Utility-first responsive styling |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | Type-safe development |
| ![Framer](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) | Smooth animations & micro-interactions |

</div>

---

## 📂 Project Structure

```
src/
├── app/                    # Pages & routing (Next.js App Router)
│   ├── (app)/              # Student-facing pages
│   │   ├── dashboard/      # Personalized learning dashboard
│   │   ├── learn/          # AI Learning Assistant
│   │   ├── strategist/     # AI Exam Strategist
│   │   ├── skills/         # AI Skill Accelerator
│   │   ├── materials/      # Study materials hub
│   │   ├── internships/    # Verified internship listings
│   │   ├── hackathons/     # Verified hackathon listings
│   │   ├── memory-palace/  # Saved AI insights
│   │   └── profile/        # User profile & settings
│   ├── (admin)/            # Admin panel (protected)
│   ├── (auth)/             # Authentication pages
│   └── about/              # About & team page
├── ai/                     # AI flows & prompt engineering
├── components/             # Reusable UI components
├── context/                # Global state management
├── hooks/                  # Custom React hooks
└── lib/                    # Utility functions & configs
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- A [Firebase](https://firebase.google.com/) project
- A [Google Gemini AI](https://ai.google.dev/) API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yaswanthsaiyelisetty/unipeasy.git
   cd unipeasy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Admin
   NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google Gemini AI
   GOOGLE_GENAI_API_KEY=your_gemini_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:9002](http://localhost:9002) and start learning! 🎉

---

## 🔐 Admin Panel

Access the admin dashboard at `/admin` to:
- 📊 View platform analytics and user activity
- 📚 Upload and manage study materials
- 💼 Add and verify internship listings
- 🏆 Manage hackathon postings
- 👥 Review community suggestions

> **Note:** The admin panel is password-protected for security.

---

## ☁️ Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yaswanthsaiyelisetty/unipeasy)

1. Push your code to GitHub
2. Import your repository at [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Deploy!

### Firebase App Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login & deploy
firebase login
firebase apphosting:backends:create
```

### Environment Variables Reference

| Variable | Required | Description |
|----------|:--------:|-------------|
| `NEXT_PUBLIC_ADMIN_PASSWORD` | ✅ | Admin panel access password |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `GOOGLE_GENAI_API_KEY` | ✅ | Google Gemini AI API key |
| `FIREBASE_CLIENT_EMAIL` | ❌ | For server-side uploads |
| `FIREBASE_PRIVATE_KEY` | ❌ | For server-side uploads |

---

## 👥 Team

<div align="center">

| | Name | Role |
|:---:|:---|:---|
| 👑 | **Yaswanth Sai Yelisetty** | Founder & Technical Lead |
| 🚀 | **T.G.S. Sri Ram** | Co-Founder, Team Manager & Backend Developer |
| 🚀 | **Vaishnavi** | Co-Founder, Contributor Lead & Onboarding |
| 📣 | **Syamala** | Marketing Lead |
| 💻 | **Ruthvik** | Frontend Developer |
| 💻 | **Raju** | Frontend Developer |
| 🔍 | **Jahnavi** | Reference Specialist |
| ✅ | **Varun** | Content Verifier |
| ✍️ | **Sravya** | Material Creator |
| 🎨 | **Vasanthi** | Material Creator |

</div>

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions or find bugs:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by students, for students**

[![Website](https://img.shields.io/badge/Website-unipeasy.com-7c3aed?style=flat-square)](https://unipeasy.com)
[![Instagram](https://img.shields.io/badge/Instagram-@unipeasy-E4405F?style=flat-square&logo=instagram&logoColor=white)](https://www.instagram.com/unipeasy)
[![Email](https://img.shields.io/badge/Email-theunipeasy@gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:theunipeasy@gmail.com)

⭐ **Star this repo if UniPeasy helps you!** ⭐

</div>
