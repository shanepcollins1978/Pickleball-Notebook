const STORAGE_KEY = "shanesPickleballPlaybookV1";

const defaultData = {
  todayReminder: "Split step before opponent contact.\nStay low.\nWatch the ball to contact.",
  sections: [
    {
      id: "always",
      title: "Always",
      hasVideos: false,
      collapsed: false,
      notes: [
        { id: cryptoId(), text: "Split step before opponent contact.", starred: false },
        { id: cryptoId(), text: "Paddle out front.", starred: false },
        { id: cryptoId(), text: "Stay low and balanced.", starred: false },
        { id: cryptoId(), text: "Move feet instead of reaching.", starred: false },
        { id: cryptoId(), text: "Loose grip.", starred: false },
        { id: cryptoId(), text: "Watch ball to contact.", starred: false },
        { id: cryptoId(), text: "Reset when stretched.", starred: false },
        { id: cryptoId(), text: "Attack only high balls.", starred: false }
      ],
      videos: []
    },
    {
      id: "footwork",
      title: "Footwork",
      hasVideos: true,
      collapsed: false,
      notes: [
        { id: cryptoId(), text: "Stay on toes.", starred: false },
        { id: cryptoId(), text: "Shuffle instead of reaching.", starred: false },
        { id: cryptoId(), text: "Wide athletic base.", starred: false },
        { id: cryptoId(), text: "Recover to ready position.", starred: false }
      ],
      videos: []
    },
    {
      id: "backhand-dink",
      title: "Backhand Dink",
      hasVideos: true,
      collapsed: false,
      notes: [
        { id: cryptoId(), text: "Paddle back early.", starred: false },
        { id: cryptoId(), text: "Hand below paddle.", starred: false },
        { id: cryptoId(), text: "Handle below ball.", starred: false },
        { id: cryptoId(), text: "Bottom edge leads.", starred: false },
        { id: cryptoId(), text: "Shoulder turns first.", starred: false }
      ],
      videos: []
    },
    {
      id: "two-hand-backhand",
      title: "Two Hand Backhand",
      hasVideos: true,
      collapsed: false,
      notes: [
        { id: cryptoId(), text: "Right hand higher on handle.", starred: false },
        { id: cryptoId(), text: "Left hand below right hand.", starred: false },
        { id: cryptoId(), text: "Turn shoulders first.", starred: false },
        { id: cryptoId(), text: "Load outside leg.", starred: false },
        { id: cryptoId(), text: "Contact in front.", starred: false },
        { id: cryptoId(), text: "Finish high.", starred: false },
        { id: cryptoId(), text: "Stay balanced.", starred: false },
        { id: cryptoId(), text: "Watch ball to contact.", starred: false }
      ],
      videos: []
    },
    {
      id: "serve",
      title: "Serve",
      hasVideos: true,
      collapsed: false,
      notes: [
        { id: cryptoId(), text: "Semi-open stance.", starred: false },
        { id: cryptoId(), text: "Choke down slightly.", starred: false },
        { id: cryptoId(), text: "Loose grip.", starred: false },
        { id: cryptoId(), text: "Smooth acceleration.", starred: false },
        { id: cryptoId(), text: "Exhale through contact.", starred: false }
      ],
      videos: []
    },
    {
      id: "slice",
      title: "Slice",
      hasVideos: true,
      collapsed: false,
      notes: [
        { id: cryptoId(), text: "Shoulder leads.", starred: false },
        { id: cryptoId(), text: "Cocked wrist.", starred: false },
        { id: cryptoId(), text: "Paddle face slightly open.", starred: false },
        { id: cryptoId(), text: "Smooth carve, not chop.", starred: false },
        { id: cryptoId(), text: "Finish toward target.", starred: false }
      ],
      videos: []
    },
    {
      id: "strategy",
      title: "Strategy",
      hasVideos: false,
      collapsed: false,
      notes: [
        { id: cryptoId(), text: "Attack high balls.", starred: false },
        { id: cryptoId(), text: "Reset low balls.", starred: false },
        { id: cryptoId(), text: "Through the middle when unsure.", starred: false },
        { id: cryptoId(), text: "Keep opponents back.", starred: false },
        { id: cryptoId(), text: "Make them hit one more ball.", starred: false }
      ],
      videos: []
    }
  ]
};

