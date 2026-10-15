# Toàn Bộ Các Yếu Tố Gameplay Trong Limbus Company

> ### BẢN ĐỒ BÁCH KHOA CƠ HỌC GAMEPLAY (GAMEPLAY ELEMENTS ATLAS)
> * **Nguồn tham chiếu dữ liệu:** [Limbus Company Official Wiki (wiki.gg)](https://limbuscompany.wiki.gg/).
> * **Không gian nghiên cứu:** `docs/explorations/limbus-company-logical-space/`
> * **Mục đích:** Liệt kê đầy đủ, toàn diện mọi thực thể, chỉ số, cơ chế, trạng thái, công thức tính toán và vòng lặp vận hành trong Gameplay của Limbus Company.
> * **Phương thức trình bày:** Tối đa hóa sơ đồ trực quan (Mermaid Diagrams) và bảng cấu trúc logic, không lược bỏ bất kỳ yếu tố cơ học nào.

---

## 1. Cấu Trúc Thực Thể & Hệ Thống Chỉ Số (Unit & Stats Taxonomy)

Mọi nhân vật (Sinners), Kẻ địch (Enemies) và Dị Thể (Abnormalities) trên chiến trường đều được cấu tạo từ các nhóm thuộc tính sau:

```mermaid
flowchart TD
    subgraph Entity_Structure ["Cấu Trúc Thực Thể Trên Chiến Trường"]
        Identity["Thực Thể: Sinner hoặc Enemy"]
        
        Identity --> BaseStats["Nhóm Chỉ Số Cơ Bản"]
        Identity --> DefensiveStats["Nhóm Chỉ Số Phòng Ngự và Choáng"]
        Identity --> KineticStats["Nhóm Động Lực và Tốc Độ"]
        Identity --> SkillSet["Bộ Kỹ Năng và Nội Tại"]
        
        BaseStats --> Lvl["Cấp Độ Level"]
        BaseStats --> HP["Thanh Máu HP"]
        BaseStats --> SP["Điểm Tinh Thần Sanity"]
        
        DefensiveStats --> Shield["Thanh Khiên Shield"]
        DefensiveStats --> StaggerBars["Vạch Ngưỡng Choáng Stagger"]
        DefensiveStats --> Resistances["Ma Trận Kháng Vật Lý và Tội"]
        DefensiveStats --> DefLvl["Cấp Phòng Thủ Defense Level"]
        
        KineticStats --> SpdDice["Khoảng Tốc Độ Speed Range"]
        KineticStats --> DeployOrder["Thứ Tự Triển Khai Deployment Order"]
        KineticStats --> OffLvl["Cấp Tấn Công Offense Level"]
        
        SkillSet --> AtkSkills["Kỹ Năng Tấn Công 1, 2, 3"]
        SkillSet --> DefSkill["Kỹ Năng Thủ Guard, Evade, Counter"]
        SkillSet --> EGOSkills["Kỹ Năng Tối Thượng E.G.O"]
        SkillSet --> Passives["Nội Tại Chiến Đấu và Hỗ Trợ"]
    end
```

---

### 1.1. Chi Tiết Các Chỉ Số Cốt Lõi

| Chỉ Số | Ký Hiệu | Khoảng Giá Trị | Cơ Chế Vận Hành Chi Tiết |
|---|---|---|---|
| **Cấp Độ (Level)** | $\text{Lvl}$ | $1 \to 65$ (Story) / $111$ (Dungeon) | Quyết định giá trị gốc của Máu tối đa, Cấp Tấn công và Cấp Phòng thủ cơ sở. |
| **Máu (Health)** | $HP$ | $[0, HP_{\max}]$ | Khi $HP = 0$, nhân vật tử trận hoặc rút lui. Công thức: $HP = \text{Base} + (\text{Mult} \times \text{Level})$. |
| **Khiên (Shield)** | $S$ | $\ge 0$ | Nhận sát thương trước $HP$, thừa hưởng kháng cự của chủ thể; tự hủy hoàn toàn ở cuối mỗi lượt. |
| **Tinh Thần (Sanity)** | $SP$ | $[-45, +45]$ | Tác động trực tiếp lên tỷ lệ mặt Ngửa của đồng xu: $P(\text{Heads}) = 50\% + SP\%$. |
| **Tốc Độ (Speed)** | $v$ | $[v_{\min}, v_{\max}]$ | Gieo xúc xắc ngẫu nhiên đầu mỗi lượt. Quyết định thứ tự hành động và quyền cưỡng bức đụng độ. |
| **Thứ Tự Triển Khai** | $\text{Order}$ | $1 \to 12$ | Cố định trong trận; ưu tiên nhận thêm slot hành động từ lượt 2 và phân xử điều kiện nội tại. |
| **Cấp Công (Offense)** | $\text{Off}$ | $\text{Level} + \text{Mod}$ | Mỗi 3 cấp chênh lệch so với đối thủ được $+1$ Clash Power; đồng thời khuếch đại sát thương ra. |
| **Cấp Thủ (Defense)** | $\text{Def}$ | $\text{Level} + \text{Mod}$ | Giảm sát thương nhận vào; dùng tính toán đụng độ cho kỹ năng phòng thủ. |
| **Vạch Choáng (Stagger)** | $T_{\text{stagger}}$ | $\%$ của $HP_{\max}$ | Các mốc phần trăm trên thanh máu; tụt qua vạch sẽ bị choáng, mất lượt và nhân đôi sát thương. |

---

## 2. Hệ Thống Kháng Cự Hai Lớp (Dual Resistance System)

Mọi sát thương gây ra trong game đều là phép tích hợp giữa **Hệ Vật Lý** và **Hệ Tội (Sin Affinity)**:

```mermaid
flowchart LR
    subgraph Damage_Type_Matrix ["Ma Trận Kháng Cự 3 × 7"]
        subgraph Physical ["3 Hệ Vật Lý"]
            P1["Chém Slash"]
            P2["Đâm Pierce"]
            P3["Đập Blunt"]
        end
        subgraph Sin ["7 Hệ Tội"]
            S1["Phẫn Nộ Wrath"]
            S2["Sắc Dục Lust"]
            S3["Lười Biếng Sloth"]
            S4["Tham Ăn Gluttony"]
            S5["U Sầu Gloom"]
            S6["Kiêu Ngạo Pride"]
            S7["Đố Kỵ Envy"]
        end
    end

    Physical --> Multiplier["Hệ Số Nhân Sát Thương Vật Lý: 0.5x, 0.75x, 1.0x, 2.0x"]
    Sin --> SinMultiplier["Hệ Số Nhân Sát Thương Tội: 0.5x, 0.75x, 1.0x, 1.5x, 2.0x"]
    Multiplier --> TotalDamage["Tổng Sát Thương Bằng Tích Các Hệ Số Nhân"]
    SinMultiplier --> TotalDamage
```

---

## 3. Hệ Thống Kỹ Năng & Cơ Học Đồng Xu (Skills & Coin Engine)

Kỹ năng là đơn vị hành động cơ bản, được vận hành qua thuật toán tung đồng xu:

```mermaid
flowchart TD
    subgraph Skill_Structure ["Cấu Trúc Một Kỹ Năng"]
        BasePower["Điểm Cơ Bản Base Power"]
        Coins["Tập Hợp Đồng Xu Coins: 1 đến 5 đồng xu"]
        CoinPower["Lực Đồng Xu Coin Power: Dương hoặc Âm"]
        SkillType["Phân Loại Kỹ Năng"]
    end

    SkillType --> Atk["Kỹ Năng Tấn Công: Sinh 1 Tài Nguyên Sin"]
    SkillType --> Def["Kỹ Năng Thủ: Guard, Evade, Counter"]
    SkillType --> EGO["Kỹ Năng E.G.O: Tốn SP và Tài Nguyên Sin"]

    Coins --> CoinToss["Thuật Toán Tung Đồng Xu"]
    CoinToss -- "Mặt Ngửa Heads" --> AddPower["Cộng hoặc Trừ Coin Power vào Final Power"]
    CoinToss -- "Mặt Sấp Tails" --> KeepPower["Giữ Nguyên Điểm Hiện Tại"]
    AddPower --> FinalPower["Điểm Cuối Cùng Final Power"]
    KeepPower --> FinalPower
```

---

### 3.1. Các Loại Đồng Xu Đặc Biệt

```mermaid
flowchart TD
    subgraph Coin_Variants ["Các Biến Thể Đồng Xu"]
        NormalCoin["Đồng Xu Thường"]
        UnbreakableCoin["Đồng Xu Không Vỡ Unbreakable"]
        ExcisionCoin["Đồng Xu Diệt Trừ Excision"]
    end

    NormalCoin -- "Thua Đụng Độ" --> Broken["Bị Phá Hủy Hoàn Toàn"]
    UnbreakableCoin -- "Thua Đụng Độ" --> Cracked["Không Bị Hủy, Khóa Lực về 1 và Phản Công Sau Đó"]
    ExcisionCoin -- "Thua Đụng Độ" --> Cracked
    ExcisionCoin -- "Đối Đầu Unbreakable" --> BreakUnbreakable["Phá Hủy Trực Tiếp Đồng Xu Không Vỡ"]
```

---

### 3.2. Phân Loại Kỹ Năng Phòng Thủ (Defense Skills)

1. **Khiên Thủ (Guard / Power Guard):**
   * Tung đồng xu tạo ra lượng khiên bảo vệ hấp thụ sát thương.
   * Biến thể *Clashable Guard*: có khả năng tham gia đụng độ trực tiếp.
2. **Né Tránh (Evade):**
   * Tung đồng xu đọ điểm với đòn tấn công của đối thủ.
   * Nếu điểm Né $>$ Điểm Đòn Đánh: Né hoàn toàn sát thương và **giữ lại đồng xu Né** cho các đòn tiếp theo trong lượt.
   * Nếu điểm Né $\le$ Điểm Đòn Đánh: Nhận đủ sát thương và mất đồng xu Né.
3. **Phản Đòn (Counter / Power Counter):**
   * Nhận sát thương từ đòn đánh đối thủ, sau đó tự động tung đòn phản công trả lại.

---

## 4. Vòng Lặp Lượt Đấu & Động Lực Đụng Độ (Turn Loop & Clash Dynamics)

Toàn bộ nhịp vận hành của một lượt đấu tuân theo cỗ máy trạng thái tuần tự:

```mermaid
stateDiagram-v2
    direction TB
    [*] --> Khoi_Dau_Luot : Turn Start
    Khoi_Dau_Luot --> Gieo_Toc_Do : Gieo Xúc Xắc Tốc Độ
    Gieo_Toc_Do --> Noi_Chuoi_Lenh : Nối Kỹ Năng Trên Bảng Lệnh
    Noi_Chuoi_Lenh --> Kiem_Tra_Dung_Do : Thiết Lập Các Cặp Đấu
    
    state Kiem_Tra_Dung_Do {
        direction LR
        Mot_Chieu : Tấn Công Đơn Chiều Ungopposed
        Doi_Dau : Đụng Độ Hai Chiều Clash
    }

    Kiem_Tra_Dung_Do --> Pha_Giai_Quyet_Clash : Bắt Đầu Đụng Độ
    
    state Pha_Giai_Quyet_Clash {
        Tung_Dong_Xu : Tung Toàn Bộ Coin Cả Hai Bên
        So_Sanh_Diem : So Sánh Final Power
        Tung_Dong_Xu --> So_Sanh_Diem
        So_Sanh_Diem --> Huy_Coin_Ben_Thua : Bên Thua Bị Vỡ 1 Coin
        Huy_Coin_Ben_Thua --> Tung_Dong_Xu : Nếu Cả Hai Còn Coin
    }

    Pha_Giai_Quyet_Clash --> Pha_Sat_Thuong : Bên Thắng Tung Đòn Đánh
    Pha_Sat_Thuong --> Kiem_Tra_Stagger : Trừ Máu và Kiểm Tra Ngưỡng Choáng
    Kiem_Tra_Stagger --> Ket_Thuc_Luot : Turn End
    Ket_Thuc_Luot --> [*] : Chuyển Sang Lượt Kế Tiếp
```

---

### 4.1. Quy Luật Chuyển Hướng Đụng Độ (Clash Redirection)

* **Điều kiện Tốc độ:** Để chuyển hướng đòn tấn công của kẻ địch nhắm vào đồng đội, Sinner phải có $v_{\text{Sinner}} > v_{\text{Enemy}}$.
* **Ngoại lệ kỹ năng không thể đụng độ (Unclashable):** Một số kỹ năng đặc biệt không thể bị ép vào vòng đụng độ, luôn đi thẳng vào giai đoạn gây sát thương đơn phương.
* **Bù trừ kỹ năng thủ (Offset):** Khi kỹ năng phòng thủ chạm kỹ năng phòng thủ của đối phương, cả hai bị triệt tiêu không gây hiệu ứng.

---

## 5. Cơ Chế Choáng Phân Đoạn (Stagger State Transitions)

Trạng thái Choáng là điểm gãy sinh tồn then chốt trong cấu trúc trận đánh:

```mermaid
stateDiagram-v2
    direction LR
    Binh_Thuong : Trạng Thái Bình Thường
    Choang_1 : Choáng Cấp 1 Stagger x2.0
    Choang_2 : Choáng Cấp 2 Stagger Plus x2.5
    Choang_3 : Choáng Cấp 3 Stagger Plus Plus x3.0

    Binh_Thuong --> Choang_1 : HP Tụt Xuống Dưới Ngưỡng T1
    Choang_1 --> Choang_2 : HP Tiếp Tục Vượt Ngưỡng T2 Trong Cùng Lượt
    Choang_2 --> Choang_3 : HP Tiếp Tục Vượt Ngưỡng T3 Trong Cùng Lượt
    Choang_1 --> Binh_Thuong : Hết Thời Gian Choáng 1 Đến 2 Lượt
    Choang_2 --> Binh_Thuong : Hết Thời Gian Choáng
    Choang_3 --> Binh_Thuong : Hết Thời Gian Choáng
```

---

## 6. Hệ Thống Tinh Thần, Hoảng Loạn & Ăn Mòn E.G.O (Sanity & Corrosion Dynamics)

Sanity ($SP$) vận hành như một con lắc động lực quyết định sự kiểm soát lý trí:

```mermaid
flowchart TD
    SP_Neutral["SP = 0: Trạng Thái Xuất Phát"]
    
    SP_High["SP = +45: Trạng Thái Lý Trí Tối Đa"]
    SP_LowMorale["SP <= -30: Tinh Thần Suy Sụp Low Morale"]
    SP_Panic["SP = -45: Hoảng Loạn Panic hoặc Ăn Mòn E.G.O Corrosion"]

    SP_Neutral -- "Thắng Đụng Độ hoặc Tiêu Diệt Địch" --> SP_High
    SP_High -- "Xác Suất Lật Mặt Ngửa Đạt 95%" --> Dominance["Dễ Dàng Thắng Đụng Độ Tiếp Theo"]
    
    SP_Neutral -- "Thua Đụng Độ, Đồng Đội Chết, Dính Sinking" --> SP_LowMorale
    SP_LowMorale -- "Tiếp Tục Tụt Điểm" --> SP_Panic
    
    SP_Panic --> PanicBranch{"Kiểm Tra Trang Bị E.G.O"}
    PanicBranch -- "Không Có E.G.O Corrosion" --> Actionless["Đứng Im Bỏ Lượt Hoàn Toàn"]
    PanicBranch -- "Có Trang Bị E.G.O" --> CorrosionAtk["Ăn Mòn E.G.O: Tự Động Dùng Chiêu Đánh Cả Đồng Đội"]
    
    Actionless --> ResetSP["Lượt Kế Tiếp: SP Được Đưa Về 0"]
    CorrosionAtk --> ResetSP
```

---

## 7. Toàn Bộ 7 Hiệu Ứng Từ Khóa Trụ Cột (The 7 Archetype Keywords)

Mỗi từ khóa trạng thái hoạt động dựa trên cặp tọa độ hai tham số: $\mathbf{S} = (\text{Potency}, \text{Count})$.

```mermaid
flowchart TD
    subgraph Keyword_Taxonomy ["7 Từ Khóa Hiệu Ứng Cốt Lõi"]
        Burn["1. Hỏa Sát Burn"]
        Bleed["2. Chảy Máu Bleed"]
        Tremor["3. Rung Động Tremor"]
        Rupture["4. Đổ Vỡ Rupture"]
        Sinking["5. Hư Hao Sinking"]
        Poise["6. Khí Thế Poise"]
        Charge["7. Nạp Năng Lượng Charge"]
    end

    Burn --> Act_Burn["Kích Hoạt Cuối Lượt: Gây Potency Sát Thương, Giảm 1 Count"]
    Bleed --> Act_Bleed["Kích Hoạt Khi Tung Coin: Gây Potency Sát Thương, Giảm 1 Count"]
    Tremor --> Act_Tremor["Kích Hoạt Qua Tremor Burst: Tăng Vạch Choáng Thêm Potency, Giảm 1 Count"]
    Rupture --> Act_Rupture["Kích Hoạt Khi Bị Đánh Trúng: Gây Potency Sát Thương Cố Định, Giảm 1 Count"]
    Sinking --> Act_Sinking["Kích Hoạt Khi Bị Đánh Trúng: Trừ Potency Điểm SP, Giảm 1 Count"]
    Poise --> Act_Poise["Kích Hoạt Khi Đánh Trúng: Tăng Tỷ Lệ và Sát Thương Chí Mạng"]
    Charge --> Act_Charge["Tích Lũy Tài Nguyên Số Đếm: Tiêu Thụ Để Tung Kỹ Năng Cường Hóa"]
```

---

### 7.1. Bảng Chi Tiết Thuật Toán Của 7 Hiệu Ứng

| Từ Khóa | Icon | Cơ Chế Kích Hoạt | Tác Động Lên Trục Chỉ Số | Quy Tắc Tiêu Hao |
|---|---|---|---|---|
| **Burn** | Hỏa Sát | Turn End | Trừ trực tiếp vào $HP$. | Count giảm 1 mỗi cuối lượt; nếu Count $= 0$, xóa Potency. |
| **Bleed** | Chảy Máu | Mỗi lần thực thể lật đồng xu tấn công | Trừ trực tiếp vào $HP$ trước khi đòn đánh diễn ra. | Count giảm 1 mỗi lần tung coin; nếu Count $= 0$, xóa Potency. |
| **Tremor** | Rung Động | Cần kỹ năng có hiệu ứng *Tremor Burst* | Dịch chuyển vạch ngưỡng Choáng $T_{\text{stagger}}$ lại gần mức máu hiện tại. | Potency dâng vạch; Count giảm 1 ở cuối lượt. |
| **Rupture** | Đổ Vỡ | Mỗi lần nhận đòn đánh trúng đích | Trừ trực tiếp vào $HP$ một lượng sát thương chuẩn cố định. | Count giảm 1 mỗi đòn trúng; nếu Count $= 0$, xóa Potency. |
| **Sinking** | Hư Hao | Mỗi lần nhận đòn đánh trúng đích | Trừ trực tiếp vào $SP$. Đối với quái không có $SP$, trừ vào $HP$ hệ Gloom. | Count giảm 1 mỗi đòn trúng; nếu Count $= 0$, xóa Potency. |
| **Poise** | Khí Thế | Khi thực thể tung đòn tấn công | Tỷ lệ chí mạng $= 5\% \times \text{Potency}$. Sát thương chí mạng $= +20\% + (2.5\% \times \text{Count})$. | Count giảm 1 khi chí mạng hoặc cuối lượt. |
| **Charge** | Tích Điện | Bị động tích lũy qua kỹ năng | Lưu trữ dung lượng năng lượng nội bộ (tối đa 20 Count). | Bị kỹ năng tiêu hao một lượng Count nhất định (ví dụ Rip Space tốn 10 Charge). |

---

## 8. Hệ Thống Đại Số Tội & Cơ Chế Cộng Hưởng (Sin Resonance Algebra)

Khi người chơi liên kết các kỹ năng trên bảng điều khiển, vị trí tô-pô của các màu sắc sinh ra hiệu ứng cộng hưởng:

```mermaid
flowchart LR
    subgraph Resonance_Types ["Hai Kiểu Cộng Hưởng Tội"]
        SinRes["Cộng Hưởng Thường Sin Resonance"]
        AbsRes["Cộng Hưởng Tuyệt Đối Absolute Resonance"]
    end

    Chain["Chuỗi Kỹ Năng Trên Bảng Điều Khiển"] --> SinRes
    Chain --> AbsRes

    SinRes --> Rule_SinRes["Độ dài chuỗi L liên tục cùng màu: Tăng L Cấp Độ Tấn Công"]
    AbsRes --> Rule_AbsRes["Có từ 3 kỹ năng cùng màu bất kỳ: Kích hoạt toàn bộ nội tại Absolute Passive"]
```

---

## 9. Toàn Bộ Công Thức Toán Học Trong Gameplay (Mathematical Formulation)

### 9.1. Công thức Máu tối đa (Max HP)
$$\text{MaxHP} = \text{BaseHP} + (\text{Multiplier} \times \text{Level})$$

### 9.2. Công thức Xác suất lật mặt Ngửa (Heads Probability)
$$P(\text{Heads}) = \min\left(0.95, \max\left(0.05, 0.50 + \frac{SP}{100}\right)\right)$$

### 9.3. Công thức Cấp Công / Cấp Thủ và Điểm Đụng Độ
$$\Delta \text{Level} = \text{Offense Level} - \text{Defense Level}$$
* Trong đụng độ: Cứ mỗi $3$ điểm chênh lệch cấp công thủ, kỹ năng có cấp cao hơn được nhận thêm **$+1$ Clash Power**.

### 9.4. Công thức Hệ số Sát thương do Chênh lệch Cấp Độ
$$M_{\text{level}} = \frac{\text{Off} - \text{Def}}{|\text{Off} - \text{Def}| + 25} \times 100\%$$

### 9.5. Công thức Sát thương Tổng hợp của Một Đòn Đánh
$$\text{Damage} = \left\lfloor \text{FinalPower} \times R_{\text{Phys}} \times R_{\text{Sin}} \times \left(1 + \frac{M_{\text{level}}}{100}\right) \times K_{\text{Stagger}} \times K_{\text{Crit}} \right\rfloor$$
Trong đó:
* $\text{FinalPower}$: Điểm sức mạnh kỹ năng sau khi lật toàn bộ đồng xu.
* $R_{\text{Phys}}$: Hệ số kháng cự vật lý (Slash / Pierce / Blunt), nhận giá trị $\{0.5, 0.75, 1.0, 2.0\}$.
* $R_{\text{Sin}}$: Hệ số kháng cự Tội (Wrath ... Envy), nhận giá trị $\{0.5, 0.75, 1.0, 1.5, 2.0\}$.
* $K_{\text{Stagger}}$: Hệ số nhân trạng thái choáng, nhận giá trị:
  * Không choáng: $1.0$
  * `Stagger`: $2.0$
  * `Stagger+`: $2.5$
  * `Stagger++`: $3.0$
* $K_{\text{Crit}}$: Hệ số sát thương chí mạng (nếu kích hoạt Poise): $1.2 + (0.025 \times \text{Count}_{\text{Poise}})$.

---

## 10. Bản Đồ Tổng Lực Vận Hành Core Gameplay (Master Loop Diagram)

```mermaid
flowchart TD
    StartRound["1. Bắt Đầu Lượt: Gieo Tốc Độ và Nạp Kỹ Năng"] --> SetupChain["2. Người Chơi Sắp Xếp Chuỗi Kỹ Năng và Phòng Thủ"]
    SetupChain --> CalcResonance["3. Tính Toán Cộng Hưởng Sin Resonance và Tăng Cấp Công"]
    CalcResonance --> ResolveClash["4. Phân Giải Toàn Bộ Đụng Độ Clash Tuần Tự Theo Tốc Độ"]
    
    ResolveClash --> ClashWon["Bên Thắng Giữ Lại Đồng Xu Chưa Vỡ"]
    ResolveClash --> ClashLost["Bên Thua Bị Vỡ Đồng Xu và Tụt SP"]
    
    ClashWon --> ExecAttacks["5. Thực Thi Đòn Tấn Công Đơn Chiều"]
    ExecAttacks --> ApplyKeywords["6. Kích Hoạt Hiệu Ứng Bám Kèm: Bleed, Rupture, Sinking"]
    ApplyKeywords --> CheckHPStagger["7. Tính Sát Thương, Trừ Khiên và Kiểm Tra Vạch Choáng"]
    
    CheckHPStagger --> CheckDeath["8. Kiểm Tra Đơn Vị Tử Trận: Trừ SP Toàn Phe"]
    CheckDeath --> TurnEnd["9. Kết Thúc Lượt: Kích Hoạt Burn, Giảm Count Trạng Thái, Triệt Tiêu Khiên"]
    TurnEnd --> NextRound{"Còn Đơn Vị Sống?"}
    NextRound -- "Có" --> StartRound
    NextRound -- "Không" --> VictoryDefeat["Kết Thúc Trận Đấu: Chiến Thắng hoặc Thất Bại"]
```
