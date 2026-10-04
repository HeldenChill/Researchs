# Kế Hoạch Triển Khai: Hệ Sinh Thái Tự Trị Bước Rời Rạc (Zero-Player Discrete Sandbox)

> **Dành cho agentic workers:** YÊU CẦU SUB-SKILL: Sử dụng `superpowers:subagent-driven-development` (khuyên dùng) hoặc `superpowers:executing-plans` để triển khai từng task theo thứ tự. Các bước sử dụng cú pháp checkbox (`- [ ]`) để theo dõi tiến độ.

**Mục tiêu:** Xây dựng một Hệ Sinh Thái Tự Trị (Zero-Player Sandbox) hoạt động theo Dòng Thời Gian Bước Rời Rạc (Discrete Simulation Steps) trên Unity Grid của `Forest_Bloom`, vận hành trọn vẹn Tam Giác Không Gian $(\mathcal{E} \leftrightarrow \mathcal{M} \leftrightarrow \mathcal{A})$ và kiểm chứng trạng thái cân bằng nội môi Ecological Smoke Test 50 Steps trước khi bổ sung bất kỳ can thiệp nào của người chơi.

**Kiến trúc:** Chu trình 4 Pha mỗi Step:
1. *Pha 1 (Sensing):* $\hat{\mathcal{O}}_{\text{sense}}: \mathcal{E} \times \mathcal{M} \to \Delta \mathcal{M}$ (Chuyển hóa Thổ nhưỡng $\to$ Tọa độ tâm lý).
2. *Pha 2 (Actuation & Phase Shift):* $\hat{\mathcal{O}}_{\text{act}}: \mathcal{M} \to \mathcal{A}$ + Tích lũy $\mathcal{H}_{\text{load}}$ (Điều biến van năng lực & chuyển pha).
3. *Pha 3 (Coupling & Warfare):* Mạng rễ Co-regulation + Cỏ Quỷ cắn xé đất.
4. *Pha 4 (World Impact & Cellular Diffusion):* $\hat{\mathcal{O}}_{\text{impact}}: \mathcal{A} \to \Delta \mathcal{E}$ + Khuếch tán thổ nhưỡng lân cận.

**Tech Stack:** Unity 2022+ / C# (.NET Standard 2.1), UnityMCP Bridge, DOTween, TextMeshPro, Grid System hiện hữu (`SCell`, `SCellData`, `PlantUnit`, `GrassUnit`).

---

## Bản Đồ Cấu Trúc File & Trách Nhiệm

```
G:/Unity/Project/Forest_Bloom/Assets/_Game/_Scripts/_Game/
├── Core/
│   ├── PsychologicalState.cs          // [TẠO MỚI] Struct 24B blittable: S = (A, V | C, W, D, Ex)
│   ├── AffordanceVector.cs            // [TẠO MỚI] Struct năng lực: A = (Emit, Absorb, Bridge, Barrier)
│   └── DiscreteSimulationEngine.cs    // [TẠO MỚI] Bộ điều phối vòng lặp 4 Pha mỗi Step (Step, Play/Pause)
├── Environment/
│   └── SoilProfile.cs                 // [TẠO MỚI] Struct thổ nhưỡng: Moisture, Fertility, BlightToxicity, Thermal
├── Operators/
│   ├── SenseAppraisalOperator.cs      // [TẠO MỚI] Toán tử O_sense: E x M -> Delta M
│   ├── ActuationOperator.cs           // [TẠO MỚI] Toán tử O_act: M -> A
│   └── WorldImpactOperator.cs         // [TẠO MỚI] Toán tử O_impact: A -> Delta E
├── SandboxUI/
│   └── SimulationDashboard.cs         // [TẠO MỚI] Canvas UI quan sát (Step +1, Play/Pause, Slider, Metrics)
├── Grid/
│   ├── SCell.cs                       // [CHỈNH SỬA] Bổ sung hàm tính khuếch tán thổ nhưỡng & truyền rễ
│   └── SCellData.cs                   // [CHỈNH SỬA] Nhúng SoilProfile vào SCellData
├── Unit/
│   ├── PlantUnit.cs                   // [CHỈNH SỬA] Nhúng PsychologicalState, AffordanceVector & Chuyển Pha
│   └── GrassUnit.cs                   // [CHỈNH SỬA] Nâng cấp thành Cỏ Quỷ ký sinh (BlightUnit logic)
└── Manager/
    └── GameplayManager.cs             // [CHỈNH SỬA] Vô hiệu hóa Player Raycast Click, kết nối SimulationEngine
```

---

## Chi Tiết Các Tác Vụ Triển Khai (Bite-Sized Tasks)

