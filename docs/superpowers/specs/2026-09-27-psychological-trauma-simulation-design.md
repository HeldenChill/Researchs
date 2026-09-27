# Đặc Tả Thiết Kế: Mô Hình Tính Toán & Mô Phỏng Không Gian Trạng Thái Tâm Lý Và Sang Chấn (Trauma Dynamics Simulation)

**Ngày lập:** 2026-09-27  
**Dự án:** Computational Modeling of Psychological Systems & Trauma Dynamics  
**Vị trí thư mục mã nguồn:** `Psychology/`  
**Tài liệu nền tảng:** [`Mo-Hinh-Tam-Ly-Va-Sang-Chan-Da-Chieu.md`](../../Mo-Hinh-Tam-Ly-Va-Sang-Chan-Da-Chieu.md)

---

## 1. Tổng Quan Mục Tiêu (Executive Summary)

Dự án hiện thực hóa lý thuyết *"Mô hình hóa hệ thống tâm lý và sang chấn trong không gian trạng thái đa chiều"* thành một **Hệ thống tính toán mô phỏng tương tác thời gian thực (Interactive Computational Simulation & Attractor Landscape Engine)**.

Mục tiêu chính:
1. **Toán học hóa lý thuyết:** Chuyển đổi các khái niệm trừu tượng (thung lũng hút, hố sang chấn cưỡng bức, sự sụp đổ số chiều, can thiệp trị liệu) thành hệ phương trình vi phân ngẫu nhiên Langevin SDE và hàm thế năng Free Energy Potential $V(\vec{S})$.
2. **Trực quan hóa 3D 60 FPS:** Xây dựng giao diện Web 3D hiện đại sử dụng Three.js để người xem quan sát trực diện bề mặt địa hình thế năng, quả cầu trạng thái $\vec{S}(t)$ lăn trên các thung lũng, và vệt quỹ đạo thể hiện sự co rút số chiều khi rơi vào hố sang chấn.
3. **Môi trường thử nghiệm kép:** Cung cấp sẵn các kịch bản lâm sàng mẫu (Người khỏe mạnh, Shock Trauma, Complex Trauma / C-PTSD) kết hợp với sa bàn tự do (Sandbox) cho phép người dùng tùy biến Trigger, Noise sinh học và kích hoạt các can thiệp trị liệu (Somatic Grounding, Cognitive Reframing).
4. **Đóng gói gọn nhẹ:** Toàn bộ mã nguồn nằm gọn trong thư mục `Psychology/`, khởi động chỉ bằng một lệnh `python run.py`, không phụ thuộc vào hệ thống build phức tạp.

---

## 2. Kiến Trúc Hệ Thống (System Architecture)

Hệ thống được thiết kế theo mô hình **Client-Server đơn khối gọn nhẹ (Self-contained Web Application)**:

```text
+---------------------------------------------------------------------------------+
|                                 TRÌNH DUYỆT WEB                                 |
|                                                                                 |
|  +-------------------------------------+  +----------------------------------+  |
|  |     Khung Nhìn 3D (Three.js WebGL)  |  |   Bảng Đồng Hồ Sinh Trắc (HUD)   |  |
|  | - Bề mặt thế năng Z = V(X, Y)       |  | - Đo số chiều PR in [1.0, 3.0]   |  |
|  | - Quả cầu S(t) + Vệt sáng quỹ đạo   |  | - Time-series 3 kênh: x1, x2, x3 |  |
|  | - Vector Trigger & Can thiệp 3D     |  | - Nhãn vùng hút hiện tại         |  |
|  +-------------------------------------+  +----------------------------------+  |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  |                   Bảng Điều Khiển Tương Tác (Control Panel)               |  |
|  | - Presets lâm sàng (Healthy, Shock Trauma, C-PTSD)                        |  |
|  | - Sliders: Trigger Pulse, Biological Noise, Trauma Basin Depth           |  |
|  | - Nút can thiệp: Somatic Grounding, Social Co-regulation, Cognitive Refram |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------▲-----------------------------------------+
                                        │ (WebSocket 50 FPS & REST API)
+---------------------------------------▼-----------------------------------------+
|                         PYTHON FASTAPI BACKEND SERVER                           |
|                                                                                 |
|  +----------------------+  +------------------------+  +---------------------+  |
|  |     landscape.py     |  |       engine.py        |  |      presets.py     |  |
|  | - Hàm thế năng V(S)  |  | - Tích phân SDE        |  | - Cấu hình ca bệnh  |  |
|  | - Gradient analytic  |  |   (Euler-Maruyama)     |  | - Tọa độ giếng hút  |  |
|  | - Lưới 3D V(X, Y)    |  | - Đo số chiều PR (DCI) |  | - Độ sâu hố chấn    |  |
|  +----------------------+  +------------------------+  +---------------------+  |
+---------------------------------------------------------------------------------+
```

