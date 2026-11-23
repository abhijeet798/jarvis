// Audio Synthesizer (Sci-Fi Sound FX using Web Audio API - Zero External Assets)
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playBeep(freq = 600, duration = 0.08, type = 'sine') {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
}

function playCyberChord() {
  if (!soundEnabled) return;
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
    setTimeout(() => playBeep(freq, 0.12, 'triangle'), idx * 70);
  });
}

// Sound toggle logic
const soundBtn = document.getElementById('sound-btn');
const sfxCheckbox = document.getElementById('sfx-toggle-check');

function toggleSoundState() {
  soundEnabled = !soundEnabled;
  if (soundBtn) {
    soundBtn.innerText = soundEnabled ? '🔊 SFX ON' : '🔇 SFX MUTED';
    soundBtn.classList.toggle('muted', !soundEnabled);
  }
  if (sfxCheckbox) sfxCheckbox.checked = soundEnabled;
  if (soundEnabled) playBeep(880, 0.1);
}

if (soundBtn) {
  soundBtn.addEventListener('click', toggleSoundState);
}

function toggleSoundCheckbox(cb) {
  soundEnabled = cb.checked;
  if (soundBtn) {
    soundBtn.innerText = soundEnabled ? '🔊 SFX ON' : '🔇 SFX MUTED';
    soundBtn.classList.toggle('muted', !soundEnabled);
  }
  if (soundEnabled) playBeep(880, 0.1);
}

// Theme Selector (Mark VII, Mark 85, Stealth)
const themeSelector = document.getElementById('theme-selector');
if (themeSelector) {
  themeSelector.addEventListener('change', (e) => {
    document.body.classList.remove('theme-mark85', 'theme-stealth');
    if (e.target.value === 'mark85') {
      document.body.classList.add('theme-mark85');
    } else if (e.target.value === 'stealth') {
      document.body.classList.add('theme-stealth');
    }
    playBeep(700, 0.1);
  });
}

// API Key Storage & Neural Modal (Gemini & ChatGPT)
const apiModal = document.getElementById('api-modal');
const geminiKeyInput = document.getElementById('gemini-key-input');
const openaiKeyInput = document.getElementById('openai-key-input');
const apiModalBtn = document.getElementById('api-modal-btn');
let activeAiEngine = 'gemini'; // default

function openApiModal() {
  if (apiModal) {
    if (geminiKeyInput) geminiKeyInput.value = localStorage.getItem('jarvis_gemini_key') || '';
    if (openaiKeyInput) openaiKeyInput.value = localStorage.getItem('jarvis_openai_key') || '';
    apiModal.style.display = 'flex';
  }
}

function closeApiModal() {
  if (apiModal) apiModal.style.display = 'none';
}

function saveApiKeys() {
  let connected = [];
  if (geminiKeyInput) {
    const gKey = geminiKeyInput.value.trim();
    if (gKey) {
      localStorage.setItem('jarvis_gemini_key', gKey);
      connected.push('Google Gemini');
    } else {
      localStorage.removeItem('jarvis_gemini_key');
    }
  }

  if (openaiKeyInput) {
    const oKey = openaiKeyInput.value.trim();
    if (oKey) {
      localStorage.setItem('jarvis_openai_key', oKey);
      connected.push('OpenAI ChatGPT');
    } else {
      localStorage.removeItem('jarvis_openai_key');
    }
  }

  updateApiBtnStatus();
  updateEngineBadge();
  closeApiModal();

  if (connected.length > 0) {
    appendJarvisMessage(`Neural intelligence linked to ${connected.join(' & ')}. You may converse freely, sir.`);
  } else {
    appendJarvisMessage("All external API keys cleared. Standby in autonomous offline heuristic mode.");
  }
}

function clearApiKeys() {
  localStorage.removeItem('jarvis_gemini_key');
  localStorage.removeItem('jarvis_openai_key');
  if (geminiKeyInput) geminiKeyInput.value = '';
  if (openaiKeyInput) openaiKeyInput.value = '';
  updateApiBtnStatus();
  updateEngineBadge();
  appendJarvisMessage("Neural pathways cleared. Standing by for directives.");
  closeApiModal();
}

