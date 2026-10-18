const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

// Ukuran font matrix rain responsif
function getMatrixFontSize() {
  const w = window.innerWidth;
  if (w < 480) return 18;
  if (w < 768) return 24;
  return 32;
}

let fontSize = getMatrixFontSize();
const letterChars = "HAPPYBIRTHDAY".split("");
// Simbol hati variatif (hati solid, hati outline, hati berkilau emoji, dll)
const heartChars = ["♥", "♡", "❤", "💖", "💕", "💗", "💓", "❣", "❦"];
let matrixMode = "letters"; // 'letters' atau 'hearts'

// Warna yang digunakan untuk matrix
const pink1 = "#FF69B4"; // Hot Pink
const pink2 = "#FF1493"; // Deep Pink
const lightPink = "#f5a7d6ff"; // Kilau putih-pink terang di ujung

let columns, maxRows;
let drops = [];
let delays = [];
let columnColors = [];

// Inisialisasi tetesan matrix rain
function initMatrix() {
  columns = Math.floor(canvas.width / fontSize) + 1;
  maxRows = Math.floor(canvas.height / fontSize) + 2;

  drops = [];
  delays = [];
  columnColors = [];

  for (let i = 0; i < columns; i++) {
    drops[i] = 0;
    delays[i] = Math.floor(Math.random() * 100);
    columnColors[i] = i % 2 === 0 ? pink1 : pink2;
  }
}

// Inisialisasi awal ukuran canvas matrix
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
initMatrix();

// Fungsi transisi matrix rain berubah menjadi simbol-simbol hati
function transitionMatrixToHearts() {
  if (matrixMode === "hearts") return;
  matrixMode = "hearts";

  // Sebarkan tetesan matrix ke berbagai posisi vertikal secara acak
  // agar hujan hati langsung mengalir deras dan memenuhi layar seketika
  for (let i = 0; i < columns; i++) {
    if (Math.random() < 0.6) {
      drops[i] = Math.floor(Math.random() * (maxRows * 0.45));
      delays[i] = Math.floor(Math.random() * 8);
    }
  }
}

// Reset animasi matrix kembali ke huruf
function resetMatrixToLetters() {
  matrixMode = "letters";
  initMatrix();
}

window.transitionMatrixToHearts = transitionMatrixToHearts;
window.resetMatrixToLetters = resetMatrixToLetters;

function draw() {
  // Kotak hitam transparan untuk efek pudar (fade)
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const activeChars = matrixMode === "hearts" ? heartChars : letterChars;
  ctx.font =
    matrixMode === "hearts"
      ? "bold " +
        fontSize +
        "px 'Segoe UI Emoji', 'Segoe UI Symbol', 'Apple Color Emoji', Consolas, sans-serif"
      : "bold " + fontSize + "px Consolas, monospace";

  for (let i = 0; i < columns; i++) {
    if (delays[i] > 0) {
      delays[i]--;
      continue;
    }

    const char = activeChars[Math.floor(Math.random() * activeChars.length)];
    ctx.shadowBlur = matrixMode === "hearts" ? 18 : 15;

    if (Math.random() < (matrixMode === "hearts" ? 0.18 : 0.12)) {
      ctx.fillStyle = lightPink;
      ctx.shadowColor = lightPink;
    } else {
      ctx.fillStyle = columnColors[i];
      ctx.shadowColor = columnColors[i];
    }

    const x = i * fontSize;
    const y = drops[i] * fontSize;

    ctx.fillText(char, x, y);

    drops[i]++;

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
      drops[i] = 0;
      delays[i] = Math.floor(Math.random() * 20);
    }
  }
}

const matrixStartTime = performance.now();
setInterval(draw, 40);

// ========== PARTICLE BIRTHDAY ANIMATION SYSTEM ==========

const particleCanvas = document.getElementById("particleCanvas");
const pCtx = particleCanvas.getContext("2d");

particleCanvas.width = window.innerWidth;
particleCanvas.height = window.innerHeight;

// Offscreen canvas untuk sampling pixel teks & bentuk hati terisi penuh
const offscreen = document.createElement("canvas");
const offCtx = offscreen.getContext("2d", { willReadFrequently: true });

// Palette warna partikel (Pink, Deep Pink, White-Pink, Gold Sparkle, Neon Magenta)
const PCOLORS = [
  "rgb(255,230,245)", // 0: putih-pink terang
  "rgb(255,105,180)", // 1: hot pink
  "rgb(255,20,147)", // 2: deep pink
  "rgb(255,225,120)", // 3: emas berkilau (gold fireworks)
  "rgb(255,80,220)", // 4: neon magenta
];
const PCOLORS_GLOW = [
  "rgba(255,230,245,0.16)",
  "rgba(255,105,180,0.16)",
  "rgba(255,20,147,0.16)",
  "rgba(255,225,120,0.22)",
  "rgba(255,80,220,0.18)",
];

// Menghitung ukuran font, gap partikel, dan batasan optimal agar teks selalu fit di layar (100% responsif)
function getOptimalConfig(text, isNumber = false) {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  const maxFractionW = screenW < 480 ? 0.86 : screenW < 768 ? 0.82 : 0.78;
  const maxW = screenW * maxFractionW;
  const maxH = screenH * (isNumber ? 0.42 : 0.32);

  let baseMaxFont;
  if (screenW < 480) {
    baseMaxFont = isNumber ? 190 : 160;
  } else if (screenW < 768) {
    baseMaxFont = isNumber ? 280 : 230;
  } else {
    baseMaxFont = isNumber ? 380 : 300;
  }

  offCtx.font = `900 100px 'Orbitron', sans-serif`;
  const m = offCtx.measureText(text);
  const testW = m.width || 100;

  const fontForW = (maxW / testW) * 100;
  let fontSz = Math.min(baseMaxFont, fontForW, maxH);
  fontSz = Math.max(28, Math.floor(fontSz));

  let gap;
  if (fontSz >= 260) {
    gap = 7;
  } else if (fontSz >= 180) {
    gap = 6;
  } else if (fontSz >= 120) {
    gap = 5;
  } else if (fontSz >= 65) {
    gap = 4;
  } else {
    gap = 3;
  }

  return { fontSz, gap };
}

// Menghasilkan titik-titik bentuk hati yang TERISI PENUH (solid filled heart)
function getFilledHeartPoints() {
  const W = particleCanvas.width;
  const H = particleCanvas.height;
  const cx = W / 2;
  const cy = H / 2 - (H < 600 ? 15 : 25);

  // Ukuran lebar dan tinggi bentuk hati agar proporsional di mobile & desktop
  const heartW = Math.min(W * 0.72, H * 0.52);
  const heartH = heartW * 0.95;

  offscreen.width = Math.ceil(heartW) + 40;
  offscreen.height = Math.ceil(heartH) + 40;
  offCtx.clearRect(0, 0, offscreen.width, offscreen.height);

  const hw = heartW;
  const hh = heartH;
  const hx = offscreen.width / 2;
  const hy = offscreen.height / 2;

  // Gambar bentuk hati terisi penuh (solid fill)
  offCtx.fillStyle = "#fff";
  offCtx.beginPath();
  const topY = hy - hh * 0.42;
  const bottomY = hy + hh * 0.48;
  const leftX = hx - hw * 0.5;
  const rightX = hx + hw * 0.5;
  const midTopY = hy - hh * 0.18;

  offCtx.moveTo(hx, midTopY);
  // Lekukan atas kiri ke samping
  offCtx.bezierCurveTo(
    hx - hw * 0.28,
    topY,
    leftX,
    topY + hh * 0.22,
    leftX,
    hy,
  );
  // Sisi kiri ke ujung bawah lancip
  offCtx.bezierCurveTo(
    leftX,
    hy + hh * 0.28,
    hx - hw * 0.15,
    bottomY - hh * 0.15,
    hx,
    bottomY,
  );
  // Ujung bawah lancip ke sisi kanan
  offCtx.bezierCurveTo(
    hx + hw * 0.15,
    bottomY - hh * 0.15,
    rightX,
    hy + hh * 0.28,
    rightX,
    hy,
  );
  // Sisi kanan ke lekukan atas tengah
  offCtx.bezierCurveTo(
    rightX,
    topY + hh * 0.22,
    hx + hw * 0.28,
    topY,
    hx,
    midTopY,
  );
  offCtx.closePath();
  offCtx.fill();

  // Sampling pixel dari canvas offscreen untuk mendapatkan partikel terisi penuh (rapat & lebat)
  const imgData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
  const gap = W < 480 ? 6 : W < 768 ? 7 : 8;
  const pts = [];

  for (let y = 0; y < offscreen.height; y += gap) {
    for (let x = 0; x < offscreen.width; x += gap) {
      const alpha = imgData.data[(y * offscreen.width + x) * 4 + 3];
      if (alpha > 120) {
        const relX = x - hx;
        const relY = y - hy;
        pts.push({
          x: cx + relX,
          y: cy + relY,
          origHx: relX,
          origHy: relY,
        });
      }
    }
  }

  return { pts, cx, cy, heartH };
}

