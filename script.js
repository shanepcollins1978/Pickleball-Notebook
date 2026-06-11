const STORAGE_KEY = "shanesPickleballNotebookV3";
const LEGACY_STORAGE_KEY = "shanesPickleballNotebookV2";
const EMAIL_TO = "shanepcollins1978@gmail.com";
const TEXT_TO = "6022281134";

const DEFAULT_SECTIONS = [
  {
    id: "topCues",
    kicker: "Quick Reminders",
    title: "My Top Cues",
    icon: "⚡",
    placeholder: "Example:\n1. Hit → split\n2. Paddle back early\n3. Get low and move feet\n4. Loose grip\n5. Watch ball to contact"
  },
  {
    id: "footwork",
    kicker: "80% of the Game",
    title: "Footwork",
    icon: "👟",
    placeholder: "Example:\nSplit step at opponent contact. Shuffle, drop step, stay low, and be on toes. Move to the peak of the bounce."
  },
  {
    id: "backhandSliceDink",
    kicker: "Kitchen Skill",
    title: "Backhand Slice Dink",
    icon: "🏓",
    placeholder: "Example:\nLevel cocked wrist. Shoulder leads. Bottom edge leads. Handle below ball. Keep hand below paddle."
  },
  {
    id: "serveReturn",
    kicker: "Start Points Better",
    title: "Serve + Return",
    icon: "🎯",
    placeholder: "Example:\nSemi-open stance. Choke down on serve. Loose grip. Return deep and get to the line."
  },
  {
    id: "dropsResets",
    kicker: "Soft Game",
    title: "Drops + Resets",
    icon: "🧊",
    placeholder: "Example:\nGet sideways. Squat. Dip shoulder. Lift with legs. Keep paddle face quiet."
  },
  {
    id: "attackDefense",
    kicker: "Strength",
    title: "Attack + Defense",
    icon: "🔥",
    placeholder: "Example:\nStrengths: power serve, drives, attack. Stay patient before speeding up. Reset when stretched."
  },
  {
    id: "drillPlan",
    kicker: "Practice Builder",
    title: "Drill Plan",
    icon: "📋",
    placeholder: "Example:\n10 min cross-court dinks\n10 min third-shot drops\n5 min hands battles\nFinish with 3 focused games"
  },
  {
    id: "matchNotes",
    kicker: "After You Play",
    title: "Match Notes",
    icon: "📝",
    placeholder: "Example:\nDate, partner, opponents, what worked, what broke down, one fix for next time."
  },
  {
    id: "videoLinks",
    kicker: "Learning Library",
    title: "Video Links + Coach Notes",
    icon: "▶️",
    placeholder: "Paste YouTube links and write the one cue you want to remember from each video."
  },
  {
    id: "equipment",
    kicker: "Setup",
    title: "Paddle + Gear Notes",
    icon: "🧰",
    placeholder: "Example:\nPaddle, grip, lead tape location, overgrip, shoes, what feels good, what to test next."
  }
];

const QUICK_CUES = [
  "Hit, then split.",
  "Paddle back early.",
  "Get low and move your feet.",
  "Loose grip. Watch the ball to contact.",
  "Return deep, then get to the kitchen line.",
  "When stretched, reset instead of attacking.",
  "Attack down through the opponent's feet.",
  "Breathe before the serve and pick one target."
];

const PRACTICE_ITEMS = [
  { id: "warmupDinks", label: "5 minutes cross-court dinks" },
  { id: "thirdShot", label: "10 quality third-shot drops" },
  { id: "serveTargets", label: "10 deep serves to targets" },
  { id: "resetDrill", label: "Reset from transition zone" },
  { id: "gameCue", label: "Play games with one focus cue" }
];

const DEFAULT_STATE = {
  todayFocus: "",
  notes: {},
  practice: {},
  lastSaved: ""
};

let state = loadState();

const notesGrid = document.getElementById("notesGrid");
const template = document.getElementById("noteCardTemplate");
const todayFocus = document.getElementById("todayFocus");
const saveStatus = document.getElementById("saveStatus");
const stats = {
  savedNotes: document.getElementById("savedNotesStat"),
  focusWords: document.getElementById("focusWordsStat"),
  practiceProgress: document.getElementById("practiceProgressStat")
};
const practiceList = document.getElementById("practiceList");

let statusTimer;

document.addEventListener("DOMContentLoaded", () => {
  renderCueButtons();
  renderPracticeList();
  renderSections();
  todayFocus.value = state.todayFocus || "";
  updateStats();
  bindEvents();
});

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);

  if (!saved) return { ...DEFAULT_STATE };

  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function normalizeState(savedState) {
  return {
    ...DEFAULT_STATE,
    ...savedState,
    notes: savedState?.notes || {},
    practice: savedState?.practice || {}
  };
}

function saveState(message = "Saved") {
  state.lastSaved = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  showStatus(message);
  updateStats();
}

function showStatus(message) {
  clearTimeout(statusTimer);
  saveStatus.textContent = `${message} • ${formatTime(state.lastSaved)}`;
  statusTimer = setTimeout(() => {
    saveStatus.textContent = state.lastSaved ? `Last saved ${formatTime(state.lastSaved)}` : "Ready";
  }, 3200);
}

function formatTime(value) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function renderCueButtons() {
  const cueStrip = document.getElementById("cueStrip");
  cueStrip.innerHTML = "";

  QUICK_CUES.forEach(cue => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.cue = cue;
    button.textContent = cue;
    cueStrip.appendChild(button);
  });
}

