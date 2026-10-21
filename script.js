const modal = document.getElementById("projectModal");
const modalVideo = document.getElementById("modalVideo");
const modalEmpty = document.getElementById("modalEmpty");
const modalError = modalEmpty.querySelector("p");
const modalErrorDetails = modalEmpty.querySelector("small");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalDescription = document.getElementById("modalDescription");
const modalLink = document.getElementById("modalLink");
const modalInstagram = document.getElementById("modalInstagram");
const modalImage = document.getElementById("modalImage");
const project02Playlist = document.getElementById("project02Playlist");
const project03Playlist = document.getElementById("project03Playlist");
const modalMediaOptions = [...document.querySelectorAll(".modal-playlist .modal-video-option")];

function getProjectDataFromCard(card) {
  if (!card) return null;

  return {
    id: card.dataset.id,
    filter: card.dataset.filter,
    category: card.dataset.category || "",
    title: card.dataset.title || card.querySelector(".project-title")?.textContent?.trim() || "",
    desc: card.dataset.desc || "",
    video: card.dataset.video || "",
    link: card.dataset.link || ""
  };
}

function getProjectVideo(project) {
  if (!project) return "";
  if (project.id === "01") return "proyek1.mp4";
  return project.video || "";
}

function render(filter = "all") {
  document.querySelectorAll(".project").forEach(card => {
    const shouldShow = filter === "all" || card.dataset.filter === filter;
    card.style.display = shouldShow ? "" : "none";
  });
}

function openProject(id) {
  const card = document.querySelector(`.project[data-id="${id}"]`);
  const project = getProjectDataFromCard(card);

  if (!project) return;

  modalTitle.textContent = project.title;
  modalCategory.textContent = project.category;
  modalDescription.textContent = project.desc;
  project02Playlist.classList.toggle("show", project.id === "02");
  project03Playlist.classList.toggle("show", project.id === "03");
  modalInstagram.hidden = project.id !== "03";

  if (project.link && project.link !== "#") {
    modalLink.href = project.link;
    modalLink.textContent = "Open project link ↗";
    modalLink.style.display = "inline-block";
  } else {
    modalLink.removeAttribute("href");
    modalLink.style.display = "none";
  }

  const activePlaylist = project.id === "02" ? project02Playlist : project.id === "03" ? project03Playlist : null;
  const firstPlaylistOption = activePlaylist?.querySelector(".modal-video-option") || null;
  modalMediaOptions.forEach(option => {
    option.classList.toggle("active", option === firstPlaylistOption);
  });

  if (firstPlaylistOption) {
    setModalMedia(firstPlaylistOption.dataset.mediaSrc, firstPlaylistOption.dataset.mediaType);
  } else {
    setModalMedia(getProjectVideo(project), "video");
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function setModalMedia(mediaSource, mediaType) {
  modalVideo.pause();
  modalVideo.onloadeddata = null;
  modalVideo.onerror = null;
  modalVideo.removeAttribute("src");
  modalVideo.load();
  modalVideo.classList.add("hide");
  modalImage.hidden = true;
  modalImage.onload = null;
  modalImage.onerror = null;
  modalImage.removeAttribute("src");
  modalEmpty.classList.remove("show");

  if (!mediaSource) {
    modalEmpty.classList.add("show");
    modalError.textContent = "Media proyek belum tersedia.";
    modalErrorDetails.textContent = "Periksa nama dan lokasi file media.";
    return;
  }

  if (mediaType === "image") {
    modalImage.onload = () => {
      modalImage.hidden = false;
      modalEmpty.classList.remove("show");
    };

    modalImage.onerror = () => {
      modalImage.hidden = true;
      modalEmpty.classList.add("show");
      modalError.textContent = "Foto proyek tidak dapat ditampilkan.";
      modalErrorDetails.textContent = "Periksa nama dan lokasi file kula.jpg.";
    };

    modalImage.src = new URL(mediaSource, document.baseURI).href;
    return;
  }

  modalVideo.onloadeddata = () => {
    modalVideo.classList.remove("hide");
    modalEmpty.classList.remove("show");
    modalVideo.play().catch(error => {
      console.log("Autoplay diblokir browser:", error);
    });
  };

  modalVideo.onerror = () => {
    modalVideo.classList.add("hide");
    modalEmpty.classList.add("show");
    modalError.textContent = "Video tidak dapat diputar di browser ini.";
    modalErrorDetails.textContent = "Periksa nama file dan pastikan video MP4 memakai codec H.264/AVC.";
  };

  modalVideo.src = new URL(mediaSource, document.baseURI).href;
  modalVideo.load();
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modalVideo.pause();
  modalVideo.onloadeddata = null;
  modalVideo.onerror = null;
  modalVideo.removeAttribute("src");
  modalVideo.load();
  modalImage.removeAttribute("src");
  modalImage.hidden = true;
  document.body.style.overflow = "";
}

modalMediaOptions.forEach(option => {
  option.addEventListener("click", () => {
    modalMediaOptions.forEach(button => button.classList.remove("active"));
    option.classList.add("active");
    setModalMedia(option.dataset.mediaSrc, option.dataset.mediaType);
  });
});

document.querySelectorAll(".project-preview").forEach(preview => {
  const video = preview.querySelector("video");

  if (video) {
    video.addEventListener("loadeddata", () => {
      preview.classList.add("has-video");
    });

    preview.addEventListener("mouseenter", () => {
      if (video.readyState < 2) return;
      video.currentTime = 0;
      video.play().catch(error => {
        console.log("Preview video tidak dapat diputar:", error);
      });
    });

    preview.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });
  }

  preview.addEventListener("click", () => openProject(preview.dataset.id));
  preview.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProject(preview.dataset.id);
    }
  });
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    render(button.dataset.filter);
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(element => {
  observer.observe(element);
});

const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");

let mx = window.innerWidth / 2;
let my = window.innerHeight / 2;
let rx = mx;
let ry = my;

window.addEventListener("mousemove", event => {
  mx = event.clientX;
  my = event.clientY;
  dot.style.left = mx + "px";
  dot.style.top = my + "px";
});

function cursorLoop() {
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
  ring.style.left = rx + "px";
  ring.style.top = ry + "px";
  requestAnimationFrame(cursorLoop);
}

cursorLoop();

function cursorHover() {
  document.querySelectorAll("a, button, .project-preview, .circle-cta").forEach(element => {
    element.addEventListener("mouseenter", () => {
      ring.classList.add("hover");
    });

    element.addEventListener("mouseleave", () => {
      ring.classList.remove("hover");
    });
  });
}

cursorHover();

document.querySelectorAll(".magnetic").forEach(element => {
  element.addEventListener("mousemove", event => {
    if (window.innerWidth < 1000) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.15;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.15;
    element.style.transform = `translate(${x}px, ${y}px)`;
  });

  element.addEventListener("mouseleave", () => {
    element.style.transform = "";
  });
});

window.addEventListener("load", () => {
  document.body.classList.remove("loading");

  setTimeout(() => {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.classList.add("done");
    }
  }, 500);
});

render();