// Supabase Integration & Cloud Sync
let supabaseClient = null;
const supabaseModal = document.getElementById('supabase-modal');
const supabaseUrlInput = document.getElementById('supabase-url-input');
const supabaseKeyInput = document.getElementById('supabase-key-input');
const supabaseModalBtn = document.getElementById('supabase-modal-btn');

function initSupabase() {
  const sbUrl = localStorage.getItem('jarvis_supabase_url');
  const sbKey = localStorage.getItem('jarvis_supabase_key');
  if (sbUrl && sbKey && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(sbUrl, sbKey);
      updateSupabaseBtnStatus(true);
      console.log("JARVIS connected to Supabase Cloud.");
    } catch (e) {
      console.warn("Supabase initialization error:", e);
    }
  } else {
    updateSupabaseBtnStatus(false);
  }
}

function openSupabaseModal() {
  if (supabaseModal) {
    if (supabaseUrlInput) supabaseUrlInput.value = localStorage.getItem('jarvis_supabase_url') || '';
    if (supabaseKeyInput) supabaseKeyInput.value = localStorage.getItem('jarvis_supabase_key') || '';
    supabaseModal.style.display = 'flex';
  }
}

function closeSupabaseModal() {
  if (supabaseModal) supabaseModal.style.display = 'none';
}

function saveSupabaseConfig() {
  const url = supabaseUrlInput ? supabaseUrlInput.value.trim() : '';
  const key = supabaseKeyInput ? supabaseKeyInput.value.trim() : '';

  if (url && key) {
    localStorage.setItem('jarvis_supabase_url', url);
    localStorage.setItem('jarvis_supabase_key', key);
    initSupabase();
    appendJarvisMessage("Supabase Cloud Database connected. Directives and memory logs will now sync to cloud storage, sir.");
  } else {
    clearSupabaseConfig();
  }
  closeSupabaseModal();
}

function clearSupabaseConfig() {
  localStorage.removeItem('jarvis_supabase_url');
  localStorage.removeItem('jarvis_supabase_key');
  supabaseClient = null;
  if (supabaseUrlInput) supabaseUrlInput.value = '';
  if (supabaseKeyInput) supabaseKeyInput.value = '';
  updateSupabaseBtnStatus(false);
  appendJarvisMessage("Supabase database disconnected. Operating in local-only cache.");
  closeSupabaseModal();
}

function updateSupabaseBtnStatus(connected) {
  if (supabaseModalBtn) {
    supabaseModalBtn.innerText = connected ? '⚡ Supabase Synced' : '⚡ Supabase Sync';
    supabaseModalBtn.style.borderColor = connected ? '#10b981' : 'rgba(168, 85, 247, 0.4)';
    supabaseModalBtn.style.color = connected ? '#10b981' : '#6ee7b7';
  }
}

async function syncDirectiveToSupabase(sender, message) {
  if (!supabaseClient) return;
  try {
    // Inserts log into 'jarvis_logs' table in Supabase
    await supabaseClient
      .from('jarvis_logs')
      .insert([{ sender: sender, content: message, created_at: new Date().toISOString() }]);
  } catch (err) {
    // Non-blocking fallback
    console.debug("Supabase sync silent skip:", err);
  }
}

if (supabaseModalBtn) {
  supabaseModalBtn.addEventListener('click', openSupabaseModal);
}
window.addEventListener('load', initSupabase);