> **Trạng thái hiệu chỉnh 2026-10-04:** Các checkbox cũ là tuyên bố chưa có log/commit nguồn trong workspace này; đã đặt lại thành chưa xác minh. Code dưới đây là ví dụ tham chiếu được sửa, không chứng minh Unity project bên ngoài đã cập nhật. Không cam kết Zero GC Alloc: danh sách/map và API hàng xóm cần đo allocation trong Unity. Adapter vòng đời bắt buộc nối API spawn/remove/pool/reset hiện hữu; dùng thứ tự cell cố định để giải quyết tranh chấp. Nếu thiếu adapter, không chạy nghiệm thu. Mutation kiểu hình/frontline chart chưa triển khai; tải hao mòn đã định nghĩa nhưng không được gọi là bằng chứng bifurcation.

### Task 1: Cấu Trúc Dữ Liệu Nền Tảng (`PsychologicalState`, `AffordanceVector`, `SoilProfile`)

**Mục tiêu:** Tạo các struct dữ liệu nền tảng cho Tam Giác Không Gian $(\mathcal{E} \leftrightarrow \mathcal{M} \leftrightarrow \mathcal{A})$ với chi phí cấp phát bộ nhớ rác bằng 0 (Zero GC Alloc).

**Files:**
- Tạo mới: `Assets/_Game/_Scripts/_Game/Core/PsychologicalState.cs`
- Tạo mới: `Assets/_Game/_Scripts/_Game/Core/AffordanceVector.cs`
- Tạo mới: `Assets/_Game/_Scripts/_Game/Environment/SoilProfile.cs`
- Chỉnh sửa: `Assets/_Game/_Scripts/_Game/Grid/SCellData.cs`

- [ ] **Bước 1: Viết `PsychologicalState.cs`**
  Tạo file `Assets/_Game/_Scripts/_Game/Core/PsychologicalState.cs` với nội dung struct blittable 24 bytes:
```csharp
using System;
using UnityEngine;

namespace _Game
{
    [Serializable]
    public struct PsychologicalState
    {
        // Tầng 1: Base block (cập nhật mỗi discrete step, không gán 10Hz)
        public float A_phys;  // [0.0, 1.0] Mức độ kích hoạt chuyển hóa (nhựa sôi)
        public float V_bio;   // [-1.0, 1.0] Cảm thức an toàn sinh thái (-1: hoảng loạn, +1: an toàn)

        // Tầng 2: Fiber block (cập nhật cùng discrete step trong bản tham chiếu)
        public float C_cog;   // [0.0, 1.0] Dung lượng ổn định nội môi
        public float W_warmth;// [-1.0, 1.0] Vị tha / Kết nối rễ (+1: chia sẻ, -1: ích kỷ)
        public float D_dom;   // [-1.0, 1.0] Thống trị / Ưu thế (+1: đè bẹp, -1: nhường nhịn)
        public float Ex_seek; // [0.0, 1.0] Động lực tầm soát đâm chồi chiếm đất

        public static PsychologicalState CreateDefaultFlora()
        {
            return new PsychologicalState
            {
                A_phys = 0.2f,
                V_bio = 0.5f,
                C_cog = 0.8f,
                W_warmth = 0.5f,
                D_dom = 0.2f,
                Ex_seek = 0.4f
            };
        }

        public static PsychologicalState CreateDefaultBlight()
        {
            return new PsychologicalState
            {
                A_phys = 0.6f,
                V_bio = 0.2f,
                C_cog = 0.9f,
                W_warmth = -1.0f, // Tuyệt đối không vị tha
                D_dom = 1.0f,     // Thống trị xâm lấn cực đại
                Ex_seek = 0.9f    // Luôn tìm đất mới
            };
        }

        public void ClampAll()
        {
            A_phys = Mathf.Clamp01(A_phys);
            V_bio = Mathf.Clamp(V_bio, -1f, 1f);
            C_cog = Mathf.Clamp01(C_cog);
            W_warmth = Mathf.Clamp(W_warmth, -1f, 1f);
            D_dom = Mathf.Clamp(D_dom, -1f, 1f);
            Ex_seek = Mathf.Clamp01(Ex_seek);
        }
    }
}
```

- [ ] **Bước 2: Viết `AffordanceVector.cs`**
  Tạo file `Assets/_Game/_Scripts/_Game/Core/AffordanceVector.cs`:
```csharp
using System;
using UnityEngine;

namespace _Game
{
    [Serializable]
    public struct AffordanceVector
    {
        // Năng lực Phóng thích (Phi_emit)
        public float EmitWater;      // Xả nước làm mát đất
        public float EmitHeat;       // Tỏa nhiệt đốt cháy
        public float EmitTox;        // Tiết độc tố Blight
        public float EmitSpore;      // Bắn bào tử sinh sản

        // Năng lực Hấp thụ (Phi_absorb)
        public float AbsorbWater;    // Hút nước từ đất
        public float AbsorbNutrient; // Hút mùn hữu cơ
        public float AbsorbTox;      // Hút lọc độc tố

        // Năng lực Mạng rễ & Cấu trúc
        public float BridgeStrength; // [0.0, 1.0] Mở van truyền dẫn rễ
        public float BarrierHardness;// [0.0, 1.0] Gai nhọn & Vỏ giáp cản cỏ
    }
}
```

