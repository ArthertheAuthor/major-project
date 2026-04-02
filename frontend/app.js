const API = "http://127.0.0.1:8000";
let currentUser = null;
let activeChapter = null;

// UI Switcher
function toggleScreen(id) {
    document.getElementById('screen-auth').classList.add('hidden');
    document.getElementById('screen-dashboard').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
}

// AI Feedback Controls
function showLoader(text) {
    document.getElementById('ai-loader').classList.remove('hidden');
    document.getElementById('loader-text').innerText = text;
}
function hideLoader() { document.getElementById('ai-loader').classList.add('hidden'); }

// AUTHENTICATION
async function handleAuth(type) {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-pass').value.trim();

    if (!email || !password) return alert("Please enter credentials!");

    const endpoint = type === 'register' ? '/register' : '/login';

    try {
        const res = await fetch(`${API}${endpoint}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (type === 'register') {
            alert("Account Registered! You can now Login.");
        } else {
            if (data.user) {
                currentUser = data.user;
                document.getElementById('user-display').innerText = `ID: ${currentUser}`;
                toggleScreen('screen-dashboard');
                loadChapters();
            } else { 
                alert(data.message || "User not found. Please Register first!"); 
            }
        }
    } catch (e) { 
        alert("Backend Offline! Ensure main.py is running on port 8000."); 
    }
}

// LOADING CONTENT
async function loadChapters() {
    try {
        const res = await fetch(`${API}/chapters`);
        const data = await res.json();
        // Support both nested subjects or flat list
        const chapters = data.subjects ? data.subjects[0].chapters : data;
        const list = document.getElementById('chapter-list');
        list.innerHTML = "";

        chapters.forEach(ch => {
            const b = document.createElement('button');
            b.className = "w-full text-left p-3 rounded-lg hover:bg-slate-700 text-sm text-slate-400 transition mb-1 border border-transparent hover:border-slate-600";
            b.innerText = ch.title;
            b.onclick = () => {
                activeChapter = ch;
                document.getElementById('view-empty').classList.add('hidden');
                document.getElementById('view-main').classList.remove('hidden');
                document.getElementById('chapter-title').innerText = ch.title;
                document.getElementById('ai-content-box').innerHTML = "<p class='italic text-slate-600 font-mono'>Local model loaded. Awaiting instruction...</p>";
            };
            list.appendChild(b);
        });
    } catch (e) { console.error("Chapter Error:", e); }
}

// AI FEATURES
async function fetchSummary() {
    if (!activeChapter) return;
    showLoader("NEURAL SUMMARIZER BOOTING...");
    try {
        const res = await fetch(`${API}/summary`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ text: activeChapter.content || activeChapter.title })
        });
        const data = await res.json();
        setTimeout(() => {
            hideLoader();
            document.getElementById('ai-content-box').innerHTML = `
                <h4 class='text-blue-400 font-bold mb-4 uppercase text-xs tracking-widest'>AI Generated Summary</h4>
                <p class='text-lg leading-relaxed text-slate-300'>${data.summary}</p>`;
        }, 1200);
    } catch (e) { hideLoader(); alert("API Error"); }
}

async function fetchMindmap() {
    if (!activeChapter) return;
    showLoader("MAPPING SEMANTIC NODES...");
    try {
        const res = await fetch(`${API}/mindmap`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ text: activeChapter.content || activeChapter.title })
        });
        const data = await res.json();
        setTimeout(() => {
            hideLoader();
            document.getElementById('ai-content-box').innerHTML = `
                <h4 class='text-purple-400 font-bold mb-4 uppercase text-xs tracking-widest'>Concept Knowledge Graph</h4>
                <div id='map' style='height:350px' class='bg-slate-950 rounded-xl border border-slate-800'></div>`;
            new vis.Network(document.getElementById('map'), { nodes: data.nodes, edges: data.edges }, {
                nodes: { color: '#3b82f6', font: { color: '#fff', size: 14 }, shape: 'dot' },
                edges: { color: '#475569', arrows: 'to' }
            });
        }, 1200);
    } catch (e) { hideLoader(); alert("API Error"); }
}

async function fetchQuiz() {
    if (!activeChapter) return;
    showLoader("SYNTHESIZING QUIZ MODULE...");
    try {
        const res = await fetch(`${API}/quiz`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ text: activeChapter.content || activeChapter.title })
        });
        const data = await res.json();
        setTimeout(() => {
            hideLoader();
            const q = data.quiz[0];
            document.getElementById('ai-content-box').innerHTML = `
                <h4 class='text-emerald-400 font-bold mb-6 uppercase text-xs tracking-widest'>Knowledge Check</h4>
                <p class='text-xl text-white mb-6 font-medium'>${q.question}</p>
                <div class='grid grid-cols-1 gap-3'>
                    ${q.options.map(o => `<button onclick="handleResult('${o}', '${q.answer}')" class='p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-900/20 text-left transition'>${o}</button>`).join('')}
                </div>`;
        }, 1200);
    } catch (e) { hideLoader(); alert("API Error"); }
}

function handleResult(sel, cor) {
    if (sel === cor) {
        alert("Correct! Progress synced locally.");
    } else {
        alert("Incorrect. Reviewing the summary is recommended.");
    }
}