function updateApiBtnStatus() {
  if (!apiModalBtn) return;
  const hasGemini = !!localStorage.getItem('jarvis_gemini_key');
  const hasOpenAI = !!localStorage.getItem('jarvis_openai_key');

  if (hasGemini && hasOpenAI) {
    apiModalBtn.innerText = '⚡ Gemini + ChatGPT';
    apiModalBtn.style.borderColor = 'var(--cyan-glow)';
  } else if (hasGemini) {
    apiModalBtn.innerText = '⚡ Gemini Linked';
    apiModalBtn.style.borderColor = 'var(--cyan-glow)';
  } else if (hasOpenAI) {
    apiModalBtn.innerText = '⚡ ChatGPT Linked';
    apiModalBtn.style.borderColor = '#10b981';
  } else {
    apiModalBtn.innerText = '⚡ Connect AI Brains';
    apiModalBtn.style.borderColor = 'rgba(168, 85, 247, 0.4)';
  }
}

function switchAiEngine(engine) {
  activeAiEngine = engine;
  updateEngineBadge();
  playBeep(750, 0.08);
}

function updateEngineBadge() {
  const badge = document.getElementById('engine-status-badge');
  if (!badge) return;
  const hasGemini = !!localStorage.getItem('jarvis_gemini_key');
  const hasOpenAI = !!localStorage.getItem('jarvis_openai_key');

  if (activeAiEngine === 'gemini') {
    badge.innerText = hasGemini ? '[ONLINE - GEMINI]' : '[KEY NEEDED - OFFLINE FALLBACK]';
    badge.style.color = hasGemini ? 'var(--cyan-glow)' : 'var(--gold-accent)';
  } else if (activeAiEngine === 'chatgpt') {
    badge.innerText = hasOpenAI ? '[ONLINE - GPT-4o]' : '[KEY NEEDED - OFFLINE FALLBACK]';
    badge.style.color = hasOpenAI ? '#10b981' : 'var(--gold-accent)';
  } else {
    badge.innerText = '[LOCAL AUTONOMOUS]';
    badge.style.color = 'var(--text-muted)';
  }
}

if (apiModalBtn) {
  apiModalBtn.addEventListener('click', openApiModal);
  updateApiBtnStatus();
  updateEngineBadge();
}

// App Tile Click Handlers
function handlePhoneCallTile(e) {
  playBeep(950, 0.08);
  const num = prompt("Enter phone number to dial:", "");
  if (num) {
    appendJarvisMessage(`Dialing ${num}...`, true);
    window.location.href = `tel:${num}`;
  } else {
    appendJarvisMessage("Opening phone call dialer.", true);
    window.location.href = 'tel:';
  }
}

function handlePhonePeTile(e) {
  playBeep(950, 0.08);
  appendJarvisMessage("Initiating PhonePe payment interface, sir.", true);
  if (/Android|iPhone/i.test(navigator.userAgent)) {
    // Open UPI / PhonePe app directly on mobile
    window.location.href = 'phonepe://pay';
  } else {
    // Open PhonePe website on Windows desktop
    window.open('https://www.phonepe.com', '_blank');
  }
}

