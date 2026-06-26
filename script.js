const DATA = window.SITE_DATA || {};
const placeholderPhoto = 'assets/placeholders/photo-placeholder.svg';
const placeholderVideo = 'assets/placeholders/video-poster.svg';

const $ = (selector) => document.querySelector(selector);
const squadGrid = $('#squadGrid');
const galleryGrid = $('#galleryGrid');
const videoRail = $('#videoRail');
const timelineList = $('#timelineList');
const audio = $('#audio');
const canvas = $('#visualizer');
const ctx = canvas.getContext('2d');
const audioStatus = $('#audioStatus');
const trackHint = $('#trackHint');
const playTrackBtn = $('#playTrackBtn');
const trackNameNode = $('#trackName');

function setText(selector, value) {
  const node = $(selector);
  if (node && value) node.textContent = value;
}

function setAudioStatus(message, type = 'info') {
  if (!audioStatus) return;
  audioStatus.textContent = message;
  audioStatus.dataset.type = type;
}

function fileNameWithoutExtension(name) {
  return (name || '').replace(/\.[^.]+$/, '');
}

function setTrackHint(text) {
  if (trackHint) trackHint.textContent = text;
}

setText('#hero-title', DATA.heroTitle);
setText('.hero__lead', DATA.heroSubtitle);
setText('#friendNameHero', DATA.friendName);
setText('#trackName', DATA.trackTitle);

const DEFAULT_TRACK = DATA.trackFile || 'assets/music/track.mp3';
if (DEFAULT_TRACK) {
  audio.src = DEFAULT_TRACK;
  audio.preload = 'auto';
  audio.volume = 1;
  audio.muted = false;
  audio.load();
}

function renderSquad() {
  squadGrid.innerHTML = '';
  (DATA.squad || []).forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'squad-card';
    card.innerHTML = `
      <div>
        <div class="squad-card__emoji">${item.emoji || '⭐'}</div>
        <h3>${item.name || `Друг ${index + 1}`}</h3>
        <small>${item.role || 'роль в команде'}</small>
      </div>
      <p>${item.phrase || 'Добавь сюда вашу фразу.'}</p>
    `;
    squadGrid.appendChild(card);
  });
}

function photoCard(item, index) {
  const card = document.createElement('article');
  card.className = 'photo-card';
  const img = document.createElement('img');
  img.alt = item.title || `Фото ${index + 1}`;
  img.src = item.src || placeholderPhoto;
  img.onerror = () => { img.onerror = null; img.src = placeholderPhoto; };
  const body = document.createElement('div');
  body.className = 'photo-card__body';
  body.innerHTML = `<h3>${item.title || `Фото ${index + 1}`}</h3><p>${item.text || 'Добавь подпись к фото.'}</p>`;
  card.append(img, body);
  return card;
}

function renderPhotos() {
  galleryGrid.innerHTML = '';
  (DATA.photos || []).forEach((item, index) => galleryGrid.appendChild(photoCard(item, index)));
}

function videoCard(item, index) {
  const card = document.createElement('article');
  card.className = 'video-card';
  const mediaWrap = document.createElement('div');
  mediaWrap.className = 'video-placeholder';

  const video = document.createElement('video');
  video.controls = true;
  video.preload = 'metadata';
  video.poster = placeholderVideo;
  video.src = item.src || '';
  video.onerror = () => {
    video.remove();
    mediaWrap.innerHTML = `<img src="${placeholderVideo}" alt="Место для видео"><span>Вставь видео</span>`;
  };

  if (item.src) {
    mediaWrap.appendChild(video);
  } else {
    mediaWrap.innerHTML = `<img src="${placeholderVideo}" alt="Место для видео"><span>Вставь видео</span>`;
  }

  const body = document.createElement('div');
  body.className = 'video-card__body';
  body.innerHTML = `<h3>${item.title || `Видео ${index + 1}`}</h3><p>${item.text || 'Добавь описание момента.'}</p>`;
  card.append(mediaWrap, body);
  return card;
}

function renderVideos() {
  videoRail.innerHTML = '';
  (DATA.videos || []).forEach((item, index) => videoRail.appendChild(videoCard(item, index)));
}

function renderTimeline() {
  timelineList.innerHTML = '';
  (DATA.timeline || []).forEach((item) => {
    const card = document.createElement('article');
    card.className = 'time-card';
    card.innerHTML = `
      <div class="time-card__year">${item.year || 'Дата'}</div>
      <div><h3>${item.title || 'Событие'}</h3><p>${item.text || 'Описание события.'}</p></div>
    `;
    timelineList.appendChild(card);
  });
}

