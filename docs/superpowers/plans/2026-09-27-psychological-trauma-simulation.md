# Psychological Trauma Dynamics Simulation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive 3D computational simulation of psychological state-space and trauma dynamics based on the Free Energy Potential landscape and Langevin stochastic differential equations.

**Architecture:** A lightweight Python FastAPI backend solves the Langevin SDE via Euler-Maruyama integration, computes real-time Dimensionality Collapse Index (Participation Ratio), and streams state vectors via WebSocket. A vanilla HTML5/Modern CSS/Three.js frontend renders the 3D Attractor surface, animated state sphere with trajectory ribbon, 2D Canvas HUD telemetry, and interactive clinical controls.

**Tech Stack:** Python 3.14, FastAPI, Uvicorn, NumPy, SciPy, Pytest, Vanilla HTML5/CSS, Three.js (via CDN), Canvas 2D API.

---

## File Structure & Responsibilities

All implementation files reside under `Psychology/`:

- `Psychology/requirements.txt` - Dependencies (`fastapi`, `uvicorn`, `numpy`, `scipy`, `pytest`, `websockets`, `httpx`).
- `Psychology/run.py` - Single-command runner starting Uvicorn server on `http://127.0.0.1:8000`.
- `Psychology/app/core/landscape.py` - Mathematical potential function $V(\vec{S})$, analytical gradient $\nabla V(\vec{S})$, and 2D/3D mesh generator.
- `Psychology/app/core/engine.py` - Langevin SDE integration (Euler-Maruyama), trigger/intervention pulse application, Participation Ratio (PR) computation.
- `Psychology/app/core/presets.py` - Clinical presets configuration (`healthy`, `shock_trauma`, `complex_trauma`).
- `Psychology/app/main.py` - FastAPI app, REST API endpoints (`/api/presets`, `/api/trigger`, `/api/intervene`, `/api/landscape-mesh`), and WebSocket stream (`/ws/stream`).
- `Psychology/app/static/index.html` - Main HTML structure with 3D viewport container, telemetry HUD overlay, and interactive controls sidebar.
- `Psychology/app/static/css/style.css` - Futuristic dark-mode scientific UI, glassmorphism, responsive grid layout.
- `Psychology/app/static/js/charts.js` - Real-time 2D Canvas charts for $x_1, x_2, x_3$ time-series and Dimensionality Gauge.
- `Psychology/app/static/js/scene3d.js` - Three.js WebGL scene: landscape wireframe/surface mesh, state sphere with glow, trailing trajectory, and 3D force vectors.
- `Psychology/app/static/js/app.js` - Frontend controller: WebSocket client, REST API dispatcher, UI event listeners, and animation loop coordinator.
- `Psychology/tests/test_landscape.py` - Unit tests for potential energy $V(\vec{S})$, gradient verification, and mesh grid generation.
- `Psychology/tests/test_engine.py` - Unit tests for SDE stability, trigger response, trauma basin trapping, and participation ratio computation.
- `Psychology/tests/test_api.py` - Integration tests for FastAPI endpoints and WebSocket connections.

---

### Task 1: Environment Setup & Project Scaffolding

**Files:**
- Create: `Psychology/requirements.txt`
- Create: `Psychology/run.py`
- Create: `Psychology/app/__init__.py`
- Create: `Psychology/app/core/__init__.py`
- Create: `Psychology/tests/__init__.py`

- [ ] **Step 1: Create requirements.txt**

```text
fastapi>=0.110.0
uvicorn>=0.28.0
numpy>=1.26.0
scipy>=1.12.0
pytest>=8.0.0
websockets>=12.0
httpx>=0.27.0
```

- [ ] **Step 2: Install dependencies**

Run: `pip install -r Psychology/requirements.txt`  
Expected: Successfully installed packages.

- [ ] **Step 3: Create package init files and run.py**

Create `Psychology/run.py`:
```python
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
```

Create empty `__init__.py` files in `Psychology/app/`, `Psychology/app/core/`, and `Psychology/tests/`.

- [ ] **Step 4: Verify pytest execution**

Run: `pytest Psychology/tests`  
Expected: `no tests ran in ...` (Exit code 5 is normal for empty test suite).

- [ ] **Step 5: Commit**

```bash
git add Psychology/
git commit -m "chore(psychology): scaffold project structure and dependencies"
```

---