- [ ] **Bước 3: Viết `SoilProfile.cs`**
  Tạo file `Assets/_Game/_Scripts/_Game/Environment/SoilProfile.cs`:
```csharp
using System;
using UnityEngine;

namespace _Game
{
    [Serializable]
    public struct SoilProfile
    {
        public float Moisture;         // [0.0, 1.0] Độ ẩm đất
        public float Fertility;        // [0.0, 1.0] Dinh dưỡng mùn hữu cơ
        public float BlightToxicity;   // [0.0, 1.0] Độc tố Cỏ Quỷ
        public float Thermal;          // [-1.0, 1.0] Nhiệt độ đất
        public bool IsLeylineNode;      // Nằm trên Mạch Năng Lượng Rừng Ngầm

        public static SoilProfile DefaultWet()
        {
            return new SoilProfile { Moisture = 0.8f, Fertility = 0.5f, BlightToxicity = 0f, Thermal = 0.2f, IsLeylineNode = false };
        }

        public static SoilProfile DefaultDry()
        {
            return new SoilProfile { Moisture = 0.1f, Fertility = 0.3f, BlightToxicity = 0f, Thermal = 0.5f, IsLeylineNode = false };
        }

        public void ClampAll()
        {
            Moisture = Mathf.Clamp01(Moisture);
            Fertility = Mathf.Clamp01(Fertility);
            BlightToxicity = Mathf.Clamp01(BlightToxicity);
            Thermal = Mathf.Clamp(Thermal, -1f, 1f);
        }
    }
}
```

- [ ] **Bước 4: Nhúng `SoilProfile` vào `SCellData.cs`**
  Chỉnh sửa `Assets/_Game/_Scripts/_Game/Grid/SCellData.cs` để thêm trường `SoilProfile`:
```csharp
using UnityEngine;

namespace _Game
{
    public class SCellData 
    {
        protected SurfaceUnit surfaceUnit;
        protected PlantUnit plantUnit;
        public SoilProfile Soil = SoilProfile.DefaultWet();

        public SurfaceUnit SurfaceUnit
        {
            get => surfaceUnit;
            set => surfaceUnit = value;
        }
        public PlantUnit PlantUnit
        {
            get => plantUnit;
            set
            {
                plantUnit = value;
                SurfaceUnit?.SetDebugText(plantUnit ? plantUnit.Type.ToString() : "");
            }
        }
    }
}
```

- [ ] **Bước 5: Kiểm tra biên dịch qua UnityMCP**
  Gọi tool `read_console` kiểm tra lỗi compile: không có lỗi cú pháp.

- [ ] **Bước 6: Commit code Task 1**
  Commit message: `feat(core): add PsychologicalState, AffordanceVector, and SoilProfile structs`

---

### Task 2: Cài Đặt Bộ Ba Toán Tử Tương Tác (`SenseAppraisal`, `Actuation`, `WorldImpact`)

**Mục tiêu:** Hiện thực hóa các phương trình toán tử biến đổi giữa $\mathcal{E}$, $\mathcal{M}$ và $\mathcal{A}$.

**Files:**
- Tạo mới: `Assets/_Game/_Scripts/_Game/Operators/SenseAppraisalOperator.cs`
- Tạo mới: `Assets/_Game/_Scripts/_Game/Operators/ActuationOperator.cs`
- Tạo mới: `Assets/_Game/_Scripts/_Game/Operators/WorldImpactOperator.cs`

- [ ] **Bước 1: Viết `SenseAppraisalOperator.cs` (Toán tử $\hat{\mathcal{O}}_{\text{sense}}$)**
```csharp
using UnityEngine;

namespace _Game
{
    public static class SenseAppraisalOperator
    {
        // O_sense: (E_soil, M_current) -> Delta M
        public static void ApplyAppraisal(ref PsychologicalState state, in SoilProfile soil, float dt = 1.0f)
        {
            // 1. Phản ứng với Độ ẩm (Moisture): Thiếu ẩm gây stress tụt V_bio
            if (soil.Moisture < 0.25f)
            {
                float droughtSeverity = (0.25f - soil.Moisture) / 0.25f;
                state.V_bio -= droughtSeverity * 0.3f * dt;
                state.A_phys += droughtSeverity * 0.2f * dt;
            }
            else if (soil.Moisture > 0.5f)
            {
                state.V_bio += 0.15f * dt;
            }

            // 2. Phản ứng với Độc tố BlightToxicity
            if (soil.BlightToxicity > 0.1f)
            {
                state.V_bio -= soil.BlightToxicity * 0.4f * dt;
                state.C_cog -= soil.BlightToxicity * 0.2f * dt; // Độc tố làm mòn nhận thức
            }

            // 3. Phản ứng với Nhiệt độ (Thermal)
            if (soil.Thermal > 0.6f && soil.Moisture < 0.3f)
            {
                state.A_phys += 0.3f * dt; // Sốc nhiệt
                state.V_bio -= 0.2f * dt;
            }

            // Recovery is absent under toxin exposure; drought alone cannot restore C.
            if (soil.BlightToxicity <= 0.1f && soil.Moisture > 0.5f)
            {
                state.C_cog += 0.05f * (1f - state.C_cog) * dt;
                state.A_phys += (0.2f - state.A_phys) * 0.1f * dt;
            }
            state.ClampAll();
        }
    }
}
```

