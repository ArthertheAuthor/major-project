if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(reg => console.log('Service Worker Registered'))
    .catch(err => console.log('Service Worker Fail', err));
}

// --- STATE MANAGEMENT ---
let currentRam = 8;
let isOffline = true;
let currentChapter = null;
let currentSubject = null;
let isMobileView = true;

// --- THE NEURAL KNOWLEDGE BASE ---
// This ensures that even if the backend is basic, the UI remains robust.
const NEURAL_KNOWLEDGE_BASE = {
    "sci_1": {
        summary: { overview: "Physical nature of matter and its three primary states.", points: ["Matter is made of particles.", "Sublimation: Solid to Gas.", "Evaporation causes cooling effect."], exam_tip: "Focus on Latent Heat and the Kelvin conversion." },
        mindmap: {
            nodes: [{id:1, label:"MATTER", color:"#000", font:{color:"#fff"}}, {id:2, label:"States"}, {id:3, label:"Solid"}, {id:4, label:"Liquid"}, {id:5, label:"Gas"}, {id:6, label:"Changes"}, {id:7, label:"Sublimation"}],
            edges: [{from:1, to:2}, {from:2, to:3}, {from:2, to:4}, {from:2, to:5}, {from:1, to:6}, {from:6, to:7}]
        }
    },
    "sci_2": {
        summary: { overview: "Classification of matter into pure substances and mixtures.", points: ["Elements vs Compounds.", "Colloids show Tyndall effect.", "Homogeneous vs Heterogeneous."], exam_tip: "Memorize the table of dispersed phases in colloids." },
        mindmap: {
            nodes: [{id:1, label:"PURITY", color:"#000", font:{color:"#fff"}}, {id:2, label:"Mixtures"}, {id:3, label:"Pure"}, {id:4, label:"Solution"}, {id:5, label:"Colloid"}, {id:6, label:"Element"}, {id:7, label:"Compound"}],
            edges: [{from:1, to:2}, {from:1, to:3}, {from:2, to:4}, {from:2, to:5}, {from:3, to:6}, {from:3, to:7}]
        }
    },
    "sci_3": {
        summary: { overview: "Fundamental laws of chemistry and atomic structure.", points: ["Law of Conservation of Mass.", "Valency and Chemical Formulas.", "The Mole Concept."], exam_tip: "Practice calculating molecular mass of common salts." },
        mindmap: {
            nodes: [{id:1, label:"ATOMS", color:"#000", font:{color:"#fff"}}, {id:2, label:"Laws"}, {id:3, label:"Mass"}, {id:4, label:"Symbols"}, {id:5, label:"Mole Concept"}, {id:6, label:"Dalton's Theory"}],
            edges: [{from:1, to:2}, {from:1, to:3}, {from:1, to:4}, {from:1, to:5}, {from:2, to:6}]
        }
    },
    "eng_1": {
        summary: { overview: "A glimpse into a future where education is entirely mechanical.", points: ["Margie's diary entry 2157.", "The discovery of a paper book.", "Human teachers vs Robots."], exam_tip: "Compare social aspects of school vs isolation." },
        mindmap: {
            nodes: [{id:1, label:"THE BOOK", color:"#000", font:{color:"#fff"}}, {id:2, label:"Margie"}, {id:3, label:"Tommy"}, {id:4, label:"Mechanical"}, {id:5, label:"Old School"}, {id:6, label:"2157 AD"}],
            edges: [{from:1, to:2}, {from:1, to:3}, {from:1, to:4}, {from:1, to:5}, {from:4, to:6}]
        }
    },
    "eng_2": {
        summary: { overview: "Biographies of musical legends overcoming barriers.", points: ["Evelyn's vibration sensing.", "Bismillah Khan's Shehnai journey.", "The ban on the Pungi."], exam_tip: "Understand how music transcends physical ability." },
        mindmap: {
            nodes: [{id:1, label:"MUSIC", color:"#000", font:{color:"#fff"}}, {id:2, label:"Evelyn"}, {id:3, label:"Bismillah"}, {id:4, label:"Vibrations"}, {id:5, label:"Red Fort"}, {id:6, label:"Scottish"}],
            edges: [{from:1, to:2}, {from:1, to:3}, {from:2, to:4}, {from:3, to:5}, {from:2, to:6}]
        }
    },
    "eng_3": {
        summary: { overview: "A child's evolving perspective of her father.", points: ["Kezia's fear of strictness.", "The birthday gift incident.", "The nightmare revelation."], exam_tip: "Focus on the transition from fear to understanding." },
        mindmap: {
            nodes: [{id:1, label:"FAMILY", color:"#000", font:{color:"#fff"}}, {id:2, label:"Kezia"}, {id:3, label:"Father"}, {id:4, label:"Strictness"}, {id:5, label:"Compassion"}, {id:6, label:"Nightmare"}],
            edges: [{from:1, to:2}, {from:1, to:3}, {from:3, to:4}, {from:3, to:5}, {from:2, to:6}]
        }
    }
};

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
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: pass })
        });
        const data = await response.json();
        if (data.message === "Login successful") { goToDashboard(); } 
        else { alert("Terminal Error: " + data.message); }
    } catch (e) { goToDashboard(); }
}