### Task 2: Mathematical Attractor Landscape Engine

**Files:**
- Create: `Psychology/tests/test_landscape.py`
- Create: `Psychology/app/core/landscape.py`

- [ ] **Step 1: Write failing tests for Potential Landscape**

Create `Psychology/tests/test_landscape.py`:
```python
import numpy as np
import pytest
from app.core.landscape import AttractorBasin, PotentialLandscape

def test_attractor_basin_creation():
    basin = AttractorBasin(name="work", center=np.array([0.5, 0.5, 0.5]), depth=3.0, width=1.0)
    assert basin.name == "work"
    assert np.allclose(basin.center, [0.5, 0.5, 0.5])
    assert basin.depth == 3.0
    assert basin.width == 1.0

def test_potential_value_at_origin():
    landscape = PotentialLandscape(k_conf=0.05, basins=[
        AttractorBasin(name="center", center=np.array([0.0, 0.0, 0.0]), depth=2.0, width=1.0)
    ])
    val = landscape.evaluate(np.array([0.0, 0.0, 0.0]))
    # V(0) = 0 - 2.0 * exp(0) = -2.0
    assert np.isclose(val, -2.0)

def test_analytical_gradient_matches_finite_difference():
    landscape = PotentialLandscape(k_conf=0.05, basins=[
        AttractorBasin(name="work", center=np.array([0.5, 0.5, 0.5]), depth=3.0, width=1.0),
        AttractorBasin(name="trauma", center=np.array([1.8, -2.0, -2.0]), depth=8.0, width=0.5)
    ])
    s0 = np.array([0.8, -0.4, 0.2])
    grad_analytic = landscape.gradient(s0)
    
    eps = 1e-5
    grad_num = np.zeros(3)
    for i in range(3):
        e = np.zeros(3)
        e[i] = eps
        v_plus = landscape.evaluate(s0 + e)
        v_minus = landscape.evaluate(s0 - e)
        grad_num[i] = (v_plus - v_minus) / (2 * eps)
        
    assert np.allclose(grad_analytic, grad_num, atol=1e-4)

def test_mesh_generation_shape():
    landscape = PotentialLandscape(k_conf=0.05, basins=[
        AttractorBasin(name="work", center=np.array([0.5, 0.5, 0.5]), depth=3.0, width=1.0)
    ])
    x, y, z = landscape.generate_mesh(grid_size=20, bounds=(-3.0, 3.0), slice_x3=0.0)
    assert x.shape == (20, 20)
    assert y.shape == (20, 20)
    assert z.shape == (20, 20)
```

- [ ] **Step 2: Run test to verify failure**

Run: `pytest Psychology/tests/test_landscape.py -v`  
Expected: FAIL (`ModuleNotFoundError: No module named 'app'`).

- [ ] **Step 3: Implement PotentialLandscape in landscape.py**

