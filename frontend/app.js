// --- STATE MANAGEMENT ---
let currentRam = 8;
let isOffline = true;
let currentChapter = null;
let currentSubject = null;
let isMobileView = true;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("screen-auth").classList.remove("hidden");
    document.getElementById("screen-dashboard").classList.add("hidden");
});

// --- DEVICE SIMULATOR ---
function toggleDevice() {
    isMobileView = !isMobileView;
    const frame = document.getElementById("app-frame");
    if (isMobileView) {
        frame.classList.add("phone-frame");
        frame.classList.remove("desktop-frame");
    } else {
        frame.classList.remove("phone-frame");
        frame.classList.add("desktop-frame");
    }
}

// --- AUTH ---
async function handleAuth(type) {
    const email = document.getElementById("auth-email").value || "student@edu.ai";
    const pass = document.getElementById("auth-pass").value || "1234";

    try {
        const response = await fetch("http://localhost:8000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: pass })
        });
        const data = await response.json();

        if (data.message === "Login successful") {
            goToDashboard();
        } else {
            alert("Terminal Error: " + data.message);
        }
    } catch (e) {
        console.warn("Backend not found. Bypassing auth for demo.");
        goToDashboard();
    }
}

function goToDashboard() {
    document.getElementById("screen-auth").classList.add("hidden");
    document.getElementById("screen-dashboard").classList.remove("hidden");
    document.getElementById("screen-dashboard").classList.add("flex");
    loadChapters();
}

// --- HARDWARE SIMULATORS ---
function handleRAMChange() {
    currentRam = parseInt(document.getElementById("ram-select").value);
    const mindmapBtn = document.getElementById("btn-mindmap");
    mindmapBtn.disabled = currentRam < 6;
}

function toggleNetwork() {
    isOffline = !isOffline;
    const text = document.getElementById("network-text");
    const dot = document.getElementById("network-dot");

    if (isOffline) {
        text.innerText = "OFFLINE";
        dot.classList.replace("bg-green-500", "bg-black");
    } else {
        text.innerText = "SYNCING";
        dot.classList.replace("bg-black", "bg-green-500");
        showLoader("Syncing Delta Updates to LMS...");
        setTimeout(() => {
            hideLoader();
            text.innerText = "ONLINE";
            alert("Smart Sync Complete: Local progress uploaded to cloud.");
        }, 1500);
    }
}

function showLoader(text) {
    document.getElementById("ai-loader").classList.remove("hidden");
    document.getElementById("loader-text").innerText = text;
}
function hideLoader() {
    document.getElementById("ai-loader").classList.add("hidden");
}

// --- INDESTRUCTIBLE CHAPTER LOADER (WITH GROUPING) ---
async function loadChapters() {
    const listDiv = document.getElementById("chapter-list");
    listDiv.innerHTML = ""; 

    let chapters = [];
    try {
        const response = await fetch("http://localhost:8000/chapters");
        chapters = await response.json();
    } catch (e) {
        console.warn("Backend fail. Using fallback UI data.");
    }

    // 1. Fallback Data 
    if (!chapters || chapters.length === 0) {
        chapters = [
            { id: 1, subject: "eng", title: "Unit 1: The Fun They Had", content: "Margie wrote in her diary..." },
            { id: 2, subject: "eng", title: "Unit 2: The Sound of Music", content: "Evelyn Glennie listens to sound without hearing it..." },
            { id: 1, subject: "sci", title: "Unit 1: Matter in Our Surroundings", content: "Matter is made up of tiny particles..." },
            { id: 2, subject: "sci", title: "Unit 2: Is Matter Around Us Pure", content: "Mixtures are constituted by more than one kind of pure form..." }
        ];
    }

    // 2. Group the chapters by Subject
    const groupedChapters = chapters.reduce((groups, chapter) => {
        const subject = chapter.subject || "other";
        if (!groups[subject]) {
            groups[subject] = [];
        }
        groups[subject].push(chapter);
        return groups;
    }, {});

    // Friendly names for the labels
    const subjectNames = {
        "eng": "English",
        "sci": "Science",
        "other": "General"
    };

    // 3. Build the grouped UI Blocks
    Object.keys(groupedChapters).forEach(subKey => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "inline-flex items-stretch border-2 border-black mr-6 shadow-[3px_3px_0px_#111] bg-white cursor-default";

        const subLabel = document.createElement("div");
        subLabel.className = "bg-black text-white text-[10px] font-black uppercase px-3 py-2 flex items-center justify-center tracking-widest";
        subLabel.innerText = subjectNames[subKey] || subKey;
        groupDiv.appendChild(subLabel);

        groupedChapters[subKey].forEach(ch => {
            const btn = document.createElement("button");
            btn.className = "px-3 py-2 border-l-2 border-black bg-white text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap active:bg-gray-300 outline-none";
            
            const displayTitle = ch.title || "Untitled";
            btn.innerText = displayTitle.length > 25 ? displayTitle.substring(0, 25) + "..." : displayTitle;
            
            btn.onclick = () => selectChapter(ch);
            groupDiv.appendChild(btn);
        });

        listDiv.appendChild(groupDiv);
    });
}

