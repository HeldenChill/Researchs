# Playbook: Phân Rã Một Game Bất Kỳ Thành Không Gian Logic Chuẩn Tắc

> **Phiên bản:** v2.1, 2026-10-24. Khớp với lý thuyết lõi `2026-10-24-logical-space-v0.2.1`.
> **Phạm vi:** Playbook cấp Base Theory (Universal Playbook áp dụng cho mọi game).
> **Lý thuyết lõi:** [Logical-Space-Base-Theory.md](../../docs/theory/Logical-Space-Base-Theory.md) — định nghĩa, nguyên tắc L1–L12, thang basis (mục 4.1), danh mục I1–I6 và M1–M6.
> **Nền tảng toán học:** [Logical-Space-Mathematical-Foundations.md](../../docs/theory/Logical-Space-Mathematical-Foundations.md).
> **Nguyên tắc nền tảng:** [no-case-study-bias-and-basis-orthogonality.md](../../.agents/rules/no-case-study-bias-and-basis-orthogonality.md).
> **Mô hình mục tiêu:** $\mathcal{G} = \left\langle \mathcal{S}, \mathcal{A}, \hat{\mathbb{O}}, \Omega \right\rangle$.

---

## 1. Mục Đích & Khi Nào Sử Dụng

Sử dụng playbook này mỗi khi cần phân tích một trò chơi (game thực tế hoặc ý tưởng game mới) thành một mô hình toán học và logic chuẩn xác, phục vụ cho việc:
1. Hiểu cặn kẽ bản chất cơ học của trò chơi mà không bị lừa bởi lớp vỏ đồ họa / tự sự.
2. Chọn bộ **basis** đủ đơn giản để sinh ra đúng loại nổi sinh mong muốn.
3. Thiết kế luật chơi cân bằng, phát hiện lỗ hổng thiết kế (Design Hazards).
4. Tái cấu trúc thành code engine hoặc simulation sạch sẽ ngay từ đầu.

---

## 2. Hai Cách Dùng: Phân Rã Game Có Sẵn và Xây Game Mới

| Tình huống | Cách dùng |
|---|---|
| Game có sẵn hoặc engine đã viết | Chạy thẳng 12 bước bên dưới như một **cuộc kiểm toán** |
| Game mới, hoặc làm lại từ đầu | Chạy **thang basis** (mục 2A); mỗi bậc thang là một không gian ứng viên đi qua 12 bước |

### 2A. Thang Basis (AG-6, L12)

Đi từ basis nhỏ nhất, leo lên từng bậc cho tới khi loại thú vị mục tiêu xuất hiện. Nếu định nghĩa được "thú vị" trước, hãy định nghĩa trước rồi suy ra basis (chủ sở hữu ưu tiên cách này).

```mermaid
flowchart TD
    Start["Basis nhỏ nhất chạy được"] --> Sim["Mô phỏng và quét tham số"]
    Sim --> Det{"Detector báo thú vị?"}
    Det -- "chưa" --> Learn["Ghi tương tác còn thiếu"]
    Learn --> Add["Thêm đúng một basis hoặc toán tử"]
    Add --> Sim
    Det -- "có" --> Rung["Ghi bậc: basis, toán tử, bản đồ chế độ"]
    Rung --> Spec{"Detector đã thành spec?"}
    Spec -- "chưa" --> Done["Tìm được không gian thô nhất chạy đúng"]
    Spec -- "rồi" --> ModeB["Chế độ B: suy basis từ spec"]
    ModeB --> Sim
```

| Chế độ | Cần | Dùng khi |
|---|---|---|
| A, leo thang | **Detector**: nhận ra loại thú vị trong log, chưa giải thích được | Chưa hiểu cái thú vị |
| B, đích trước | **Spec**: chỉ ra số hạng tương tác nào sinh ra cái thú vị (L6) | Lịch sử các bậc đã giải thích được detector |

Quy tắc của thang:
* **Có detector trước khi leo.** Không có detector thì không có điều kiện dừng; phán đoán bằng mắt không ổn định vì một tham số nhỏ có thể lật chế độ (L10).
* **Mỗi bậc chỉ thay đổi một thứ.** Thay nhiều thứ cùng lúc thì không quy được nguyên nhân khi chế độ bị lật.
* **Mỗi bậc giữ bản đồ chế độ** và ghi lại tương tác nào tạo khác biệt; đủ ghi chép thì detector nâng cấp thành spec.
* **Engine cũ là kho linh kiện.** Chỉ lấy lại một toán tử cũ khi bậc hiện tại cần nó; không cắt tỉa engine cũ rồi gọi đó là thang.