- [ ] **Bước 2: Viết `ActuationOperator.cs` (Toán tử $\hat{\mathcal{O}}_{\text{act}}$)**
```csharp
using UnityEngine;

namespace _Game
{
    public static class ActuationOperator
    {
        // Wilt suppresses all capacities; phase must be evaluated first.
        // O_act: (M_state, PlantType) -> AffordanceVector
        public static AffordanceVector ComputeAffordances(in PsychologicalState state, PLANT_TYPE type)
        {
            AffordanceVector aff = new AffordanceVector();
            if (state.C_cog < 0.2f) return aff;

            // 1. Năng lực Mạng Rễ: Đóng van khi V_bio hoảng loạn (< -0.4)
            if (state.V_bio > -0.4f)
            {
                aff.BridgeStrength = Mathf.Clamp01(state.W_warmth * Mathf.Max(0.1f, state.V_bio));
            }
            else
            {
                aff.BridgeStrength = 0f; // Tự đóng van bảo toàn mạng sống
            }

            // 2. Năng lực Rào Cản / Gai: Tăng cao khi gặp nguy hiểm
            aff.BarrierHardness = Mathf.Clamp01(0.2f + (state.V_bio < 0 ? -state.V_bio * 0.6f : 0f));

            // 3. Chuyên hóa theo Type
            switch (type)
            {
                case PLANT_TYPE.GREEN: // Chuyên hút dinh dưỡng & mở rộng
                    aff.AbsorbNutrient = 0.3f;
                    aff.EmitSpore = 0.15f * state.Ex_seek;
                    aff.AbsorbWater = 0.15f;
                    aff.EmitWater = 0.05f;
                    break;
                case PLANT_TYPE.RED:   // Chuyên phát nhiệt thiêu đốt
                    aff.EmitHeat = state.A_phys > 0.5f ? 0.4f * Mathf.Max(0f, state.D_dom) : 0.1f;
                    aff.AbsorbWater = 0.2f;
                    break;
                case PLANT_TYPE.BLUE:  // Chuyên xả nước làm mát
                    aff.EmitWater = 0.35f * state.C_cog;
                    aff.AbsorbWater = 0.05f;
                    break;
                case PLANT_TYPE.YELLOW:// Chuyên mỏ neo rễ
                    aff.BridgeStrength = Mathf.Max(aff.BridgeStrength, 0.8f);
                    aff.AbsorbNutrient = 0.1f;
                    break;
                case PLANT_TYPE.PURPLE:// Chuyên hấp thụ và giải độc
                    aff.AbsorbTox = 0.35f;
                    aff.EmitSpore = 0.2f;
                    break;
                case PLANT_TYPE.GRASS: // Cỏ Quỷ Ký Sinh
                    aff.AbsorbWater = 0.35f;
                    aff.EmitTox = 0.25f;
                    aff.EmitSpore = state.Ex_seek * 0.3f;
                    aff.BridgeStrength = 0f; // Không chia sẻ rễ
                    aff.BarrierHardness = 0.1f;
                    break;
            }

            if (state.V_bio <= -0.4f) aff.BridgeStrength = 0f;
            return aff;
        }
    }
}
```

- [ ] **Bước 3: Viết `WorldImpactOperator.cs` (Toán tử $\hat{\mathcal{O}}_{\text{impact}}$)**
```csharp
using UnityEngine;

namespace _Game
{
    public static class WorldImpactOperator
    {
        // O_impact: AffordanceVector -> Delta SoilProfile
        public static void ApplyImpact(in AffordanceVector aff, ref SoilProfile soil, float dt = 1.0f)
        {
            // Cân bằng nước: Xả - Hút - Bốc hơi tự nhiên
            float deltaMoisture = (aff.EmitWater - aff.AbsorbWater - 0.02f) * dt;
            soil.Moisture += deltaMoisture;

            // Cân bằng độc tố: Tiết độc - Hút giải độc
            float deltaTox = (aff.EmitTox - aff.AbsorbTox) * dt;
            soil.BlightToxicity += deltaTox;

            // Cân bằng nhiệt
            soil.Thermal += (aff.EmitHeat - 0.05f) * dt;

            // Mùn hữu cơ tiêu hao
            soil.Fertility -= aff.AbsorbNutrient * 0.05f * dt;

            soil.ClampAll();
        }
    }
}
```

- [ ] **Bước 4: Kiểm tra biên dịch qua UnityMCP**
  Xác nhận `read_console` không báo lỗi.