// --- Kelas Partikel Multi-Mode ---
class Particle {
  constructor(startX, startY, targetX, targetY) {
    this.x = startX;
    this.y = startY;
    this.tx = targetX;
    this.ty = targetY;

    const baseP = window.innerWidth < 480 ? 1.6 : 2.2;
    this.size = Math.random() * (baseP * 1.2) + baseP;
    this.baseSize = this.size;

    this.vx = 0;
    this.vy = 0;
    this.friction = 0.85 + Math.random() * 0.08;
    this.ease = 0.06 + Math.random() * 0.04;
    this.alpha = 1;
    this.alive = true;
    this.phase = Math.random() * Math.PI * 2;
    this.mode = "target"; // 'target', 'orbit', 'heart', 'firework'
    this.isRaining = false;
    this.rainMaxSpeed = 5.0;

    // Parameter Orbit Layar (mengelilingi batas layar)
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.orbitSpeed = 0.03 + Math.random() * 0.01;
    this.orbitRadiusX = (window.innerWidth / 2) * (0.8 + Math.random() * 0.12);
    this.orbitRadiusY = (window.innerHeight / 2) * (0.8 + Math.random() * 0.12);

    // Parameter Bentuk Hati
    this.origHx = 0;
    this.origHy = 0;

    // Parameter Kembang Api
    this.gravity = 0.12;
    this.drag = 0.965;
    this.decay = 0.008;

    // Warna awal dalam tema pink
    const r = Math.random();
    if (r < 0.12) {
      this.cIdx = 0; // putih-pink
    } else if (r < 0.55) {
      this.cIdx = 1; // hot pink
    } else {
      this.cIdx = 2; // deep pink
    }
  }

  update() {
    // Mode 1: Kembang Api (Meledak, gravitasi, deselerasi udara, kilauan, memudar)
    if (this.mode === "firework") {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.alpha -= this.decay;

      // Efek kilau / twinkle kembang api
      if (Math.random() < 0.2) {
        this.size = this.baseSize * (1.2 + Math.random() * 0.6);
      } else {
        this.size = this.baseSize;
      }
      return this.alpha > 0;
    }

    if (!this.alive) {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.15;
      this.alpha -= 0.007;
      return this.alpha > 0;
    }

    // Mode 2: Orbit Layar (Berputar mengelilingi batas layar secara spektakuler)
    if (this.mode === "orbit") {
      const cx = particleCanvas.width / 2;
      const cy = particleCanvas.height / 2;
      this.orbitAngle += this.orbitSpeed;

      const targetX = cx + Math.cos(this.orbitAngle) * this.orbitRadiusX;
      const targetY = cy + Math.sin(this.orbitAngle) * this.orbitRadiusY;

      const dx = targetX - this.x;
      const dy = targetY - this.y;
      this.vx += dx * 0.045;
      this.vy += dy * 0.045;
      this.vx *= 0.88;
      this.vy *= 0.88;
      this.x += this.vx;
      this.y += this.vy;

      this.size =
        this.baseSize + Math.sin(performance.now() * 0.006 + this.phase) * 0.5;
      return true;
    }

    // Mode 3: Heart (Membentuk simbol hati terisi penuh dengan denyut lembut)
    if (this.mode === "heart") {
      const cx = particleCanvas.width / 2;
      const cy =
        particleCanvas.height / 2 - (window.innerHeight < 600 ? 15 : 25);

      // Efek detak jantung berirama (heartbeat pulse)
      const now = performance.now();
      const pulse =
        1 +
        Math.sin(now * 0.005) * 0.035 +
        (Math.sin(now * 0.01) > 0.85 ? 0.025 : 0);
      const targetX = cx + this.origHx * pulse;
      const targetY = cy + this.origHy * pulse;

      const dx = targetX - this.x;
      const dy = targetY - this.y;
      this.vx += dx * this.ease;
      this.vy += dy * this.ease;
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.x += this.vx;
      this.y += this.vy;

      this.size = this.baseSize + Math.sin(now * 0.006 + this.phase) * 0.45;
      return true;
    }

    // Mode Default: Target Teks & Angka
    const dx = this.tx - this.x;
    const dy = this.ty - this.y;

    if (this.isRaining) {
      // Efek hujan partikel: pergerakan turun yang anggun, bertahap, dan santai
      this.vx += dx * this.ease;
      this.vy += dy * this.ease;

      // Sentuhan melayang/mengayun lembut
      this.vx += Math.sin(performance.now() * 0.003 + this.phase) * 0.14;

      this.vx *= this.friction;
      this.vy *= this.friction;

      // Batasi kecepatan agar tidak melesat instan, memberikan efek hujan bercahaya yang megah
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > this.rainMaxSpeed) {
        this.vx = (this.vx / speed) * this.rainMaxSpeed;
        this.vy = (this.vy / speed) * this.rainMaxSpeed;
      }

      // Begitu mendekati target huruf, beralih ke stabilitas normal
      if (Math.hypot(dx, dy) < 18) {
        this.isRaining = false;
        this.ease = 0.06 + Math.random() * 0.04;
        this.friction = 0.85 + Math.random() * 0.08;
      }
    } else {
      this.vx += dx * this.ease;
      this.vy += dy * this.ease;
      this.vx *= this.friction;
      this.vy *= this.friction;
    }

    this.x += this.vx;
    this.y += this.vy;

    this.size =
      this.baseSize + Math.sin(performance.now() * 0.004 + this.phase) * 0.4;
    return true;
  }

  setTarget(x, y) {
    this.tx = x;
    this.ty = y;
  }

  scatter() {
    this.alive = false;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 4;
  }
}

// --- State Animasi ---
let particles = [];
let labelText = "";
let labelAlpha = 0;
let labelColor = "rgba(255,105,180,0.7)";
let countdownDone = true;
let animRunning = false;
let currentPhase = "words"; // 'words', 'orbit', 'heart', 'fireworks'
let currentWordOrNum = null;
let currentFontSz = 180;
let lastHeartH = 200;

// --- Sampling posisi pixel dari teks ---
function sampleText(text, fontSz, gap) {
  offCtx.font = `900 ${fontSz}px 'Orbitron', sans-serif`;
  const m = offCtx.measureText(text);
  const w = Math.ceil(m.width) + 40;
  const h = Math.ceil(fontSz * 1.3) + 40;
  offscreen.width = w;
  offscreen.height = h;

  offCtx.clearRect(0, 0, w, h);
  offCtx.font = `900 ${fontSz}px 'Orbitron', sans-serif`;
  offCtx.fillStyle = "#fff";
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  offCtx.fillText(text, w / 2, h / 2);

  const imgData = offCtx.getImageData(0, 0, w, h);
  const pts = [];
  const cx = particleCanvas.width / 2;
  const cy = particleCanvas.height / 2;

  for (let y = 0; y < h; y += gap) {
    for (let x = 0; x < w; x += gap) {
      if (imgData.data[(y * w + x) * 4 + 3] > 128) {
        pts.push({ x: cx + x - w / 2, y: cy + y - h / 2 });
      }
    }
  }
  return pts;
}

// --- Morph partikel ke bentuk teks baru ---
// fromTop = true → semua partikel muncul dari atas layar (efek hujan turun)
function morphTo(text, isNumber = false, fromTop = false) {
  currentWordOrNum = { text, isNumber };
  const { fontSz, gap } = getOptimalConfig(text, isNumber);
  currentFontSz = fontSz;

  const positions = sampleText(text, fontSz, gap);
  const cx = particleCanvas.width / 2;
  const cy = particleCanvas.height / 2;
  const W = particleCanvas.width;
  const H = particleCanvas.height;
  const newArr = [];

  for (let i = 0; i < positions.length; i++) {
    if (i < particles.length && particles[i].alive) {
      const p = particles[i];
      // Jika fromTop, pindahkan partikel yang sudah ada ke atas layar secara bertingkat
      if (fromTop) {
        p.x = Math.random() * W;
        // Sebaran vertikal bertingkat (-80px sampai -500px) agar partikel turun bertahap seperti tirai hujan
        p.y = -(Math.random() * Math.max(350, H * 0.45) + 80);
        p.vx = (Math.random() - 0.5) * 1.5;
        p.vy = Math.random() * 2 + 1;
        p.isRaining = true;
        p.rainMaxSpeed = 4.2 + Math.random() * 2.0; // Kecepatan terkontrol santai (~4-6 px/frame)
        p.ease = 0.005 + Math.random() * 0.003; // Akselerasi halus
        p.friction = 0.91 + Math.random() * 0.03;
      } else {
        p.isRaining = false;
        p.ease = 0.006 + Math.random() * 0.004;
        p.friction = 0.85 + Math.random() * 0.08;
      }
      p.mode = "target";
      p.setTarget(positions[i].x, positions[i].y);
      p.alive = true;
      p.alpha = 1;
      newArr.push(p);
    } else {
      // Posisi awal: dari atas layar (fromTop) atau dari sekitar tengah
      let startX, startY;
      if (fromTop) {
        startX = Math.random() * W;
        startY = -(Math.random() * Math.max(350, H * 0.45) + 80);
      } else {
        startX = cx + (Math.random() - 0.5) * Math.min(W, 350);
        startY = cy + (Math.random() - 0.5) * Math.min(H, 350);
      }
      const p = new Particle(startX, startY, positions[i].x, positions[i].y);
      if (fromTop) {
        p.vx = (Math.random() - 0.5) * 1.5;
        p.vy = Math.random() * 2 + 1;
        p.isRaining = true;
        p.rainMaxSpeed = 4.2 + Math.random() * 2.0;
        p.ease = 0.002 + Math.random() * 0.001;
        p.friction = 0.91 + Math.random() * 0.03;
      }
      p.mode = "target";
      newArr.push(p);
    }
  }

  // Partikel berlebih → scatter keluar
  for (let i = positions.length; i < particles.length; i++) {
    if (particles[i].alive) {
      particles[i].scatter();
      newArr.push(particles[i]);
    }
  }

  particles = newArr;
}