function updateDateStats() {
  const daysValue = $('#daysValue');
  const daysLabel = $('#daysLabel');
  const target = DATA.returnDate ? new Date(DATA.returnDate) : new Date('2026-06-26T18:00:00+03:00');
  const now = new Date();
  const diff = target - now;
  const oneDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil(Math.abs(diff) / oneDay);

  if (Math.abs(diff) < oneDay) {
    daysValue.textContent = 'сегодня';
    daysLabel.textContent = 'тот самый день';
  } else if (diff > 0) {
    daysValue.textContent = days;
    daysLabel.textContent = 'дней до встречи';
  } else {
    daysValue.textContent = days;
    daysLabel.textContent = 'дней как Коля дома';
  }
}

function setupUploaders() {
  $('#photoInput')?.addEventListener('change', (event) => {
    [...event.target.files].forEach((file) => {
      const url = URL.createObjectURL(file);
      galleryGrid.prepend(photoCard({ src: url, title: fileNameWithoutExtension(file.name), text: 'Фото добавлено прямо на странице.' }, 0));
    });
  });

  $('#videoInput')?.addEventListener('change', (event) => {
    [...event.target.files].forEach((file) => {
      const url = URL.createObjectURL(file);
      videoRail.prepend(videoCard({ src: url, title: fileNameWithoutExtension(file.name), text: 'Видео добавлено прямо на странице.' }, 0));
    });
  });

  $('#audioInput')?.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    audio.pause();
    audio.src = url;
    audio.volume = 1;
    audio.muted = false;
    audio.load();
    if (trackNameNode) trackNameNode.textContent = fileNameWithoutExtension(file.name);
    setTrackHint('трек выбран — нажми «Включить наш трек»');
    setAudioStatus('Трек выбран прямо с компьютера. Нажми «Включить наш трек».', 'ok');
  });
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.13 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function setupCursorGlow() {
  const glow = $('.cursor-glow');
  window.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
}

function confetti(amount = 130) {
  const colors = ['#ff8a3d', '#26f0c2', '#7694ff', '#ffffff', '#ffd166'];
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2.4 + Math.random() * 2.8}s`;
    piece.style.animationDelay = `${Math.random() * .5}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    piece.style.borderRadius = Math.random() > .55 ? '999px' : '2px';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 6200);
  }
}

function setupSurprise() {
  const modal = $('#surpriseModal');
  $('#surpriseBtn')?.addEventListener('click', () => {
    modal.showModal();
    confetti(160);
  });
  $('#bigFinalBtn')?.addEventListener('click', () => confetti(220));
  $('#confettiAgain')?.addEventListener('click', () => confetti(150));
  $('#closeModal')?.addEventListener('click', () => modal.close());
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });
}

function setupToasts() {
  const toastText = $('#toastText');
  $('#toastBtn')?.addEventListener('click', () => {
    const list = DATA.toasts || ['За возвращение домой!'];
    toastText.textContent = list[Math.floor(Math.random() * list.length)];
  });
}

let idleRaf = null;
function drawIdleVisualizer() {
  cancelAnimationFrame(idleRaf);
  const draw = () => {
    if (!audio.paused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bars = 54;
    const gap = 6;
    const barWidth = (canvas.width - gap * (bars - 1)) / bars;
    for (let i = 0; i < bars; i++) {
      const wave = Math.sin(Date.now() / 450 + i * .45);
      const height = 30 + Math.abs(wave) * 80;
      const x = i * (barWidth + gap);
      const y = canvas.height - height - 18;
      const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
      gradient.addColorStop(0, '#26f0c2');
      gradient.addColorStop(.55, '#ff8a3d');
      gradient.addColorStop(1, 'rgba(255,255,255,.16)');
      ctx.fillStyle = gradient;
      roundRect(ctx, x, y, barWidth, height, 999);
      ctx.fill();
    }
    idleRaf = requestAnimationFrame(draw);
  };
  draw();
}

let audioContext;
let analyser;
let source;
function tryCreateAudioGraph() {
  try {
    if (audioContext && analyser) return true;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    audioContext = new AudioContextClass();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    return true;
  } catch (error) {
    // Главное — чтобы музыка играла. Визуализатор не должен ломать звук.
    console.warn('Визуализатор не запустился, но музыка может играть:', error);
    return false;
  }
}

async function startAudioOnly() {
  audio.muted = false;
  audio.volume = 1;

  if (!audio.src) {
    throw new Error('NO_SRC');
  }

  // Если до этого была ошибка загрузки, пробуем заново перечитать файл из папки.
  if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE && DEFAULT_TRACK) {
    audio.src = `${DEFAULT_TRACK}?v=${Date.now()}`;
    audio.load();
  }

  await audio.play();
}

