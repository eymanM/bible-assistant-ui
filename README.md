# Bible Assistant - AI-Powered Bible Study Tool 📖✨

Bible Assistant is a modern, full-stack web application designed to revolutionize Bible study through the power of Artificial Intelligence. It provides users with semantic search capabilities, deep theological insights, and tailored commentaries, all wrapped in a premium, responsive user interface.

## 🚀 Key Features

- **🧠 Semantic Search**: Go beyond keyword matching. Ask natural language questions like *"What does the Bible say about anxiety?"* and get relevant scriptures and interpretations.
- **✨ AI Insights**: Leveraging LLMs to generate context-aware explanations and summaries for complex theological concepts.
- **📚 Old & New Testament**: Seamlessly access both Old and New Testament scriptures. 
- **📝 Commentary & Analysis**: Integrated commentaries to provide historical and cultural context.
- **🔐 Secure Authentication**: Robust user management via **AWS Cognito**.
- **💳 Credit System**: **Stripe** integration for managing study credits and premium features.
- **🎨 Modern UI/UX**: Built with **TailwindCSS** for a sleek, responsive, and accessible design.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Language**: TypeScript / React 19
- **Styling**: TailwindCSS, Lucide Icons, Radix UI
- **State Management**: React Hooks & Context API

### Backend & Infrastructure
- **Search Engine**: Python (Flask) with Vector Search (FAISS/ChromaDB)
- **AI/LLM**: Integration with Large Language Models for generative insights
- **Database**: PostgreSQL (User data, Credits)
- **Authentication**: AWS Cognito
- **Payments**: Stripe API

## 🏁 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js (v20+)
- PostgreSQL
- AWS Account (Cognito)
- Stripe Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/eymanM/bible-assistant-ui.git
   cd bible-assistant-ui
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_API_DOMAIN=http://localhost:5000
   NEXT_PUBLIC_AWS_USER_POOLS_ID=us-east-1_lB..
   NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID=157nas...
   STRIPE_WEBHOOK_SECRET=whsec_ac..
   STRIPE_SECRET_KEY=sk_test_51S..
   DATABASE_URL=postgres://postgres:password@localhost:5432/postgres
   NODE_ENV=development
   BACKEND_API_KEY=your-api-key-here
   SERPER_API_KEY=your-serper-api-key
   MEDIA_CACHE_EXPIRATION_DAYS=30
   USER_MEDIA_SEARCH_LIMIT=100
   USER_GENERAL_REQUEST_LIMIT=1000
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Start the Backend API**
   This frontend requires the **Bible Assistant API** to be running.
   
   Clone the backend repository and start the server:
   
   ```bash
   git clone https://github.com/eymanM/bible-assistant.git
   cd bible-assistant
   pip install -r requirements.txt
   python app.py
   ```
   *Ensure the API is properly configured and running.*

## 📂 Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components (Sidebar, SearchBar, Results)
├── hooks/            # Custom React hooks (useBibleSearch)
├── lib/              # Utilities (Auth, API clients)
└── styles/           # Global styles and Tailwind config
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License

---

<p align="center">
  Made with ❤️ by Mateusz
</p>