// --- 1. Fase Pecah & Berputar Mengelilingi Layar (Orbit Screen) ---
function startOrbitScreenPhase() {
  currentPhase = "orbit";
  labelText = "";
  labelAlpha = 0;

  const W = particleCanvas.width;
  const H = particleCanvas.height;
  const cx = W / 2;
  const cy = H / 2;

  // Arahkan setiap partikel memancar keluar menuju tepi layar lalu berputar mengelilingi layar
  particles.forEach((p) => {
    p.mode = "orbit";
    p.alive = true;
    p.alpha = 1;

    // Sudut orbit awal dihitung dari posisi partikel terhadap tengah
    p.orbitAngle = Math.atan2(p.y - cy, p.x - cx);
    p.orbitSpeed = 0.032 + Math.random() * 0.008;

    // Radius orbit mengikuti batas tepi layar (lebar & tinggi viewport)
    p.orbitRadiusX = (W / 2) * (0.8 + Math.random() * 0.14);
    p.orbitRadiusY = (H / 2) * (0.8 + Math.random() * 0.14);

    // Berikan dorongan keluar ke arah tepi layar
    const angle = p.orbitAngle;
    const speed = Math.random() * 3 + 2;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
  });

  // Berputar mengelilingi layar selama 2.8 detik, kemudian berkumpul membentuk simbol hati terisi penuh
  setTimeout(formFilledHeartPhase, 2800);
}

// --- 2. Fase Membentuk Simbol Hati Terisi Penuh (Solid Filled Heart) ---
function formFilledHeartPhase() {
  currentPhase = "heart";

  // Dapatkan seluruh titik bentuk hati yang terisi penuh
  const heartData = getFilledHeartPoints();
  const heartPoints = heartData.pts;
  lastHeartH = heartData.heartH;

  const targetCount = heartPoints.length;
  const W = particleCanvas.width;
  const H = particleCanvas.height;
  const cx = W / 2;
  const cy = H / 2;

  // Tambahkan partikel jika jumlah saat ini kurang dari titik hati agar terisi sangat padat
  while (particles.length < targetCount) {
    const angle = Math.random() * Math.PI * 2;
    const startX = cx + Math.cos(angle) * ((W / 2) * 0.85);
    const startY = cy + Math.sin(angle) * ((H / 2) * 0.85);
    const p = new Particle(startX, startY, cx, cy);
    p.mode = "heart";
    particles.push(p);
  }

  // Pasangkan setiap partikel ke titik hati terisi penuh
  for (let i = 0; i < particles.length; i++) {
    const pt = heartPoints[i % targetCount];
    particles[i].mode = "heart";
    particles[i].origHx = pt.origHx;
    particles[i].origHy = pt.origHy;
    particles[i].setTarget(pt.x, pt.y);
    particles[i].friction = 0.86 + Math.random() * 0.05;
    particles[i].ease = 0.05 + Math.random() * 0.03;
    particles[i].alive = true;
    particles[i].alpha = 1;
  }

  // Munculkan ucapan hangat di bawah simbol hati
  setTimeout(() => {
    labelText = "✨ Semoga semua harapanmu terwujud ✨";
    labelColor = "rgba(255,255,255,0.95)";
    labelAlpha = 0.95;
  }, 700);

  // Tahan simbol hati terisi penuh selama 3.5 detik, lalu meledak menjadi kembang api
  setTimeout(explodeHeartIntoFireworks, 3500);
}

// --- 3. Fase Meledak Menjadi Kembang Api (Fireworks) ---
function explodeHeartIntoFireworks() {
  currentPhase = "fireworks";

  // Transisi animasi matrix dari huruf ke model hati tepat saat kalimat terakhir muncul
  transitionMatrixToHearts();

  const cx = particleCanvas.width / 2;
  const cy = particleCanvas.height / 2 - (window.innerHeight < 600 ? 15 : 25);

  labelText = "🎆 HAPPY BIRTHDAY! 🎆";
  labelColor = "rgba(255, 235, 245, 1)";
  labelAlpha = 1;

  // Meledakkan semua partikel hati keluar
  particles.forEach((p) => {
    p.mode = "firework";
    p.alive = true;

    // Arah radial ledakan dari pusat hati
    const angle = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - 0.5) * 0.5;
    const speed = Math.random() * 15 + 5;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - (Math.random() * 3 + 1);
    p.gravity = 0.1 + Math.random() * 0.05;
    p.drag = 0.965;
    p.decay = Math.random() * 0.009 + 0.006;

    // Aneka warna kembang api berkilau (Pink, Gold, Magenta, White)
    const r = Math.random();
    if (r < 0.25)
      p.cIdx = 0; // putih-pink
    else if (r < 0.5)
      p.cIdx = 1; // hot pink
    else if (r < 0.7)
      p.cIdx = 2; // deep pink
    else if (r < 0.88)
      p.cIdx = 3; // emas berkilau (gold)
    else p.cIdx = 4; // neon magenta
  });

  // Tambahkan semburan kembang api pendukung untuk kemeriahan ekstra
  spawnExtraFireworks(cx - 140, cy - 80, 55);
  spawnExtraFireworks(cx + 140, cy - 80, 55);

  setTimeout(() => {
    spawnExtraFireworks(cx, cy - 120, 65);
  }, 380);

  setTimeout(() => {
    spawnExtraFireworks(cx - 80, cy + 60, 45);
    spawnExtraFireworks(cx + 80, cy + 60, 45);
  }, 750);

  // Munculkan galeri kenangan indah setelah kembang api meletup (saat hati terakhir hancur)
  setTimeout(() => {
    showMemoryGallery();
  }, 2400);

  // Fade out label setelah kembang api mulai mereda
  setTimeout(() => {
    const fadeLabel = setInterval(() => {
      labelAlpha -= 0.005;
      if (labelAlpha <= 0) {
        labelAlpha = 0;
        clearInterval(fadeLabel);
        animRunning = false;
      }
    }, 50);
  }, 5000);
}

// Bantuan untuk memunculkan letusan kembang api sekunder
function spawnExtraFireworks(originX, originY, count = 40) {
  for (let i = 0; i < count; i++) {
    const p = new Particle(originX, originY, originX, originY);
    p.mode = "firework";
    p.alive = true;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 10 + 3;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - Math.random() * 2;
    p.gravity = 0.11;
    p.drag = 0.962;
    p.decay = Math.random() * 0.011 + 0.007;

    const r = Math.random();
    if (r < 0.35)
      p.cIdx = 3; // gold
    else if (r < 0.65)
      p.cIdx = 0; // white-pink
    else if (r < 0.85)
      p.cIdx = 1; // hot pink
    else p.cIdx = 4; // magenta

    particles.push(p);
  }
}

// --- Rendering partikel (batch per warna untuk performa maksimal) ---
function renderParticles() {
  const numColors = PCOLORS.length;
  const aliveGroups = Array.from({ length: numColors }, () => []);
  const fadingList = [];

  for (const p of particles) {
    if (p.mode === "firework" || !p.alive) {
      fadingList.push(p);
    } else {
      const c = p.cIdx % numColors;
      aliveGroups[c].push(p);
    }
  }

  // Pass 1: Glow (partikel hidup)
  pCtx.globalAlpha = 1;
  for (let c = 0; c < numColors; c++) {
    if (aliveGroups[c].length === 0) continue;
    pCtx.fillStyle = PCOLORS_GLOW[c];
    pCtx.beginPath();
    for (const p of aliveGroups[c]) {
      const r = Math.max(1, p.size * 3.2);
      pCtx.moveTo(p.x + r, p.y);
      pCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
    }
    pCtx.fill();
  }

  // Pass 2: Core (partikel hidup)
  for (let c = 0; c < numColors; c++) {
    if (aliveGroups[c].length === 0) continue;
    pCtx.fillStyle = PCOLORS[c];
    pCtx.beginPath();
    for (const p of aliveGroups[c]) {
      const r = Math.max(0.4, p.size);
      pCtx.moveTo(p.x + r, p.y);
      pCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
    }
    pCtx.fill();
  }

  // Pass 3: Partikel kembang api & fading (glow + core)
  for (const p of fadingList) {
    if (p.alpha <= 0) continue;
    const c = p.cIdx % numColors;
    pCtx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
    pCtx.fillStyle = PCOLORS[c];
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, Math.max(0.4, p.size), 0, Math.PI * 2);
    pCtx.fill();
  }

  pCtx.globalAlpha = 1;
}

// --- Gambar label teks responsif tanpa tabrakan ---
function drawLabel() {
  if (labelAlpha <= 0 || !labelText) return;

  const screenW = window.innerWidth;
  let lblFont = screenW < 480 ? 12 : screenW < 768 ? 14 : 17;
  pCtx.font = `400 ${lblFont}px 'Orbitron', sans-serif`;

  const maxLabelW = screenW * 0.9;
  const measuredW = pCtx.measureText(labelText).width;
  if (measuredW > maxLabelW) {
    lblFont = Math.max(10, Math.floor(lblFont * (maxLabelW / measuredW)));
    pCtx.font = `400 ${lblFont}px 'Orbitron', sans-serif`;
  }

  pCtx.fillStyle = labelColor;
  pCtx.textAlign = "center";
  pCtx.textBaseline = "middle";
  pCtx.globalAlpha = labelAlpha;

  let targetY;
  if (currentPhase === "heart") {
    const cy = particleCanvas.height / 2 - (window.innerHeight < 600 ? 15 : 25);
    targetY = Math.min(particleCanvas.height - 25, cy + lastHeartH * 0.48 + 35);
  } else if (currentPhase === "fireworks") {
    targetY = particleCanvas.height / 2;
  } else {
    const offsetY = Math.round(
      currentFontSz * 0.55 + (screenW < 480 ? 25 : 35),
    );
    targetY = Math.min(
      particleCanvas.height - 20,
      particleCanvas.height / 2 + offsetY,
    );
  }

  pCtx.fillText(labelText, particleCanvas.width / 2, targetY);
  pCtx.globalAlpha = 1;
}

// --- Loop animasi utama ---
function animLoop() {
  pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

  // Update semua partikel
  for (let i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].update()) {
      particles.splice(i, 1);
    }
  }

  renderParticles();
  drawLabel();

  if (animRunning || particles.length > 0) {
    requestAnimationFrame(animLoop);
  }
}