// Weather Module API (Open-Meteo free API - no key required)
async function fetchWeatherForCity(cityName) {
  const inputEl = document.getElementById('city-search-input');
  const city = cityName || (inputEl ? inputEl.value.trim() : '') || 'New York';
  const labelEl = document.getElementById('weather-city-label');
  const tempEl = document.getElementById('weather-temp');
  const condEl = document.getElementById('weather-condition');
  const windEl = document.getElementById('weather-wind');

  if (labelEl) labelEl.innerText = city.toUpperCase();
  playBeep(900, 0.05);

  try {
    // Geocoding step
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      if (condEl) condEl.innerText = 'Location coordinates not resolved';
      return;
    }

    const loc = geoData.results[0];
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true`);
    const weatherData = await weatherRes.json();

    if (weatherData.current_weather) {
      const temp = Math.round(weatherData.current_weather.temperature);
      const wind = weatherData.current_weather.windspeed;
      if (tempEl) tempEl.innerText = `${temp}°C`;
      if (condEl) condEl.innerText = `Coordinates: ${loc.latitude.toFixed(2)}N, ${loc.longitude.toFixed(2)}E`;
      if (windEl) windEl.innerText = `Wind: ${wind} km/h`;
      appendJarvisMessage(`Atmospheric telemetry for ${loc.name}: Current temperature is ${temp}°C with wind speed of ${wind} km/h.`, false);
    }
  } catch (err) {
    console.warn("Weather telemetry sync failed, using fallback:", err);
    if (tempEl) tempEl.innerText = '22°C';
    if (condEl) condEl.innerText = 'Condition: Clear Sky';
  }
}

// System Toggles
function toggleHudProjection(cb) {
  const reactor = document.getElementById('reactor-visualizer');
  if (reactor) {
    reactor.style.opacity = cb.checked ? '1' : '0.15';
  }
  playBeep(cb.checked ? 1000 : 400, 0.08);
}

function triggerHouseParty(cb) {
  if (cb.checked) {
    appendJarvisMessage("House Party Protocol initiated, sir. All suits deployed for defense perimeter.", true);
    playCyberChord();
    document.body.classList.add('theme-mark85');
  } else {
    appendJarvisMessage("House Party Protocol disengaged. Returning to standard standby.", true);
    document.body.classList.remove('theme-mark85');
  }
}

// Global Synapse Clocks
function updateWorldClocks() {
  const malibu = document.getElementById('clock-malibu');
  const ny = document.getElementById('clock-ny');
  const london = document.getElementById('clock-london');

  const now = new Date();
  if (malibu) {
    malibu.innerText = now.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' PST';
  }
  if (ny) {
    ny.innerText = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' EST';
  }
  if (london) {
    london.innerText = now.toLocaleTimeString('en-US', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' GMT';
  }
}
setInterval(updateWorldClocks, 1000);
updateWorldClocks();

// Gemini API Query Handler
async function queryGemini(promptText) {
  const apiKey = localStorage.getItem('jarvis_gemini_key');
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{
        parts: [{
          text: `You are J.A.R.V.I.S., Tony Stark's sophisticated, witty, concise, and ultra-intelligent AI assistant. Keep responses brief (under 2-3 sentences), highly refined, respectful ("sir"), and tactical. The user says: "${promptText}"`
        }]
      }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
  } catch (e) {
    console.error("Gemini API call failed:", e);
  }
  return null;
}

// OpenAI ChatGPT Query Handler
async function queryChatGPT(promptText) {
  const apiKey = localStorage.getItem('jarvis_openai_key');
  if (!apiKey) return null;

  try {
    const url = 'https://api.openai.com/v1/chat/completions';
    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are J.A.R.V.I.S., Tony Stark\'s loyal, intelligent, and refined British AI assistant. Address the user as sir. Keep responses concise, helpful, and cinematic (under 3 sentences).'
        },
        {
          role: 'user',
          content: promptText
        }
      ],
      max_tokens: 150
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }
  } catch (e) {
    console.error("OpenAI ChatGPT API call failed:", e);
  }
  return null;
}

// Register Service Worker for PWA (Installable on Android & Windows)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('JARVIS ServiceWorker registered with scope: ', reg.scope))
      .catch(err => console.log('ServiceWorker registration failed: ', err));
  });
}

// Global PWA prompt handler
let deferredPrompt = null;
const pwaInstallBtn = document.getElementById('pwa-install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (pwaInstallBtn) {
    pwaInstallBtn.style.display = 'inline-flex';
  }
});

function triggerPwaPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        appendJarvisMessage("JARVIS: Installation sequence accepted. Initializing desktop/mobile bridge.");
      } else {
        appendJarvisMessage("JARVIS: Installation sequence dismissed.");
      }
      deferredPrompt = null;
      if (pwaInstallBtn) pwaInstallBtn.style.display = 'none';
    });
  } else {
    // Helpful guidance when testing directly in browser
    alert("To install JARVIS:\n• On Windows (Chrome/Edge): Click the Install icon in the browser address bar (top right) or Menu > 'Install JARVIS'.\n• On Android (Chrome): Tap Menu (three dots) > 'Add to Home screen' or 'Install App'.");
  }
}

if (pwaInstallBtn) {
  pwaInstallBtn.addEventListener('click', triggerPwaPrompt);
}