Create `Psychology/app/core/landscape.py`:
```python
from dataclasses import dataclass
from typing import List, Tuple
import numpy as np

@dataclass
class AttractorBasin:
    name: str
    center: np.ndarray  # 3D vector [x1, x2, x3]
    depth: float
    width: float

class PotentialLandscape:
    def __init__(self, k_conf: float = 0.05, basins: List[AttractorBasin] = None):
        self.k_conf = k_conf
        self.basins = basins if basins is not None else []

    def evaluate(self, s: np.ndarray) -> float:
        """Evaluate V(S) at state vector s = [x1, x2, x3]."""
        s = np.asarray(s, dtype=float)
        # Quartic confinement: (k_conf / 4) * sum(x_i^4)
        v_conf = 0.25 * self.k_conf * np.sum(s**4)
        
        # Sum of Gaussian potential wells
        v_wells = 0.0
        for basin in self.basins:
            diff = s - basin.center
            dist_sq = np.sum(diff**2)
            v_wells += basin.depth * np.exp(-dist_sq / (2.0 * basin.width**2))
            
        return float(v_conf - v_wells)

    def gradient(self, s: np.ndarray) -> np.ndarray:
        """Compute analytical gradient ∇V(S)."""
        s = np.asarray(s, dtype=float)
        # Confinement gradient: k_conf * [x1^3, x2^3, x3^3]
        grad_conf = self.k_conf * (s**3)
        
        grad_wells = np.zeros(3, dtype=float)
        for basin in self.basins:
            diff = s - basin.center
            dist_sq = np.sum(diff**2)
            coeff = (basin.depth / (basin.width**2)) * np.exp(-dist_sq / (2.0 * basin.width**2))
            grad_wells += coeff * diff
            
        return grad_conf + grad_wells

    def generate_mesh(self, grid_size: int = 40, bounds: Tuple[float, float] = (-3.0, 3.0), slice_x3: float = 0.0) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Generate 2D grid coordinates and corresponding potential values z = V(x, y, slice_x3)."""
        x_vals = np.linspace(bounds[0], bounds[1], grid_size)
        y_vals = np.linspace(bounds[0], bounds[1], grid_size)
        x_grid, y_grid = np.meshgrid(x_vals, y_vals)
        z_grid = np.zeros_like(x_grid)
        
        for i in range(grid_size):
            for j in range(grid_size):
                state = np.array([x_grid[i, j], y_grid[i, j], slice_x3])
                z_grid[i, j] = self.evaluate(state)
                
        return x_grid, y_grid, z_grid
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest Psychology/tests/test_landscape.py -v` (with `PYTHONPATH=Psychology`).  
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Psychology/app/core/landscape.py Psychology/tests/test_landscape.py
git commit -m "feat(psychology): implement potential landscape and analytical gradient"
```

---

### Task 3: SDE Solver & Trajectory Simulation Engine

**Files:**
- Create: `Psychology/tests/test_engine.py`
- Create: `Psychology/app/core/engine.py`

- [ ] **Step 1: Write failing tests for Engine**

Create `Psychology/tests/test_engine.py`:
```python
import numpy as np
import pytest
from app.core.landscape import AttractorBasin, PotentialLandscape
from app.core.engine import SimulationEngine

@pytest.fixture
def test_engine():
    landscape = PotentialLandscape(k_conf=0.05, basins=[
        AttractorBasin(name="work", center=np.array([0.5, 0.5, 0.5]), depth=4.0, width=1.0),
        AttractorBasin(name="trauma", center=np.array([2.0, -2.0, -2.0]), depth=8.0, width=0.5)
    ])
    return SimulationEngine(landscape=landscape, initial_state=np.array([0.5, 0.5, 0.5]), dt=0.02, noise_std=0.05)

def test_engine_initialization(test_engine):
    assert np.allclose(test_engine.state, [0.5, 0.5, 0.5])
    assert test_engine.dt == 0.02

def test_engine_single_step_stays_stable(test_engine):
    for _ in range(100):
        packet = test_engine.step()
        assert not np.isnan(packet["state"]).any()
        assert not np.isinf(packet["state"]).any()
        assert -3.5 <= packet["state"][0] <= 3.5

def test_trigger_pulse_application(test_engine):
    test_engine.apply_trigger(magnitude=10.0, direction=np.array([1.0, -1.0, -1.0]))
    assert np.linalg.norm(test_engine.external_force) > 0.0
    packet = test_engine.step()
    # Force should decay over time
    assert np.linalg.norm(test_engine.external_force) < 10.0

def test_participation_ratio_computation(test_engine):
    # Fill history with 3D isotropic variance
    test_engine.history.clear()
    for _ in range(50):
        test_engine.history.append(np.random.normal(0, 1, 3))
    pr_high = test_engine.compute_participation_ratio()
    assert 2.0 <= pr_high <= 3.0
    
    # Fill history with 1D collapsed trajectory
    test_engine.history.clear()
    for _ in range(50):
        t = np.random.normal(0, 1)
        test_engine.history.append(np.array([t, 0.001 * t, -0.001 * t]))
    pr_low = test_engine.compute_participation_ratio()
    assert pr_low < 1.3
```

- [ ] **Step 2: Run test to verify failure**

Run: `pytest Psychology/tests/test_engine.py -v`  
Expected: FAIL (`ModuleNotFoundError: No module named 'app.core.engine'`).

- [ ] **Step 3: Implement SimulationEngine in engine.py**

Create `Psychology/app/core/engine.py`:
```python
from collections import deque
from typing import Dict, List, Optional
import numpy as np
from app.core.landscape import PotentialLandscape