// --- Handler Resize & Orientasi Mobile ---
function handleResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = w;
  canvas.height = h;
  fontSize = getMatrixFontSize();
  initMatrix();

  particleCanvas.width = w;
  particleCanvas.height = h;

  if (animRunning) {
    if (currentPhase === "heart") {
      const heartData = getFilledHeartPoints();
      const heartPoints = heartData.pts;
      lastHeartH = heartData.heartH;
      for (let i = 0; i < particles.length; i++) {
        const pt = heartPoints[i % heartPoints.length];
        particles[i].origHx = pt.origHx;
        particles[i].origHy = pt.origHy;
        particles[i].setTarget(pt.x, pt.y);
      }
    } else if (currentPhase === "orbit") {
      particles.forEach((p) => {
        p.orbitRadiusX = (w / 2) * (0.8 + Math.random() * 0.14);
        p.orbitRadiusY = (h / 2) * (0.8 + Math.random() * 0.14);
      });
    } else if (currentPhase === "countdown" || currentPhase === "words") {
      if (currentWordOrNum && currentWordOrNum.text) {
        morphTo(currentWordOrNum.text, currentWordOrNum.isNumber);
      }
    }
  }

  // Perbarui posisi formasi kartu hati saat ukuran layar berubah
  if (
    heartFormed &&
    heartStage &&
    !heartStage.classList.contains("hidden") &&
    heartPhotosContainer
  ) {
    const dockedCards = heartPhotosContainer.querySelectorAll(
      ".floating-photo-card.docked",
    );
    if (dockedCards.length > 0) {
      const { points } = computeHeartFormationLayout(dockedCards.length, w, h);
      dockedCards.forEach((card, i) => {
        if (points[i]) {
          const { targetX, targetY, rot } = points[i];
          card.style.transform = `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) rotate(${rot}deg) scale(1)`;
        }
      });
    }
  }
}

window.addEventListener("resize", handleResize);
window.addEventListener("orientationchange", () => {
  setTimeout(handleResize, 150);
});

// --- Sistem Audio Background Music (Sinkron via Gesture Overlay) ---
const bgMusicAudio =
  document.getElementById("bgMusic") || new Audio("assets/lagu.mp3");
const soundBtn = document.getElementById("soundBtn");
const soundIcon = document.getElementById("soundIcon");
const startOverlay = document.getElementById("startOverlay");
let isMuted = false;
let bgMusicStarted = false;

// Fungsi putar lagu.mp3 saat ucapan dimulai
function playBackgroundMusic() {
  if (bgMusicStarted || !bgMusicAudio) return;
  bgMusicStarted = true;

  bgMusicAudio.currentTime = 0;
  bgMusicAudio.muted = isMuted;
  bgMusicAudio.volume = 0.85;

  bgMusicAudio
    .play()
    .then(() => {
      if (soundIcon) soundIcon.textContent = isMuted ? "🔇" : "🔊";
    })
    .catch((err) => {
      console.warn("Lagu background gagal diputar:", err);
    });
}

// Tombol toggle mute / unmute
if (soundBtn) {
  soundBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    isMuted = !isMuted;

    if (bgMusicAudio) {
      bgMusicAudio.muted = isMuted;
      if (!isMuted && bgMusicAudio.paused && bgMusicStarted) {
        bgMusicAudio.play().catch(() => {});
      }
    }

    if (soundIcon) soundIcon.textContent = isMuted ? "🔇" : "🔊";
  });
}

// --- Mulai Animasi Ucapan ---
const WORD_DURATION = 4000; // Durasi per kata teks ucapan agar tenang & jelas terbaca
const birthdayWords = [
  "Happy",
  "Birthday",
  "To",
  "You",
  "Tegar",
  "Utomo",
  "yang ke",
  "24 tahun",
];

function startCelebration() {
  resetMatrixToLetters();
  currentPhase = "words";
  animRunning = true;
  bgMusicStarted = false;
  letterHasBeenOpened = false;
  lyricsUnlocked = false;

  // Sembunyikan galeri, surat, dan lirik saat animasi baru dimulai
  if (galleryModal) {
    galleryModal.classList.add("hidden");
    galleryModal.setAttribute("aria-hidden", "true");
  }
  if (letterModal) {
    letterModal.classList.add("hidden");
    letterModal.setAttribute("aria-hidden", "true");
  }
  if (lyricsWidget) {
    lyricsWidget.classList.add("hidden");
    lyricsWidget.setAttribute("aria-hidden", "true");
  }

  const reopenGallery = document.getElementById("reopenGalleryBtn");
  if (reopenGallery) reopenGallery.classList.add("hidden");
  const reopenLetter = document.getElementById("reopenLetterBtn");
  if (reopenLetter) reopenLetter.classList.add("hidden");
  const reopenLyrics = document.getElementById("reopenLyricsBtn");
  if (reopenLyrics) reopenLyrics.classList.add("hidden");

  // Putar lagu.mp3 secara langsung
  playBackgroundMusic();

  requestAnimationFrame(animLoop);

  // Langsung mulai urutan kata dari kata pertama ("Happy")
  showWordsSequence(birthdayWords);
}

// Menampilkan kata per kata dengan partikel
function showWordsSequence(words) {
  currentPhase = "words";
  let wordIndex = 0;
  labelText = "";
  labelAlpha = 0;

  function showNextWord() {
    if (wordIndex >= words.length) {
      // Semua kata selesai tampil (termasuk kata terakhir apapun itu)
      // Setelah kata terakhir bertahan selama WORD_DURATION, mulai fase partikel berputar mengelilingi layar!
      setTimeout(startOrbitScreenPhase, WORD_DURATION);
      return;
    }

    const word = words[wordIndex];
    const isFirstWord = wordIndex === 0;
    morphTo(word, false, isFirstWord);
    wordIndex++;

    // Kata pertama turun perlahan (~1.5 detik), berikan durasi 4800ms agar kata "Happy" dapat dinikmati & terbaca jelas
    const duration = isFirstWord ? 4800 : WORD_DURATION;
    setTimeout(showNextWord, duration);
  }

  showNextWord();
}

// === INISIALISASI: Overlay Tap → Audio + Animasi Kata Langsung Dimulai ===
// Saat user mengetuk overlay, lagu langsung diputar dan kata "Happy" langsung muncul.
let appStarted = false;

function handleStartTap() {
  if (appStarted) return;
  appStarted = true;

  // Sembunyikan overlay dengan animasi fade-out
  if (startOverlay) {
    startOverlay.classList.add("hidden");
  }

  // Langsung jalankan ucapan dimulai dari kata "Happy"
  setTimeout(startCelebration, 300);
}

// Alias fungsi untuk kompatibilitas
window.startCelebration = startCelebration;
window.startCountdown = startCelebration;

// Pasang event listener pada overlay
if (startOverlay) {
  startOverlay.addEventListener("click", handleStartTap);
  startOverlay.addEventListener("touchstart", handleStartTap, {
    passive: true,
  });
}

// ==============================================================================
// 📸 [BLOK PENGATURAN CAPTION & FOTO KENANGAN]
// Edit semua judul, kata-kata/quote, dan gambar foto cukup pada blok ini saja:
// ==============================================================================
const bookConfig = {
  coverTitle: "SWEET MEMORIES",
  coverSubtitle: "Kumpulan Kenangan Indah Bersamamu",
  closingQuote:
    "Setiap kenangan bersamamu adalah anugerah terindah yang selalu kusyukuri... ✨💖",
};

const memoriesData = [
  {
    src: "assets/memory1.jpeg",
    caption: "My Favorite Part About This Year ✨",
    date: "Momen 1 dari 6",
    quote: "i think my favorite part about this year was meeting you",
  },
  {
    src: "assets/memory2.jpeg",
    caption: "You & Me in the End 🌸",
    date: "Momen 2 dari 6",
    quote: "i'm still hoping it's you and me in the end",
  },
  {
    src: "assets/memory3.jpeg",
    caption: "Just Stay & Be My Last 💫",
    date: "Momen 3 dari 6",
    quote: "just stay and be my last!",
  },
  {
    src: "assets/memory4.jpeg",
    caption: "Proud of You 🌌✨",
    date: "Momen 4 dari 6",
    quote:
      "And I hope you're proud of yourself for surviving the wars you fought in silence.",
  },
  {
    src: "assets/memory5.jpeg",
    caption: "Your Smile Makes Me Smile 💖",
    date: "Momen 5 dari 6",
    quote:
      "The first thing I liked about you was your smile.\nDo you know why?\nBecause when you smiled, you made me smile too.",
  },
  {
    src: "assets/memory6.jpeg",
    caption: "Tetap Sehat & Bahagia 🎂✨",
    date: "Momen 6 dari 6",
    quote:
      "Mari tetap sehat dan bahagia untuk waktu yang lama, dibawah langit manapun.",
  },
];
// ==============================================================================

// Audio FX Sintetis (Web Audio API - ringan, mandiri, dan responsif)
function playSynthesizedSound(type = "flip") {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const actx = new AudioContextClass();

    if (type === "flip") {
      // Efek desau lembut lembaran kertas dibalik (paper whoosh)
      const bufferSize = actx.sampleRate * 0.14;
      const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }
      const noise = actx.createBufferSource();
      noise.buffer = buffer;
      const filter = actx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(950, actx.currentTime);
      filter.Q.value = 1.4;

      const gain = actx.createGain();
      gain.gain.setValueAtTime(0.09, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(actx.destination);
      noise.start();
    } else if (type === "chime") {
      // Nada lonceng pentatonik lembut berkilau saat foto berlabuh ke hati
      const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C5, D5, E5, G5, A5, C6
      const freq = notes[Math.floor(Math.random() * notes.length)];
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, actx.currentTime);

      gain.gain.setValueAtTime(0.04, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.35);
    }
  } catch (e) {
    // Silent fallback jika audio context dibatasi browser
  }
}