// Clock & Real-time Live Date/Time Telemetry
function updateClock() {
  const clockEl = document.getElementById('clock-display');
  const mainTimeEl = document.getElementById('main-time-display');
  const mainDateEl = document.getElementById('main-date-display');
  const mainTzEl = document.getElementById('main-timezone-display');

  const now = new Date();

  if (clockEl) {
    clockEl.innerText = now.toTimeString().split(' ')[0] + '.' + String(Math.floor(now.getMilliseconds() / 100));
  }

  if (mainTimeEl) {
    mainTimeEl.innerText = now.toLocaleTimeString('en-US', { hour12: true });
  }

  if (mainDateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    mainDateEl.innerText = now.toLocaleDateString('en-US', options);
  }

  if (mainTzEl) {
    const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -now.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hrs = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const mins = String(Math.abs(offset) % 60).padStart(2, '0');
    mainTzEl.innerText = `Region: ${tzName} (UTC${sign}${hrs}:${mins})`;
  }
}
setInterval(updateClock, 100);
updateClock();

// Dynamic Neural & CPU Simulators
setInterval(() => {
  const cpuLoadVal = document.getElementById('cpu-load-val');
  const cpuBar = document.getElementById('cpu-bar');
  const latencyCounter = document.getElementById('latency-counter');

  if (cpuLoadVal && cpuBar) {
    const simulatedLoad = Math.floor(18 + Math.random() * 25);
    cpuLoadVal.innerText = simulatedLoad + '%';
    cpuBar.style.width = simulatedLoad + '%';
  }

  if (latencyCounter) {
    const simulatedLatency = Math.floor(9 + Math.random() * 8);
    latencyCounter.innerText = `LATENCY: ${simulatedLatency}ms`;
  }
}, 2500);

// Background Interactive Cyber Particle Canvas
const canvas = document.getElementById('bg-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let particles = [];
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.7;
    this.vy = (Math.random() - 0.5) * 0.7;
    this.radius = Math.random() * 1.5 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw() {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 240, 255, ${this.alpha})`;
    ctx.fill();
  }
}

function initParticles() {
  if (!canvas) return;
  particles = [];
  const count = Math.min(Math.floor(window.innerWidth / 15), 80);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}
initParticles();

function animateParticles() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    // Draw connecting neural lines
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 110) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist / 110)})`;
        ctx.lineWidth = 0.6;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}
if (canvas) animateParticles();

// Voice Synthesis (JARVIS Speaking)
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel(); // Stop active speaking
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 0.95; // Slightly deeper, refined AI cadence
  utterance.rate = 1.05;

  // Attempt to select an English / British or masculine voice if present (JARVIS vibe)
  const voices = window.speechSynthesis.getVoices();
  const jarvisVoice = voices.find(v => 
    v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Daniel') || v.name.includes('George') || v.name.includes('David') || v.name.includes('Google UK English Male'))
  ) || voices.find(v => v.lang.startsWith('en'));

  if (jarvisVoice) {
    utterance.voice = jarvisVoice;
  }

  // Visual pulse on arc reactor while speaking
  const reactor = document.getElementById('reactor-visualizer');
  utterance.onstart = () => {
    if (reactor) reactor.style.filter = 'drop-shadow(0 0 35px #00f0ff)';
  };
  utterance.onend = () => {
    if (reactor) reactor.style.filter = 'none';
  };

  window.speechSynthesis.speak(utterance);
}

// Interactive Speech Recognition (Speech-to-Text)
const micBtn = document.getElementById('voice-input-btn');
let recognition = null;
let isListening = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add('listening');
    appendJarvisMessage("// ACOUSTIC SENSOR ACTIVE: Listening for command...");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    handleUserCommand(transcript);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error: ', event.error);
    isListening = false;
    micBtn.classList.remove('listening');
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove('listening');
  };
}