---

## 3. Cấu Trúc Thư Mục (Directory Structure)

Toàn bộ ứng dụng được tổ chức biệt lập trong thư mục `Psychology/`:

```text
G:\Projects\Researchs\Psychology/
├── app/
│   ├── __init__.py
│   ├── main.py                     # Entry point FastAPI, định tuyến API và WebSocket
│   ├── core/
│   │   ├── __init__.py
│   │   ├── landscape.py            # Hàm thế năng V(S), tính gradient, lưới địa hình 3D
│   │   ├── engine.py               # Bộ giải SDE (Euler-Maruyama), tính ma trận PR, xử lý xung lực
│   │   └── presets.py              # Định nghĩa tham số lâm sàng: Healthy, Shock, Complex Trauma
│   └── static/
│       ├── index.html              # Trang giao diện chính
│       ├── css/
│       │   └── style.css           # Giao diện khoa học tối màu (Dark mode, Glassmorphism)
│       └── js/
│           ├── app.js              # Khởi tạo ứng dụng, kết nối WebSocket & gọi REST API
│           ├── scene3d.js          # Three.js: Mesh địa hình V(x,y), quả cầu S(t), vệt quỹ đạo
│           └── charts.js           # Vẽ Canvas 2D đồ thị 3 kênh x1, x2, x3 & Gauge sụp đổ số chiều
├── tests/
│   ├── __init__.py
│   ├── test_landscape.py           # Unit tests kiểm tra tính đúng đắn của V(S) và gradient
│   └── test_engine.py              # Unit tests kiểm tra SDE solver, sự rơi hố và can thiệp
├── requirements.txt                # fastapi>=0.100.0, uvicorn>=0.22.0, numpy>=1.24.0, scipy>=1.10.0
└── run.py                          # Script khởi chạy: python run.py
```

---

## 4. Mô Hình Toán Học Chi Tiết (Mathematical Formulation)

### 4.1. Không gian trạng thái 3D Core
Vector trạng thái toàn vẹn tại thời điểm $t$:
$$\vec{S}(t) = \big(x_1(t), x_2(t), x_3(t)\big) \in [-3.5, 3.5]^3$$
* $x_1$ - **Trục Thể lý & Kích hoạt Thần kinh (Arousal):**
  * $x_1 \in [-1.0, +1.0]$: Vùng Dung Sai (Window of Tolerance / Ventral Vagal an toàn).
  * $x_1 > +1.0$: Kích hoạt chiến - biến (Hyperarousal / Sympathetic overdrive).
  * $x_1 < -1.0$: Đóng băng / Tê liệt / Phân ly (Hypoarousal / Dorsal Vagal Shutdown).
* $x_2$ - **Trục Cảm xúc (Affective Valence):**
  * Âm: Sợ hãi, xấu hổ, uất nghẹn.
  * Dương: Tự tin, an tâm, hạnh phúc.
* $x_3$ - **Trục Bản thể / Nhận thức An toàn (Cognitive Self-Safety):**
  * Âm: Toxic Shame ("Tôi là đứa tồi tệ, tôi là nguồn cơn của mọi tội lỗi").
  * Dương: Lòng tự trắc ẩn (Self-Compassion), ý thức giá trị tự thân vững vàng.

### 4.2. Hàm Thế Năng Địa Hình $V(\vec{S})$
Địa hình năng lượng biểu diễn Attractor Landscape:
$$V(\vec{S}) = \frac{k_{\text{conf}}}{4} \left(x_1^4 + x_2^4 + x_3^4\right) - \sum_{i=1}^{M} A_i \exp\left( -\frac{\|\vec{S} - \vec{\mu}_i\|^2}{2 \sigma_i^2} \right)$$
* $k_{\text{conf}} = 0.05$: Hằng số giam giữ biên để quả cầu không bao giờ bay ra vô cực.
* Các giếng hút $i = 1, \dots, M$:
  1. **Giếng Làm việc/Sinh hoạt (Work Basin):** $\vec{\mu}_1 = (0.5, 0.5, 0.5)$, $A_1 = 3.0$, $\sigma_1 = 1.0$.
  2. **Giếng Thư giãn/Nghỉ ngơi (Rest Basin):** $\vec{\mu}_2 = (-0.2, 1.2, 1.2)$, $A_2 = 3.5$, $\sigma_2 = 1.1$.
  3. **Hố Sang Chấn Cấp Tính (Shock Trauma Basin):** $\vec{\mu}_3 = (2.2, -1.8, 0.2)$, $A_3 = 5.0$, $\sigma_3 = 0.6$ (thể lý kích động cực đại, bản thể chưa sụp đổ).
  4. **Hố Sang Chấn Phức Hợp (Complex Trauma / Toxic Shame Basin):** $\vec{\mu}_4 = (1.8, -2.2, -2.2)$, $A_4 = 8.0$, $\sigma_4 = 0.5$ (vực sâu cực dốc, lực hút cưỡng bức, bản thể sụp đổ hoàn toàn về Toxic Shame).