// Elemen DOM Galeri
const galleryModal = document.getElementById("galleryModal");
const galleryBackdrop = document.getElementById("galleryBackdrop");
const galleryTitle = document.getElementById("galleryTitle");
const gallerySubtitle = document.getElementById("gallerySubtitle");
const bookStage = document.getElementById("bookStage");
const bookElement = document.getElementById("bookElement");
const bookPrevBtn = document.getElementById("bookPrevBtn");
const bookNextBtn = document.getElementById("bookNextBtn");
const bookNextBtnText = document.getElementById("bookNextBtnText");
const bookPageIndicator = document.getElementById("bookPageIndicator");
const bookHint = document.getElementById("bookHint");
const heartStage = document.getElementById("heartStage");
const heartPhotosContainer = document.getElementById("heartPhotosContainer");
const heartCenterCard = document.getElementById("heartCenterCard");
const heartBottomDock = document.getElementById("heartBottomDock");
const goToLetterBtn = document.getElementById("goToLetterBtn");
const reopenBookBtn = document.getElementById("reopenBookBtn");
const reopenGalleryBtn = document.getElementById("reopenGalleryBtn");

// Elemen DOM Lightbox Zoom Foto
const photoLightboxModal = document.getElementById("photoLightboxModal");
const photoLightboxBackdrop = document.getElementById("photoLightboxBackdrop");
const closePhotoLightboxBtn = document.getElementById("closePhotoLightboxBtn");
const photoLightboxImg = document.getElementById("photoLightboxImg");
const photoLightboxTitle = document.getElementById("photoLightboxTitle");
const photoLightboxDate = document.getElementById("photoLightboxDate");
const photoLightboxQuote = document.getElementById("photoLightboxQuote");

// Fungsi Membuka Zoom Preview Foto
function openPhotoLightbox(item) {
  if (!photoLightboxModal || !item) return;
  if (photoLightboxImg) {
    photoLightboxImg.src = item.src || "assets/memory1.jpeg";
    photoLightboxImg.alt = item.caption || "Foto Kenangan";
  }
  if (photoLightboxTitle)
    photoLightboxTitle.textContent = item.caption || "Kenangan Indah";
  if (photoLightboxDate) photoLightboxDate.textContent = item.date || "";
  if (photoLightboxQuote) {
    photoLightboxQuote.textContent = item.quote ? `"${item.quote}"` : "";
  }

  photoLightboxModal.classList.remove("hidden");
  photoLightboxModal.setAttribute("aria-hidden", "false");
  playSynthesizedSound("chime");
}

// Fungsi Menutup Zoom Preview Foto
function closePhotoLightbox() {
  if (!photoLightboxModal) return;
  photoLightboxModal.classList.add("hidden");
  photoLightboxModal.setAttribute("aria-hidden", "true");
}

if (closePhotoLightboxBtn) {
  closePhotoLightboxBtn.addEventListener("click", closePhotoLightbox);
}
if (photoLightboxBackdrop) {
  photoLightboxBackdrop.addEventListener("click", closePhotoLightbox);
}

let bookLeaves = [];
let currentBookLeafIndex = 0; // 0 = Cover tertutup
let totalBookLeaves = 0;
let heartFormed = false;

// Inisialisasi Lembaran Buku 3D
function buildBookLeaves() {
  if (!bookElement) return;
  bookElement.innerHTML = "";

  // Alas Buku & Efek Tumpukan Kertas
  const bookBase = document.createElement("div");
  bookBase.className = "book-base";
  const paperStack = document.createElement("div");
  paperStack.className = "book-paper-stack";
  bookElement.appendChild(bookBase);
  bookElement.appendChild(paperStack);

  const leavesData = [];

  // Helper untuk merender halaman kutipan (halaman kiri saat buku terbuka)
  const renderQuotePageHTML = (quoteText, icon = "✨") => `
    <div class="page-scrapbook-back">
      <div class="scrapbook-quote-icon">${icon}</div>
      <p class="scrapbook-quote" title="Ketuk untuk membaca penuh">
        "${quoteText || ""}"
      </p>
      <div class="scrapbook-hearts">💕 🌸 💕</div>
    </div>
  `;

  // 1. Cover Depan Buku (Leaf 0)
  // - Sisi depan: Cover judul buku
  // - Sisi belakang: Menjadi halaman kiri saat Foto 1 dibuka, menampilkan quote Foto 1
  leavesData.push({
    isCover: true,
    frontHTML: `
      <div class="cover-front">
        <div class="cover-gold-border"></div>
        <div class="cover-icon">📖</div>
        <div class="cover-title">${bookConfig.coverTitle || "SWEET MEMORIES"}</div>
        <div class="cover-subtitle">${bookConfig.coverSubtitle || "Kumpulan Kenangan Indah Bersamamu"}</div>
        <div class="cover-open-tag">
          <span>Ketuk untuk Buka</span>
          <span>➔</span>
        </div>
      </div>
    `,
    backHTML: renderQuotePageHTML(
      memoriesData[0] ? memoriesData[0].quote : "",
      "🌸"
    ),
    quoteIndex: 0,
  });

  // 2. Lembaran Foto Kenangan (Dinamis dari memoriesData)
  memoriesData.forEach((item, idx) => {
    // Pada sisi belakang lembaran ini, tampilkan quote untuk foto selanjutnya (idx + 1)
    // Jika ini foto terakhir, tampilkan kata penutup buku
    const nextItem = memoriesData[idx + 1];
    const backQuoteText = nextItem
      ? nextItem.quote
      : (bookConfig.closingQuote || "Setiap kenangan bersamamu adalah anugerah terindah... ✨💖");
    const backIcon = nextItem ? "✨" : "💖";

    leavesData.push({
      isMemory: true,
      memoryIndex: idx,
      frontHTML: `
        <div class="page-memory">
          <div class="page-photo-frame">
            <div class="photo-tape"></div>
            <div class="page-photo-box" role="button" tabindex="0" title="Ketuk untuk perbesar foto">
              <img class="page-photo-img" src="${item.src}" alt="${item.caption}" loading="eager">
              <button class="photo-zoom-btn" type="button" title="Perbesar Foto">🔍 Perbesar</button>
            </div>
            <div class="page-caption-box">
              <div class="page-caption-title">${item.caption}</div>
              <div class="page-caption-date">${item.date || `Momen ${idx + 1}`}</div>
            </div>
            <div class="page-corner-decor">💖</div>
          </div>
        </div>
      `,
      backHTML: renderQuotePageHTML(backQuoteText, backIcon),
      quoteIndex: nextItem ? idx + 1 : -1,
    });
  });

  totalBookLeaves = leavesData.length;
  bookLeaves = [];

  // Rakit elemen DOM setiap lembaran (Leaf)
  leavesData.forEach((data, index) => {
    const leaf = document.createElement("div");
    leaf.className = "book-leaf";
    leaf.dataset.index = index;

    // Urutan z-index alami agar lembaran di atas menumpuk rapi
    leaf.style.zIndex = totalBookLeaves - index;

    const front = document.createElement("div");
    front.className = "leaf-front";
    front.innerHTML = data.frontHTML;

    const back = document.createElement("div");
    back.className = "leaf-back";
    back.innerHTML = data.backHTML;

    // Klik pada area foto untuk memperbesar foto & kutipan (Lightbox) tanpa membalik halaman
    const photoBox = front.querySelector(".page-photo-box");
    if (photoBox && data.isMemory) {
      photoBox.addEventListener("click", (e) => {
        e.stopPropagation();
        openPhotoLightbox(memoriesData[data.memoryIndex]);
      });
    }

    // Klik pada teks quote untuk memperbesar teks di modal jika ingin membaca lebih nyaman
    const quoteEl = back.querySelector(".scrapbook-quote");
    if (quoteEl) {
      quoteEl.addEventListener("click", (e) => {
        e.stopPropagation();
        if (data.quoteIndex !== undefined && data.quoteIndex >= 0 && memoriesData[data.quoteIndex]) {
          openPhotoLightbox(memoriesData[data.quoteIndex]);
        } else {
          openPhotoLightbox({
            src: "assets/memory1.jpeg",
            caption: "Buku Kenangan Indah",
            date: "Spesial Untukmu",
            quote: bookConfig.closingQuote,
          });
        }
      });
    }

    leaf.appendChild(front);
    leaf.appendChild(back);

    // Klik langsung pada lembaran untuk membalik halaman
    leaf.addEventListener("click", () => {
      if (leaf.classList.contains("flipped")) {
        // Balik kembali
        flipBookTo(index);
      } else {
        // Buka lembar ini
        flipBookTo(index + 1);
      }
    });

    bookElement.appendChild(leaf);
    bookLeaves.push(leaf);
  });

  updateBookControls();
}

// Update tampilan tombol navigasi & indikator halaman
function updateBookControls() {
  if (!bookPageIndicator || !bookNextBtn || !bookPrevBtn) return;

  if (currentBookLeafIndex === 0) {
    bookPageIndicator.textContent = "Cover";
    if (bookNextBtnText) bookNextBtnText.textContent = "Buka Buku";
    bookPrevBtn.disabled = true;
    bookNextBtn.classList.remove("highlight-next");
    if (bookHint)
      bookHint.textContent = "💡 Ketuk cover buku atau tombol untuk membuka";
  } else if (currentBookLeafIndex < totalBookLeaves) {
    bookPageIndicator.textContent = `Halaman ${currentBookLeafIndex} / ${memoriesData.length}`;
    if (bookNextBtnText) {
      if (currentBookLeafIndex === totalBookLeaves - 1) {
        bookNextBtnText.textContent = "Halaman Terakhir";
      } else {
        bookNextBtnText.textContent = "Halaman Berikutnya";
      }
    }
    bookPrevBtn.disabled = false;
    bookNextBtn.classList.remove("highlight-next");
    if (bookHint)
      bookHint.textContent =
        "💡 Buka setiap lembaran untuk mengenang semua momen";
  } else {
    // Semua lembaran ke-n telah selesai dibuka!
    bookPageIndicator.textContent = `Selesai (${memoriesData.length}/${memoriesData.length})`;
    if (bookNextBtnText) bookNextBtnText.textContent = "✨ Satukan di Hati";
    bookPrevBtn.disabled = false;
    bookNextBtn.classList.add("highlight-next");
    if (bookHint)
      bookHint.textContent =
        "🎉 Semua kenangan terbuka! Ketuk tombol untuk menyusun hati ✨";
  }
}