class SimulationEngine:
    def __init__(
        self,
        landscape: PotentialLandscape,
        initial_state: Optional[np.ndarray] = None,
        dt: float = 0.02,
        noise_std: float = 0.08,
        history_len: int = 100
    ):
        self.landscape = landscape
        self.dt = dt
        self.noise_std = noise_std
        self.state = np.array(initial_state if initial_state is not None else [0.5, 0.5, 0.5], dtype=float)
        self.time = 0.0
        self.external_force = np.zeros(3, dtype=float)
        self.force_decay = 0.85
        self.history = deque(maxlen=history_len)
        self.history.append(self.state.copy())

    def apply_trigger(self, magnitude: float, direction: np.ndarray):
        """Apply an external sudden trigger pulse."""
        dir_norm = np.linalg.norm(direction)
        if dir_norm > 1e-6:
            unit_dir = direction / dir_norm
        else:
            unit_dir = np.array([1.0, -1.0, -1.0]) / np.sqrt(3)
        self.external_force += unit_dir * magnitude

    def apply_intervention(self, intervention_type: str, strength: float = 1.0):
        """Apply clinical intervention forces."""
        if intervention_type == "somatic":
            # Push x1 (arousal) back towards window of tolerance [-1, 1]
            pull = -4.0 * np.sign(self.state[0]) * strength
            self.external_force += np.array([pull, 0.5 * strength, 0.5 * strength])
        elif intervention_type == "social":
            # Co-regulation: soothe both arousal and valence
            self.external_force += np.array([-2.0 * np.sign(self.state[0]), 3.0, 1.5]) * strength
        elif intervention_type == "cognitive":
            # Cognitive reframing: lift toxic shame (x3) and valence (x2)
            self.external_force += np.array([0.0, 2.5, 4.0]) * strength

    def compute_participation_ratio(self) -> float:
        """Compute Participation Ratio (PR) of recent trajectory covariance."""
        if len(self.history) < 10:
            return 3.0
            
        data = np.array(self.history)  # Shape (W, 3)
        centered = data - np.mean(data, axis=0)
        cov = np.cov(centered, rowvar=False)
        
        try:
            eigenvalues = np.linalg.eigvalsh(cov)
            eigenvalues = np.maximum(eigenvalues, 1e-9)
            sum_lambda = np.sum(eigenvalues)
            sum_lambda_sq = np.sum(eigenvalues**2)
            pr = (sum_lambda**2) / sum_lambda_sq
            return float(np.clip(pr, 1.0, 3.0))
        except Exception:
            return 2.5

    def identify_active_basin(self) -> str:
        """Identify which attractor basin the current state is closest to."""
        min_dist = float('inf')
        active_name = "neutral"
        for basin in self.landscape.basins:
            dist = np.linalg.norm(self.state - basin.center)
            if dist < min_dist and dist < basin.width * 2.0:
                min_dist = dist
                active_name = basin.name
        return active_name

    def step(self) -> Dict:
        """Execute one Euler-Maruyama integration step."""
        grad = self.landscape.gradient(self.state)
        # SDE: dS = (-∇V + F_ext) dt + σ * sqrt(dt) * ξ
        noise = self.noise_std * np.sqrt(self.dt) * np.random.normal(0, 1, 3)
        ds = (-grad + self.external_force) * self.dt + noise
        
        self.state = np.clip(self.state + ds, -3.5, 3.5)
        self.time += self.dt
        self.history.append(self.state.copy())
        
        # Decay external force impulse
        self.external_force *= self.force_decay
        if np.linalg.norm(self.external_force) < 1e-4:
            self.external_force = np.zeros(3)

        energy = self.landscape.evaluate(self.state)
        pr = self.compute_participation_ratio()
        active_basin = self.identify_active_basin()
        status = "COLLAPSED" if pr < 1.3 else ("VULNERABLE" if pr < 1.8 else "EXPANDED")

        return {
            "t": round(self.time, 3),
            "state": self.state.round(4).tolist(),
            "velocity": ds.round(4).tolist(),
            "energy": round(energy, 4),
            "pr": round(pr, 3),
            "status": status,
            "active_basin": active_basin,
            "force": self.external_force.round(3).tolist()
        }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest Psychology/tests/test_engine.py -v`  
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Psychology/app/core/engine.py Psychology/tests/test_engine.py
git commit -m "feat(psychology): implement Langevin SDE solver and dimensionality gauge"
```

---

### Task 4: Presets Module

**Files:**
- Create: `Psychology/tests/test_presets.py`
- Create: `Psychology/app/core/presets.py`

- [ ] **Step 1: Write failing tests for presets**