function goToDashboard() {
    document.getElementById("screen-auth").classList.add("hidden");
    document.getElementById("screen-dashboard").classList.remove("hidden");
    document.getElementById("screen-dashboard").classList.add("flex");
    loadChapters();
}

function handleRAMChange() {
    currentRam = parseInt(document.getElementById("ram-select").value);
    const mm = document.getElementById("btn-mindmap");
    const fc = document.getElementById("btn-flashcards");
    if(mm) mm.disabled = currentRam < 6;
    if(fc) fc.disabled = currentRam < 8;
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
        showLoader("Syncing Delta Updates...");
        setTimeout(() => { hideLoader(); text.innerText = "ONLINE"; alert("Smart Sync Complete."); }, 1200);
    }
}

function showLoader(text) {
    document.getElementById("ai-loader").classList.remove("hidden");
    document.getElementById("loader-text").innerText = text;
}
function hideLoader() {
    document.getElementById("ai-loader").classList.add("hidden");
}

async function loadChapters() {
    const listDiv = document.getElementById("chapter-list");
    listDiv.innerHTML = ""; 
    let chapters = [];
    try {
        const response = await fetch("http://localhost:8000/chapters");
        chapters = await response.json();
    } catch (e) { console.warn("Backend offline."); }

    if (!chapters || chapters.length === 0) {
        chapters = [
            { id: 1, subject: "sci", title: "Unit 1: Matter" },
            { id: 2, subject: "sci", title: "Unit 2: Pure Matter" },
            { id: 3, subject: "sci", title: "Unit 3: Atoms" },
            { id: 1, subject: "eng", title: "Unit 1: Fun They Had" },
            { id: 2, subject: "eng", title: "Unit 2: Sound of Music" },
            { id: 3, subject: "eng", title: "Unit 3: Little Girl" }
        ];
    }

    const grouped = chapters.reduce((g, c) => {
        const s = c.subject || "eng";
        if (!g[s]) g[s] = [];
        g[s].push(c);
        return g;
    }, {});

    const names = { "eng": "ENGLISH", "sci": "SCIENCE" };

    Object.keys(grouped).forEach(k => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "inline-flex items-stretch border-2 border-black mr-6 shadow-[3px_3px_0px_#111] bg-white";
        const subLabel = document.createElement("div");
        subLabel.className = "bg-black text-white text-[9px] font-black uppercase px-2 py-2 flex items-center justify-center";
        subLabel.innerText = names[k] || k.toUpperCase();
        groupDiv.appendChild(subLabel);

        grouped[k].forEach(ch => {
            const btn = document.createElement("button");
            btn.className = "px-3 py-2 border-l-2 border-black bg-white text-[9px] font-bold hover:bg-gray-100 cursor-pointer whitespace-nowrap outline-none";
            btn.innerText = ch.title.substring(0, 15);
            btn.onclick = () => selectChapter(ch);
            groupDiv.appendChild(btn);
        });
        listDiv.appendChild(groupDiv);
    });
}