// Beralih ke lembaran target dengan animasi buka 3D
function flipBookTo(targetIndex) {
  targetIndex = Math.max(0, Math.min(totalBookLeaves, targetIndex));
  if (targetIndex === currentBookLeafIndex && targetIndex === totalBookLeaves) {
    // Jika tombol ditekan saat semua halaman sudah terbuka → Mulai formasi hati!
    startFloatingHeartFormation();
    return;
  }

  currentBookLeafIndex = targetIndex;
  playSynthesizedSound("flip");

  // Jika buku sudah dibuka (bukan halaman cover depan), geser jilid tengah ke posisi tengah layar
  if (bookElement) {
    if (currentBookLeafIndex > 0) {
      bookElement.classList.add("book-opened");
    } else {
      bookElement.classList.remove("book-opened");
    }
  }

  bookLeaves.forEach((leaf, idx) => {
    if (idx < currentBookLeafIndex) {
      leaf.classList.add("flipped");
      leaf.style.zIndex = idx + 1; // Tingkatkan z-index halaman yang sudah di kiri
    } else {
      leaf.classList.remove("flipped");
      leaf.style.zIndex = totalBookLeaves - idx;
    }
  });

  updateBookControls();

  // Otomatis transisi ke formasi hati setelah lembar terakhir selesai dibuka
  if (currentBookLeafIndex === totalBookLeaves) {
    setTimeout(() => {
      if (currentBookLeafIndex === totalBookLeaves && !heartFormed) {
        startFloatingHeartFormation();
      }
    }, 1400);
  }
}

// === ALGORITMA PERHITUNGAN FORMASI HATI EQUIDISTANT (BENTUK HATI SEMPURNA) ===
function computeHeartFormationLayout(count, screenW, screenH) {
  const isMobile = screenW < 520;
  const isTablet = screenW >= 520 && screenW < 900;

  // Ukuran kartu proporsional agar tidak saling menumpuk dan menutupi bentuk hati
  const cardW = isMobile ? 56 : isTablet ? 82 : 108;
  const cardH = isMobile ? 66 : isTablet ? 96 : 124;

  // Batas ruang layar yang aman
  const availW = Math.min(
    screenW * 0.92,
    isMobile ? 360 : isTablet ? 650 : 860,
  );
  const availH = Math.min(
    screenH * 0.74,
    isMobile ? 480 : isTablet ? 560 : 680,
  );

  const scaleX = (availW - cardW) / 32;
  const scaleY = (availH - cardH) / 30;
  const scale = Math.max(7, Math.min(scaleX, scaleY));

  // Kurva parametrik hati dengan jarak keliling sama rata (Arc-Length Parameterization)
  const N = 1000;
  const curve = [];
  for (let i = 0; i <= N; i++) {
    const t = (2 * Math.PI * i) / N;
    const sinT = Math.sin(t);
    const x = 16 * Math.pow(sinT, 3);
    const y = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );
    // Dinormalkan agar pusat vertikal kurva tepat di tengah layar (0, 0)
    curve.push({ x, y: y - 2.55 });
  }

  const lengths = [0];
  for (let i = 1; i < curve.length; i++) {
    const dx = curve[i].x - curve[i - 1].x;
    const dy = curve[i].y - curve[i - 1].y;
    lengths.push(lengths[i - 1] + Math.hypot(dx, dy));
  }
  const totalLen = lengths[lengths.length - 1];

  const points = [];
  for (let k = 0; k < count; k++) {
    const targetDist = (k / count) * totalLen;
    for (let j = 0; j < lengths.length - 1; j++) {
      if (lengths[j] <= targetDist && targetDist <= lengths[j + 1]) {
        const span = lengths[j + 1] - lengths[j];
        const frac = span > 0 ? (targetDist - lengths[j]) / span : 0;
        const hx = curve[j].x + frac * (curve[j + 1].x - curve[j].x);
        const hy = curve[j].y + frac * (curve[j + 1].y - curve[j].y);

        // Vektor kontur untuk rotasi sudut kartu yang selaras dengan bentuk lekukan hati
        const jNext = (j + 25) % N;
        const jPrev = (j - 25 + N) % N;
        const tdx = curve[jNext].x - curve[jPrev].x;
        const tdy = curve[jNext].y - curve[jPrev].y;

        let rot = (Math.atan2(tdy, tdx) * 180) / Math.PI;
        if (rot > 90) rot -= 180;
        if (rot < -90) rot += 180;
        rot = Math.max(-42, Math.min(42, Math.round(rot)));

        points.push({
          targetX: Math.round(hx * scale),
          targetY: Math.round(hy * scale),
          rot: rot,
        });
        break;
      }
    }
  }

  return { points, scale, cardW, cardH };
}