Create `Psychology/tests/test_presets.py`:
```python
import pytest
from app.core.presets import get_preset, list_presets

def test_list_presets_contains_all_scenarios():
    presets = list_presets()
    keys = [p["id"] for p in presets]
    assert "healthy" in keys
    assert "shock_trauma" in keys
    assert "complex_trauma" in keys

def test_get_preset_loads_valid_landscape():
    landscape, initial_state = get_preset("complex_trauma")
    assert len(landscape.basins) >= 3
    basin_names = [b.name for b in landscape.basins]
    assert any("trauma" in name for name in basin_names)
    assert len(initial_state) == 3

def test_invalid_preset_raises_error():
    with pytest.raises(ValueError):
        get_preset("non_existent_preset")
```

- [ ] **Step 2: Run test to verify failure**

Run: `pytest Psychology/tests/test_presets.py -v`  
Expected: FAIL (`ModuleNotFoundError: No module named 'app.core.presets'`).

- [ ] **Step 3: Implement presets in presets.py**

Create `Psychology/app/core/presets.py`:
```python
from typing import Dict, List, Tuple
import numpy as np
from app.core.landscape import AttractorBasin, PotentialLandscape

PRESET_DEFINITIONS = [
    {
        "id": "healthy",
        "name": "Người Khỏe Mạnh (Healthy Baseline)",
        "description": "Thung lũng an toàn sâu rộng, khả năng tự điều hòa cao, dung sai thần kinh lớn.",
        "initial_state": [0.5, 0.8, 1.0],
        "basins": [
            {"name": "work", "center": [0.5, 0.5, 0.5], "depth": 4.5, "width": 1.2},
            {"name": "rest", "center": [-0.3, 1.2, 1.2], "depth": 4.0, "width": 1.3},
            {"name": "minor_stress", "center": [1.5, -0.8, 0.2], "depth": 2.0, "width": 0.8}
        ]
    },
    {
        "id": "shock_trauma",
        "name": "Sang Chấn Cấp Tính (Shock Trauma)",
        "description": "Hệ thần kinh bị sốc xung lực mạnh trên trục Arousal, nhưng nhận thức bản thể (Self) chưa biến dạng toàn diện.",
        "initial_state": [2.2, -1.5, 0.2],
        "basins": [
            {"name": "work", "center": [0.5, 0.5, 0.5], "depth": 2.5, "width": 1.0},
            {"name": "rest", "center": [-0.2, 1.0, 1.0], "depth": 2.0, "width": 1.0},
            {"name": "shock_trauma", "center": [2.4, -1.8, 0.0], "depth": 6.0, "width": 0.6}
        ]
    },
    {
        "id": "complex_trauma",
        "name": "Sang Chấn Phức Hợp (Complex Trauma / C-PTSD)",
        "description": "Đứa trẻ lớn lên trong bạo hành lời nói trường diễn; hố Toxic Shame cực sâu khóa chặt hệ thống vào chế độ sinh tồn.",
        "initial_state": [1.8, -2.2, -2.2],
        "basins": [
            {"name": "work", "center": [0.5, 0.5, 0.5], "depth": 1.8, "width": 0.8},
            {"name": "rest", "center": [-0.2, 0.8, 0.5], "depth": 1.5, "width": 0.8},
            {"name": "toxic_shame_hyper", "center": [2.0, -2.2, -2.2], "depth": 9.0, "width": 0.5},
            {"name": "freeze_shutdown", "center": [-2.2, -2.2, -2.0], "depth": 7.5, "width": 0.6}
        ]
    }
]

def list_presets() -> List[Dict]:
    return [
        {"id": p["id"], "name": p["name"], "description": p["description"]}
        for p in PRESET_DEFINITIONS
    ]

def get_preset(preset_id: str) -> Tuple[PotentialLandscape, np.ndarray]:
    for p in PRESET_DEFINITIONS:
        if p["id"] == preset_id:
            basins = [
                AttractorBasin(
                    name=b["name"],
                    center=np.array(b["center"], dtype=float),
                    depth=b["depth"],
                    width=b["width"]
                )
                for b in p["basins"]
            ]
            landscape = PotentialLandscape(k_conf=0.05, basins=basins)
            return landscape, np.array(p["initial_state"], dtype=float)
            
    raise ValueError(f"Unknown preset ID: {preset_id}")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest Psychology/tests/test_presets.py -v`  
Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Psychology/app/core/presets.py Psychology/tests/test_presets.py
git commit -m "feat(psychology): implement clinical presets configuration"
```

---

### Task 5: FastAPI Backend & API/WebSocket Routes

**Files:**
- Create: `Psychology/tests/test_api.py`
- Create: `Psychology/app/main.py`

- [ ] **Step 1: Write failing tests for API endpoints**

Create `Psychology/tests/test_api.py`:
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_get_presets(client):
    res = client.get("/api/presets")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3
    assert any(p["id"] == "healthy" for p in data)

def test_select_preset(client):
    res = client.post("/api/preset/complex_trauma")
    assert res.status_code == 200
    assert res.json()["active_preset"] == "complex_trauma"

def test_get_landscape_mesh(client):
    res = client.get("/api/landscape-mesh?grid_size=15")
    assert res.status_code == 200
    data = res.json()
    assert "x" in data and "y" in data and "z" in data
    assert len(data["x"]) == 15

def test_trigger_endpoint(client):
    res = client.post("/api/trigger", json={"magnitude": 5.0, "direction": [1.0, -1.0, -1.0]})
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_intervention_endpoint(client):
    res = client.post("/api/intervene", json={"type": "somatic", "strength": 1.5})
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
```

