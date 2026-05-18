(() => {
  const screen   = document.getElementById('screen');
  const history  = document.getElementById('history');
  const boot     = document.getElementById('boot');
  const welcome  = document.getElementById('welcome');
  const form     = document.getElementById('prompt-form');
  const input    = document.getElementById('prompt-input');
  const caret    = document.querySelector('.caret');
  const ps1El    = document.querySelector('.prompt-line .ps1');
  const clockEl  = document.getElementById('clock');

  // ───────────── clock (SGT) ─────────────
  const tickClock = () => {
    const d = new Date();
    const sgt = new Date(d.getTime() + (d.getTimezoneOffset() + 480) * 60000);
    const pad = n => String(n).padStart(2, '0');
    clockEl.textContent = `${pad(sgt.getHours())}:${pad(sgt.getMinutes())}:${pad(sgt.getSeconds())}`;
  };
  tickClock(); setInterval(tickClock, 1000);

  // ───────────── boot sequence ─────────────
  const bootLines = [
    '[ <span class="ok">OK</span> ] booting maxrichie.os v0.1.0 …',
    '[ <span class="ok">OK</span> ] loading neural runtime … <span class="g">ok</span>',
    '[ <span class="ok">OK</span> ] mounting /models  … <span class="g">ok</span>',
    '[ <span class="ok">OK</span> ] connecting to singapore-1.maxrichie.ai … <span class="g">200</span>',
    '[ <span class="warn">..</span> ] hydrating context window …',
    '[ <span class="ok">OK</span> ] ready.',
  ];
  let bootIdx = 0;
  const runBoot = () => {
    if (bootIdx >= bootLines.length) {
      boot.innerHTML = '';
      welcome.hidden = false;
      input.focus();
      return;
    }
    boot.innerHTML = bootLines.slice(0, bootIdx + 1).join('\n');
    bootIdx++;
    setTimeout(runBoot, 180 + Math.random() * 160);
  };
  setTimeout(runBoot, 200);

  // ───────────── command registry ─────────────
  const escape = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const commands = {
    help: {
      desc: 'show available commands',
      run: () => {
        const rows = Object.entries(commands)
          .filter(([k]) => !commands[k].hidden)
          .map(([k, v]) => `<tr><td class="g">${k}</td><td>${v.desc}</td></tr>`)
          .join('');
        return `<table class="kv">${rows}</table>
<div class="dim">tip: ↑/↓ history · Tab autocomplete · Ctrl+L clear</div>`;
      }
    },

    about: {
      desc: 'who is behind this',
      run: () => `
<div class="box">
<h3>// ABOUT</h3>
<p>Hi, I'm <span class="g">Max</span> — a serial entrepreneur based in <span class="g">Singapore</span>, now focused on building in <span class="amber">AI</span>.</p>
<p>Maxrichie is the home for what I'm working on next. More to share soon.</p>
</div>`
    },

    mission: {
      desc: 'what i care about',
      run: () => `
<div class="box">
<h3>// MISSION</h3>
<p>Build AI products that are <span class="g">useful</span> — small team, fast iteration, real users.</p>
</div>`
    },

    projects: {
      desc: 'what we are building',
      run: () => `
<div class="box">
<h3>// PROJECTS</h3>
<p><span class="amber">[coming soon]</span> — project details will be added here as they go live.</p>
<p class="dim">Want a preview? Drop a line: <a href="mailto:max@maxrichie.ai">max@maxrichie.ai</a></p>
</div>`
    },

    contact: {
      desc: 'get in touch',
      run: () => `
<div class="box">
<h3>// CONTACT</h3>
<table class="kv">
  <tr><td>email</td><td><a href="mailto:max@maxrichie.ai">max@maxrichie.ai</a></td></tr>
  <tr><td>location</td><td>Singapore 🇸🇬</td></tr>
</table>
</div>`
    },

    whoami: {
      desc: 'about you',
      run: () => `guest@maxrichie — a curious human, probably building something cool.`
    },

    date: {
      desc: 'current date/time (SGT)',
      run: () => {
        const d = new Date();
        const sgt = new Date(d.getTime() + (d.getTimezoneOffset() + 480) * 60000);
        return sgt.toUTCString().replace('GMT', 'SGT');
      }
    },

    ls: {
      desc: 'list sections',
      run: () => `<span class="g">about</span>  <span class="g">mission</span>  <span class="g">projects</span>  <span class="g">contact</span>`
    },

    cat: {
      desc: 'cat <section>',
      run: (args) => {
        const name = (args[0] || '').toLowerCase();
        if (!name) return 'usage: cat &lt;section&gt;';
        if (commands[name]) return commands[name].run([]);
        return `cat: ${escape(name)}: No such section`;
      }
    },

    echo: {
      desc: 'echo <text>',
      run: (args) => escape(args.join(' '))
    },

    matrix: {
      desc: 'toggle matrix rain',
      run: () => {
        toggleMatrix();
        return matrixOn ? 'matrix: <span class="g">enabled</span>' : 'matrix: <span class="dim">disabled</span>';
      }
    },

    theme: {
      desc: 'theme <green|amber|blue>',
      run: (args) => {
        const t = (args[0] || '').toLowerCase();
        const map = { green: '#00ff9c', amber: '#ffb454', blue: '#5ce1ff' };
        if (!map[t]) return 'usage: theme &lt;green|amber|blue&gt;';
        document.documentElement.style.setProperty('--green', map[t]);
        document.documentElement.style.setProperty('--green-soft', map[t]);
        return `theme set: <span class="g">${t}</span>`;
      }
    },

    sudo: {
      desc: 'try it',
      run: () => `<span class="red">Permission denied</span>: this incident will be reported. 😎`
    },

    banner: {
      desc: 'print the logo',
      run: () => `<pre class="ascii">
███╗   ███╗ █████╗ ██╗  ██╗██████╗ ██╗ ██████╗██╗  ██╗██╗███████╗
████╗ ████║██╔══██╗╚██╗██╔╝██╔══██╗██║██╔════╝██║  ██║██║██╔════╝
██╔████╔██║███████║ ╚███╔╝ ██████╔╝██║██║     ███████║██║█████╗
██║╚██╔╝██║██╔══██║ ██╔██╗ ██╔══██╗██║██║     ██╔══██║██║██╔══╝
██║ ╚═╝ ██║██║  ██║██╔╝ ██╗██║  ██║██║╚██████╗██║  ██║██║███████╗
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝╚══════╝
</pre>`
    },

    ai: {
      desc: 'say hi to the model',
      run: (args) => {
        const q = args.join(' ').trim();
        if (!q) return 'usage: ai &lt;your message&gt;';
        const responses = [
          `processing "${escape(q)}" … <span class="g">done</span>. (this is a static demo — ping Max at <a href="mailto:max@maxrichie.ai">max@maxrichie.ai</a>)`,
          `Hmm. "${escape(q)}" is an interesting one. The real model lives behind <a href="mailto:max@maxrichie.ai">max@</a>.`,
          `42. Also: you should email Max — <a href="mailto:max@maxrichie.ai">max@maxrichie.ai</a>.`,
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    },

    clear: {
      desc: 'clear the screen',
      run: () => { history.innerHTML = ''; return ''; }
    },

    // hidden aliases
    cls:   { hidden: true, run: () => commands.clear.run() },
    h:     { hidden: true, run: () => commands.help.run() },
    '?':   { hidden: true, run: () => commands.help.run() },
    exit:  { hidden: true, run: () => 'nope. you live here now.' },
  };

  // ───────────── history & input ─────────────
  const cmdHistory = [];
  let histIdx = -1;

  const printEntry = (cmdText, outputHTML) => {
    const ps1 = `<span class="ps1"><span class="user">root</span><span class="at">@</span><span class="host">maxrichie</span>:<span class="path">~</span>$</span>`;
    const wrap = document.createElement('div');
    wrap.className = 'entry';
    wrap.innerHTML = `<div class="cmdline">${ps1} ${escape(cmdText)}</div>` +
                     (outputHTML ? `<div class="output">${outputHTML}</div>` : '');
    history.appendChild(wrap);
    screen.scrollTop = screen.scrollHeight;
    window.scrollTo(0, document.body.scrollHeight);
  };

  const execute = (raw) => {
    const line = raw.trim();
    if (!line) { printEntry('', ''); return; }
    cmdHistory.push(line); histIdx = cmdHistory.length;
    const [name, ...args] = line.split(/\s+/);
    const key = name.toLowerCase();
    const cmd = commands[key];
    if (!cmd) {
      printEntry(line, `<span class="red">command not found:</span> ${escape(name)} — try <span class="g">help</span>`);
      return;
    }
    const out = cmd.run(args);
    printEntry(line, out);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    execute(v);
    updateCaret();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      histIdx = Math.max(0, histIdx - 1);
      input.value = cmdHistory[histIdx] || '';
      setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      histIdx = Math.min(cmdHistory.length, histIdx + 1);
      input.value = cmdHistory[histIdx] || '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const cur = input.value.trim();
      if (!cur) return;
      const matches = Object.keys(commands).filter(k => !commands[k].hidden && k.startsWith(cur));
      if (matches.length === 1) { input.value = matches[0] + ' '; }
      else if (matches.length > 1) { printEntry(cur, matches.join('  ')); }
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      history.innerHTML = '';
    }
    updateCaret();
  });

  input.addEventListener('input', updateCaret);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('a')) input.focus();
  });

  // caret follows the input text
  function updateCaret() {
    // measure text width
    const meas = document.createElement('span');
    meas.style.visibility = 'hidden';
    meas.style.position = 'absolute';
    meas.style.whiteSpace = 'pre';
    meas.style.font = getComputedStyle(input).font;
    meas.textContent = input.value || '';
    document.body.appendChild(meas);
    const w = meas.getBoundingClientRect().width;
    meas.remove();
    const ps1W = ps1El.getBoundingClientRect().width;
    caret.style.left = (ps1W + w) + 'px';
  }
  window.addEventListener('resize', updateCaret);
  setTimeout(updateCaret, 50);

  // ───────────── matrix rain ─────────────
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d');
  let cols = 0, drops = [], matrixOn = true, raf = null;
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノマクスリッチ01ハヒフヘホ$#@&%MAXRICHIE';

  const sizeCanvas = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / 16);
    drops = new Array(cols).fill(0).map(() => Math.random() * -50);
  };

  const drawMatrix = () => {
    ctx.fillStyle = 'rgba(6, 8, 10, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--green').trim() || '#00ff9c';
    ctx.font = '14px JetBrains Mono, monospace';
    for (let i = 0; i < cols; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      const x = i * 16;
      const y = drops[i] * 18;
      ctx.fillText(ch, x, y);
      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    raf = requestAnimationFrame(drawMatrix);
  };

  const toggleMatrix = () => {
    matrixOn = !matrixOn;
    if (matrixOn) {
      canvas.style.display = 'block';
      drawMatrix();
    } else {
      canvas.style.display = 'none';
      if (raf) cancelAnimationFrame(raf);
    }
  };

  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();
  drawMatrix();

  // focus on any keypress
  window.addEventListener('keydown', () => {
    if (document.activeElement !== input) input.focus();
  });
})();