- [ ] **Bước 5: Commit code Task 2**
  Commit message: `feat(operators): implement SenseAppraisal, Actuation, and WorldImpact operators`

---

### Task 3: Chuyển Pha Trạng Thái & Nâng Cấp Thực Thể (`PlantUnit` & `GrassUnit`)

**Mục tiêu:** Tích hợp `PsychologicalState`, `AffordanceVector` và logic 3 Pha Động Học (`HOMEOSTATIC`, `STRESS`, `WILT`) vào `PlantUnit` và `GrassUnit`.

**Files:**
- Chỉnh sửa: `Assets/_Game/_Scripts/_Game/Unit/PlantUnit.cs`
- Chỉnh sửa: `Assets/_Game/_Scripts/_Game/Unit/GrassUnit.cs`

- [ ] **Bước 1: Bổ sung trường và phương thức Chuyển Pha vào `PlantUnit.cs`**
  Thêm enum và các biến:
```csharp
public enum ATTRACTOR_PHASE { HOMEOSTATIC, STRESS, WILT }

// Trong PlantUnit.cs:
public PsychologicalState PsychState;
public AffordanceVector Affordance;
public ATTRACTOR_PHASE CurrentPhase = ATTRACTOR_PHASE.HOMEOSTATIC;
public float AllostaticLoad = 0f;
public int ConsecutiveWiltSteps = 0;

public virtual void EvaluatePhaseShift()
{
    if (PsychState.C_cog < 0.2f)
    {
        CurrentPhase = ATTRACTOR_PHASE.WILT;
    }
    else if (PsychState.V_bio < -0.3f)
    {
        CurrentPhase = ATTRACTOR_PHASE.STRESS;
    }
    else
    {
        CurrentPhase = ATTRACTOR_PHASE.HOMEOSTATIC;
    }
}
```

- [ ] **Bước 2: Cập nhật khởi tạo trong `PlantUnit.OnInit()`**
  Gán `PsychState = PsychologicalState.CreateDefaultFlora();`, `AllostaticLoad = 0`, `ConsecutiveWiltSteps = 0` khi cây xuất hiện hoặc được lấy lại từ pool.

- [ ] **Bước 3: Nâng cấp `GrassUnit.cs` thành Cỏ Quỷ Ký Sinh**
  Chỉnh sửa `GrassUnit.cs` để khi khởi tạo gán `PsychState = PsychologicalState.CreateDefaultBlight();` và type là `PLANT_TYPE.GRASS`.

- [ ] **Bước 4: Kiểm tra biên dịch qua UnityMCP**
  Xác nhận `read_console` không báo lỗi.

- [ ] **Bước 5: Commit code Task 3**
  Commit message: `feat(units): attach PsychologicalState and phase transitions to PlantUnit and GrassUnit`

---

### Task 4: Bộ Điều Phối Dòng Thời Gian Bước Rời Rạc (`DiscreteSimulationEngine.cs`)

**Mục tiêu:** Xây dựng cỗ máy tiến hóa hệ sinh thái theo từng Step độc lập với 4 Pha tuần tự, và vô hiệu hóa tạm thời Player Input trong `GameplayManager`.

**Files:**
- Tạo mới: `Assets/_Game/_Scripts/_Game/Core/DiscreteSimulationEngine.cs`
- Chỉnh sửa: `Assets/_Game/_Scripts/_Game/Manager/GameplayManager.cs`