- [ ] **Step 2: Run test to verify failure**

Run: `pytest Psychology/tests/test_api.py -v`  
Expected: FAIL (`ModuleNotFoundError: No module named 'app.main'`).

- [ ] **Step 3: Implement main.py**

Create `Psychology/app/main.py`:
```python
import asyncio
import os
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.core.engine import SimulationEngine
from app.core.presets import get_preset, list_presets

app = FastAPI(title="Psychological Trauma Dynamics Simulation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global simulation state
active_preset_id = "complex_trauma"
landscape, initial_state = get_preset(active_preset_id)
engine = SimulationEngine(landscape=landscape, initial_state=initial_state, dt=0.02, noise_std=0.08)

class TriggerRequest(BaseModel):
    magnitude: float = 6.0
    direction: Optional[List[float]] = [1.0, -1.0, -1.0]

class InterventionRequest(BaseModel):
    type: str  # 'somatic', 'social', 'cognitive'
    strength: float = 1.0

class ConfigRequest(BaseModel):
    noise_std: Optional[float] = None
    trauma_depth: Optional[float] = None

@app.get("/api/presets")
def api_list_presets():
    return list_presets()

@app.post("/api/preset/{preset_id}")
def api_set_preset(preset_id: str):
    global active_preset_id, landscape, engine
    try:
        landscape, initial_state = get_preset(preset_id)
        active_preset_id = preset_id
        engine = SimulationEngine(landscape=landscape, initial_state=initial_state, dt=0.02, noise_std=0.08)
        return {"status": "ok", "active_preset": preset_id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/landscape-mesh")
def api_landscape_mesh(grid_size: int = 40):
    x, y, z = engine.landscape.generate_mesh(grid_size=grid_size, bounds=(-3.0, 3.0), slice_x3=engine.state[2])
    return {
        "x": x.tolist(),
        "y": y.tolist(),
        "z": z.tolist(),
        "slice_x3": float(engine.state[2])
    }

@app.post("/api/trigger")
def api_trigger(req: TriggerRequest):
    import numpy as np
    dir_arr = np.array(req.direction, dtype=float) if req.direction else np.array([1.0, -1.0, -1.0])
    engine.apply_trigger(magnitude=req.magnitude, direction=dir_arr)
    return {"status": "ok"}

@app.post("/api/intervene")
def api_intervene(req: InterventionRequest):
    if req.type not in ["somatic", "social", "cognitive"]:
        raise HTTPException(status_code=400, detail="Invalid intervention type")
    engine.apply_intervention(intervention_type=req.type, strength=req.strength)
    return {"status": "ok"}

@app.post("/api/config")
def api_config(req: ConfigRequest):
    if req.noise_std is not None:
        engine.noise_std = float(req.noise_std)
    if req.trauma_depth is not None:
        for basin in engine.landscape.basins:
            if "trauma" in basin.name or "shame" in basin.name:
                basin.depth = float(req.trauma_depth)
    return {"status": "ok", "noise_std": engine.noise_std}

@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            packet = engine.step()
            await websocket.send_json(packet)
            await asyncio.sleep(0.02)  # ~50 FPS
    except WebSocketDisconnect:
        pass

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest Psychology/tests/test_api.py -v`  
Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Psychology/app/main.py Psychology/tests/test_api.py
git commit -m "feat(psychology): implement FastAPI REST endpoints and WebSocket stream"
```

---

### Task 6: Modern Web HUD & Canvas Charts

**Files:**
- Create: `Psychology/app/static/css/style.css`
- Create: `Psychology/app/static/js/charts.js`

- [ ] **Step 1: Create style.css**

Create `Psychology/app/static/css/style.css` with sleek dark-mode, glassmorphism, responsive grid layout, status indicators, and clean typography.

- [ ] **Step 2: Create charts.js**

Create `Psychology/app/static/js/charts.js` implementing:
- 2D Canvas real-time scrolling charts for $x_1(t), x_2(t), x_3(t)$.
- Visual reference horizon for Window of Tolerance $[-1, 1]$ on $x_1$.
- Circular / Progress Dimensionality Gauge displaying $\text{PR} \in [1.0, 3.0]$ with active state coloring (Green for expanded, Red pulsating for collapsed).

- [ ] **Step 3: Commit**

```bash
git add Psychology/app/static/css/style.css Psychology/app/static/js/charts.js
git commit -m "feat(psychology): add responsive dark-mode styling and canvas telemetry charts"
```

---

### Task 7: Three.js 3D Attractor Surface & Orb

**Files:**
- Create: `Psychology/app/static/js/scene3d.js`

- [ ] **Step 1: Implement scene3d.js**

Create `Psychology/app/static/js/scene3d.js` with:
- Three.js WebGL Renderer, PerspectiveCamera, OrbitControls.
- Attractor Landscape Surface Mesh: reconstructed from `z = V(x, y)` grid with custom height-based vertex coloring / colormap (cyan valleys to crimson trauma abyss).
- State Sphere $\vec{S}(t)$: glowing sphere with dynamic point light.
- Trajectory Ribbon / BufferGeometry: storing last 150 points to visually show dimensional collapse into 1D line vs 3D exploration.
- 3D ArrowHelpers for external forces (Red for trigger, Green for intervention).
- Smooth interpolation (`lerp`) for 60fps rendering.

- [ ] **Step 2: Commit**

```bash
git add Psychology/app/static/js/scene3d.js
git commit -m "feat(psychology): implement 3D attractor surface mesh and trajectory ribbon"
```

---

### Task 8: App Orchestration & Interactive Controls

**Files:**
- Create: `Psychology/app/static/js/app.js`
- Create: `Psychology/app/static/index.html`

- [ ] **Step 1: Implement app.js**

Create `Psychology/app/static/js/app.js`:
- WebSocket connection management with exponential auto-reconnect.
- Mesh loader via `GET /api/landscape-mesh` whenever preset changes.
- Event listeners for Preset Buttons (`healthy`, `shock_trauma`, `complex_trauma`).
- Trigger Pulse Dispatcher (`POST /api/trigger`).
- Intervention Dispatcher (`POST /api/intervene`).
- Sliders for noise and trauma depth (`POST /api/config`).

- [ ] **Step 2: Implement index.html**

Create `Psychology/app/static/index.html`:
- Import Three.js and OrbitControls via CDN.
- Layout: 3D Viewport container, Telemetry HUD overlay, and Sidebar Controls.
- Include all controls defined in the design spec.

- [ ] **Step 3: Commit**

```bash
git add Psychology/app/static/js/app.js Psychology/app/static/index.html
git commit -m "feat(psychology): build interactive control panel and full frontend orchestration"
```

---

### Task 9: End-to-End Verification & Verification Run

**Files:**
- Verification only

- [ ] **Step 1: Run complete test suite**

Run: `python -m pytest Psychology/tests -v`  
Expected: All tests in `test_landscape.py`, `test_engine.py`, `test_presets.py`, and `test_api.py` PASS.

- [ ] **Step 2: Launch server and verify HTTP response**

Run: `python Psychology/run.py` (or test with httpx/curl in test script).  
Verify `http://127.0.0.1:8000/` loads index.html with 200 OK.

- [ ] **Step 3: Final Commit**

```bash
git add .
git commit -m "feat(psychology): complete end-to-end psychological trauma simulation"
```