---

## 3. Quy Trình 12 Bước

Bước 1–6 là phân rã (P1 trong lý thuyết lõi). Bước 7–11 là các cổng kiểm định P2–P6. Mỗi cổng tạo ra **bằng chứng**, không phải tuyên bố.

```mermaid
flowchart TD
    S0["Bước 0: Đặc Tả Ý Tưởng và Loại Thú Vị Mục Tiêu"] --> S1["Bước 1: Thu Thập Cơ Học Thô"]
    S1 --> S2["Bước 2: Chọn Độ Phân Giải Basis"]
    S2 --> S3["Bước 3: Lọc Biến Trạng Thái S"]
    S3 --> S4["Bước 4: Không Gian Hành Động A"]
    S4 --> S5["Bước 5: Chuỗi Toán Tử O"]
    S5 --> S6["Bước 6: Ranh Giới Omega"]
    S6 --> S7["Bước 7: Cổng Độc Lập"]
    S7 -- "Phụ thuộc hoặc dẫn xuất" --> S2
    S7 -- "Hợp lệ" --> S8["Bước 8: Cổng Đầy Đủ"]
    S8 -- "Thiếu cơ chế" --> S2
    S8 -- "Hợp lệ" --> S9["Bước 9: Cổng Đại Số Toán Tử"]
    S9 -- "Lỗi thứ tự hoặc bất biến" --> S5
    S9 -- "Hợp lệ" --> S10["Bước 10: Đo Nổi Sinh"]
    S10 --> S11["Bước 11: Lọc Chất Lượng"]
    S11 -- "Nổi sinh suy biến" --> S2
    S11 -- "Hợp lệ" --> S12["Bước 12: Kiểm Tra 7 Cạm Bẫy Bản Thể"]
    S12 --> Finished["Bản Đặc Tả Không Gian Logic Có Phiên Bản"]
```

---

### Bước 0: Đặc Tả Ý Tưởng (P0)
* **Thao tác:** Viết danh sách đánh số các **cơ chế và trải nghiệm bắt buộc** của ý tưởng ("người chơi dập lửa bằng nước", "kinh tế không được lăn cầu tuyết").
* **Khai báo loại thú vị mục tiêu** từ danh mục I1–I6 của lý thuyết lõi, kèm ngưỡng đo. Mỗi game có điểm thú vị riêng; không có định nghĩa "thú vị" phổ quát.
* Danh sách này là **đích đầy đủ**: đầy đủ chỉ có nghĩa tương đối với một ý tưởng, không bao giờ là "mọi game".
* **Khai báo detector hoặc spec** cho loại thú vị đã chọn: tín hiệu nào trong log nói "điều đó đã xảy ra". Chưa có → ghi "chưa có detector"; không được leo thang hay tuyên bố đạt P5.
* **Khai báo người chơi làm gì bằng tay** tại khoảnh khắc thú vị. Nếu câu trả lời là "chỉnh tham số", thì tham số đó là hành động (xem Bước 4).

---

### Bước 1: Thu Thập Cơ Học Thực Chứng Thô (Raw Mechanics Inventory)
* **Thao tác:** Khảo sát toàn bộ tài liệu thiết kế (GDD), Wiki chính thức, hoặc **mã nguồn** của game.
* **Quy tắc bắt buộc:** Ghi chép dữ liệu dạng "nhật ký cơ học thô". **Tuyệt đối không mang sẵn bất kỳ mô hình lý thuyết nào vào bước này** (không gắn nhãn tâm lý học, không gắn nhãn 5 trục hay SDE).
* Khi đọc mã nguồn: ghi lại revision, file đã đọc, và đánh dấu "chưa kiểm chứng runtime".

---