### 4.3. Động lực học Langevin & Thuật toán Euler-Maruyama
Chuyển động của vector trạng thái:
$$d\vec{S} = \Big(-\nabla V(\vec{S}) + \vec{F}_{\text{trigger}}(t) + \vec{F}_{\text{intervention}}(t)\Big) dt + \sigma_{\text{noise}} d\vec{W}_t$$
* **Gradient giải tích:**
  $$\nabla V(\vec{S}) = k_{\text{conf}} \begin{pmatrix} x_1^3 \\ x_2^3 \\ x_3^3 \end{pmatrix} + \sum_{i=1}^M \frac{A_i}{\sigma_i^2} \exp\left( -\frac{\|\vec{S} - \vec{\mu}_i\|^2}{2 \sigma_i^2} \right) (\vec{S} - \vec{\mu}_i)$$
* **Bước tích phân số ($\Delta t = 0.02s$):**
  $$\vec{S}_{n+1} = \text{clip}\left(\vec{S}_n - \nabla V(\vec{S}_n)\Delta t + (\vec{F}_{\text{trigger}} + \vec{F}_{\text{intervention}})\Delta t + \sigma_{\text{noise}} \sqrt{\Delta t}\,\vec{\xi}_n, -3.5, 3.5\right)$$
  với $\vec{\xi}_n \sim \mathcal{N}(0, I_3)$.

### 4.4. Định lượng Toán học Sự Sụp Đổ Số Chiều (DCI)
Tại mỗi bước thời gian, lưu trữ cửa sổ trượt $W = 100$ bước trạng thái gần nhất. Tính ma trận hiệp phương sai $C \in \mathbb{R}^{3 \times 3}$:
$$C = \frac{1}{W-1} \sum_{k=1}^W (\vec{S}_{n-k} - \bar{S})(\vec{S}_{n-k} - \bar{S})^T$$
Tìm các giá trị riêng $\lambda_1, \lambda_2, \lambda_3 \ge 0$ của $C$.
Chỉ số **Participation Ratio (PR)**:
$$\text{PR} = \frac{\left(\sum_{k=1}^3 \lambda_k\right)^2}{\sum_{k=1}^3 \lambda_k^2} \in [1.0, 3.0]$$
* $\text{PR} \in [2.2, 3.0]$: **Trạng thái Mở Rộng Đa Chiều (Healthy / Expanded)** — Hệ thống sở hữu trọn vẹn các bậc tự do (nhận thức linh hoạt, cảm xúc đa dạng).
* $\text{PR} \in [1.0, 1.3]$: **Sụp Đổ Số Chiều (Dimensionality Collapse)** — Hệ thống bị kẹt cứng ở đáy hố Trauma, mọi nguồn lực sinh học bị dồn toàn bộ vào trục sinh tồn nhị phân (Hyperarousal hoặc Shutdown).

---

## 5. Đặc Tả Giao Diện Người Dùng & Tương Tác 3D

### 5.1. Khung nhìn 3D (Three.js WebGL)
* **Bề mặt thế năng 3D Mesh:**
  * Lưới $80 \times 80$ điểm trên mặt phẳng $(x_1, x_2)$, độ cao đỉnh $z = V(x_1, x_2, \bar{x}_3)$.
  * Vertex Shader hoặc Color Heatmap: Xanh ngọc (giếng an toàn) $\to$ Vàng/Cam (rào cản thế năng) $\to$ Đỏ thẫm/Tím đậm (hố sang chấn).
* **Quả cầu phát quang $\vec{S}(t)$:**
  * Vị trí thực tế $[x_1(t), x_2(t), V(x_1, x_2)]$.
  * Particle Trail / Ribbon: Lưu lại 150 bước quỹ đạo để người dùng quan sát hình thái chuyển động.
* **Vector Mũi tên 3D (ArrowHelpers):**
  * Vector lực kéo $-\nabla V$ (màu trắng).
  * Vector Trigger $\vec{F}_{\text{trigger}}$ (màu đỏ tươi).
  * Vector Can thiệp $\vec{F}_{\text{intervention}}$ (màu xanh lục).

