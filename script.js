const STORAGE_KEY = "shanesPickleballNotebookV2";
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

let state = loadState();

const notesGrid = document.getElementById("notesGrid");
const template = document.getElementById("noteCardTemplate");
const todayFocus = document.getElementById("todayFocus");
const saveStatus = document.getElementById("saveStatus");

document.addEventListener("DOMContentLoaded", () => {
  renderSections();
  todayFocus.value = state.todayFocus || "";
  bindEvents();
});

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { todayFocus: "", notes: {} };
  } catch {
    return { todayFocus: "", notes: {} };
  }
}

function saveState(message = "Saved") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveStatus.textContent = `${message} • ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
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

  document.getElementById("saveNowBtn").addEventListener("click", () => saveState("Saved now"));
  document.getElementById("emailBtn").addEventListener("click", emailNotes);
  document.getElementById("textBtn").addEventListener("click", textFocus);
  document.getElementById("resetBtn").addEventListener("click", resetNotebook);

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

function buildNotesText() {
  const lines = ["Shane's Pickleball Notebook", "", "TODAY'S FOCUS", state.todayFocus || "No focus entered yet.", ""];

  DEFAULT_SECTIONS.forEach(section => {
    lines.push(section.title.toUpperCase());
    lines.push(state.notes?.[section.id] || "No notes entered yet.");
    lines.push("");
  });

  return lines.join("\n");
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
  const confirmed = window.confirm("Clear every note in Pickleball Notebook V2?");
  if (!confirmed) return;
  state = { todayFocus: "", notes: {} };
  localStorage.removeItem(STORAGE_KEY);
  todayFocus.value = "";
  renderSections();
  saveStatus.textContent = "Cleared";
}
