# EduEdge AI 
**Empowering Rural Education through Offline-First, Hardware-Adaptive AI.**

![EduEdge AI Prototype](icon.png) *(Note: Add your icon.png here)*

## The Problem
Millions of students in rural areas face a massive digital divide. While urban students leverage cloud-based AI tools to accelerate their learning, rural students are often restricted by zero internet connectivity and low-end hardware (typically secondhand smartphones with 4GB of RAM). Modern EdTech solutions, heavily reliant on continuous cloud connectivity, are leaving these students behind.

## Our Solution
EduEdge AI is a fully offline, Progressive Web App (PWA) designed to bring the power of an educational neural engine directly to the "edge." We do not bring the student to the cloud; we bring the intelligence to the device. 

By caching the NCERT curriculum and utilizing a hardware-adaptive architecture, EduEdge AI delivers dynamic summaries, mindmaps, and quizzes without requiring a continuous internet connection.

## Key Features

* **Offline-First PWA:** Utilizes Service Workers (`sw.js`) to cache the entire application shell and knowledge base. Functions flawlessly in completely disconnected environments (Airplane Mode).
* **Hardware-Adaptive Engine:** The user interface dynamically scales its processing based on the user's available hardware:
    * **4GB RAM:** Provides basic semantic text extraction and offline quizzes.
    * **6GB RAM:** Unlocks Hierarchical Knowledge Graphs (Mindmaps) to visualize ontological relationships between concepts.
    * **8GB RAM:** Activates the Neural Exam Predictor, generating interactive, active-recall flashcards and detailed study guides.
* **Dynamic Knowledge Graphs:** Built with `vis-network` to generate structured, hierarchical mindmaps of complex NCERT science and English topics.
* **Tiered Summaries & Flashcards:** Moves beyond basic text blocks to provide structured overviews, key takeaways, and exam-focused active recall flashcards.
* **Smart Sync Protocol:** When the device detects a secure Wi-Fi connection, it silently packages the student's progress and quiz scores, syncing them to a central cloud for educator review.
* **Low-Resource UI:** Designed with high-contrast, vintage terminal aesthetics using Tailwind CSS to minimize battery drain and rendering lag on low-end mobile processors.

## Tech Stack
* **Frontend:** HTML5, Vanilla JavaScript, Tailwind CSS (via CDN for local caching)
* **Data Visualization:** Vis-Network (`vis.js`) for local mindmap rendering
* **Architecture:** Progressive Web App (PWA) with local `manifest.json` and Service Worker caching
* **Backend (Sync/API):** Python / FastAPI (Mocked for offline presentation capabilities)

## How to Run Locally

### 1. Run the Frontend (UI)
You can run the frontend using any basic local development server.
If you have Python installed:
```bash
# Navigate to the project directory
cd eduedge-ai

# Start a local web server
python -m http.server 8000
