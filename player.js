const playlist = [
  {
    title: 'Midnight Drive',
    artist: 'Neon Horizon',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: null,
  },
  {
    title: 'Golden Hour',
    artist: 'Luna Echo',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: null,
  },
  {
    title: 'Electric Dreams',
    artist: 'Synthwave Collective',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: null,
  },
  {
    title: 'Ocean Breeze',
    artist: 'Coastal Vibes',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: null,
  },
  {
    title: 'Starlight',
    artist: 'Cosmic Pulse',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: null,
  },
];

const audio = document.getElementById('audio');
const playlistEl = document.getElementById('playlist');
const songTitleEl = document.getElementById('songTitle');
const artistNameEl = document.getElementById('artistName');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const progressBar = document.getElementById('progressBar');
const progressWrap = progressBar.parentElement;
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeBar = document.getElementById('volumeBar');
const volumeValueEl = document.getElementById('volumeValue');
const muteBtn = document.getElementById('muteBtn');
const autoplayToggle = document.getElementById('autoplayToggle');
const albumArt = document.getElementById('albumArt');
const visualizer = document.getElementById('visualizer');
const iconPlay = playPauseBtn.querySelector('.icon-play');
const iconPause = playPauseBtn.querySelector('.icon-pause');
const iconVolume = muteBtn.querySelector('.icon-volume');
const iconMuted = muteBtn.querySelector('.icon-muted');

let currentIndex = 0;
let isSeeking = false;
let lastVolume = 80;

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function renderPlaylist() {
  playlistEl.innerHTML = '';

  playlist.forEach((track, index) => {
    const li = document.createElement('li');
    li.className = 'playlist-item' + (index === currentIndex ? ' active' : '');
    li.dataset.index = index;
    li.innerHTML = `
      <span class="track-num">${index + 1}</span>
      <div class="track-details">
        <h3>${track.title}</h3>
        <p>${track.artist}</p>
      </div>
      <span class="track-duration">${track.duration ? formatTime(track.duration) : '—'}</span>
    `;
    li.addEventListener('click', () => loadTrack(index, true));
    playlistEl.appendChild(li);
  });
}

function updateTrackInfo() {
  const track = playlist[currentIndex];
  songTitleEl.textContent = track.title;
  artistNameEl.textContent = track.artist;
  document.title = `${track.title} — WaveFlow`;
}

function updatePlaylistActiveState() {
  playlistEl.querySelectorAll('.playlist-item').forEach((item, index) => {
    item.classList.toggle('active', index === currentIndex);
  });
}

function setPlayingUI(playing) {
  albumArt.classList.toggle('playing', playing);
  visualizer.classList.toggle('active', playing);
  iconPlay.classList.toggle('hidden', playing);
  iconPause.classList.toggle('hidden', !playing);
  playPauseBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  playPauseBtn.title = playing ? 'Pause' : 'Play';
}

function loadTrack(index, autoplay = false) {
  currentIndex = index;
  const track = playlist[currentIndex];

  audio.src = track.src;
  updateTrackInfo();
  updatePlaylistActiveState();
  progressBar.value = 0;
  progressWrap.style.setProperty('--progress', '0%');
  currentTimeEl.textContent = '0:00';
  totalDurationEl.textContent = '0:00';

  if (autoplay) {
    audio.play().catch(() => {});
  }
}

function togglePlayPause() {
  if (audio.paused) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}

function playPrevious() {
  const nextIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
  loadTrack(nextIndex, true);
}

function playNext() {
  const nextIndex = (currentIndex + 1) % playlist.length;
  loadTrack(nextIndex, true);
}

function updateProgress() {
  if (isSeeking || !audio.duration) return;

  const percent = (audio.currentTime / audio.duration) * 100;
  progressBar.value = percent;
  progressWrap.style.setProperty('--progress', `${percent}%`);
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

function seekTo(percent) {
  if (!audio.duration) return;
  audio.currentTime = (percent / 100) * audio.duration;
  progressWrap.style.setProperty('--progress', `${percent}%`);
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

function updateVolume(value) {
  const vol = value / 100;
  audio.volume = vol;
  volumeValueEl.textContent = `${value}%`;

  if (vol > 0) {
    lastVolume = value;
    iconVolume.classList.remove('hidden');
    iconMuted.classList.add('hidden');
    muteBtn.setAttribute('aria-label', 'Mute');
  }
}

function toggleMute() {
  if (audio.volume > 0) {
    lastVolume = volumeBar.value;
    volumeBar.value = 0;
    updateVolume(0);
    iconVolume.classList.add('hidden');
    iconMuted.classList.remove('hidden');
    muteBtn.setAttribute('aria-label', 'Unmute');
  } else {
    volumeBar.value = lastVolume || 80;
    updateVolume(volumeBar.value);
    iconVolume.classList.remove('hidden');
    iconMuted.classList.add('hidden');
    muteBtn.setAttribute('aria-label', 'Mute');
  }
}

playPauseBtn.addEventListener('click', togglePlayPause);
prevBtn.addEventListener('click', playPrevious);
nextBtn.addEventListener('click', playNext);
muteBtn.addEventListener('click', toggleMute);

audio.addEventListener('play', () => setPlayingUI(true));
audio.addEventListener('pause', () => setPlayingUI(false));

audio.addEventListener('loadedmetadata', () => {
  totalDurationEl.textContent = formatTime(audio.duration);
  playlist[currentIndex].duration = audio.duration;

  const durationEl = playlistEl.querySelector(
    `.playlist-item[data-index="${currentIndex}"] .track-duration`
  );
  if (durationEl) {
    durationEl.textContent = formatTime(audio.duration);
  }
});

audio.addEventListener('timeupdate', updateProgress);

audio.addEventListener('ended', () => {
  if (autoplayToggle.checked) {
    playNext();
  } else {
    setPlayingUI(false);
    progressBar.value = 0;
    progressWrap.style.setProperty('--progress', '0%');
  }
});

progressBar.addEventListener('input', () => {
  isSeeking = true;
  seekTo(progressBar.value);
});

progressBar.addEventListener('change', () => {
  isSeeking = false;
});

volumeBar.addEventListener('input', () => {
  updateVolume(volumeBar.value);
  if (volumeBar.value > 0) {
    iconVolume.classList.remove('hidden');
    iconMuted.classList.add('hidden');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input')) return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'ArrowLeft':
      playPrevious();
      break;
    case 'ArrowRight':
      playNext();
      break;
    case 'ArrowUp':
      e.preventDefault();
      volumeBar.value = Math.min(100, Number(volumeBar.value) + 5);
      updateVolume(volumeBar.value);
      break;
    case 'ArrowDown':
      e.preventDefault();
      volumeBar.value = Math.max(0, Number(volumeBar.value) - 5);
      updateVolume(volumeBar.value);
      break;
  }
});

renderPlaylist();
updateVolume(volumeBar.value);
loadTrack(0, false);
