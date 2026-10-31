import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './styles.css';

const app = document.querySelector('#app');

if (!app) {
  throw new Error('AeroLab app root element #app was not found.');
}

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

      <div class="sidebar-panel">
        <h3>Mission status</h3>
        <div class="status-row"><span>Simulation</span><strong>Nominal</strong></div>
        <div class="status-row"><span>Atmosphere</span><strong>STD</strong></div>
        <div class="status-row"><span>Wind</span><strong>2.0 m/s</strong></div>
      </div>
    </aside>

    <main class="content">
      <header class="topbar">
        <div>
          <p class="eyebrow">Mission Control</p>
          <h2>Launch System Overview</h2>
        </div>
        <div class="top-actions">
          <button class="action-button secondary">Load Design</button>
          <button class="action-button">Run Simulation</button>
        </div>
      </header>

      <section class="metrics-grid">
        <article class="metric-card">
          <span>Total Mass</span>
          <strong id="massValue">-- kg</strong>
        </article>
        <article class="metric-card">
          <span>CG</span>
          <strong id="cgValue">-- m</strong>
        </article>
        <article class="metric-card">
          <span>Peak Altitude</span>
          <strong id="altitudeValue">-- m</strong>
        </article>
        <article class="metric-card">
          <span>Max Velocity</span>
          <strong id="velocityValue">-- m/s</strong>
        </article>
      </section>

      <section class="visual-panel">
        <div class="viewer-shell">
          <div id="viewer" class="viewer"></div>
          <div class="viewer-overlay">
            <span>Flight simulation preview</span>
            <strong>Altitude window: 0–1800 m</strong>
          </div>
        </div>

        <div class="telemetry-panel">
          <h3>Telemetry</h3>
          <ul>
            <li><span>Altitude</span><strong id="telemetryAltitude">--</strong></li>
            <li><span>Velocity</span><strong id="telemetryVelocity">--</strong></li>
            <li><span>Acceleration</span><strong id="telemetryAcceleration">--</strong></li>
            <li><span>Stability Margin</span><strong>1.4 cal</strong></li>
          </ul>
        </div>
      </section>

      <section class="lower-grid">
        <div class="analytics-card chart-card">
          <div class="panel-header">
            <h3>Trajectory</h3>
            <span>Altitude vs time</span>
          </div>
          <div class="chart-bars" id="trajectoryChart"></div>
        </div>

        <div class="analytics-card">
          <div class="panel-header">
            <h3>Components</h3>
            <span>Assembly summary</span>
          </div>
          <ul class="component-list" id="componentList"></ul>
        </div>
      </section>
    </main>
  </div>
