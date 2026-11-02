import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import './styles.css';

window.CESIUM_BASE_URL = '/cesium/';

const ionToken = (import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined) ?? '';

const app = document.querySelector('#app');

if (!app) {
  throw new Error('AeroLab app root element #app was not found.');
}

app.innerHTML = `
  <div class="app-shell">
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
          <div id="cesiumContainer" class="viewer"></div>
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

const trajectoryChart = document.getElementById('trajectoryChart');
const componentList = document.getElementById('componentList');

if (!trajectoryChart || !componentList) {
  throw new Error('AeroLab dashboard chart containers were not created.');
}

function renderBars(values: number[]): void {
  trajectoryChart.innerHTML = '';

  const safeValues = values.length > 0 ? values : [10, 20, 30, 40, 50];
  const maxValue = Math.max(...safeValues, 1);

  safeValues.forEach((value) => {
    const bar = document.createElement('span');
    bar.className = 'bar';
    const normalized = Math.max(10, (value / maxValue) * 100);
    bar.style.height = `${normalized}%`;
    trajectoryChart.appendChild(bar);
  });
}

function renderComponentList(items: Array<{ name: string; mass_kg: number }>): void {
  componentList.innerHTML = '';

  items.forEach((item) => {
    const row = document.createElement('li');
    row.innerHTML = `
      <span>${item.name}</span>
      <strong>${Number(item.mass_kg || 0).toFixed(1)} kg</strong>
    `;
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

async function initializeCesium(): Promise<void> {
  const viewer = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    baseLayerPicker: true,
    geocoder: true,
    homeButton: true,
    navigationHelpButton: true,
    sceneModePicker: true,
    timeline: false,
    fullscreenButton: true,
    selectionIndicator: false,
    terrain: new Cesium.EllipsoidTerrainProvider(),
    imageryProvider: ionToken
      ? new Cesium.IonImageryProvider({ assetId: 2, accessToken: ionToken })
      : new Cesium.OpenStreetMapImageryProvider({
          url: 'https://tile.openstreetmap.org/',
        }),
  });

  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.resolutionScale = window.devicePixelRatio || 1;

  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-121.915, 37.32, 800000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-35),
      roll: 0,
    },
  });

  if (ionToken) {
    Cesium.Ion.defaultAccessToken = ionToken;
    try {
      viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1, {
        accessToken: ionToken,
      });
    } catch {
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    }
  }

  const flightPath = [
    Cesium.Cartesian3.fromDegrees(-122.5, 37.36, 0),
    Cesium.Cartesian3.fromDegrees(-122.2, 37.8, 22000),
    Cesium.Cartesian3.fromDegrees(-121.9, 38.3, 45000),
    Cesium.Cartesian3.fromDegrees(-121.5, 38.9, 78000),
    Cesium.Cartesian3.fromDegrees(-121.1, 39.4, 110000),
  ];

  viewer.entities.add({
    polyline: {
      positions: flightPath,
      width: 4,
      material: Cesium.Color.CYAN.withAlpha(0.9),
      clampToGround: true,
    },
  });

  const launchMarker = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(-122.5, 37.36, 0),
    point: {
      pixelSize: 10,
      color: Cesium.Color.fromCssColorString('#57d0ff'),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: 'Launch Site',
      font: '16px sans-serif',
      fillColor: Cesium.Color.WHITE,
      backgroundColor: Cesium.Color.BLACK.withAlpha(0.4),
      showBackground: true,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 800000.0),
      pixelOffset: new Cesium.Cartesian2(0, -30),
    },
  });

  const rocket = viewer.entities.add({
    position: flightPath[0],
    point: {
      pixelSize: 9,
      color: Cesium.Color.ORANGE,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: 'AeroLab Rocket',
      font: '14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString('#111827').withAlpha(0.75),
      pixelOffset: new Cesium.Cartesian2(0, -25),
    },
  });

  let phase = 0;

  const rocketPath = new Cesium.CallbackProperty(() => {
    const t = (performance.now() / 1000) % 30;
    const p = t / 30;
    phase = p;
    const index = Math.min(flightPath.length - 1, Math.floor(p * (flightPath.length - 1)));
    const nextIndex = Math.min(flightPath.length - 1, index + 1);
    const localT = (p * (flightPath.length - 1)) % 1;

    const current = Cesium.Ellipsoid.WGS84.cartesianToCartographic(flightPath[index]);
    const next = Cesium.Ellipsoid.WGS84.cartesianToCartographic(flightPath[nextIndex]);

    const lon = Cesium.Math.lerp(current.longitude, next.longitude, localT);
    const lat = Cesium.Math.lerp(current.latitude, next.latitude, localT);
    const height = Cesium.Math.lerp(current.height, next.height, localT) + 1500;

    return Cesium.Cartesian3.fromRadians(lon, lat, height);
  }, false);

  rocket.position = rocketPath;

  const missionTarget = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(-121.1, 39.4, 110000),
    billboard: {
      image: '/cesium/Assets/Images/2D/target.png',
      width: 34,
      height: 34,
      color: Cesium.Color.CYAN,
    },
  });

  if (missionTarget) {
    viewer.trackedEntity = missionTarget;
  }

  const area = viewer.entities.add({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        -123, 36.8,
        -119.8, 36.8,
        -119.8, 40.5,
        -123, 40.5,
      ]),
      material: Cesium.Color.CYAN.withAlpha(0.08),
      outline: true,
      outlineColor: Cesium.Color.CYAN.withAlpha(0.5),
      outlineWidth: 2,
    },
  });

  void area;
  void launchMarker;
  void phase;
  return viewer;
}

async function loadSimulation(): Promise<void> {
  try {
    const inventoryResponse = await fetch('http://localhost:8000/inventory');
    const inventory = (await inventoryResponse.json()) as {
      components?: Array<{ name: string; mass_kg: number }>;
    };

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
      summary?: {
        total_mass_kg?: number;
        cg_m?: number;
        peak_altitude_m?: number;
        max_velocity_mps?: number;
      };
      trajectory?: Array<{ altitude_m: number }>;
    };

    updateCards(simulation.summary ?? null);

    const trajectoryValues = Array.isArray(simulation.trajectory)
      ? simulation.trajectory.map((point) => Number(point.altitude_m || 0))
      : [40, 80, 120, 180, 260, 420, 580, 710, 910, 1120, 1360, 1540, 1720, 1610, 1490, 1300, 980, 620, 340, 10];

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
          { name: 'Guidance Unit', mass_kg: 0.8 },
        ];

    renderComponentList(
      inventory.components && inventory.components.length > 0
        ? inventory.components.slice(0, 5).map((component) => ({
            name: component.name,
            mass_kg: Number(component.mass_kg || 0),
          }))
        : componentValues
    );
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
      { name: 'Guidance Unit', mass_kg: 0.8 },
    ]);
  }
}

void initializeCesium();
void loadSimulation();

const viewer = new Cesium.Viewer('cesiumContainer', {
  animation: false,
  timeline: false,
  baseLayerPicker: true,
  fullscreenButton: true,
  geocoder: true,
  homeButton: true,
  navigationHelpButton: true,
  sceneModePicker: true,
  terrainProvider: new Cesium.EllipsoidTerrainProvider(),
  imageryProvider: new Cesium.OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
  }),
});

viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(-121.915, 37.32, 800000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-35),
    roll: 0,
  },
});

viewer.scene.globe.enableLighting = true;
viewer.scene.globe.depthTestAgainstTerrain = true;

const camera = viewer.camera;
const earthPath = [
  Cesium.Cartesian3.fromDegrees(-122.5, 37.36, 0),
  Cesium.Cartesian3.fromDegrees(-122.2, 37.8, 22000),
  Cesium.Cartesian3.fromDegrees(-121.9, 38.3, 45000),
  Cesium.Cartesian3.fromDegrees(-121.5, 38.9, 78000),
  Cesium.Cartesian3.fromDegrees(-121.1, 39.4, 110000),
];

viewer.entities.add({
  polyline: {
    positions: earthPath,
    width: 4,
    material: Cesium.Color.CYAN.withAlpha(0.95),
    clampToGround: true,
  },
});

const rocketEntity = viewer.entities.add({
  position: earthPath[0],
  point: {
    pixelSize: 10,
    color: Cesium.Color.ORANGE,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: 'AeroLab Rocket',
    font: '14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    showBackground: true,
    backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
    pixelOffset: new Cesium.Cartesian2(0, -25),
  },
});

const rocketPosition = new Cesium.CallbackProperty(() => {
  const t = (performance.now() / 1000) % 30;
  const p = t / 30;
  const index = Math.min(earthPath.length - 1, Math.floor(p * (earthPath.length - 1)));
  const nextIndex = Math.min(earthPath.length - 1, index + 1);
  const localT = (p * (earthPath.length - 1)) % 1;

  const current = Cesium.Ellipsoid.WGS84.cartesianToCartographic(earthPath[index]);
  const next = Cesium.Ellipsoid.WGS84.cartesianToCartographic(earthPath[nextIndex]);

  const lon = Cesium.Math.lerp(current.longitude, next.longitude, localT);
  const lat = Cesium.Math.lerp(current.latitude, next.latitude, localT);
  const height = Cesium.Math.lerp(current.height, next.height, localT) + 1500;

  return Cesium.Cartesian3.fromRadians(lon, lat, height);
}, false);

rocketEntity.position = rocketPosition;

viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(-121.1, 39.4, 110000),
  billboard: {
    image: '/cesium/Assets/Images/2D/target.png',
    width: 32,
    height: 32,
    color: Cesium.Color.CYAN,
  },
});

viewer.camera.lookAt(
  Cesium.Cartesian3.fromDegrees(-121.6, 38.5, 40000),
  new Cesium.Cartesian3(0, 0, 100000)
);

window.addEventListener('resize', () => {
  viewer.resize();
  camera.update();
});

const flightSummary = {
  total_mass_kg: 17.8,
  cg_m: 0.93,
  peak_altitude_m: 1762,
  max_velocity_mps: 274,
};

updateCards(flightSummary);
renderBars([40, 80, 120, 180, 260, 420, 580, 710, 910, 1120, 1360, 1540, 1720, 1610, 1490, 1300, 980, 620, 340, 10]);
renderComponentList([
  { name: 'Nose Cone A', mass_kg: 1.1 },
  { name: 'Body Tube 18', mass_kg: 2.4 },
  { name: 'Fin Set 4', mass_kg: 0.45 },
  { name: 'Motor Mount', mass_kg: 0.32 },
  { name: 'Guidance Unit', mass_kg: 0.8 },
]);