### Bước 2: Chọn Độ Phân Giải Basis (Resolution Rule, L4)
* **Định nghĩa basis:** phần tử không thể chia nhỏ hơn **trong phạm vi game**, tức là không thể dựng từ các phần tử khác bằng các toán tử của game. Basis = **tập sinh tối tiểu** dưới $\hat{\mathbb{O}}$.
* **Quy tắc dừng:** basis là mức **thô nhất** mà vẫn:
  1. sinh ra mọi cơ chế ở Bước 0 cộng với loại nổi sinh mục tiêu;
  2. người chơi **cảm nhận và dự đoán** được;
  3. vừa chi phí tính toán và code.
* Mọi chi tiết mịn hơn thu gọn thành **tham số cấu hình** (giống lý thuyết hiệu dụng trong vật lý: hóa học không cần lý thuyết dây; nhiệt độ sôi tóm gọn toàn bộ vật lý phân tử). Không đào xuống "lý thuyết dây".
* **Phân biệt kiểu và thể hiện:** basis là **kiểu** (Substance, Noun, Property). Giá trị của từng thể hiện (nhiệt độ ô này, vị trí bức tường này) là **hệ số**, nằm trong $\mathcal{S}$. Tương tự Fourier: basis đánh chỉ số theo tần số; biên độ và pha thuộc về hệ số.

---

### Bước 3: Lọc Tách Biến Trạng Thái Động ($\mathcal{S}$)
* **Thao tác:** Đặt câu hỏi: *"Nếu lưu game (Save Game) tại đúng tích tắc này, những biến số nào BẮT BUỘC phải lưu vào file save để khôi phục chính xác thế cờ?"*
* **Phân định rạch ròi ba loại:**
  * **Biến trạng thái động ($\mathcal{S}$):** Máu hiện tại, năng lượng, tài nguyên, tọa độ, vận tốc, số đếm hiệu ứng.
  * **Tham số cấu hình tĩnh:** Máu cơ bản, hệ số kháng, sát thương cơ sở, nhiệt độ sôi, khối lượng. $\implies$ **Loại khỏi $\mathcal{S}$**, đưa vào bảng tham số hằng.
  * **Giá trị dẫn xuất:** Tính được từ trạng thái và cấu hình (pha vật chất, "đang cháy", tập luật đang kích hoạt trong Baba Is You). $\implies$ **Không phải basis, không lưu**, tính khi đọc.

---

### Bước 4: Định Nghĩa Không Gian Hành Động ($\mathcal{A}$)
* **Thao tác:** Đặt câu hỏi: *"Trong mỗi nhịp quyết định (turn / tick), người chơi và AI được phép thay đổi những bậc tự do nào?"*
* **Phân loại hành động:**
  * Lựa chọn chiêu thức / tài nguyên tiêu hao.
  * Phân bổ mục tiêu (ghép cặp đối kháng).
  * Điều phối vị trí không gian hoặc thứ tự chuỗi lệnh.
  * **Hành động liên tục** (vector bắn, lực kéo): ghi rõ miền giá trị; các bước đo sau phải **lấy mẫu** trên miền này thay vì liệt kê.
  * **Hành động sửa luật** (đẩy chữ trong Baba Is You): ghi rõ, vì nó kéo theo toán tử hai tầng ở Bước 5.
  * **Hành động chỉnh tham số** (sandbox, game không người chơi): khi cái thú vị nằm ở việc chỉnh cấu hình, cấu hình bị chỉnh chính là $\mathcal{A}$. Ghi rõ tham số nào được mở cho người chơi. *Lỗ hổng lý thuyết T2, chưa giải quyết:* mô hình $\langle \mathcal{S}, \mathcal{A}, \hat{\mathbb{O}}, \Omega \rangle$ chưa có chỗ cho hành động-meta này.
* **Kiểm tra rỗng:** nếu $\mathcal{A}$ rỗng hoặc hành động định nghĩa cái thú vị chưa được hiện thực (không có UI), ghi thành lỗi thiết kế, không phải chi tiết hoàn thiện.

---

### Bước 5: Xây Dựng Chuỗi Toán Tử Phân Giải ($\hat{\mathbb{O}}$)
* **Thao tác:** Liệt kê các hàm biến đổi trạng thái theo thứ tự thời gian thực thi:
  $$(\mathcal{S}_t \times \mathcal{A}_t) \xrightarrow{\hat{\mathcal{O}}_1 \to \hat{\mathcal{O}}_2 \to \dots \to \hat{\mathcal{O}}_m} \mathcal{S}_{t+1}$$