function renderPracticeList() {
  practiceList.innerHTML = "";

  PRACTICE_ITEMS.forEach(item => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    const text = document.createElement("span");

    label.className = "practice-item";
    checkbox.type = "checkbox";
    checkbox.dataset.practiceId = item.id;
    checkbox.checked = Boolean(state.practice[item.id]);
    text.textContent = item.label;

    label.append(checkbox, text);
    practiceList.appendChild(label);
  });
}

function renderSections() {
  notesGrid.innerHTML = "";

  DEFAULT_SECTIONS.forEach(section => {
    const node = template.content.cloneNode(true);
    const article = node.querySelector("article");
    const kicker = node.querySelector(".card-kicker");
    const title = node.querySelector("h2");
    const icon = node.querySelector(".card-icon");
    const textarea = node.querySelector("textarea");

    article.dataset.sectionId = section.id;
    kicker.textContent = section.kicker;
    title.textContent = section.title;
    icon.textContent = section.icon;
    textarea.placeholder = section.placeholder;
    textarea.value = state.notes?.[section.id] || "";
    textarea.dataset.noteId = section.id;
    textarea.setAttribute("aria-label", `${section.title} notes`);

    notesGrid.appendChild(node);
  });
}

function bindEvents() {
  todayFocus.addEventListener("input", () => {
    state.todayFocus = todayFocus.value;
    saveState("Auto-saved focus");
  });

  notesGrid.addEventListener("input", event => {
    if (!event.target.matches("textarea")) return;
    state.notes[event.target.dataset.noteId] = event.target.value;
    saveState("Auto-saved notes");
  });

  practiceList.addEventListener("change", event => {
    if (!event.target.matches("input[type='checkbox']")) return;
    state.practice[event.target.dataset.practiceId] = event.target.checked;
    saveState("Practice plan updated");
  });

  document.getElementById("saveNowBtn").addEventListener("click", () => saveState("Saved now"));
  document.getElementById("copyBtn").addEventListener("click", copyNotes);
  document.getElementById("emailBtn").addEventListener("click", emailNotes);
  document.getElementById("textBtn").addEventListener("click", textFocus);
  document.getElementById("printBtn").addEventListener("click", () => window.print());
  document.getElementById("resetBtn").addEventListener("click", resetNotebook);
  document.getElementById("randomCueBtn").addEventListener("click", addRandomCue);
  document.getElementById("addPracticeFocusBtn").addEventListener("click", addPracticePlanToFocus);

  document.querySelectorAll("[data-cue]").forEach(button => {
    button.addEventListener("click", () => addCueToFocus(button.dataset.cue));
  });
}

function addCueToFocus(cue) {
  const current = todayFocus.value.trim();
  todayFocus.value = current ? `${current}\n${cue}` : cue;
  state.todayFocus = todayFocus.value;
  saveState("Cue added");
  todayFocus.focus();
}

function addRandomCue() {
  const cue = QUICK_CUES[Math.floor(Math.random() * QUICK_CUES.length)];
  addCueToFocus(cue);
}

function addPracticePlanToFocus() {
  const selectedItems = PRACTICE_ITEMS.filter(item => state.practice[item.id]).map(item => `• ${item.label}`);
  const plan = selectedItems.length ? selectedItems.join("\n") : "• Pick one warm-up drill\n• Choose one target cue\n• Review match notes after play";
  addCueToFocus(`Today's practice plan:\n${plan}`);
}

function buildNotesText() {
  const completedItems = PRACTICE_ITEMS.filter(item => state.practice[item.id]).map(item => `- ${item.label}`);
  const lines = ["Shane's Pickleball Notebook", "", "TODAY'S FOCUS", state.todayFocus || "No focus entered yet.", ""];

  lines.push("PRACTICE PLAN");
  lines.push(completedItems.length ? completedItems.join("\n") : "No practice items checked yet.");
  lines.push("");

  DEFAULT_SECTIONS.forEach(section => {
    lines.push(section.title.toUpperCase());
    lines.push(state.notes?.[section.id] || "No notes entered yet.");
    lines.push("");
  });

  return lines.join("\n");
}

async function copyNotes() {
  const notes = buildNotesText();

  if (!navigator.clipboard) {
    showStatus("Clipboard unavailable");
    return;
  }

  try {
    await navigator.clipboard.writeText(notes);
    showStatus("Copied notebook");
  } catch {
    showStatus("Clipboard blocked");
  }
}

function emailNotes() {
  const subject = encodeURIComponent("Shane's Pickleball Notebook Notes");
  const body = encodeURIComponent(buildNotesText());
  window.location.href = `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
}

function textFocus() {
  const body = encodeURIComponent(state.todayFocus || "Today's pickleball focus: split step, stay low, and watch the ball.");
  window.location.href = `sms:${TEXT_TO}&body=${body}`;
}

function resetNotebook() {
  const confirmed = window.confirm("Clear every note in Pickleball Notebook?");
  if (!confirmed) return;
  state = { ...DEFAULT_STATE, notes: {}, practice: {} };
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  todayFocus.value = "";
  renderPracticeList();
  renderSections();
  updateStats();
  saveStatus.textContent = "Cleared";
}

function updateStats() {
  const savedNotes = DEFAULT_SECTIONS.filter(section => (state.notes?.[section.id] || "").trim()).length;
  const focusWords = (state.todayFocus || "").trim().split(/\s+/).filter(Boolean).length;
  const completedPractice = PRACTICE_ITEMS.filter(item => state.practice[item.id]).length;

  stats.savedNotes.textContent = `${savedNotes}/${DEFAULT_SECTIONS.length}`;
  stats.focusWords.textContent = focusWords;
  stats.practiceProgress.textContent = `${completedPractice}/${PRACTICE_ITEMS.length}`;
}
