(() => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- boot sequence ---------- */
  const boot = document.getElementById("boot");
  if (boot) {
    const log = document.getElementById("boot-log");
    const lines = [
      ["> yaleedhaque.dev v3.1 ............ INIT", 12],
      ["> gamepad_server.dll ............ LOADED", 12],
      ["> stark_agent.core ............... LOADED", 12],
      ["> hid_remote.bt .................. LINKED", 12],
      ["> lumen_torch.led ................ POWERED", 12],
      ["> aether_compass.mag ............. CALIBRATED", 12],
      ["> edge_transcribe.py ............. READY", 12],
      ["> binding udp://0.0.0.0:9876 ........ OK", 12],
      ["> players connected ......... 4 / 8", 16],
      ["> cloud dependencies ................ 0", 16],
      ["> system online ................. WELCOME", 24]
    ];
    let lineIdx = 0;
    let charIdx = 0;
    let finished = false;

    const hideBoot = () => {
      if (finished) return;
      finished = true;
      boot.classList.add("done");
      document.documentElement.classList.add("booted");
      setTimeout(() => boot.remove(), 900);
    };

    const skip = () => {
      window.removeEventListener("click", skip);
      hideBoot();
    };
    window.addEventListener("click", skip);

    const typeLine = () => {
      if (lineIdx >= lines.length) {
        setTimeout(hideBoot, 300);
        return;
      }
      const [text, speed] = lines[lineIdx];
      if (charIdx <= text.length) {
        log.textContent = text.slice(0, charIdx);
        charIdx++;
        setTimeout(typeLine, reduceMotion ? 0 : speed);
      } else {
        log.textContent = text;
        log.appendChild(document.createElement("br"));
        lineIdx++;
        charIdx = 0;
        setTimeout(typeLine, reduceMotion ? 0 : 130);
      }
    };
    if (reduceMotion) {
      log.textContent = lines.map((l) => l[0]).join("\n");
      setTimeout(hideBoot, 400);
    } else {
      typeLine();
      setTimeout(hideBoot, 2600);
    }
  }

  /* ---------- magnetic buttons ---------- */
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      if (reduceMotion) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.3}px, ${dy * 0.4}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });

  /* ---------- anchor navigation (native scroll) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });

  /* ---------- scroll reveals ---------- */
  const revealOnScroll = (selector, stagger = 0) => {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el, i) => {
      if (stagger && i > 0) el.style.transitionDelay = `${Math.min(i * 0.07, 0.22)}s`;
      observer.observe(el);
    });
  };

  revealOnScroll(".card");
  revealOnScroll(".pillar", true);
  revealOnScroll(".quote", true);
  revealOnScroll(".stats");
  revealOnScroll(".terminal");
  revealOnScroll(".contact-box");

  /* ---------- scroll narrative ---------- */
  const narrative = document.getElementById("narrative");
  if (narrative) {
    const stage = narrative.querySelector(".scroll-stage");
    const panels = Array.from(stage.querySelectorAll(".scroll-panel"));
    const progressBar = narrative.querySelector(".scroll-progress-bar");
    const hint = narrative.querySelector(".scroll-hint");

    const update = () => {
      const rect = narrative.getBoundingClientRect();
      const total = narrative.offsetHeight - window.innerHeight;
      const p = clamp(-rect.top / total, 0, 1);
      if (progressBar) progressBar.style.transform = `scaleX(${p})`;
      if (hint) hint.style.opacity = p > 0.02 && p < 0.98 ? String(1 - p) : "1";
      const n = panels.length;
      panels.forEach((panel, i) => {
        const start = i / n;
        const end = (i + 1) / n;
        const rel = clamp((p - start) / (end - start), 0, 1);
        const strength = Math.sin(Math.PI * rel);
        const side = panel.dataset.side === "right" ? 1 : -1;
        const drift = (0.5 - rel) * 2;
        panel.style.opacity = String(strength);
        panel.style.transform = `translate3d(${side * drift * 120}px, 0, 0)`;
      });
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ---------- stat counters ---------- */
  const counters = document.querySelectorAll(".count");
  if (counters.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || "";
          if (reduceMotion) {
            el.textContent = target + suffix;
          } else {
            const dur = 1200;
            const start = performance.now();
            const tick = (now) => {
              const t = clamp((now - start) / dur, 0, 1);
              const eased = 1 - Math.pow(1 - t, 3);
              el.textContent = Math.round(target * eased) + suffix;
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
          countObserver.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => countObserver.observe(c));
  }

  /* ---------- terminal ---------- */
  const termBody = document.getElementById("terminal-body");
  const termInput = document.getElementById("terminal-input");
  if (termBody && termInput) {
    const prompt = "yaleed@localhost:~$";
    const commands = {
      help: [
        "available commands:",
        "  whoami      who is behind the terminal",
        "  projects    list shipped projects",
        "  skills      show the stack",
        "  philosophy  what i hold to",
        "  status      live system status",
        "  clear       clear this session",
        "  contact     how to reach me"
      ],
      whoami: [
        "md. yaleed haque",
        "developer / dhaka, bangladesh",
        "local-first systems, low-level & close to the metal"
      ],
      projects: [
        "[P1] GamePadEcosystem - phones as xbox 360 controllers, zero cloud",
        "[P2] StarkAgent - ai desktop agent, 275+ commands, local tcp api",
        "[P3] BluetoothRemoteHid - wireless keyboard/touchpad/air-mouse over bluetooth hid",
        "[P4] Lumen - torch, strobe, sos, morse send + decode from camera",
        "[P5] AetherCompass - offline compass, all on-device",
        "[P6] opencode-free-fallback - keep opencode sessions alive, free providers + warp rotation",
        "[P7] Edge-project - self-hosted on-device whisper transcription, word-timed, txt/srt/vtt exports"
      ],
      skills: [
        "C# / .NET 8 ............ core systems",
        "Kotlin / Compose ....... android apps: gamepads, remotes, torch, compass",
        "Bluetooth HID / GATT ... phone as wireless keyboard / touchpad / mouse",
        "sensors / camera ....... gyro air-mouse, morse decode, compass bearings",
        "UDP / realtime ......... wire protocol, sub-5ms",
        "Python / Flask ......... on-device whisper transcription (faster-whisper)",
        "Win32 / ViGEm / SendInput  virtual input devices",
        "local-first ............ zero cloud, zero telemetry"
      ],
      philosophy: [
        "your network is your network",
        "control should not require a degree",
        "say the number - latency, capacity, limits, up front"
      ],
      status: [
        "server  : gamepad_server ONLINE",
        "hotspot : active (ssid: gamepad_server)",
        "players : 4 / 8 connected",
        "cloud   : 0 dependencies",
        "latency : < 5 ms"
      ],
      contact: [
        "github  : github.com/yaleedhaque",
        "email   : yaleedhaque@users.noreply.github.com",
        "everything is public - open an issue or say hello"
      ]
    };

    const bootLines = [
      "welcome to yaleedhaque.dev",
      "type 'help' to see available commands",
      ""
    ];
    let booted = false;

    const appendLine = (text, cls) => {
      const p = document.createElement("div");
      p.className = "term-line" + (cls ? " " + cls : "");
      p.textContent = text;
      termBody.appendChild(p);
      termBody.scrollTop = termBody.scrollHeight;
    };

    const printBlock = (lines, done) => {
      let i = 0;
      const next = () => {
        if (i < lines.length) {
          appendLine(lines[i]);
          i++;
          setTimeout(next, reduceMotion ? 0 : 25);
        } else {
          if (done) done();
        }
      };
      next();
    };

    const runCommand = (raw) => {
      appendLine(prompt + " " + raw, "cmd");
      const [cmd, ...args] = raw.trim().toLowerCase().split(/\s+/);
      const clean = cmd || "help";
      if (clean === "clear") {
        termBody.innerHTML = "";
      } else if (clean === "whoami" && args.length) {
        appendLine("usage: whoami");
      } else if (commands[clean]) {
        printBlock(commands[clean]);
      } else {
        appendLine(`command not found: ${clean}  (try 'help')`, "err");
      }
    };

    const startBoot = () => {
      booted = true;
      printBlock(bootLines, () => {
        termInput.disabled = false;
        termInput.focus({ preventScroll: true });
      });
    };

    if (reduceMotion) startBoot();
    else setTimeout(startBoot, 600);

    termInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const val = termInput.value;
      termInput.value = "";
      runCommand(val);
    });
  }
})();