- [ ] **Bước 1: Viết `DiscreteSimulationEngine.cs`**
```csharp
using System;
using System.Collections.Generic;
using UnityEngine;

namespace _Game
{
    public class DiscreteSimulationEngine : MonoBehaviour
    {
        public static DiscreteSimulationEngine Instance { get; private set; }
        public int CurrentStep { get; private set; }
        public bool IsAutoRunning { get; set; }
        public float StepInterval { get; set; } = 0.5f;
        public event Action StepCompleted;
        // Required scene adapter: bind existing spawning/pooling/removal APIs.
        public Action<SCell> RemovePlant;
        public Action<SCell, PLANT_TYPE> SpawnPlant;
        public Action RestoreInitialScene;
        public bool LifecycleBound => RemovePlant != null && SpawnPlant != null && RestoreInitialScene != null;
        private float timer;
        private List<SCell> cells = new List<SCell>();
        private Dictionary<SCell, int> index = new Dictionary<SCell, int>();
        private float[] sensedV, coupledV;
        private SoilProfile[] impacted, diffused;
        private List<int> deaths = new List<int>();
        private SortedDictionary<int, PLANT_TYPE> births = new SortedDictionary<int, PLANT_TYPE>();
        private void Awake() { Instance = this; }
        private void OnDestroy() { if (Instance == this) Instance = null; }
        public void Initialize(SGrid grid, List<SCell> allCells)
        {
            cells = new List<SCell>(allCells);
            index.Clear();
            for (int i = 0; i < cells.Count; i++) index.Add(cells[i], i);
            foreach (var cell in cells)
            {
                var neighbors = cell.GetCrossAroundCell();
                var unique = new HashSet<SCell>();
                if (neighbors.Count > 4) throw new ArgumentException("Grid degree must be at most four");
                foreach (var neighbor in neighbors)
                    if (neighbor == cell || !index.ContainsKey(neighbor) || !unique.Add(neighbor) ||
                        !neighbor.GetCrossAroundCell().Contains(cell))
                        throw new ArgumentException("Grid neighbors must be unique, present and symmetric");
            }
            sensedV = new float[cells.Count]; coupledV = new float[cells.Count];
            impacted = new SoilProfile[cells.Count]; diffused = new SoilProfile[cells.Count];
            CurrentStep = 0; timer = 0; IsAutoRunning = false;
        }
        private void Update()
        {
            if (!IsAutoRunning) return;
            if (float.IsNaN(StepInterval) || float.IsInfinity(StepInterval) || StepInterval <= 0)
                throw new InvalidOperationException("StepInterval must be finite and positive");
            timer += Time.deltaTime;
            if (timer >= StepInterval) { timer -= StepInterval; ExecuteStep(); }
        }
        public void ResetSimulation()
        {
            if (RestoreInitialScene == null) throw new InvalidOperationException("Reset scene adapter is required");
            IsAutoRunning = false; RestoreInitialScene(); CurrentStep = 0; timer = 0; StepCompleted?.Invoke();
        }
        [ContextMenu("Execute Single Step")]
        public void ExecuteStep()
        {
            if (!LifecycleBound) throw new InvalidOperationException("Bind spawn/remove/reset adapters before stepping");
            deaths.Clear(); births.Clear();
            // 1. Sense from previous soil; 2. evaluate phase before computing actions.
            for (int i = 0; i < cells.Count; i++)
            {
                var plant = cells[i].Data.PlantUnit;
                if (plant == null) continue;
                SenseAppraisalOperator.ApplyAppraisal(ref plant.PsychState, cells[i].Data.Soil);
                plant.EvaluatePhaseShift();
                plant.AllostaticLoad = Mathf.Max(0f, plant.AllostaticLoad +
                    Mathf.Max(0f, -plant.PsychState.V_bio) * plant.PsychState.A_phys - 0.05f * plant.PsychState.C_cog);
                plant.ConsecutiveWiltSteps = plant.CurrentPhase == ATTRACTOR_PHASE.WILT ? plant.ConsecutiveWiltSteps + 1 : 0;
                if (plant.ConsecutiveWiltSteps >= 5) deaths.Add(i);
                plant.Affordance = ActuationOperator.ComputeAffordances(plant.PsychState, plant.Type);
                sensedV[i] = coupledV[i] = plant.PsychState.V_bio;
            }
            // 3. Read frozen states; sum edge effects before committing.
            for (int i = 0; i < cells.Count; i++)
            {
                var plant = cells[i].Data.PlantUnit;
                if (plant == null || plant.Type == PLANT_TYPE.GRASS || plant.CurrentPhase == ATTRACTOR_PHASE.WILT) continue;
                foreach (var neighbor in cells[i].GetCrossAroundCell())
                {
                    int j; if (!index.TryGetValue(neighbor, out j)) continue;
                    var other = neighbor.Data.PlantUnit; if (other == null) continue;
                    if (other.Type == PLANT_TYPE.GRASS) coupledV[i] -= 0.15f * other.Affordance.AbsorbWater;
                    else coupledV[i] += (sensedV[j] - sensedV[i]) * 0.2f * plant.Affordance.BridgeStrength * other.Affordance.BridgeStrength;
                }
            }
            for (int i = 0; i < cells.Count; i++)
            {
                var plant = cells[i].Data.PlantUnit;
                if (plant != null) { plant.PsychState.V_bio = Mathf.Clamp(coupledV[i], -1f, 1f); plant.EvaluatePhaseShift(); }
                impacted[i] = cells[i].Data.Soil;
                if (plant != null) WorldImpactOperator.ApplyImpact(plant.Affordance, ref impacted[i]);
                else impacted[i].Moisture = Mathf.Max(0f, impacted[i].Moisture - 0.01f);
                diffused[i] = impacted[i];
            }
            // 4. Conservative symmetric edge flux. Coefficient .1 <= .25 for degree <=4.
            for (int i = 0; i < cells.Count; i++)
            foreach (var neighbor in cells[i].GetCrossAroundCell())
            {
                int j; if (!index.TryGetValue(neighbor, out j) || j <= i) continue;
                float water = 0.1f * (impacted[j].Moisture - impacted[i].Moisture);
                float toxin = 0.1f * (impacted[j].BlightToxicity - impacted[i].BlightToxicity);
                diffused[i].Moisture += water; diffused[j].Moisture -= water;
                diffused[i].BlightToxicity += toxin; diffused[j].BlightToxicity -= toxin;
            }
            for (int i = 0; i < cells.Count; i++) { diffused[i].ClampAll(); cells[i].Data.Soil = diffused[i]; }
            // Deterministic growth pulses into cells empty at start of lifecycle resolution.
            // Resolve competitors by fixed source-cell index, independent of loop scheduling.
            for (int i = 0; i < cells.Count; i++)
            {
                var plant = cells[i].Data.PlantUnit;
                if (plant == null || plant.CurrentPhase == ATTRACTOR_PHASE.WILT || plant.PsychState.V_bio < 0 ||
                    plant.Affordance.EmitSpore <= 0 || deaths.Contains(i)) continue;
                int period = Math.Max(1, (int)Math.Ceiling(1.0 / plant.Affordance.EmitSpore));
                if ((CurrentStep + 1) % period != 0) continue;
                foreach (var neighbor in cells[i].GetCrossAroundCell())
                {
                    int j; if (!index.TryGetValue(neighbor, out j) || neighbor.Data.PlantUnit != null || births.ContainsKey(j)) continue;
                    if (neighbor.Data.Soil.Moisture >= 0.25f && neighbor.Data.Soil.Fertility > 0.05f)
                        births.Add(j, plant.Type);
                }
            }
            if ((deaths.Count > 0 && RemovePlant == null) || (births.Count > 0 && SpawnPlant == null))
                throw new InvalidOperationException("Bind lifecycle scene adapter before population simulation");
            foreach (int i in deaths) RemovePlant(cells[i]);
            foreach (var birth in births) SpawnPlant(cells[birth.Key], birth.Value);
            CurrentStep++; StepCompleted?.Invoke();
        }
        public void GetMetrics(out int flora, out int blight, out int empty, out float moisture, out float safety)
        {
            flora = blight = empty = 0; moisture = safety = 0;
            foreach (var cell in cells)
            {
                moisture += cell.Data.Soil.Moisture;
                var plant = cell.Data.PlantUnit;
                if (plant == null) empty++;
                else { if (plant.Type == PLANT_TYPE.GRASS) blight++; else flora++; safety += plant.PsychState.V_bio; }
            }
            if (cells.Count > 0) moisture /= cells.Count;
            if (flora + blight > 0) safety /= flora + blight;
        }
    }
}
```