`;

const viewer = document.getElementById('viewer');
const trajectoryChart = document.getElementById('trajectoryChart');
const componentList = document.getElementById('componentList');

if (!viewer || !trajectoryChart || !componentList) {
  throw new Error('AeroLab dashboard required elements were not created.');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0d1320');

const camera = new THREE.PerspectiveCamera(50, viewer.clientWidth / viewer.clientHeight || 1, 0.1, 1500);
camera.position.set(0, 2.5, 9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewer.clientWidth || 800, viewer.clientHeight || 500);
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 18;
controls.target.set(0, 1.5, 0);

const ambient = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0x7ec8ff, 1.8);
directional.position.set(6, 8, 4);
scene.add(directional);

const group = new THREE.Group();
scene.add(group);

const bodyMaterial = new THREE.MeshStandardMaterial({
  color: 0x8fb4ff,
  metalness: 0.7,
  roughness: 0.25,
});

const noseMaterial = new THREE.MeshStandardMaterial({
  color: 0x8ee3ff,
  metalness: 0.5,
  roughness: 0.25,
});

const finMaterial = new THREE.MeshStandardMaterial({
  color: 0xc5d8ff,
  metalness: 0.4,
  roughness: 0.45,
});

const body = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 4.0, 32), bodyMaterial);
body.position.y = 0.4;
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
  new THREE.Vector3(-2.8, 0.1, 0),
  new THREE.Vector3(-2.0, 0.8, 0.2),
  new THREE.Vector3(-1.1, 1.6, -0.1),
  new THREE.Vector3(0.0, 2.6, 0.0),
];

const trail = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(trailPoints),
  new THREE.LineBasicMaterial({ color: 0x66d9ff }),
);
scene.add(trail);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(8, 64),
  new THREE.MeshStandardMaterial({
    color: 0x101a2d,
    metalness: 0.3,
    roughness: 0.93,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.5;
scene.add(floor);

function renderBars(values: number[]): void {
  trajectoryChart.innerHTML = '';
  const safeValues = values.length > 0 ? values : [10, 20, 30, 40, 50];
  safeValues.forEach((value) => {
    const bar = document.createElement('span');
    bar.className = 'bar';
    const safeValue = Number.isFinite(value) ? value : 0;
    const normalized = Math.max(10, (safeValue / Math.max(...safeValues, 1)) * 100);
    bar.style.height = `${normalized}%`;
    trajectoryChart.appendChild(bar);
  });
}

function renderComponentList(items: Array<{ name: string; mass_kg: number }>): void {
  componentList.innerHTML = '';
  items.forEach((item) => {
    const row = document.createElement('li');
    row.innerHTML = `<span>${item.name}</span><strong>${Number(item.mass_kg || 0).toFixed(1)} kg</strong>`;
    componentList.appendChild(row);
  });
}

function updateCards(summary: { total_mass_kg?: number; cg_m?: number; peak_altitude_m?: number; max_velocity_mps?: number } | null): void {
  const safeSummary = summary ?? {
    total_mass_kg: 0,
    cg_m: 0,
    peak_altitude_m: 0,
    max_velocity_mps: 0,
  };

  const massElement = document.getElementById('massValue');
  const cgElement = document.getElementById('cgValue');
  const altitudeElement = document.getElementById('altitudeValue');
  const velocityElement = document.getElementById('velocityValue');
  const telemetryAltitudeElement = document.getElementById('telemetryAltitude');
  const telemetryVelocityElement = document.getElementById('telemetryVelocity');
  const telemetryAccelerationElement = document.getElementById('telemetryAcceleration');

  if (massElement) {
    massElement.textContent = `${Number(safeSummary.total_mass_kg || 0).toFixed(1)} kg`;
  }
  if (cgElement) {
    cgElement.textContent = `${Number(safeSummary.cg_m || 0).toFixed(2)} m`;
  }
  if (altitudeElement) {
    altitudeElement.textContent = `${Number(safeSummary.peak_altitude_m || 0).toFixed(0)} m`;
  }
  if (velocityElement) {
    velocityElement.textContent = `${Number(safeSummary.max_velocity_mps || 0).toFixed(0)} m/s`;
  }
  if (telemetryAltitudeElement) {
    telemetryAltitudeElement.textContent = `${Number(safeSummary.peak_altitude_m || 0).toFixed(0)} m`;
  }
  if (telemetryVelocityElement) {
    telemetryVelocityElement.textContent = `${Number(safeSummary.max_velocity_mps || 0).toFixed(0)} m/s`;
  }
  if (telemetryAccelerationElement) {
    const accel = Number(safeSummary.max_velocity_mps || 0) / 25;
    telemetryAccelerationElement.textContent = `${accel.toFixed(1)} m/s²`;
  }
}

async function loadSimulation(): Promise<void> {
  try {
    const inventoryResponse = await fetch('http://localhost:8000/inventory');
    const inventory = (await inventoryResponse.json()) as { components?: Array<{ name: string; mass_kg: number }> };

    const defaultResponse = await fetch('http://localhost:8000/config/default');
    const defaultConfig = (await defaultResponse.json()) as {
      name?: string;
      components?: Array<{ name: string; mass_kg: number }>;
    };

    const requestPayload = {
      rocket: defaultConfig,
      integrator: 'RK4',
      time_step_s: 0.05,
      max_duration_s: 30,
      drag_coefficient: 0.35,
      wind_speed_mps: 2.0,
    };

    const simResponse = await fetch('http://localhost:8000/simulation/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    const simulation = (await simResponse.json()) as {
      summary?: { total_mass_kg?: number; cg_m?: number; peak_altitude_m?: number; max_velocity_mps?: number };
      trajectory?: Array<{ altitude_m: number }>;
    };

    updateCards(simulation.summary ?? null);

    const trajectoryValues = Array.isArray(simulation.trajectory)
      ? simulation.trajectory.map((point) => Number(point.altitude_m || 0))
      : [10, 20, 30, 40, 50];

    renderBars(trajectoryValues.slice(0, 20));

    const componentValues = Array.isArray(defaultConfig.components)
      ? defaultConfig.components.map((component) => ({
          name: component.name,
          mass_kg: Number(component.mass_kg || 0),
        }))
      : [
          { name: 'Nose Cone A', mass_kg: 1.1 },
          { name: 'Body Tube 18', mass_kg: 2.4 },
          { name: 'Fin Set 4', mass_kg: 0.45 },
          { name: 'Motor Mount', mass_kg: 0.32 },
        ];

    renderComponentList(inventory.components ? inventory.components.slice(0, 5).map((component) => ({
      name: component.name,
      mass_kg: Number(component.mass_kg || 0),
    })) : componentValues);
  } catch (error) {
    console.warn('AeroLab API is not running yet; showing design defaults.', error);
    updateCards({
      total_mass_kg: 17.8,
      cg_m: 0.93,
      peak_altitude_m: 1762,
      max_velocity_mps: 274,
    });

    renderBars([40, 80, 120, 180, 260, 420, 580, 710, 910, 1120, 1360, 1540, 1720, 1610, 1490, 1300, 980, 620, 340, 10]);

    renderComponentList([
      { name: 'Nose Cone A', mass_kg: 1.1 },
      { name: 'Body Tube 18', mass_kg: 2.4 },
      { name: 'Fin Set 4', mass_kg: 0.45 },
      { name: 'Motor Mount', mass_kg: 0.32 },
    ]);
  }
}

const clock = new THREE.Clock();

function animate(): void {
  const t = clock.getElapsedTime();
  group.rotation.y = t * 0.6;
  group.rotation.x = Math.sin(t * 0.8) * 0.16;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
void loadSimulation();

window.addEventListener('resize', () => {
  camera.aspect = (viewer.clientWidth || 800) / (viewer.clientHeight || 500);
  camera.updateProjectionMatrix();
  renderer.setSize(viewer.clientWidth || 800, viewer.clientHeight || 500);
});