* **Nguyên tắc cốt tử:** **Toán tử không phải là một trục không gian.** Đụng độ, tính sát thương, trừ tài nguyên là các hàm ánh xạ, tuyệt đối không được nhét vào $\mathcal{S}$.
* **Bảng toán tử bắt buộc:** mỗi toán tử ghi chữ ký, các tọa độ **đọc**, các tọa độ **ghi**, và vị trí trong thứ tự.
* **Đánh dấu toán tử tương tác:** nổi sinh nằm ở các số hạng tương tác phi tuyến. Phép cộng chỉ tạo độ phức tạp, không tạo nổi sinh (tổng các sóng chỉ chứa tần số đầu vào); phép nhân tạo thành phần mới ($\sin a \sin b = \tfrac12[\cos(a-b) - \cos(a+b)]$). Ví dụ: HOT với MELT, cháy với ướt, va chạm đồng minh kích hoạt kỹ năng.
* **Toán tử hai tầng:** nếu luật nằm trong trạng thái, tách **bộ thông dịch cố định** khỏi **dữ liệu luật biến đổi**. Phân tách không gian và toán tử vẫn giữ ở tầng bộ thông dịch.
* **Hai thang thời gian:** lượt rời rạc bọc một mô phỏng vật lý liên tục cần một toán tử lượt chứa toán tử vật lý con.

---

### Bước 6: Xác Lập Không Gian Ranh Giới ($\Omega$)
* **Thao tác:** Liệt kê các điều kiện dừng của vòng lặp:
  * Điều kiện thắng.
  * Điều kiện thua.
  * Giới hạn an toàn (Timeout, Turn limit, Resource exhaustion).

---

### Bước 7: Cổng Độc Lập (P2)

| Kiểm tra | Câu hỏi | Trượt khi |
|---|---|---|
| Dẫn xuất | Tọa độ $x_k$ có tính được từ các tọa độ khác không? | Có công thức $x_k = g(\text{khác})$ luôn đúng → giá trị dẫn xuất |
| Bỏ khỏi file save | Bỏ $x_k$ khỏi save, khôi phục có giống hệt không? | Giống hệt → dư thừa |
| Phụ thuộc trên tập đạt được | Trên các trạng thái mô phỏng được, $x_k$ có bị các tọa độ khác quyết định không? | Entropy có điều kiện xấp xỉ 0 → xem lại: chủ ý thiết kế hay ghép nối ẩn |
| Phân loại bản thể | $x_k$ thực chất là toán tử hay tham số? | Là công thức, resolver, bảng tra |

Với toán tử phi tuyến, tập sinh tối tiểu có thể **không duy nhất** và **khác kích thước**. Báo cáo bộ basis đã chọn, không báo cáo "số chiều".

---

### Bước 8: Cổng Đầy Đủ (P3)
* Dựng **ma trận phủ**: hàng là các mục Bước 0; cột là basis và toán tử.
* Mỗi hàng cần một **nhân chứng**: chuỗi hành động từ trạng thái đầu tạo ra cơ chế đó (chứng minh bằng cấu trúc hoặc mô phỏng có ghi log).
* Hàng không có nhân chứng → thiếu: thêm basis hoặc toán tử.
* Cột không phục vụ hàng nào → ứng viên xóa (YAGNI).
* **Kiểm tra hữu dụng bằng ablation** (đề xuất T4, chưa đồng thuận): đóng băng một basis hoặc tắt một toán tử, chạy nhiều seed. Kết quả không đổi → phần tử đó không đóng góp, ứng viên xóa. Nối được trên sơ đồ chưa chứng minh có tác dụng: chuỗi đúng là đường khai báo → điều kiện mở được → toán tử chạy → đầu ra khác 0 → kết quả đổi → quy nguyên nhân có đối chứng.

---

