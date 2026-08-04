import * as THREE from "three";

(() => {
  const canvas = document.getElementById("hero-3d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas || reduceMotion || typeof WebGLRenderingContext === "undefined") return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06070d, 0.016);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 20;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  } catch (e) {
    return;
  }

  const group = new THREE.Group();
  scene.add(group);

  const N = 110;
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  const cAurora = new THREE.Color(0xa78bfa);
  const cCyan = new THREE.Color(0x67e8f9);

  for (let i = 0; i < N; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 32;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    const c = Math.random() > 0.55 ? cAurora : cCyan;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.13,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true
  });
  group.add(new THREE.Points(pGeo, pMat));

  const edgeLimit = 3.4;
  const edges = [];
  const linePositions = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < edgeLimit * edgeLimit) {
        edges.push([i, j]);
        linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        linePositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
      }
    }
  }

  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  const lMat = new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.1 });
  group.add(new THREE.LineSegments(lGeo, lMat));

  const packetCount = 10;
  const packetGeo = new THREE.SphereGeometry(0.11, 8, 8);
  const packets = [];
  for (let k = 0; k < packetCount; k++) {
    const e = edges[Math.floor(Math.random() * edges.length)];
    const mesh = new THREE.Mesh(
      packetGeo,
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x67e8f9 : 0xa78bfa,
        transparent: true,
        opacity: 0.95
      })
    );
    group.add(mesh);
    packets.push({ e, t: Math.random(), speed: 0.18 + Math.random() * 0.32, mesh });
  }

  const lerp = (a, b, t) => a + (b - a) * t;

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (ev) => {
    mouse.tx = (ev.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (ev.clientY / window.innerHeight) * 2 - 1;
  });

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  let raf = 0;
  let visible = true;
  let scrolling = false;
  let scrollTimer = 0;

  const markScrolling = () => {
    scrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      scrolling = false;
    }, 180);
  };
  window.addEventListener("wheel", markScrolling, { passive: true });
  window.addEventListener("touchmove", markScrolling, { passive: true });
  window.addEventListener("scroll", markScrolling, { passive: true });

  function animate() {
    raf = requestAnimationFrame(animate);
    if (!visible || scrolling || document.hidden) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    group.rotation.y = t * 0.06;
    group.rotation.x = Math.sin(t * 0.12) * 0.08;

    mouse.x = lerp(mouse.x, mouse.tx, 0.05);
    mouse.y = lerp(mouse.y, mouse.ty, 0.05);
    group.rotation.y += mouse.x * 0.12;
    group.rotation.x += mouse.y * 0.06;

    packets.forEach((p) => {
      p.t += p.speed * dt;
      if (p.t >= 1) {
        p.t = 0;
        p.e = edges[Math.floor(Math.random() * edges.length)];
      }
      const [a, b] = p.e;
      p.mesh.position.set(
        lerp(positions[a * 3], positions[b * 3], p.t),
        lerp(positions[a * 3 + 1], positions[b * 3 + 1], p.t),
        lerp(positions[a * 3 + 2], positions[b * 3 + 2], p.t)
      );
    });

    renderer.render(scene, camera);
  }

  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => (visible = en.isIntersecting)),
    { threshold: 0.05 }
  );
  io.observe(canvas);
  animate();
})();