if (micBtn) {
  micBtn.addEventListener('click', () => {
    if (!recognition) {
      alert("Speech Recognition API is not supported on this browser version. You can still type commands directly!");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });
}

// Chat & Command Execution Engine
const chatHistory = document.getElementById('chat-history');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

function appendUserMessage(text) {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.innerHTML = `<span class="sender-tag">// OPERATOR</span>${escapeHtml(text)}`;
  chatHistory.appendChild(bubble);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  syncDirectiveToSupabase('operator', text);
}

function appendJarvisMessage(text, shouldSpeak = true) {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble jarvis';
  bubble.innerHTML = `<span class="sender-tag">// JARVIS</span>${escapeHtml(text)}`;
  chatHistory.appendChild(bubble);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  syncDirectiveToSupabase('jarvis', text);

  if (shouldSpeak) {
    speakText(text);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

// Command Processing
async function handleUserCommand(cmd) {
  const query = cmd.trim();
  if (!query) return;

  playBeep(800, 0.05);
  appendUserMessage(query);

  const lower = query.toLowerCase();

  // 1. Direct Weather Check
  if (lower.startsWith('weather in') || lower.startsWith('weather for') || lower === 'weather') {
    const city = lower.replace(/weather in|weather for|weather/g, '').trim() || 'New York';
    fetchWeatherForCity(city);
    return;
  }

  // 2. Direct Date / Time Inquiry
  if (lower.includes('time') || lower.includes('date') || lower.includes('day') || lower.includes('clock')) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    appendJarvisMessage(`The current local time is ${timeStr}, on ${dateStr}.`, true);
    return;
  }

  // 3. Direct App Launch Directives
  const appKeywords = {
    'chatgpt': { name: 'ChatGPT', url: 'https://chat.openai.com' },
    'gemini': { name: 'Gemini AI', url: 'https://gemini.google.com' },
    'youtube': { name: 'YouTube', url: 'https://www.youtube.com' },
    'gmail': { name: 'Gmail', url: 'https://mail.google.com' },
    'email': { name: 'Gmail', url: 'https://mail.google.com' },
    'whatsapp': { name: 'WhatsApp Web', url: 'https://web.whatsapp.com' },
    'phonepe': { name: 'PhonePe', url: 'https://www.phonepe.com' },
    'phone pay': { name: 'PhonePe', url: 'https://www.phonepe.com' },
    'pay': { name: 'PhonePe', url: 'https://www.phonepe.com' },
    'upi': { name: 'PhonePe', url: 'https://www.phonepe.com' },
    'spotify': { name: 'Spotify', url: 'https://open.spotify.com' },
    'music': { name: 'Spotify', url: 'https://open.spotify.com' },
    'maps': { name: 'Google Maps', url: 'https://maps.google.com' },
    'github': { name: 'GitHub', url: 'https://github.com' }
  };

  // Phone call trigger: "call [number/name]" or "phone call"
  if (lower.startsWith('call ') || lower.startsWith('phone call') || lower.startsWith('dial ')) {
    const number = lower.replace(/call|phone|dial/g, '').trim();
    if (number) {
      appendJarvisMessage(`Initiating telecommunication relay to ${number}...`, true);
      window.location.href = `tel:${number}`;
    } else {
      appendJarvisMessage("Opening phone dialer pad for calling, sir.", true);
      window.location.href = 'tel:';
    }
    return;
  }

  // Payment trigger: "pay with phonepe" or "open phonepe"
  if (lower.includes('phonepe') || lower.includes('phone pay') || lower.includes('send payment')) {
    appendJarvisMessage("Initializing PhonePe secure payment gateway interface, sir.", true);
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      window.location.href = 'phonepe://pay';
    } else {
      window.open('https://www.phonepe.com', '_blank');
    }
    return;
  }

  if (lower.startsWith('open ') || lower.startsWith('launch ')) {
    for (const [key, app] of Object.entries(appKeywords)) {
      if (lower.includes(key)) {
        appendJarvisMessage(`Deploying ${app.name} interface now, sir.`, true);
        window.open(app.url, '_blank');
        return;
      }
    }
  }

  // 4. Check for Connected LLM Engine (Gemini or ChatGPT)
  const geminiKey = localStorage.getItem('jarvis_gemini_key');
  const openaiKey = localStorage.getItem('jarvis_openai_key');

  if ((activeAiEngine === 'gemini' && geminiKey) || (activeAiEngine === 'chatgpt' && openaiKey)) {
    const engineLabel = activeAiEngine === 'gemini' ? 'Gemini 1.5 Flash' : 'OpenAI GPT-4o';
    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'chat-bubble jarvis';
    thinkingBubble.innerHTML = `<span class="sender-tag">// JARVIS NEURAL SYNAPSE</span>Thinking... transmitting prompt to ${engineLabel}.`;
    chatHistory.appendChild(thinkingBubble);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    let aiReply = null;
    if (activeAiEngine === 'gemini') {
      aiReply = await queryGemini(query);
    } else {
      aiReply = await queryChatGPT(query);
    }

    if (thinkingBubble.parentNode) thinkingBubble.parentNode.removeChild(thinkingBubble);

    if (aiReply) {
      appendJarvisMessage(aiReply, true);
      return;
    }
  }

  // 5. Built-in Autonomous Heuristic Directives
  setTimeout(() => {
    if (lower.includes('status') || lower.includes('system')) {
      const platform = navigator.userAgent.includes('Android') ? 'Android OS Mobile' : 'Windows Desktop Interface';
      appendJarvisMessage(`Diagnostics complete. Host architecture: ${platform}. Neural core running at peak efficiency with 0 errors detected.`);
    } 
    else if (lower.includes('diagnostic')) {
      appendJarvisMessage("Running full multi-core sub-routine check: Audio synthesis operational. PWA cache verified. Hardware acceleration active.");
    } 
    else if (lower.includes('telemetry') || lower.includes('device')) {
      const mem = navigator.deviceMemory ? `${navigator.deviceMemory} GB RAM available` : 'Memory metrics protected';
      const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} logical CPU threads` : 'Multi-threaded processor';
      appendJarvisMessage(`Device Telemetry: Detected ${cores}, ${mem}. Screen resolution: ${window.screen.width}x${window.screen.height}.`);
    } 
    else if (lower.includes('security') || lower.includes('scan')) {
      appendJarvisMessage("Security perimeter scan active. Sandboxed protocols are enforced. No unauthorized intrusion vectors found.");
    } 
    else if (lower.includes('who are you') || lower.includes('what are you')) {
      appendJarvisMessage("I am J.A.R.V.I.S. - Just A Rather Very Intelligent System, adapted for both Windows workstations and Android mobile environments.");
    } 
    else if (lower.includes('help')) {
      appendJarvisMessage("Available voice and console directives: 'status', 'telemetry', 'diagnostics', 'weather in [city]', 'security scan', 'who are you', 'clear console', or connect a Gemini key for open-ended conversation.");
    } 
    else if (lower.includes('clear') || lower.includes('clean')) {
      chatHistory.innerHTML = '';
      appendJarvisMessage("Console buffer wiped. Standing by for instructions.", false);
    } 
    else if (lower.includes('hello') || lower.includes('hi jarvis') || lower.includes('hey jarvis')) {
      appendJarvisMessage("Always a pleasure, sir. How may I be of assistance today?");
    } 
    else {
      appendJarvisMessage(`Directive '${query}' processed. To unlock open intelligence across any topic, click 'Connect Gemini' on the navigation bar.`);
    }
  }, 400);
}

if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = userInput.value;
    if (val.trim()) {
      handleUserCommand(val);
      userInput.value = '';
    }
  });
}

function executeQuickCommand(cmdText) {
  handleUserCommand(cmdText);
}

function scrollToConsole() {
  const el = document.getElementById('console');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function speakWelcome() {
  const welcomeText = "Welcome to JARVIS. Voice engine and neural core are online and synchronized for your device.";
  appendJarvisMessage(welcomeText, true);
}

// Core button interactive click
const coreBtn = document.getElementById('core-button');
if (coreBtn) {
  coreBtn.addEventListener('click', () => {
    speakWelcome();
  });
}