### Bước 9: Cổng Đại Số Toán Tử (P4)
* **Kiểm tra giao hoán:** với mỗi cặp toán tử cùng ghi một tọa độ, hoặc một bên đọc thứ bên kia ghi, thử cả hai thứ tự trên các trạng thái lấy mẫu. Khác kết quả → hoặc là luật chủ ý (sát thương trước kiểm tra chết), hoặc là lỗi ẩn.
* **Xung đột luật:** định nghĩa thứ tự ưu tiên tường minh (Baba Is You: WALL IS STOP và WALL IS DEFEAT là bài toán khó nhất của nhà phát triển).
* **Bất biến:** khai báo đại lượng bảo toàn (tổng nước, tổng vàng trừ nguồn và hố), kiểm bằng property test.
* **Đóng kín:** trạng thái hợp lệ vào → trạng thái hợp lệ ra (biên, không âm, hữu hạn).

---

### Bước 10: Đo Nổi Sinh (P5)
* Cần **mô phỏng headless** có seed. Nếu chưa có, ghi "chưa đo" — không tuyên bố.
* Chọn thước đo theo loại thú vị đã khai báo ở Bước 0:

| Loại mục tiêu | Thước đo |
|---|---|
| I1 Thay đổi khả năng hành động | M5: thực thể phản hồi input, nước đi khả dĩ, tập đạt được, chiến lược tác tử mạnh trước và sau sự kiện |
| I2 Cân bằng động | Bản đồ chế độ theo tham số; M4 |
| I3 Đa dạng lời giải | M2, M3 |
| I4 Câu chuyện nổi sinh | M2 cộng báo cáo người chơi |
| I5 Chiều sâu chiến lược | Kiểm tra chiến lược áp đảo; độ đo kỹ năng và may rủi |
| I6 Phản ứng dây chuyền | M6: độ dài chuỗi mỗi hành động, tỉ số phân nhánh, chênh lệch cú bắn tốt nhất so với ngẫu nhiên |

* **Độ nhạy tham số:** một thay đổi nhỏ có thể lật hệ từ thú vị sang nhàm chán. Vẽ **bản đồ chế độ** (quét tham số, nhiều seed, phân loại chế độ) trước khi chỉnh tay; đặt giá trị mặc định cách xa biên vùng thú vị.
* Mọi thước đo M1–M6 còn là **giả thuyết** cho tới khi được kiểm chứng trên hệ đã biết là nổi sinh và hệ thuần cộng.
* **Kiểm tra khả năng cảm nhận** (đề xuất T3, chưa đồng thuận): lập bảng "tọa độ quyết định kết quả" so với "thứ người chơi nhìn thấy". Tọa độ chi phối mạnh mà không hiển thị → vi phạm điều kiện 2 của L4. Mô hình hiện chưa có ánh xạ quan sát Y, nên ghi bảng này thủ công.

---

### Bước 11: Lọc Chất Lượng (P6)
Nổi sinh là điều kiện cần, không đủ. Loại hoặc thiết kế lại khi có:
* chiến lược áp đảo vượt khoảng tin cậy;
* softlock hoặc điều kiện thắng không đạt được;
* tăng trưởng mất kiểm soát khi đặc tả cần cân bằng;
* vi phạm bất biến;
* lựa chọn giả (các phương án khác nhau không đáng kể);
* thay đổi tầm thường hóa game (BABA IS WIN ngay cạnh Baba).

Playtest người thật vẫn là lớp bằng chứng riêng sau bước này.

---

### Bước 12: Kiểm Tra 7 Cạm Bẫy Bản Thể Học (Sanity Check)

1. **Cạm bẫy Toán tử (Operator-as-Space):** Có trục nào của $\mathcal{S}$ thực chất là thuật toán (resolver, công thức sát thương, kiểm tra trúng)? Nếu có, **đưa sang $\hat{\mathbb{O}}$**.
2. **Con số thiêng (Sacred Number):** Số chiều có bị gượng ép về 5, 6, 7? Báo cáo bộ basis, không báo cáo con số.
3. **Sụp đổ liên kết (Coupling Collapse):** Toán tử có bao quát các số hạng chéo giữa trạng thái không? Phân tách quá mức làm mất nổi sinh.
4. **Dẫn xuất giả basis (Derived-as-Basis):** Có phần tử nào trong basis tính được từ phần tử khác (pha vật chất, lửa, hơi nước)? Nếu có, chuyển thành toán tử.
5. **Sai độ phân giải (Wrong Resolution):** Basis quá thô (phải viết tay từng tổ hợp) hay quá mịn (người chơi không cảm nhận được, chi phí cao)? Quay lại Bước 2. Dấu hiệu quá mịn: hàng trăm tham số ghép nối, nhiều đường song song cùng ghi một tọa độ, trạng thái quyết định kết quả không hiển thị.
6. **Mang trục từ case study khác (Case-Study Carryover):** Có trục nào được thừa hưởng từ dự án khác (trục tâm lý, "hai tầng", số khối) thay vì rút ra từ nhu cầu của game này? Nếu có, chứng minh lại từ Bước 0 hoặc bỏ.
7. **Bảng không gian lẫn loại (Mixed Space Table):** Bảng "các không gian" có chứa thứ không phải trạng thái game: quan sát/log, hiển thị, công cụ AI, hoặc giá trị dựng lại mỗi tick (ngân sách, yêu cầu)? Chỉ những gì phải lưu trong save mới là $\mathcal{S}$; phần còn lại là toán tử, giá trị dẫn xuất hoặc tầng ngoài game.