let data = loadData();
let searchTerm = "";

const sectionsEl = document.getElementById("sections");
const searchInput = document.getElementById("searchInput");
const searchStatus = document.getElementById("searchStatus");
const todayReminder = document.getElementById("todayReminder");
const sectionTemplate = document.getElementById("sectionTemplate");

document.addEventListener("DOMContentLoaded", () => {
  todayReminder.value = data.todayReminder || "";
  renderSections();

  todayReminder.addEventListener("input", () => {
    data.todayReminder = todayReminder.value;
    saveData();
  });

  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    renderSections();
  });
});

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredCloneSafe(defaultData);

  try {
    const parsed = JSON.parse(saved);
    return mergeData(parsed);
  } catch (error) {
    console.warn("Could not load saved playbook. Resetting.", error);
    return structuredCloneSafe(defaultData);
  }
}

function mergeData(saved) {
  const fresh = structuredCloneSafe(defaultData);
  fresh.todayReminder = saved.todayReminder ?? fresh.todayReminder;

  fresh.sections = fresh.sections.map(defaultSection => {
    const savedSection = (saved.sections || []).find(section => section.id === defaultSection.id);
    if (!savedSection) return defaultSection;

    return {
      ...defaultSection,
      collapsed: savedSection.collapsed ?? defaultSection.collapsed,
      notes: Array.isArray(savedSection.notes) ? savedSection.notes : defaultSection.notes,
      videos: Array.isArray(savedSection.videos) ? savedSection.videos : []
    };
  });

  return fresh;
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    alert("This device could not save that change. If you uploaded a large video, try using a YouTube link instead.");
    console.error(error);
  }
}

function renderSections() {
  sectionsEl.innerHTML = "";
  let visibleCount = 0;

  data.sections.forEach(section => {
    const sectionNode = sectionTemplate.content.cloneNode(true);
    const panel = sectionNode.querySelector(".playbook-section");
    const title = sectionNode.querySelector(".section-title");
    const toggle = sectionNode.querySelector(".section-toggle");
    const notesList = sectionNode.querySelector(".notes-list");
    const addNote = sectionNode.querySelector(".add-note");
    const videosBlock = sectionNode.querySelector(".videos-block");
    const videoForm = sectionNode.querySelector(".video-form");
    const videoTitle = sectionNode.querySelector(".video-title");
    const videoUrl = sectionNode.querySelector(".video-url");
    const videoUpload = sectionNode.querySelector(".video-upload");
    const videosList = sectionNode.querySelector(".videos-list");

    title.textContent = section.title;
    panel.dataset.sectionId = section.id;
    if (section.collapsed && !searchTerm) panel.classList.add("collapsed");

    toggle.addEventListener("click", () => {
      section.collapsed = !section.collapsed;
      saveData();
      renderSections();
    });

    addNote.addEventListener("click", () => {
      const text = prompt(`Add a note to ${section.title}:`);
      if (!text || !text.trim()) return;
      section.notes.push({ id: cryptoId(), text: text.trim(), starred: false });
      saveData();
      renderSections();
    });

    const matchingNotes = section.notes.filter(note => matchesSearch(section.title, note.text, note.starred ? "starred favorite" : ""));
    renderNotes(notesList, section, matchingNotes);

    if (!section.hasVideos) {
      videosBlock.remove();
    } else {
      videoForm.addEventListener("submit", event => {
        event.preventDefault();
        const titleValue = videoTitle.value.trim();
        const urlValue = videoUrl.value.trim();
        if (!titleValue || !urlValue) return alert("Add a video title and link first.");
        section.videos.push({ id: cryptoId(), title: titleValue, url: urlValue, type: "link" });
        videoTitle.value = "";
        videoUrl.value = "";
        saveData();
        renderSections();
      });

      videoUpload.addEventListener("change", event => {
        const file = event.target.files[0];
        if (!file) return;
        const titleValue = prompt("Name this video:", file.name.replace(/\.[^/.]+$/, ""));
        if (!titleValue || !titleValue.trim()) return;

        const reader = new FileReader();
        reader.onload = () => {
          section.videos.push({
            id: cryptoId(),
            title: titleValue.trim(),
            url: reader.result,
            type: "upload"
          });
          saveData();
          renderSections();
        };
        reader.readAsDataURL(file);
      });

      const matchingVideos = section.videos.filter(video => matchesSearch(section.title, video.title, video.url));
      renderVideos(videosList, section, matchingVideos);
    }

    const hasVisibleContent = matchingNotes.length > 0 || (section.hasVideos && section.videos.some(video => matchesSearch(section.title, video.title, video.url))) || !searchTerm;

    if (hasVisibleContent) {
      visibleCount += 1;
      sectionsEl.appendChild(sectionNode);
    }
  });

  searchStatus.textContent = searchTerm ? `${visibleCount} section${visibleCount === 1 ? "" : "s"} matched.` : "";
}

