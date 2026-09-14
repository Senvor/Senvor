const fs = require('fs');

const skills = [
  { name: 'HTML',           level: 'solid',        fill: 12 },
  { name: 'CSS',            level: 'solid',        fill: 12 },
  { name: 'GDScript',       level: 'comfortable',  fill: 9  },
  { name: 'JavaScript',     level: 'growing',      fill: 8  },
  { name: 'Pixel Art',      level: 'growing',      fill: 8  },
  { name: 'Graphic Design', level: 'solid',        fill: 12 },
  { name: 'CAD',            level: 'learning',     fill: 5  },
  { name: 'Java',           level: 'early',        fill: 4  },
];

const BG       = '#0F130C';
const SURFACE  = '#1A2015';
const INK      = '#EFE8D8';
const INK_DIM  = '#A8A697';
const ACCENT   = '#E0632B';
const LINE     = '#3E4A34';
const BAR_FULL = '#E0632B';
const BAR_EMPTY= '#2A3525';

const W         = 520;
const ROW_H     = 36;
const PADDING   = 24;
const TOP       = 48;
const BAR_X     = 240;
const BAR_W     = 160;
const BAR_H     = 6;
const BAR_R     = 3;
const TOTAL_H   = TOP + skills.length * ROW_H + PADDING + 32;
const MAX_FILL  = 12;
const DELAY_PER = 180;  // ms between each skill appearing
const CHAR_DELAY= 40;   // ms between each char in typewriter

function barSegments(fill) {
  const segs = [];
  const segW = Math.floor(BAR_W / MAX_FILL);
  for (let i = 0; i < MAX_FILL; i++) {
    const x = BAR_X + i * segW + (i > 0 ? 2 : 0);
    const color = i < fill ? BAR_FULL : BAR_EMPTY;
    segs.push(`<rect x="${x}" y="0" width="${segW - 2}" height="${BAR_H}" rx="${BAR_R}" fill="${color}"/>`);
  }
  return segs.join('');
}

function skillRow(skill, index) {
  const y        = TOP + index * ROW_H;
  const labelY   = y + 14;
  const levelY   = y + 14;
  const barY     = y + 8;
  const delay    = index * DELAY_PER;
  const nameLen  = skill.name.length;
  const typeDur  = nameLen * CHAR_DELAY;

  // each row fades in then the name types out
  return `
  <g opacity="0" transform="translate(0,6)">
    <animateTransform attributeName="transform" type="translate"
      values="0,6;0,0" dur="300ms" begin="${delay}ms" fill="freeze"/>
    <animate attributeName="opacity"
      values="0;1" dur="250ms" begin="${delay}ms" fill="freeze"/>

    <!-- skill name typewriter -->
    <text x="${PADDING}" y="${labelY}" 
      font-family="'IBM Plex Mono', monospace" font-size="13" fill="${INK}">
      ${[...skill.name].map((char, ci) => `<tspan>
        <animate attributeName="display" values="none;inline"
          begin="${delay + ci * CHAR_DELAY}ms" dur="indefinite" fill="freeze"/>
        ${char === ' ' ? '&#160;' : char}
      </tspan>`).join('')}
    </text>

    <!-- level label -->
    <text x="${BAR_X + BAR_W + 14}" y="${levelY}"
      font-family="'IBM Plex Mono', monospace" font-size="11" fill="${INK_DIM}"
      opacity="0">
      <animate attributeName="opacity" values="0;1"
        begin="${delay + typeDur + 80}ms" dur="200ms" fill="freeze"/>
      ${skill.level}
    </text>

    <!-- bar bg -->
    <g transform="translate(0,${barY})">
      <rect x="${BAR_X}" y="0" width="${BAR_W}" height="${BAR_H}"
        rx="${BAR_R}" fill="${BAR_EMPTY}" opacity="0">
        <animate attributeName="opacity" values="0;1"
          begin="${delay + typeDur}ms" dur="150ms" fill="freeze"/>
      </rect>

      <!-- bar fill animates width -->
      <rect x="${BAR_X}" y="0"
        width="0" height="${BAR_H}" rx="${BAR_R}" fill="${BAR_FULL}" opacity="0">
        <animate attributeName="opacity" values="0;1"
          begin="${delay + typeDur}ms" dur="50ms" fill="freeze"/>
        <animate attributeName="width"
          values="0;${Math.round((skill.fill / MAX_FILL) * BAR_W)}"
          dur="400ms" begin="${delay + typeDur + 80}ms"
          calcMode="spline" keySplines="0.4 0 0.2 1" fill="freeze"/>
      </rect>
    </g>

    <!-- row separator -->
    <line x1="${PADDING}" y1="${y + ROW_H - 2}" x2="${W - PADDING}" y2="${y + ROW_H - 2}"
      stroke="${LINE}" stroke-width="0.5" opacity="0.5"/>
  </g>`;
}

const totalDur = skills.length * DELAY_PER + 600;

const svg = `<svg xmlns="http://www.w3.org/2000/svg"
  width="${W}" height="${TOTAL_H}" viewBox="0 0 ${W} ${TOTAL_H}">

  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&amp;display=swap');
    </style>
  </defs>

  <!-- background -->
  <rect width="${W}" height="${TOTAL_H}" rx="6" fill="${BG}"/>
  <rect width="${W}" height="${TOTAL_H}" rx="6"
    fill="none" stroke="${LINE}" stroke-width="1"/>

  <!-- header -->
  <text x="${PADDING}" y="28"
    font-family="'IBM Plex Mono', monospace" font-size="12" fill="${ACCENT}"
    letter-spacing="0.1em">
    skills
  </text>
  <line x1="${PADDING}" y1="36" x2="${W - PADDING}" y2="36"
    stroke="${ACCENT}" stroke-width="1" opacity="0.4"/>

  <!-- skill rows -->
  ${skills.map((s, i) => skillRow(s, i)).join('')}

  <!-- footer cursor blink -->
  <text x="${PADDING}" y="${TOTAL_H - 12}"
    font-family="'IBM Plex Mono', monospace" font-size="12" fill="${ACCENT}"
    opacity="0">
    <animate attributeName="opacity" values="0;0;1"
      begin="${totalDur}ms" dur="indefinite" fill="freeze"/>
    <animate attributeName="opacity" values="1;0;1"
      dur="900ms" begin="${totalDur + 200}ms" repeatCount="indefinite"/>
    _
  </text>
</svg>`;

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/skills.svg', svg);
console.log('skills.svg generated');