---

## 4. Bài Học Kinh Nghiệm Tích Lũy

| Nguồn | Bài học |
|---|---|
| Ví dụ lửa và nước | Lửa và nước là basis quá thô. Kiểu chất (cấu hình) và nhiệt độ (trạng thái) là đủ; pha, lửa, hơi nước đều là dẫn xuất. Hơi nước, băng, dập lửa, gỗ cháy, kim loại chảy tự nổi sinh |
| Baba Is You | Vật thể **không có thuộc tính mặc định**: mọi hành vi đến từ luật. Luật nằm trong trạng thái → toán tử hai tầng. Thay đổi thú vị là khi **cách chơi thay đổi** (WALL IS YOU). Màn chơi giới hạn từ vựng để uốn không gian nổi sinh thành tiến trình |
| Bump_Hero | Hành vi theo loài (Bat, Bear, Seal) viết cứng ở mức thô, trong khi modifier vật lý và hiệu ứng trạng thái đã ở mức thuộc tính. Giả thuyết: loài là hàng cấu hình của thuộc tính thân × trigger × điều kiện × hiệu ứng. Hành động liên tục cần lấy mẫu |
| Forest_Bloom | Một tham số nhỏ có thể lật nổi sinh từ thú vị sang nhàm chán → bản đồ chế độ trước khi chỉnh tay |
| Forest_Bloom, kiểm toán 2026-10-24 | Kỹ thuật mạnh (thứ tự 22 giai đoạn, snapshot, ledger, checkpoint, ablation) nhưng tầng thiết kế bị ngược: xây từ nguyên tử tâm lý lên, không có P0. Kết quả: hơn 100 tham số ghép nối, $\mathcal{A}$ rỗng (UI chỉnh gen/tham số không tồn tại), trạng thái nội tại quyết định mọi thứ nhưng không hiển thị, I2 chưa đạt (10/10 seed trượt nghiệm thu). Bài học: kỹ thuật tốt không thay được P0; cần detector và thang basis (mục 2A); cạm bẫy 5, 6, 7 |
| Phiên lý thuyết 2026-10-24 | Leo thang mà không có detector thì không có điểm dừng. Detector (nhận ra) khác spec (giải thích); lịch sử các bậc nâng detector thành spec |
| Sửa lỗi 2026-10-04 | "5 trục" thực chất là 5 khối và 10 tọa độ vô hướng → kiểm tra độc lập trước khi tuyên bố số chiều. Đọc láng giềng tại chỗ gây phụ thuộc thứ tự → đọc snapshot, cộng dồn delta, commit cùng lúc |

---

## 5. Mẫu Đầu Ra

```text
<game>-logical-space/
├── README.md        # P0 đặc tả, loại thú vị mục tiêu, nguồn và revision
├── decomposition    # Bảng basis: cấu hình / trạng thái / dẫn xuất; A; bảng toán tử; Omega
├── ladder           # Game mới: mỗi bậc thang, thay đổi gì, detector báo gì, bản đồ chế độ
├── gates            # Bằng chứng P2 đến P6, hoặc "chưa đo"
└── lessons          # Bài học mới để đưa ngược về lý thuyết lõi và playbook này
```

Với game nhỏ, gộp tất cả vào một `README.md`, như [bump-hero-logical-space](../../docs/explorations/bump-hero-logical-space/README.md).