function renderNotes(container, section, notes) {
  container.innerHTML = "";

  if (notes.length === 0) {
    container.innerHTML = `<div class="empty-state">No matching notes.</div>`;
    return;
  }

  notes.forEach(note => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.innerHTML = `
      <div class="note-top">
        <div class="note-text"></div>
        <div class="note-actions">
          <button class="icon-button star-button" type="button" title="Star note">★</button>
          <button class="icon-button edit-button" type="button" title="Edit note">✎</button>
          <button class="icon-button danger delete-button" type="button" title="Delete note">×</button>
        </div>
      </div>
    `;

    card.querySelector(".note-text").textContent = note.text;
    const starButton = card.querySelector(".star-button");
    if (note.starred) starButton.classList.add("starred");

    starButton.addEventListener("click", () => {
      note.starred = !note.starred;
      saveData();
      renderSections();
    });

    card.querySelector(".edit-button").addEventListener("click", () => {
      const updated = prompt("Edit note:", note.text);
      if (updated === null) return;
      if (!updated.trim()) return alert("Note cannot be blank.");
      note.text = updated.trim();
      saveData();
      renderSections();
    });

    card.querySelector(".delete-button").addEventListener("click", () => {
      if (!confirm("Delete this note?")) return;
      section.notes = section.notes.filter(item => item.id !== note.id);
      saveData();
      renderSections();
    });

    container.appendChild(card);
  });
}

function renderVideos(container, section, videos) {
  container.innerHTML = "";

  if (videos.length === 0) {
    container.innerHTML = `<div class="empty-state">No videos yet.</div>`;
    return;
  }

  videos.forEach(video => {
    const card = document.createElement("div");
    card.className = "video-card";

    const mediaHtml = video.type === "upload"
      ? `<video controls src="${escapeAttr(video.url)}"></video>`
      : `<p><a href="${escapeAttr(video.url)}" target="_blank" rel="noopener">Open video</a></p>`;

    card.innerHTML = `
      <div class="video-top">
        <div>
          <strong class="video-name"></strong>
          ${mediaHtml}
        </div>
        <div class="video-actions">
          <button class="icon-button edit-video" type="button" title="Edit video">✎</button>
          <button class="icon-button danger delete-video" type="button" title="Delete video">×</button>
        </div>
      </div>
    `;

    card.querySelector(".video-name").textContent = video.title;

    card.querySelector(".edit-video").addEventListener("click", () => {
      const updatedTitle = prompt("Edit video title:", video.title);
      if (updatedTitle === null) return;
      if (!updatedTitle.trim()) return alert("Video title cannot be blank.");
      video.title = updatedTitle.trim();

      if (video.type === "link") {
        const updatedUrl = prompt("Edit video link:", video.url);
        if (updatedUrl === null) return;
        if (!updatedUrl.trim()) return alert("Video link cannot be blank.");
        video.url = updatedUrl.trim();
      }

      saveData();
      renderSections();
    });

    card.querySelector(".delete-video").addEventListener("click", () => {
      if (!confirm("Delete this video?")) return;
      section.videos = section.videos.filter(item => item.id !== video.id);
      saveData();
      renderSections();
    });

    container.appendChild(card);
  });
}

function matchesSearch(...values) {
  if (!searchTerm) return true;
  return values.some(value => String(value || "").toLowerCase().includes(searchTerm));
}

function cryptoId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function escapeAttr(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
