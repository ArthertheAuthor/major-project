const API = "http://127.0.0.1:8000";
let currentUser = null;
let activeChapter = null;

// --- UI UTILS ---
function toggleScreen(id) {
    document.getElementById('screen-auth').classList.add('hidden');
    document.getElementById('screen-dashboard').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
}

function showLoader(text) {
    document.getElementById('ai-loader').classList.remove('hidden');
    document.getElementById('loader-text').innerText = text;
}

function hideLoader() { 
    document.getElementById('ai-loader').classList.add('hidden'); 
}

// --- AUTH LOGIC (Fix #5: Ensure data.user check works) ---
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
            alert("Registration successful! Now please Login.");
        } else {
            // Checks if backend returned the "user" key correctly
            if (data.user) {
                currentUser = data.user;
                document.getElementById('user-display').innerText = `Student: ${currentUser}`;
                toggleScreen('screen-dashboard');
                loadChapters();
            } else {
                alert(data.message || "User not found. Please register first.");
            }
        }
    } catch (e) { 
        alert("CRITICAL: Cannot connect to Backend. Is main.py running?"); 
    }
}

// --- CHAPTERS (Fix #2: Simplified handling) ---
async function loadChapters() {
    try {
        const res = await fetch(`${API}/chapters`);
        const data = await res.json();
        
        // Backend returns a list directly now
        const chapters = data; 
        const list = document.getElementById('chapter-list');
        list.innerHTML = "";

        chapters.forEach(ch => {
            const b = document.createElement('button');
            b.className = "w-full text-left p-3 rounded-lg hover:bg-slate-700 text-sm text-slate-400 transition mb-1";
            b.innerText = ch.title;
            b.onclick = () => {
                activeChapter = ch; // This now includes ch.content!
                document.getElementById('view-empty').classList.add('hidden');
                document.getElementById('view-main').classList.remove('hidden');
                document.getElementById('chapter-title').innerText = ch.title;
                document.getElementById('ai-content-box').innerHTML = 
                    `<p class='italic text-slate-500'>Module loaded. Neural inference engine standby...</p>`;
            };
            list.appendChild(b);
        });
    } catch (e) {
        console.error("Chapter Load Error:", e);
    }
}

// --- AI FEATURES (Fix #1 & #4: Use .content & check if selected) ---

async function fetchSummary() {
    if (!activeChapter) return alert("Select a chapter first!");
    
    showLoader("SYNTHESIZING SUMMARY...");
    try {
        const res = await fetch(`${API}/summary`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            // FIX: Sending full content, not just title
            body: JSON.stringify({ text: activeChapter.content }) 
        });
        const data = await res.json();
        
        setTimeout(() => {
            hideLoader();
            document.getElementById('ai-content-box').innerHTML = `
                <h4 class='text-blue-400 font-bold mb-2 uppercase text-xs'>AI Summary</h4>
                <p class='text-lg leading-relaxed text-slate-200'>${data.summary}</p>
            `;
        }, 1200);
    } catch (e) { hideLoader(); alert("Summary API Error"); }
}

async function fetchMindmap() {
    if (!activeChapter) return alert("Select a chapter first!");

    showLoader("MAPPING KNOWLEDGE GRAPH...");
    try {
        const res = await fetch(`${API}/mindmap`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            // FIX: Sending full content
            body: JSON.stringify({ text: activeChapter.content }) 
        });
        const data = await res.json();
        
        setTimeout(() => {
            hideLoader();
            document.getElementById('ai-content-box').innerHTML = `
                <h4 class='text-purple-400 font-bold mb-4 uppercase text-xs'>Semantic Relationship Map</h4>
                <div id='map-container' style='height:350px' class='bg-slate-950 rounded-xl border border-slate-800'></div>
            `;
            
            // Fix #3: Rendering with nodes and edges
            const container = document.getElementById('map-container');
            const options = {
                nodes: { color: '#3b82f6', font: { color: '#fff', size: 14 }, shape: 'dot' },
                edges: { color: '#475569', arrows: 'to' },
                physics: { enabled: true }
            };
            new vis.Network(container, { nodes: data.nodes, edges: data.edges }, options);
        }, 1200);
    } catch (e) { hideLoader(); alert("Mindmap API Error"); }
}

async function fetchQuiz() {
    if (!activeChapter) return alert("Select a chapter first!");

    showLoader("GENERATING ADAPTIVE QUIZ...");
    try {
        const res = await fetch(`${API}/quiz`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            // FIX: Sending full content
            body: JSON.stringify({ text: activeChapter.content }) 
        });
        const data = await res.json();
        
        setTimeout(() => {
            hideLoader();
            const q = data.quiz[0];
            document.getElementById('ai-content-box').innerHTML = `
                <h4 class='text-emerald-400 font-bold mb-6 uppercase text-xs'>Knowledge Validation</h4>
                <p class='text-white text-xl mb-6'>${q.question}</p>
                <div class='grid grid-cols-1 gap-3'>
                    ${q.options.map(opt => `
                        <button onclick="handleQuizAnswer('${opt}', '${q.answer}')" 
                                class='p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-900/20 text-left transition'>
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            `;
        }, 1200);
    } catch (e) { hideLoader(); alert("Quiz API Error"); }
}

async function handleQuizAnswer(selected, correct) {
    if (selected === correct) {
        alert("Correct! Progress updated in local database.");
        // Optional: Send score to /progress
        await fetch(`${API}/progress`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user: currentUser, score: 1 })
        });
    } else {
        alert(`Incorrect. The system suggests reviewing the summary.`);
    }
}