// === FORMASI FOTO MELAYANG MENYUSUN BENTUK HATI (FULLSCREEN PERSIS REFERENSI) ===
function startFloatingHeartFormation() {
  if (heartFormed) return;
  heartFormed = true;

  // Ubah tampilan galeri menjadi mode fullscreen formasi hati
  if (galleryModal) galleryModal.classList.add("heart-view-active");
  if (galleryHeader) galleryHeader.classList.add("hidden");
  if (bookStage) bookStage.classList.add("stage-hidden");
  if (heartStage) heartStage.classList.remove("hidden");
  if (heartPhotosContainer) heartPhotosContainer.innerHTML = "";
  if (heartCenterCard) heartCenterCard.classList.remove("show");
  if (heartBottomDock) heartBottomDock.classList.remove("show");

  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  // Gunakan 16 kartu agar tiap foto tersusun anggun dengan bentuk lekukan hati yang tajam & jelas
  const totalCount = 16;
  const { points } = computeHeartFormationLayout(totalCount, screenW, screenH);
  const cards = [];

  // SVG Stiker Tangan Memegang Hati (Persis seperti referensi madeforanita.vercel.app)
  const handsStickerSvg = `
    <svg viewBox="0 0 120 60" class="sticker-hands-svg" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 42 C60 42 46 28 46 19 C46 12 52 8 58 12 C59.5 13.5 60 15 60 15 C60 15 60.5 13.5 62 12 C68 8 74 12 74 19 C74 28 60 42 60 42 Z" fill="#ff2a6d"/>
      <path d="M22 55 C28 50 36 45 48 47 C51 47.5 52 44 48 42 C44 40 40 41 36 43 C35 40 39 37 43 36 C47 35 48 33 45 31 C40 30 35 34 31 38 C23 42 19 46 16 55 Z" fill="#ffffff" stroke="#ff758c" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M98 55 C92 50 84 45 72 47 C69 47.5 68 44 72 42 C76 40 80 41 84 43 C85 40 81 37 77 36 C73 35 72 33 75 31 C80 30 85 34 89 38 C97 42 101 46 104 55 Z" fill="#ffffff" stroke="#ff758c" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>
  `;

  // Stiker tangan di kartu sayap luar (indeks 3 dan 13)
  const stickerIndices = new Set([3, 13]);

  for (let i = 0; i < totalCount; i++) {
    const { targetX, targetY, rot } = points[i];

    // Posisi awal melayang acak menyebar di layar (floating freely across viewport)
    const floatAngle =
      (i / totalCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const floatDist = Math.min(screenW, screenH) * 0.32 + Math.random() * 80;
    const floatX = Math.round(
      Math.cos(floatAngle) * floatDist + (Math.random() - 0.5) * 60,
    );
    const floatY = Math.round(
      Math.sin(floatAngle) * floatDist * 0.85 + (Math.random() - 0.5) * 50,
    );
    const floatRot = Math.round((Math.random() - 0.5) * 35);

    const memoryItem = memoriesData[i % memoriesData.length];
    const isSticker = stickerIndices.has(i);

    const card = document.createElement("div");
    card.className = "floating-photo-card" + (isSticker ? " is-sticker" : "");
    card.setAttribute("title", memoryItem.caption);

    if (isSticker) {
      card.innerHTML = `
        <div class="sticker-photo-box">
          <img src="${memoryItem.src}" alt="${memoryItem.caption}" loading="eager">
        </div>
        <div class="sticker-hands-box">
          ${handsStickerSvg}
        </div>
      `;
    } else {
      card.innerHTML = `
        <img class="floating-card-img" src="${memoryItem.src}" alt="${memoryItem.caption}" loading="eager">
      `;
    }

    // Set posisi awal: melayang di layar
    card.style.transform = `translate(calc(-50% + ${floatX}px), calc(-50% + ${floatY}px)) rotate(${floatRot}deg) scale(0.9)`;
    card.style.opacity = "0";

    heartPhotosContainer.appendChild(card);
    cards.push({ card, targetX, targetY, rot, i });
  }

  // Tahap 1: Foto muncul melayang di layar secara lembut
  cards.forEach(({ card }, idx) => {
    setTimeout(() => {
      card.style.opacity = "1";
    }, idx * 30);
  });

  // Tahap 2: Setelah melayang sejenak (1100ms), foto SATU PERSATU berbaris menyusun bentuk hati
  const DOCK_START_DELAY = 1100;
  const DOCK_INTERVAL = 170; // 170ms jeda beruntun antar foto

  cards.forEach(({ card, targetX, targetY, rot, i }) => {
    setTimeout(
      () => {
        card.classList.add("docked");
        card.style.transform = `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) rotate(${rot}deg) scale(1)`;
        playSynthesizedSound("chime");
      },
      DOCK_START_DELAY + i * DOCK_INTERVAL,
    );
  });

  // Tahap 3: Setelah semua 20 foto selesai berbaris, munculkan kartu foto di tengah & tombol aksi
  const totalFormTime = DOCK_START_DELAY + totalCount * DOCK_INTERVAL + 300;
  setTimeout(() => {
    if (heartCenterCard) {
      heartCenterCard.classList.add("show");
    }
    if (heartBottomDock) {
      heartBottomDock.classList.add("show");
    }
    playSynthesizedSound("chime");
  }, totalFormTime);
}

// Buka buku kembali jika ingin membaca ulang
function resetBookToStart() {
  heartFormed = false;
  if (galleryModal) galleryModal.classList.remove("heart-view-active");
  if (heartStage) heartStage.classList.add("hidden");
  if (galleryHeader) galleryHeader.classList.remove("hidden");
  if (bookStage) bookStage.classList.remove("stage-hidden");
  if (heartPhotosContainer) heartPhotosContainer.innerHTML = "";
  if (heartCenterCard) heartCenterCard.classList.remove("show");
  if (heartBottomDock) heartBottomDock.classList.remove("show");
  if (galleryTitle) galleryTitle.textContent = "Buku Kenangan Indah";
  if (gallerySubtitle) {
    gallerySubtitle.textContent =
      "Buka setiap lembaran untuk mengenang setiap tawa dan cerita kita ✨";
  }
  flipBookTo(0);
}

// Fungsi membuka modal galeri
function showMemoryGallery() {
  if (!galleryModal) return;

  if (typeof hideLyricsWidget === "function") {
    hideLyricsWidget();
  }

  buildBookLeaves();
  resetBookToStart();

  galleryModal.classList.remove("hidden");
  galleryModal.setAttribute("aria-hidden", "false");

  if (reopenGalleryBtn) reopenGalleryBtn.classList.add("hidden");
  if (reopenLetterBtn) reopenLetterBtn.classList.add("hidden");
}

// Fungsi menutup modal galeri
function closeMemoryGallery() {
  if (galleryModal) {
    galleryModal.classList.add("hidden");
    galleryModal.setAttribute("aria-hidden", "true");
  }
  if (letterHasBeenOpened && reopenGalleryBtn) {
    reopenGalleryBtn.classList.remove("hidden");
  }
  if (
    letterHasBeenOpened &&
    (!letterModal || letterModal.classList.contains("hidden"))
  ) {
    if (typeof showLyricsWidget === "function") {
      showLyricsWidget();
    }
  }
}

// Event Listeners Navigasi Buku
if (bookNextBtn) {
  bookNextBtn.addEventListener("click", () => {
    if (currentBookLeafIndex < totalBookLeaves) {
      flipBookTo(currentBookLeafIndex + 1);
    } else {
      startFloatingHeartFormation();
    }
  });
}

if (bookPrevBtn) {
  bookPrevBtn.addEventListener("click", () => {
    if (currentBookLeafIndex > 0) {
      flipBookTo(currentBookLeafIndex - 1);
    }
  });
}

if (galleryBackdrop) {
  galleryBackdrop.addEventListener("click", closeMemoryGallery);
}

if (reopenBookBtn) {
  reopenBookBtn.addEventListener("click", resetBookToStart);
}

// Tombol Lanjut ke Surat dari dalam Hati
if (goToLetterBtn) {
  goToLetterBtn.addEventListener("click", () => {
    closeMemoryGallery();
    showBirthdayLetter();
  });
}

// Tombol Floating Buka Galeri
if (reopenGalleryBtn) {
  reopenGalleryBtn.addEventListener("click", () => {
    closeBirthdayLetter();
    showMemoryGallery();
  });
}

// === SISTEM SURAT ULANG TAHUN ===
const letterModal = document.getElementById("letterModal");
const letterEnvelope = document.getElementById("letterEnvelope");
const letterCard = document.getElementById("letterCard");
const letterBackdrop = document.getElementById("letterBackdrop");
const closeLetterBtn = document.getElementById("closeLetterBtn");
const reopenLetterBtn = document.getElementById("reopenLetterBtn");

// Fungsi menampilkan surat (dimulai dari amplop manis yang bisa diketuk)
function showBirthdayLetter() {
  if (!letterModal) return;

  if (typeof hideLyricsWidget === "function") {
    hideLyricsWidget();
  }

  // Sesuaikan nama penerima surat
  const nameEl = document.querySelector(".letter-name");
  if (nameEl) {
    nameEl.textContent = "Tegar Utomo";
  }

  // Tampilkan amplop terlebih dahulu
  if (letterEnvelope) letterEnvelope.classList.remove("hidden");
  if (letterCard) letterCard.classList.add("hidden");
  if (reopenLetterBtn) reopenLetterBtn.classList.add("hidden");

  letterModal.classList.remove("hidden");
  letterModal.setAttribute("aria-hidden", "false");
}

let letterHasBeenOpened = false;

// Fungsi membuka isi surat dari amplop
function openBirthdayLetter() {
  letterHasBeenOpened = true;
  lyricsUnlocked = true;

  if (letterEnvelope) letterEnvelope.classList.add("hidden");
  if (letterCard) {
    letterCard.classList.remove("hidden");
    letterCard.scrollTop = 0; // Scroll ke bagian atas
  }
}

// Fungsi menutup surat
function closeBirthdayLetter() {
  if (letterModal) {
    letterModal.classList.add("hidden");
    letterModal.setAttribute("aria-hidden", "true");
  }

  // Tombol floating & widget lirik HANYA aktif jika animasi surat sudah dibuka oleh pengguna
  if (letterHasBeenOpened) {
    if (reopenLetterBtn) {
      reopenLetterBtn.classList.remove("hidden");
    }
    if (reopenGalleryBtn) {
      reopenGalleryBtn.classList.remove("hidden");
    }
    if (reopenLyricsBtn) {
      reopenLyricsBtn.classList.remove("hidden");
    }

    // Tampilkan widget lirik lagu setelah surat selesai dibuka/dibaca
    if (typeof showLyricsWidget === "function") {
      showLyricsWidget();
    }
  }
}

// Event Listeners untuk surat
if (letterEnvelope) {
  letterEnvelope.addEventListener("click", openBirthdayLetter);
  letterEnvelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openBirthdayLetter();
    }
  });
}

if (closeLetterBtn) {
  closeLetterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeBirthdayLetter();
  });
}

if (letterBackdrop) {
  letterBackdrop.addEventListener("click", closeBirthdayLetter);
}

if (reopenLetterBtn) {
  reopenLetterBtn.addEventListener("click", () => {
    closeMemoryGallery();
    if (typeof hideLyricsWidget === "function") {
      hideLyricsWidget();
    }
    if (letterEnvelope) letterEnvelope.classList.add("hidden");
    if (letterCard) {
      letterCard.classList.remove("hidden");
      letterCard.scrollTop = 0;
    }
    if (reopenLetterBtn) reopenLetterBtn.classList.add("hidden");
    if (letterModal) {
      letterModal.classList.remove("hidden");
      letterModal.setAttribute("aria-hidden", "false");
    }
  });
}

// ==========================================================================
// SISTEM LIRIK LAGU SINKRON (PAUL PARTOHAP - THANK YOU 4 LOVIN' ME - VERSI PEREMPUAN)
// ==========================================================================