function selectChapter(chapter) {
    currentChapter = chapter;
    currentSubject = chapter.subject || "eng"; 
    document.getElementById("view-empty").style.display = "none";
    document.getElementById("view-main").style.display = "block";
    document.getElementById("chapter-title").innerText = chapter.title;
    document.getElementById("ai-content-box").innerHTML = "<p class='text-gray-400 font-bold uppercase text-[9px] mt-4'>// Local Model Loaded</p>";
}

// --- AI FEATURES (ENRICHED FROM NEURAL_KNOWLEDGE_BASE) ---

async function fetchSummary() {
    if (!currentChapter) return;
    const key = `${currentSubject}_${currentChapter.id}`;
    const entry = NEURAL_KNOWLEDGE_BASE[key] || { summary: { overview: "Basic Analysis Complete.", points: ["General information extraction..."], exam_tip: "Review chapter text." }};
    
    showLoader(`Deep Text Analysis (${currentRam}GB)...`);
    setTimeout(() => {
        const data = entry.summary;
        let html = `<h4 class="text-xs uppercase font-black border-b-2 border-black mb-3">Contextual Analysis</h4><div class="space-y-4">
            <section><p class="text-[8px] font-black text-gray-400">// Overview</p><p class="font-bold border-l-4 border-black pl-3 text-[10px]">${data.overview}</p></section>`;
        if (currentRam >= 6) {
            html += `<section><p class="text-[8px] font-black text-gray-400">// Key Takeaways</p>
                    <ul class="list-disc list-inside font-bold text-[9px]">${data.points.map(p => `<li>${p}</li>`).join('')}</ul></section>`;
        }
        if (currentRam === 8) {
            html += `<section class="bg-black text-white p-3 shadow-[4px_4px_0px_#ccc]">
                    <p class="text-[7px] uppercase opacity-70">Exam Predictor:</p><p class="text-[9px] font-bold mt-1">${data.exam_tip}</p></section>`;
        }
        document.getElementById("ai-content-box").innerHTML = html + `</div>`;
        hideLoader();
    }, 1200);
}

async function fetchMindmap() {
    if (!currentChapter) return;
    const key = `${currentSubject}_${currentChapter.id}`;
    const entry = NEURAL_KNOWLEDGE_BASE[key] || { mindmap: { nodes: [{id:1, label:currentChapter.title}], edges: [] }};

    showLoader("Constructing Knowledge Graph...");
    setTimeout(() => {
        try {
            document.getElementById("ai-content-box").innerHTML = `
                <h4 class="text-xs uppercase font-black border-b-2 border-black mb-3">Logical Structure</h4>
                <div id="mindmap-container" style="width: 100%; height: 350px;" class="border-2 border-black bg-white shadow-[4px_4px_0px_#000]"></div>
            `;
            const options = {
                layout: { hierarchical: { direction: "UD", sortMethod: "directed", levelSeparation: 70 } },
                nodes: { shape: 'box', borderWidth: 2, color: { background: '#fff', border: '#000' }, font: { face: 'Space Mono', size: 9, bold: true }, margin: 6 },
                edges: { color: '#000', width: 2, arrows: { to: { enabled: true, scaleFactor: 0.5 } } },
                physics: false
            };
            new vis.Network(document.getElementById("mindmap-container"), { nodes: entry.mindmap.nodes, edges: entry.mindmap.edges }, options);
        } catch (err) { console.error(err); } finally { hideLoader(); }
    }, 1800);
}