- [ ] **Bước 2: Vô hiệu hóa Raycast Input người chơi trong `GameplayManager.cs`**
  Trong `GameplayManager.cs`, thêm kiểm tra `isSimulationMode = true` để bỏ qua click/hold và gắn `DiscreteSimulationEngine`:
```csharp
// Trong GameplayManager.cs
[SerializeField] protected bool isSandboxSimulation = true;

// Trong OnRaycastClick():
if (isSandboxSimulation) return; // Vô hiệu hóa click người chơi để chạy mô phỏng tự thân
```

- [ ] **Bước 3: Khởi tạo `DiscreteSimulationEngine` trong `GameplayManager.ConstructLevel()`**
  Gắn engine vào `mapCells`.

- [ ] **Bước 4: Kiểm tra biên dịch qua UnityMCP**
  Xác nhận `read_console` không báo lỗi.

- [ ] **Bước 5: Commit code Task 4**
  Commit message: `feat(engine): implement 4-phase DiscreteSimulationEngine and disable player input`

---

### Task 5: Bảng Điều Khiển Quan Sát Mô Phỏng (`SimulationDashboard.cs`)

**Mục tiêu:** Cung cấp giao diện trực quan cho nhà phát triển để theo dõi các chỉ số sinh thái (% Flora, % Blight, Moisture, $V_{\text{bio}}$) và điều khiển nhịp Step.

**Files:**
- Tạo mới: `Assets/_Game/_Scripts/_Game/SandboxUI/SimulationDashboard.cs`