const lyricsData = [
  {
    time: 0.8,
    text: "Wish you could always tell me",
    trans: "Kuharap kamu selalu memberitahuku",
  },
  {
    time: 4.8,
    text: "How to make you happy",
    trans: "Bagaimana cara membuatmu bahagia",
  },
  { time: 9.0, text: "I just got no clue", trans: "Aku sungguh tak tahu" },
  {
    time: 12.5,
    text: "Don't want you feel blue",
    trans: "Tak ingin membuatmu bersedih",
  },
  { time: 15.5, text: "It's true...", trans: "Sungguh..." },
  {
    time: 18.0,
    text: "✨ (Melodi Lembut) ✨",
    trans: "Hanya ingin melihatmu tersenyum...",
  },
  {
    time: 24.5,
    text: "I'm tryin' to be a better woman",
    trans: "Aku berusaha menjadi wanita yang lebih baik untukmu",
  },
  {
    time: 29.5,
    text: "Doin' the best that I think I can",
    trans: "Melakukan yang terbaik sebisa yang kumampu",
  },
  {
    time: 34.0,
    text: "Don't know where I'm goin'",
    trans: "Tak tahu ke mana langkahku berujung",
  },
  {
    time: 37.0,
    text: "But in case you're wonderin'",
    trans: "Tapi jika kamu bertanya-tanya",
  },
  {
    time: 40.0,
    text: "I'm on my way",
    trans: "Aku sedang dalam perjalanan menuju ke sana",
  },
  {
    time: 44.5,
    text: "I know I'm not perfect",
    trans: "Aku tahu aku tidak sempurna",
  },
  {
    time: 48.0,
    text: "But you still chose me",
    trans: "Tapi kamu tetap memilih diriku",
  },
  {
    time: 51.0,
    text: "Boy, this is not an act",
    trans: "Kasih, ini sungguh bukan sandiwara",
  },
  {
    time: 54.5,
    text: "Oh, I want to be the last for you, for you",
    trans: "Oh, aku ingin menjadi pelabuhan terakhir untukmu",
  },
  {
    time: 60.5,
    text: "And often I keep thinking",
    trans: "Dan sering kali aku terus berpikir",
  },
  {
    time: 64.0,
    text: "Am I worth waiting for?",
    trans: "Apakah aku pantas untuk kamu tunggu?",
  },
  {
    time: 67.2,
    text: "But you keep motivating me",
    trans: "Tetapi kamu selalu menyemangatiku",
  },
  {
    time: 71.5,
    text: "To be the best of me, of me, of me",
    trans: "Untuk menjadi versi terbaik dari diriku",
  },
  {
    time: 82.0,
    text: "✨ (Melodi Solo Gitar yang Manis) ✨",
    trans: "Mengenang setiap senyum dan kehangatanmu...",
  },
  {
    time: 110.0,
    text: "Tried to be a better woman",
    trans: "Berusaha menjadi wanita yang lebih baik",
  },
  {
    time: 115.0,
    text: "Doin' the best of the things I can",
    trans: "Melakukan yang terbaik dari segala yang bisa kulakukan",
  },
  {
    time: 119.5,
    text: "Don't know where I'm going",
    trans: "Tak tahu ke mana arah tujuanku",
  },
  {
    time: 122.5,
    text: "But in case you're wonderin'",
    trans: "Namun jika kamu penasaran",
  },
  {
    time: 125.5,
    text: "I'm on my way",
    trans: "Aku sedang melangkah menuju hatimu",
  },
  {
    time: 130.0,
    text: "I know I'm not perfect",
    trans: "Aku tahu aku tidak sempurna",
  },
  {
    time: 133.5,
    text: "But you still chose me",
    trans: "Tapi kamu tetap setia memilihku",
  },
  {
    time: 136.5,
    text: "Boy, this is not an act",
    trans: "Kasih, ini sungguh tulus dari hatiku",
  },
  {
    time: 140.0,
    text: "Oh, I want to be the last for you, for you",
    trans: "Oh, aku ingin menjadi yang terakhir untukmu",
  },
  {
    time: 146.0,
    text: "And often I keep thinking",
    trans: "Dan sering kali aku merenung",
  },
  {
    time: 149.5,
    text: "Am I worth waiting for?",
    trans: "Apakah aku layak untuk kamu nantikan?",
  },
  {
    time: 152.5,
    text: "But you keep motivating me",
    trans: "Namun kamu selalu memotivasiku",
  },
  {
    time: 156.8,
    text: "To be the best of me, of me, of me",
    trans: "Untuk terus menjadi yang terbaik untukmu",
  },
  {
    time: 168.0,
    text: "✨ (Solo Harmoni Akustik yang Hangat) ✨",
    trans: "Bersyukur atas setiap detik yang kita lalui bersama...",
  },
  {
    time: 193.0,
    text: "I know it ain't easy",
    trans: "Aku tahu ini tidak mudah",
  },
  {
    time: 199.0,
    text: "I know it ain't easy",
    trans: "Aku tahu semua ini tidak mudah bagimu",
  },
  {
    time: 206.5,
    text: "But thank you...",
    trans: "Tapi terima kasih banyak...",
  },
  {
    time: 210.0,
    text: "Thank you for lovin' me ❤️",
    trans: "Terima kasih telah mencintaiku setulus hatimu",
  },
  {
    time: 218.0,
    text: "✨ (Melodi Penutup yang Indah) ✨",
    trans: "Selamat ulang tahun, sayangku Tegar Utomo 🎂",
  },
];

const lyricsWidget = document.getElementById("lyricsWidget");
const lyricsList = document.getElementById("lyricsList");
const lyricsScrollArea = document.getElementById("lyricsScrollArea");
const closeLyricsBtn = document.getElementById("closeLyricsBtn");
const reopenLyricsBtn = document.getElementById("reopenLyricsBtn");
const finishLetterBtn = document.getElementById("finishLetterBtn");
const lyricsProgressBar = document.getElementById("lyricsProgressBar");
const lyricsProgressFill = document.getElementById("lyricsProgressFill");
const lyricsCurrentTimeEl = document.getElementById("lyricsCurrentTime");
const lyricsDurationEl = document.getElementById("lyricsDuration");

let lyricsInitialized = false;
let currentLyricIndex = -1;
let lyricsUnlocked = false;

// Format detik ke mm:ss
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Inisialisasi DOM list lirik
function initLyricsDOM() {
  if (!lyricsList || lyricsInitialized) return;
  lyricsList.innerHTML = "";

  lyricsData.forEach((item, index) => {
    const el = document.createElement("div");
    el.className = "lyric-item";
    el.dataset.index = index;
    el.dataset.time = item.time;

    el.innerHTML = `
      <div class="lyric-text">${item.text}</div>
      <div class="lyric-trans">${item.trans}</div>
    `;

    // Klik pada baris lirik untuk lompat langsung ke audio bagian tersebut
    el.addEventListener("click", () => {
      if (bgMusicAudio) {
        bgMusicAudio.currentTime = Math.max(0, item.time + 0.1);
        if (bgMusicAudio.paused) bgMusicAudio.play().catch(() => {});
        updateLyricsByTime(bgMusicAudio.currentTime, true);
      }
    });

    lyricsList.appendChild(el);
  });

  lyricsInitialized = true;
}

// Update posisi lirik aktif berdasarkan currentTime audio
function updateLyricsByTime(currentTime, forceScroll = false) {
  if (!lyricsList) return;

  // Cari baris lirik yang cocok
  let activeIdx = -1;
  for (let i = lyricsData.length - 1; i >= 0; i--) {
    if (currentTime >= lyricsData[i].time - 0.25) {
      activeIdx = i;
      break;
    }
  }

  // Update progress bar & time labels
  if (bgMusicAudio && bgMusicAudio.duration) {
    const dur = bgMusicAudio.duration;
    const pct = Math.min(100, Math.max(0, (currentTime / dur) * 100));
    if (lyricsProgressFill) lyricsProgressFill.style.width = `${pct}%`;
    if (lyricsCurrentTimeEl)
      lyricsCurrentTimeEl.textContent = formatTime(currentTime);
    if (lyricsDurationEl) lyricsDurationEl.textContent = formatTime(dur);
  }

  if (activeIdx !== currentLyricIndex || forceScroll) {
    currentLyricIndex = activeIdx;
    const items = lyricsList.querySelectorAll(".lyric-item");
    items.forEach((item, idx) => {
      if (idx === activeIdx) {
        item.classList.add("active");
        if (lyricsScrollArea) {
          // Scroll halus agar baris aktif tepat berada di tengah area lirik
          const itemTop = item.offsetTop;
          const itemHeight = item.offsetHeight;
          const containerHeight = lyricsScrollArea.clientHeight;
          lyricsScrollArea.scrollTo({
            top: itemTop - containerHeight / 2 + itemHeight / 2,
            behavior: "smooth",
          });
        }
      } else {
        item.classList.remove("active");
      }
    });
  }
}

// Buka widget lirik
function showLyricsWidget() {
  // Hanya boleh dibuka jika surat memang sudah dibuka oleh pengguna
  if (!lyricsWidget || !letterHasBeenOpened) return;
  initLyricsDOM();
  lyricsUnlocked = true;

  lyricsWidget.classList.remove("hidden");
  lyricsWidget.setAttribute("aria-hidden", "false");

  if (reopenLyricsBtn) {
    reopenLyricsBtn.classList.remove("hidden");
  }

  if (bgMusicAudio) {
    updateLyricsByTime(bgMusicAudio.currentTime, true);
  }
}

// Sembunyikan widget lirik
function hideLyricsWidget() {
  if (!lyricsWidget) return;
  lyricsWidget.classList.add("hidden");
  lyricsWidget.setAttribute("aria-hidden", "true");

  if (letterHasBeenOpened && reopenLyricsBtn) {
    reopenLyricsBtn.classList.remove("hidden");
  } else if (!letterHasBeenOpened && reopenLyricsBtn) {
    reopenLyricsBtn.classList.add("hidden");
  }
}

// Toggle widget lirik
function toggleLyricsWidget() {
  if (!lyricsWidget) return;
  if (lyricsWidget.classList.contains("hidden")) {
    showLyricsWidget();
  } else {
    hideLyricsWidget();
  }
}

// Pasang event listener progress bar seek
if (lyricsProgressBar) {
  lyricsProgressBar.addEventListener("click", (e) => {
    if (!bgMusicAudio || !bgMusicAudio.duration) return;
    const rect = lyricsProgressBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    bgMusicAudio.currentTime = pos * bgMusicAudio.duration;
    updateLyricsByTime(bgMusicAudio.currentTime, true);
  });
}

// Event listener timeupdate audio
if (bgMusicAudio) {
  bgMusicAudio.addEventListener("timeupdate", () => {
    if (lyricsWidget && !lyricsWidget.classList.contains("hidden")) {
      updateLyricsByTime(bgMusicAudio.currentTime);
    }
  });

  bgMusicAudio.addEventListener("loadedmetadata", () => {
    if (lyricsDurationEl && bgMusicAudio.duration) {
      lyricsDurationEl.textContent = formatTime(bgMusicAudio.duration);
    }
  });
}

// Event listener tombol tutup & toggle lirik
if (closeLyricsBtn) {
  closeLyricsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    hideLyricsWidget();
  });
}

if (reopenLyricsBtn) {
  reopenLyricsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleLyricsWidget();
  });
}

if (finishLetterBtn) {
  finishLetterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeBirthdayLetter();
  });
}

// Expose ke window agar bisa diakses jika diperlukan
window.showMemoryGallery = showMemoryGallery;
window.closeMemoryGallery = closeMemoryGallery;
window.startFloatingHeartFormation = startFloatingHeartFormation;
window.showBirthdayLetter = showBirthdayLetter;
window.openBirthdayLetter = openBirthdayLetter;
window.closeBirthdayLetter = closeBirthdayLetter;
window.showLyricsWidget = showLyricsWidget;
window.hideLyricsWidget = hideLyricsWidget;
window.toggleLyricsWidget = toggleLyricsWidget;