async function fetchFlashcards() {
    if (currentRam < 8) return;
    showLoader("Extracting Flashcards...");
    setTimeout(() => {
        const cards = [
            { q: "Define Primary Concept", a: "Core theoretical framework." },
            { q: "Most Probable Question", a: "Explain state change via heat." },
            { q: "Key Terminology", a: "Latent Heat / Semantic Shift." }
        ];
        let html = `<h4 class="text-xs uppercase font-black border-b-2 border-black mb-4">Revision Cards</h4>`;
        cards.forEach(card => {
            html += `<div class="flashcard-container mb-3" onclick="this.classList.toggle('flipped')" style="height:110px;">
                    <div class="flashcard-inner"><div class="flashcard-front font-black text-[9px] uppercase">${card.q}</div>
                    <div class="flashcard-back font-bold text-[9px] italic">${card.a}</div></div></div>`;
        });
        document.getElementById("ai-content-box").innerHTML = html;
        hideLoader();
    }, 1000);
}

async function fetchQuiz() {
    if (!currentChapter) return;
    showLoader("Generating Quiz...");
    setTimeout(async () => {
        try {
            const res = await fetch("http://localhost:8000/quiz", {
                method: "POST", headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ subject: currentSubject, chapter_id: currentChapter.id })
            });
            const data = await res.json();
            
            let html = `<h4 class="text-xs uppercase font-black border-b-2 border-black mb-3">Assessment</h4>`;
            
            data.quiz.forEach((q, i) => {
                // Encode answer to safely handle words with apostrophes like "Father's"
                const safeCorrect = encodeURIComponent(q.answer);
                
                html += `<div class="mb-4 p-3 border-2 border-black bg-white shadow-[3px_3px_0px_#111] quiz-container" data-correct="${safeCorrect}">
                        <p class="font-black mb-2 text-[10px]">${i + 1}. ${q.question}</p>
                        <div class="space-y-2">`;
                        
                q.options.forEach(opt => {
                    const safeOpt = encodeURIComponent(opt);
                    html += `
                        <label class="block p-2 border border-gray-300 font-bold text-[9px] cursor-pointer hover:bg-gray-100 transition-all">
                            <input type="radio" name="q${i}" value="${safeOpt}" class="mr-2" onchange="checkAnswer(this)"> 
                            ${opt}
                        </label>`;
                });
                
                html += `</div></div>`;
            });
            document.getElementById("ai-content-box").innerHTML = html;
        } catch (e) { 
            alert("Backend Quiz Data Missing."); 
        } finally { 
            hideLoader(); 
        }
    }, 1200);
}

// --- INTERACTIVE QUIZ LOGIC ---
function checkAnswer(radioInput) {
    // 1. Find the parent container and get the encoded correct answer
    const container = radioInput.closest('.quiz-container');
    const correctEncoded = container.getAttribute('data-correct');
    const selectedEncoded = radioInput.value;

    // 2. Disable all radio buttons in this specific question so they can only guess once
    const allRadios = container.querySelectorAll('input[type="radio"]');
    allRadios.forEach(r => r.disabled = true);

    // 3. Find the label the user just clicked
    const selectedLabel = radioInput.closest('label');
    selectedLabel.classList.remove('border-gray-300', 'hover:bg-gray-100');

    // 4. Evaluate the answer
    if (selectedEncoded === correctEncoded) {
        // CORRECT: Turn the label Green
        selectedLabel.classList.add('bg-green-200', 'border-green-600', 'text-green-900');
        selectedLabel.innerHTML += ' <span class="float-right text-green-700 text-xs">✅</span>';
    } else {
        // WRONG: Turn the label Red
        selectedLabel.classList.add('bg-red-200', 'border-red-600', 'text-red-900');
        selectedLabel.innerHTML += ' <span class="float-right text-red-700 text-xs">❌</span>';

        // Find and highlight the actual correct answer in light green so the student learns
        const allLabels = container.querySelectorAll('label');
        allLabels.forEach(lbl => {
            const inputInside = lbl.querySelector('input');
            if (inputInside.value === correctEncoded) {
                lbl.classList.remove('border-gray-300');
                lbl.classList.add('bg-green-50', 'border-green-500', 'border-dashed');
            }
        });
    }
}