- [ ] **Bước 1: Viết `SimulationDashboard.cs`**
```csharp
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace _Game
{
    public class SimulationDashboard : MonoBehaviour
    {
        [Header("Controls")]
        [SerializeField] private Button stepButton;
        [SerializeField] private Button playPauseButton;
        [SerializeField] private Slider speedSlider;
        [SerializeField] private TextMeshProUGUI playPauseText;

        [SerializeField] private Button resetButton;
        private DiscreteSimulationEngine engine;
        [SerializeField] private TextMeshProUGUI emptyPercentText;
        [SerializeField] private TextMeshProUGUI avgSafetyText;

        [Header("Metrics")]
        [SerializeField] private TextMeshProUGUI stepCountText;
        [SerializeField] private TextMeshProUGUI floraPercentText;
        [SerializeField] private TextMeshProUGUI blightPercentText;
        [SerializeField] private TextMeshProUGUI avgMoistureText;

        private void Start()
        {
            engine = DiscreteSimulationEngine.Instance;
            if (engine == null) throw new System.InvalidOperationException("Initialize simulation before dashboard");
            engine.StepCompleted += UpdateMetricsUI;
            if (resetButton != null) resetButton.onClick.AddListener(OnResetClicked);
            UpdateMetricsUI();
            if (stepButton != null)
                stepButton.onClick.AddListener(OnStepClicked);

            if (playPauseButton != null)
                playPauseButton.onClick.AddListener(OnPlayPauseClicked);

            if (speedSlider != null)
            {
                speedSlider.minValue = 0.1f;
                speedSlider.maxValue = 2.0f;
                speedSlider.value = 0.5f;
                speedSlider.onValueChanged.AddListener(OnSpeedChanged);
            }
        }

        private void OnDestroy()
        {
            if (engine != null) engine.StepCompleted -= UpdateMetricsUI;
            if (stepButton != null) stepButton.onClick.RemoveListener(OnStepClicked);
            if (playPauseButton != null) playPauseButton.onClick.RemoveListener(OnPlayPauseClicked);
            if (speedSlider != null) speedSlider.onValueChanged.RemoveListener(OnSpeedChanged);
            if (resetButton != null) resetButton.onClick.RemoveListener(OnResetClicked);
        }
        private void OnResetClicked() { engine.ResetSimulation(); if (playPauseText != null) playPauseText.text = "AUTO PLAY"; }

        private void OnStepClicked()
        {
            DiscreteSimulationEngine.Instance?.ExecuteStep();
            UpdateMetricsUI();
        }

        private void OnPlayPauseClicked()
        {
            if (DiscreteSimulationEngine.Instance == null) return;
            bool newState = !DiscreteSimulationEngine.Instance.IsAutoRunning;
            DiscreteSimulationEngine.Instance.IsAutoRunning = newState;
            if (playPauseText != null)
                playPauseText.text = newState ? "PAUSE" : "AUTO PLAY";
        }

        private void OnSpeedChanged(float val)
        {
            if (DiscreteSimulationEngine.Instance != null)
                DiscreteSimulationEngine.Instance.StepInterval = val;
        }

        public void UpdateMetricsUI()
        {
            if (DiscreteSimulationEngine.Instance == null) return;

            if (stepCountText != null)
                stepCountText.text = $"Step: {DiscreteSimulationEngine.Instance.CurrentStep}";
            int flora, blight, empty; float moisture, safety;
            engine.GetMetrics(out flora, out blight, out empty, out moisture, out safety);
            float total = Mathf.Max(1f, flora + blight + empty);
            if (floraPercentText != null) floraPercentText.text = $"Flora: {100f * flora / total:F1}%";
            if (blightPercentText != null) blightPercentText.text = $"Blight: {100f * blight / total:F1}%";
            if (emptyPercentText != null) emptyPercentText.text = $"Empty: {100f * empty / total:F1}%";
            if (avgMoistureText != null) avgMoistureText.text = $"Moisture: {moisture:F3}";
            if (avgSafetyText != null) avgSafetyText.text = $"Safety: {safety:F3}";
        }
    }
}
```

- [ ] **Bước 2: Kiểm tra biên dịch qua UnityMCP**
  Xác nhận `read_console` không báo lỗi.

- [ ] **Bước 3: Commit code Task 5**
  Commit message: `feat(ui): implement SimulationDashboard for zero-player experiment observation`

---

### Task 6: Kiểm Thử Toàn Diện & Đạt Tiêu Chuẩn Cân Bằng Ecological Smoke Test 50 Steps

**Mục tiêu:** Chạy thử nghiệm tự động 50 Steps trên Unity scene và quan sát trạng thái cân bằng nội môi.

- [ ] **Bước 1: Chạy Scene `GameScene` qua UnityMCP**
  Kích hoạt scene qua boot sequence `CryptoLoader -> LoadStart -> GameScene`.
- [ ] **Bước 2: Kích hoạt mô phỏng tự động 50 Steps**
  Quan sát quỹ đạo động lực học thổ nhưỡng, độ ẩm, tâm lý và ranh giới sinh thái.
- [ ] **Bước 3: Đánh giá tiêu chuẩn nghiệm thu**
  - Chạy lưới 7×7 với 3 cây và 2 cỏ, 10 seed cố định (0–9); lưu vị trí/type ban đầu, tham số, log mỗi step và phiên bản source.
  - Không phe nào tuyệt diệt trong steps 1–39.
  - Tỷ lệ cỏ trên tổng 49 ô ở mỗi step 10–50 nằm trong [20%, 75%]; steps 0–9 là giai đoạn thiết lập vì 2/49 chỉ bằng 4.08%.
  - Có ít nhất một lần sinh sản cỏ, một lần cây sinh sản, một lần wilt được phục hồi trước chết và một lần chết mở lại ô; lưu ID/step chứng minh.
  - Mọi seed phải đạt; hiện CHƯA CÓ kết quả chạy chứng minh. Đây là smoke test sinh thái, không phải chứng minh ổn định Lyapunov.
  - Không ép kết quả pha bằng type: pha phải theo trạng thái, soil và quỹ đạo đo được.
- [ ] **Bước 4: Nghiệm thu hoàn tất giai đoạn Zero-Player Sandbox**
