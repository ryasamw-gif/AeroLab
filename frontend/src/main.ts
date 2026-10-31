import * as THREE from 'three';
import './styles.css';

const app = document.querySelector('#app') as HTMLElement;
app.innerHTML = `
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">A</span>
        <div>
          <h1>AeroLab</h1>
          <p>Advanced Rocket Engineering</p>
        </div>
      </div>

      <nav>
        <button class="nav-item active">Dashboard</button>
        <button class="nav-item">Rocket Builder</button>
        <button class="nav-item">Component Inventory</button>
        <button class="nav-item">Simulation Lab</button>
        <button class="nav-item">Computational Lab</button>
        <button class="nav-item">Engineering Analysis</button>
      </nav>
    </aside>

    <main class="content">
      <header class="topbar">
        <div>
          <p class="eyebrow">Mission Control</p>
          <h2>Launch System Overview</h2>
        </div>
        <button class="action-button">Run Simulation</button>
      </header>

      <section class="metrics-grid">
        <article class="metric-card">
          <span>Total Mass</span>
          <strong>18.2 kg</strong>
        </article>
        <article class="metric-card">
          <span>CG</span>
          <strong>0.94 m</strong>
        </article>
        <article class="metric-card">
          <span>Peak Altitude</span>
          <strong>1,735 m</strong>
        </article>
        <article class="metric-card">
          <span>Max Velocity</span>
          <strong>277 m/s</strong>
        </article>
      </section>

      <section class="visual-panel">
        <div id="viewer" class="viewer"></div>
        <div class="telemetry-panel">
          <h3>Telemetry</h3>
          <ul>
            <li>Altitude: 1,240 m</li>
            <li>Velocity: 263 m/s</li>
            <li>Acceleration: 9.3 m/s²</li>
            <li>Stability Margin: 1.4 cal</li>
          </ul>
        </div>
      </section>
    </main>
  </div>
`;

const viewer = document.getElementById('viewer') as HTMLElement;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0d1320');

const camera = new THREE.PerspectiveCamera(50, viewer.clientWidth / viewer.clientHeight, 0.1, 1000);
camera.position.set(0, 2.5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
viewer.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0x7ec8ff, 1.6);
directional.position.set(5, 7, 4);
scene.add(directional);

const group = new THREE.Group();
scene.add(group);

const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8fb4ff, metalness: 0.5, roughness: 0.35 });
const noseMaterial = new THREE.MeshStandardMaterial({ color: 0x8ee3ff, metalness: 0.4, roughness: 0.3 });
const finMaterial = new THREE.MeshStandardMaterial({ color: 0xc5d8ff, metalness: 0.3, roughness: 0.5 });

const body = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 4.0, 32), bodyMaterial);
body.position.y = 0.5;
body.rotation.z = 0;
group.add(body);

const nose = new THREE.Mesh(new THREE.ConeGeometry(0.51, 1.2, 32), noseMaterial);
nose.position.y = 3.0;
group.add(nose);

const finGeometry = new THREE.BoxGeometry(0.18, 1.1, 0.65);
for (let i = 0; i < 4; i += 1) {
  const fin = new THREE.Mesh(finGeometry, finMaterial);
  fin.position.set(0, -1.1, 0);
  fin.rotation.y = (i * Math.PI) / 2;
  fin.rotation.z = Math.PI / 12;
  group.add(fin);
}

const trailPoints = [
  new THREE.Vector3(-2.2, 0.3, 0),
  new THREE.Vector3(-1.4, 1.1, 0.2),
  new THREE.Vector3(-0.8, 1.9, -0.1),
  new THREE.Vector3(0.0, 2.7, 0.0),
];

const trail = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(trailPoints),
  new THREE.LineBasicMaterial({ color: 0x66d9ff })
);
scene.add(trail);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(8, 64),
  new THREE.MeshStandardMaterial({ color: 0x111b2f, metalness: 0.2, roughness: 0.95 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.4;
scene.add(floor);

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  group.rotation.y = t * 0.6;
  group.rotation.x = Math.sin(t * 0.8) * 0.15;
  camera.lookAt(0, 1.5, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
window.addEventListener('resize', () => {
  if (!viewer) return;
  camera.aspect = viewer.clientWidth / viewer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
});