async function playTrack() {
  if (!audio.src) {
    setAudioStatus('Трек ещё не выбран. Нажми «Выбрать ваш трек» или положи файл assets/music/track.mp3.', 'error');
    return;
  }

  setAudioStatus('Пытаюсь включить трек… Если сайт открыт прямо из ZIP-архива, сначала распакуй папку.', 'info');

  try {
    await startAudioOnly();
    setAudioStatus('Трек включён. Если не слышно — проверь громкость вкладки, браузера и Windows.', 'ok');
    setTrackHint('играет ваш трек');
    if (playTrackBtn) playTrackBtn.textContent = 'Трек играет';

    // Визуализатор запускаем уже после старта музыки. Даже если он не сработает, звук не пострадает.
    const graphReady = tryCreateAudioGraph();
    if (audioContext?.state === 'suspended') await audioContext.resume();
    if (graphReady) renderVisualizer();
  } catch (error) {
    const code = audio.error?.code;
    let message = 'Музыка не запустилась. Самый надёжный способ: нажми «Выбрать ваш трек» и выбери песню прямо с компьютера.';

    if (code === 4) {
      message = 'Файл есть, но браузер не может его прочитать. Частая причина: файл не настоящий MP3, а M4A/WEBM переименованный в .mp3. Выбери обычный MP3 или WAV.';
    } else if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      message = 'Файл не найден по пути assets/music/track.mp3. Проверь, что папка распакована, а название файла строго track.mp3, не track.mp3.mp3.';
    } else if (String(error?.name).includes('NotAllowed')) {
      message = 'Браузер заблокировал звук. Нажми кнопку ещё раз или нажми Play прямо на маленьком плеере.';
    }

    setAudioStatus(message, 'error');
    setTrackHint('проверь файл или выбери трек кнопкой');
    if (playTrackBtn) playTrackBtn.textContent = 'Включить наш трек';
    console.error('Ошибка запуска трека:', error, audio.error);
  }
}

function setupAudioVisualizer() {
  drawIdleVisualizer();

  playTrackBtn?.addEventListener('click', playTrack);

  audio.addEventListener('canplay', () => {
    if (audio.src) {
      setAudioStatus('Трек найден и готов. Нажми «Включить наш трек».', 'ok');
      setTrackHint('трек готов к запуску');
    }
  });

  audio.addEventListener('play', async () => {
    audio.muted = false;
    audio.volume = 1;
    setAudioStatus('Трек включён. Если тишина — проверь громкость вкладки и компьютера.', 'ok');
    setTrackHint('играет ваш трек');
    if (playTrackBtn) playTrackBtn.textContent = 'Трек играет';

    const graphReady = tryCreateAudioGraph();
    if (audioContext?.state === 'suspended') await audioContext.resume();
    if (graphReady) renderVisualizer();
  });

  audio.addEventListener('pause', () => {
    if (playTrackBtn) playTrackBtn.textContent = 'Включить наш трек';
    setTrackHint('пауза — можно продолжить');
    drawIdleVisualizer();
  });

  audio.addEventListener('volumechange', () => {
    if (audio.muted || audio.volume === 0) {
      setAudioStatus('Звук выключен в плеере. Включи громкость на маленьком аудиоплеере.', 'error');
    }
  });

  audio.addEventListener('error', () => {
    const code = audio.error?.code;
    const messages = {
      1: 'Загрузка трека отменена. Попробуй выбрать файл заново.',
      2: 'Проблема с загрузкой файла. Если сайт открыт из ZIP — распакуй архив.',
      3: 'Файл повреждён или браузер не смог его декодировать. Попробуй другой MP3/WAV.',
      4: 'Формат не поддерживается или файл не найден. Проверь track.mp3 или выбери трек кнопкой.'
    };
    setAudioStatus(messages[code] || 'Файл трека не найден или формат не читается. Нажми «Выбрать ваш трек».', 'error');
    setTrackHint('файл не найден — выбери трек');
  });
}

function renderVisualizer() {
  if (!analyser || audio.paused) {
    if (audio.paused) drawIdleVisualizer();
    return;
  }
  cancelAnimationFrame(idleRaf);
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const bars = data.length;
  const gap = 5;
  const barWidth = (canvas.width - gap * (bars - 1)) / bars;
  for (let i = 0; i < bars; i++) {
    const height = Math.max(10, (data[i] / 255) * (canvas.height - 26));
    const x = i * (barWidth + gap);
    const y = canvas.height - height - 12;
    const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
    gradient.addColorStop(0, '#26f0c2');
    gradient.addColorStop(.55, '#ff8a3d');
    gradient.addColorStop(1, '#7694ff');
    ctx.fillStyle = gradient;
    roundRect(ctx, x, y, barWidth, height, 999);
    ctx.fill();
  }
  requestAnimationFrame(renderVisualizer);
}

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y + height - r, r);
  context.arcTo(x, y, x + r, y, r);
  context.closePath();
}

renderSquad();
renderPhotos();
renderVideos();
renderTimeline();
updateDateStats();
setupUploaders();
setupReveal();
setupCursorGlow();
setupSurprise();
setupToasts();
setupAudioVisualizer();

window.addEventListener('load', () => confetti(80));