// 🔥 THE MISSING FUNCTION IS BACK 🔥
function selectChapter(chapter) {
    currentChapter = chapter;
    currentSubject = chapter.subject || "eng"; 
    
    // Force CSS display to bypass Tailwind conflicts
    document.getElementById("view-empty").style.display = "none";
    document.getElementById("view-main").style.display = "block";
    
    document.getElementById("chapter-title").innerText = chapter.title;
    document.getElementById("ai-content-box").innerHTML = "<p class='text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-4'>// Neural Engine Ready</p>";
}

// --- AI FEATURES (VINTAGE STYLING) ---
async function fetchSummary() {
    if (!currentChapter) return;
    const delay = currentRam === 4 ? 2500 : 1000;
    showLoader(`Loading Local LLM (${currentRam}GB)...`);
    
    setTimeout(async () => {
        try {
            const response = await fetch("http://localhost:8000/summary", {
                method: "POST", headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ text: currentChapter.content })
            });
            const data = await response.json();
            document.getElementById("ai-content-box").innerHTML = `
                <h4 class="text-xs uppercase font-black tracking-widest border-b-2 border-black mb-3 pb-1">Contextual Summary</h4>
                <p class="font-bold bg-gray-100 p-4 border border-black">${data.summary}</p>
            `;
        } catch (e) { console.error(e); }
        hideLoader();
    }, delay);
}

async function fetchQuiz() {
    if (!currentChapter) return;
    showLoader("Generating Assessment...");
    
    setTimeout(async () => {
        try {
            const response = await fetch("http://localhost:8000/quiz", {
                method: "POST", headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ subject: currentSubject, chapter_id: currentChapter.id })
            });
            const data = await response.json();
            
            let quizHTML = `<h4 class="text-xs uppercase font-black tracking-widest border-b-2 border-black mb-3 pb-1">Adaptive Quiz</h4>`;
            data.quiz.forEach((q, i) => {
                quizHTML += `
                    <div class="mb-5 p-4 border-2 border-black bg-white shadow-[4px_4px_0px_#111]">
                        <p class="font-black mb-3 text-sm">${i + 1}. ${q.question}</p>
                        <div class="space-y-2">
                            ${q.options.map(opt => `<label class="block p-2 border border-gray-300 hover:border-black hover:bg-gray-50 cursor-pointer font-bold text-xs"><input type="radio" name="q${i}" class="mr-2"> ${opt}</label>`).join('')}
                        </div>
                    </div>`;
            });
            document.getElementById("ai-content-box").innerHTML = quizHTML;
        } catch (e) { console.error(e); }
        hideLoader();
    }, 1500);
}

async function fetchMindmap() {
    if (!currentChapter) return;
    showLoader("Rendering Concept Map...");
    
    setTimeout(async () => {
        try {
            const response = await fetch("http://localhost:8000/mindmap", {
                method: "POST", headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ text: currentChapter.content })
            });
            const data = await response.json();
            
            document.getElementById("ai-content-box").innerHTML = `
                <h4 class="text-xs uppercase font-black tracking-widest border-b-2 border-black mb-3 pb-1">Local Flow Diagram</h4>
                <div id="mindmap-container" style="width: 100%; height: 350px;" class="border-2 border-black bg-white shadow-[4px_4px_0px_#111]"></div>
            `;
            
            const container = document.getElementById("mindmap-container");
            const graphData = { nodes: new vis.DataSet(data.nodes), edges: new vis.DataSet(data.edges) };
            const options = {
                nodes: { shape: 'box', color: { background: 'white', border: 'black' }, font: { color: 'black', face: 'Space Mono', bold: true }, borderWidth: 2 },
                edges: { color: 'black', width: 2 }
            };
            new vis.Network(container, graphData, options);
        } catch (e) { console.error(e); }
        hideLoader();
    }, 2000);
}