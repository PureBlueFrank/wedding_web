const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("p");
const closeButton = lightbox.querySelector(".lightbox-close");

document.querySelectorAll(".photo-card").forEach((card) => {
  card.addEventListener("click", () => {
    lightboxImage.src = card.dataset.src;
    lightboxImage.alt = card.dataset.caption;
    lightboxCaption.textContent = card.dataset.caption;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
}

closeButton.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
    closeLightbox();
  }
});

const musicButton = document.querySelector(".music-toggle");
const musicText = musicButton.querySelector(".music-text");
let audioContext;
let masterGain;
let chordTimer;
let isMusicPlaying = false;
let activeVoices = [];

const chordProgression = [
  [261.63, 329.63, 392.0, 523.25],
  [220.0, 329.63, 392.0, 493.88],
  [174.61, 261.63, 349.23, 440.0],
  [196.0, 246.94, 329.63, 392.0],
];

function createVoice(frequency, startTime, duration) {
  const oscillator = audioContext.createOscillator();
  const overtone = audioContext.createOscillator();
  const voiceGain = audioContext.createGain();
  const pan = audioContext.createStereoPanner();

  oscillator.type = "sine";
  overtone.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  overtone.frequency.setValueAtTime(frequency * 2, startTime);
  pan.pan.setValueAtTime((Math.random() - 0.5) * 0.5, startTime);

  voiceGain.gain.setValueAtTime(0.0001, startTime);
  voiceGain.gain.exponentialRampToValueAtTime(0.045, startTime + 1.4);
  voiceGain.gain.exponentialRampToValueAtTime(0.018, startTime + duration - 1.4);
  voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(voiceGain);
  overtone.connect(voiceGain);
  voiceGain.connect(pan);
  pan.connect(masterGain);

  oscillator.start(startTime);
  overtone.start(startTime);
  oscillator.stop(startTime + duration + 0.1);
  overtone.stop(startTime + duration + 0.1);

  return { oscillator, overtone, voiceGain };
}

function playChord(index = 0) {
  if (!isMusicPlaying) {
    return;
  }

  const startTime = audioContext.currentTime + 0.04;
  const duration = 6.8;
  activeVoices = chordProgression[index].map((note) => createVoice(note, startTime, duration));
  chordTimer = window.setTimeout(() => playChord((index + 1) % chordProgression.length), 5600);
}

function setMusicVolume(value) {
  if (!masterGain) {
    return;
  }

  masterGain.gain.cancelScheduledValues(audioContext.currentTime);
  masterGain.gain.linearRampToValueAtTime(value, audioContext.currentTime + 0.45);
}

function startMusic() {
  if (!audioContext) {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) {
      return;
    }
    audioContext = new AudioEngine();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.0001;
    masterGain.connect(audioContext.destination);
  }

  isMusicPlaying = true;
  musicButton.classList.add("is-playing");
  musicButton.setAttribute("aria-label", "暂停背景音乐");
  musicButton.setAttribute("aria-pressed", "true");
  musicText.textContent = "Playing";
  setMusicVolume(0.28);
  audioContext.resume().then(() => playChord()).catch(stopMusic);
}

function stopMusic() {
  isMusicPlaying = false;
  window.clearTimeout(chordTimer);
  activeVoices.forEach(({ voiceGain }) => {
    voiceGain.gain.cancelScheduledValues(audioContext.currentTime);
    voiceGain.gain.linearRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
  });
  activeVoices = [];
  setMusicVolume(0.0001);
  musicButton.classList.remove("is-playing");
  musicButton.setAttribute("aria-label", "播放背景音乐");
  musicButton.setAttribute("aria-pressed", "false");
  musicText.textContent = "Music";
}

musicButton.addEventListener("click", () => {
  if (isMusicPlaying) {
    stopMusic();
    return;
  }

  startMusic();
});

document.querySelectorAll("video").forEach((video) => {
  video.addEventListener("play", () => setMusicVolume(0.08));
  video.addEventListener("pause", () => {
    if (isMusicPlaying) {
      setMusicVolume(0.28);
    }
  });
});