### 5.2. Bảng Đồng Hồ Sinh Trắc (HUD)
* **Dimensionality Gauge:** Thanh tiến trình hiển thị chỉ số $\text{PR}$. Khi $\text{PR} < 1.3$, toàn bộ viền HUD nhấp nháy đỏ với cảnh báo: `DIMENSIONALITY COLLAPSE: 1.05 D (SURVIVAL MODE)`.
* **Realtime Time-Series (Canvas 2D):** 3 biểu đồ sóng độc lập biểu diễn $x_1(t), x_2(t), x_3(t)$ chạy cuộn theo thời gian, có đường chân trời Vùng Dung Sai $[-1, 1]$ cho $x_1$.

### 5.3. Bảng Điều Khiển Tương Tác
1. **Clinical Presets Selector:**
   * `Healthy Baseline`: Giếng an toàn sâu, không có hố trauma cực đoan.
   * `Shock Trauma`: Hố sang chấn thể lý sâu nhưng bản thể chưa méo mó.
   * `Complex Trauma (Verbal Abuse Child)`: Hố Toxic Shame khoét cực sâu ở góc âm $(-2, -2, -2)$.
2. **Sandbox Adjustments:**
   * Thanh trượt Trigger Pulse Magnitude ($0.0 \to 15.0$).
   * Thanh trượt Biological Noise $\sigma$ ($0.0 \to 2.0$).
   * Thanh trượt Trauma Depth $A_{\text{trauma}}$ ($0.0 \to 12.0$).
3. **Therapeutic Interventions (Nút hành động):**
   * **Somatic Grounding:** Bơm lực $\vec{F} = (-5.0 \cdot \text{sgn}(x_1), 0, 0)$ kéo nhịp thần kinh quay về Window of Tolerance.
   * **Social Co-regulation:** Giảm độ sâu hố $A_{\text{trauma}}$ tức thời và mở rộng bán kính giếng an toàn.
   * **Cognitive Reframing:** Bơm lực $\vec{F} = (0, +3.0, +5.0)$ nâng trục bản thể thoát khỏi vùng Toxic Shame.

---

## 6. Giao Thức API & Luồng Dữ Liệu (API Specifications)

### 6.1. REST Endpoints
* `GET /api/presets` $\to$ Danh sách các ca lâm sàng có sẵn.
* `POST /api/preset/{name}` $\to$ Chuyển đổi mô hình sang preset được chỉ định.
* `GET /api/landscape-mesh` $\to$ Trả về mảng 2D/3D $[X, Y, Z]$ của bề mặt thế năng.
* `POST /api/trigger` $\to$ Body: `{"magnitude": float, "direction": [float, float, float]}`.
* `POST /api/intervene` $\to$ Body: `{"type": "somatic" | "social" | "cognitive", "strength": float}`.
* `POST /api/config` $\to$ Cập nhật tham số động (`noise`, `trauma_depth`, `dt`).

### 6.2. WebSocket Stream (`/ws/stream`)
Client kết nối tới WebSocket để nhận luồng dữ liệu 50 gói/giây:
```json
{
  "t": 12.44,
  "state": [1.82, -2.15, -2.08],
  "velocity": [0.03, -0.01, -0.02],
  "energy": -6.84,
  "pr": 1.08,
  "status": "COLLAPSED",
  "active_basin": "trauma_complex"
}
```

---

## 7. Kế Hoạch Kiểm Thử Tự Động (Verification & Testing)

Hệ thống kiểm thử tự động sử dụng `pytest` trong thư mục `Psychology/tests/`:
1. **`test_landscape.py`:**
   * So sánh gradient giải tích $\nabla V(\vec{S})$ với sai phân hữu hạn (Numerical differentiation) với sai số cho phép $< 10^{-4}$.
   * Xác thực các điểm $\vec{\mu}_i$ là cực tiểu địa phương ($\nabla V(\vec{\mu}_i) \approx 0$).
   * Xác thực tính giam giữ biên: $V(\vec{S}) \to +\infty$ khi $\|\vec{S}\| \to 4.0$.
2. **`test_engine.py`:**
   * Kiểm thử tính ổn định của thuật toán Euler-Maruyama qua $10,000$ bước mô phỏng: không xuất hiện `NaN` hay `Inf`.
   * Kiểm thử kịch bản Sụp đổ số chiều: Sau khi bơm Trigger vượt ngưỡng, hệ thống rơi vào giếng Trauma và chỉ số $\text{PR}$ giảm xuống $< 1.3$.
   * Kiểm thử kịch bản Thoát hố (Can thiệp): Khi kích hoạt can thiệp Somatic và Cognitive, trạng thái thoát khỏi hố sang chấn và $\text{PR}$ tăng trở lại $> 2.2$.
