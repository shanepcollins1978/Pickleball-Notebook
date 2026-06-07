const STORAGE_KEY = "shanesPickleballNotebookV1";

const sectionNames = [
  "General",
  "Footwork",
  "Backhand Dink",
  "Two Hand Backhand",
  "Serve",
  "Slice",
  "Strategy"
];

const starterNotes = {
  General: "Keep it simple. Pick one focus for the day. Breathe out on contact. Watch the ball all the way in.",
  Footwork: "Split step. Stay low. Move feet first. Shuffle or drop step. Be on toes at the peak of the bounce.",
  "Backhand Dink": "Paddle back early. Level, cocked wrist. Shoulder leads. Bottom edge leads. Hand below paddle. Handle below ball.",
  "Two Hand Backhand": "Compact turn. Paddle back early. Use the left hand to guide. Stay balanced and finish toward the target.",
  Serve: "Semi-open stance. Loose grip. Choke down if needed. Smooth shoulder turn. Drive through the ball.",
  Slice: "Sideways. Squat. Dip shoulder. Keep wrist firm. Lead with the edge. Let the paddle work under the ball.",
  Strategy: "Attack when balanced. Reset when stretched. Make opponents hit up. Aim middle when unsure. Win with patience."
};

let notebook = loadNotebook();

document.addEventListener("DOMContentLoaded", () => {
  renderNotebook();
});

function loadNotebook() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return mergeDefaults(parsed);
    } catch (error) {
      console.warn("Could not load saved notebook. Starting fresh.", error);
    }
  }

  return createDefaultNotebook();
}

function createDefaultNotebook() {
  return {
    todayReminder: "Split step before every shot. Stay low. Watch the ball to contact.",
    sections: sectionNames.map((name) => ({
      name,
      notes: starterNotes[name] || "",
      videos: []
    }))
  };
}

function mergeDefaults(saved) {
  const defaults = createDefaultNotebook();
  const savedSections = Array.isArray(saved.sections) ? saved.sections : [];

  return {
    todayReminder: typeof saved.todayReminder === "string" ? saved.todayReminder : defaults.todayReminder,
    sections: defaults.sections.map((defaultSection) => {
      const matchingSaved = savedSections.find((section) => section.name === defaultSection.name);
      return {
        name: defaultSection.name,
        notes: typeof matchingSaved?.notes === "string" ? matchingSaved.notes : defaultSection.notes,
        videos: Array.isArray(matchingSaved?.videos) ? matchingSaved.videos : []
      };
    })
  };
}

function saveNotebook() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notebook));
}

function renderNotebook() {
  const todayReminder = document.getElementById("todayReminder");
  const sectionsContainer = document.getElementById("sections");

  todayReminder.value = notebook.todayReminder;
  todayReminder.addEventListener("input", (event) => {
    notebook.todayReminder = event.target.value;
    saveNotebook();
  });

  sectionsContainer.innerHTML = "";

  notebook.sections.forEach((section, index) => {
    const card = document.createElement("details");
    card.className = "section-card";
    if (index === 0) card.open = true;

    const summary = document.createElement("summary");
    summary.textContent = section.name;

    const body = document.createElement("div");
    body.className = "section-body";

    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = "Editable notes for your own reminders, swing thoughts, and practice cues.";

    const notes = document.createElement("textarea");
    notes.value = section.notes;
    notes.placeholder = `Write your ${section.name.toLowerCase()} notes here...`;
    notes.addEventListener("input", (event) => {
      notebook.sections[index].notes = event.target.value;
      saveNotebook();
    });

    const videoTools = document.createElement("div");
    videoTools.className = "video-tools";
    videoTools.innerHTML = `
      <h3>Video Links</h3>
      <div class="video-row">
        <input type="url" placeholder="Paste a YouTube or video link" aria-label="Video link for ${section.name}" />
        <button type="button">Add Video</button>
      </div>
      <div class="video-list"></div>
    `;

    const input = videoTools.querySelector("input");
    const button = videoTools.querySelector("button");
    const list = videoTools.querySelector(".video-list");

    button.addEventListener("click", () => {
      addVideo(index, input.value);
      input.value = "";
      renderNotebook();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addVideo(index, input.value);
        input.value = "";
        renderNotebook();
      }
    });

    renderVideoList(section.videos, list, index);

    body.appendChild(hint);
    body.appendChild(notes);
    body.appendChild(videoTools);
    card.appendChild(summary);
    card.appendChild(body);
    sectionsContainer.appendChild(card);
  });

  const actions = document.createElement("div");
  actions.className = "footer-actions";
  actions.innerHTML = `
    <button type="button" class="secondary-btn" id="exportNotes">Export Notes</button>
    <button type="button" class="secondary-btn" id="resetNotes">Reset Notebook</button>
  `;
  sectionsContainer.appendChild(actions);

  document.getElementById("exportNotes").addEventListener("click", exportNotes);
  document.getElementById("resetNotes").addEventListener("click", resetNotebook);
}

function addVideo(sectionIndex, rawUrl) {
  const url = rawUrl.trim();
  if (!url) return;

  try {
    new URL(url);
  } catch {
    alert("Please paste a valid video URL.");
    return;
  }

  notebook.sections[sectionIndex].videos.push(url);
  saveNotebook();
}

function renderVideoList(videos, list, sectionIndex) {
  list.innerHTML = "";

  videos.forEach((video, videoIndex) => {
    const item = document.createElement("div");
    item.className = "video-link";

    const link = document.createElement("a");
    link.href = video;
    link.textContent = video;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const remove = document.createElement("button");
    remove.className = "remove-btn";
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      notebook.sections[sectionIndex].videos.splice(videoIndex, 1);
      saveNotebook();
      renderNotebook();
    });

    item.appendChild(link);
    item.appendChild(remove);
    list.appendChild(item);
  });
}

function exportNotes() {
  const lines = [];
  lines.push("Shane's Pickleball Notebook");
  lines.push("");
  lines.push("Today's Reminder");
  lines.push(notebook.todayReminder || "");
  lines.push("");

  notebook.sections.forEach((section) => {
    lines.push(section.name);
    lines.push(section.notes || "");

    if (section.videos.length) {
      lines.push("Videos:");
      section.videos.forEach((video) => lines.push(video));
    }

    lines.push("");
  });

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pickleball-notebook-notes.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function resetNotebook() {
  const shouldReset = confirm("Reset all notes and video links back to the starter notebook?");
  if (!shouldReset) return;

  localStorage.removeItem(STORAGE_KEY);
  notebook = createDefaultNotebook();
  saveNotebook();
  renderNotebook();
}
