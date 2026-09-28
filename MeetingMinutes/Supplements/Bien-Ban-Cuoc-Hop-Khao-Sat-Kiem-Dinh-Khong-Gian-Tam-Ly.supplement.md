# Tài liệu bổ sung (Supplement): Thẩm định không gian tâm lý hai tầng của Project Anima

**Biên bản gốc được thẩm định:** [Khảo sát và kiểm định không gian tâm lý](../Bien-Ban-Cuoc-Hop-Khao-Sat-Kiem-Dinh-Khong-Gian-Tam-Ly.md) (từ mục §1 đến §7).  
**Hồ sơ thẩm định liên quan:** [Biên bản thẩm định phiên 01](../../EvaluationMinutes/2026-09-28-Bien-Ban-Cuoc-Hop-Khao-Sat-Kiem-Dinh-Khong-Gian-Tam-Ly-01.md), [Biên bản thẩm định phiên 02](../../EvaluationMinutes/2026-09-28-Bien-Ban-Cuoc-Hop-Khao-Sat-Kiem-Dinh-Khong-Gian-Tam-Ly-02.md).  
**Thời điểm biên soạn:** 2026-09-28.  
**Ghi chú biên tập:** Ngày 2026-09-29: Biên tập văn phong tiếng Việt tự nhiên và chuẩn hóa học thuật bởi Antigravity theo chỉ đạo của Chủ tọa; bảo toàn tuyệt đối 100% nội dung khoa học, mã kiểm chứng, số liệu và kết luận thẩm định.  
**Đối tượng tiếp nhận:** Chủ tọa dự án và Nhóm kiến trúc triển khai.

---

## 1. Hướng dẫn tiếp cận tài liệu bổ sung

Tài liệu này được biên soạn nhằm giải trình chi tiết cơ sở học thuật của các luận điểm nêu trong cuộc họp, xác định ranh giới hỗ trợ thực tế của các tài liệu tham khảo, đồng thời phân định rạch ròi đâu là tri thức khoa học đã được thực chứng và đâu là các quyết định thiết kế riêng của dự án. Tài liệu này mang tính chất giải thích độc lập, không thay thế nội dung biên bản họp gốc.

Một công trình nghiên cứu được trích dẫn tại đây **không đồng nghĩa** với việc nó xác nhận tính đúng đắn cho mọi nhận định trong biên bản. Hội đồng thẩm định phân loại các luận điểm theo sáu nhãn bằng chứng chuẩn mực:
* **Được hỗ trợ:** Luận điểm có bằng chứng thực nghiệm hoặc suy luận toán học chặt chẽ chứng minh.
* **Được hỗ trợ một phần:** Tài liệu chỉ xác nhận khung lý thuyết hoặc một phần phạm vi của khẳng định.
* **Tranh cãi/chưa ngã ngũ:** Vấn đề học thuật còn nhiều luồng quan điểm trái chiều trong giới chuyên môn.
* **Chưa xác minh:** Dự án hiện chưa có đủ dữ liệu, mã nguồn hoặc tài liệu thực nghiệm để đưa ra phán quyết (lưu ý: nhãn này không đồng nghĩa với “sai”).
* **Bị nguồn phản bác:** Tuyên bố mâu thuẫn trực tiếp với các bằng chứng khoa học hiện hành.
* **Giả thuyết/mô hình của dự án:** Phương án thiết kế kỹ thuật phục vụ trò chơi, chưa qua kiểm chứng ngoài đời thực.

Phạm vi kiểm chứng nguồn hiện tại tập trung vào trang xuất bản chính thức, cơ sở dữ liệu PubMed, phần tóm tắt công khai (abstract) và các chương mục mở. Các phép tính giải tích nội bộ được kiểm tra trực tiếp từ phương trình trong biên bản. Hiện dự án chưa sở hữu mã nguồn hoàn chỉnh, dữ liệu vận hành thực tế, kết quả đo lường CPU (profiler), dữ liệu sinh lý thực nghiệm hay nghiên cứu đánh giá hiệu lực tâm lý độc lập cho Project Anima. Mức độ tin cậy nêu trong các bảng đánh giá là **mức độ tin cậy vào phán quyết học thuật của hội đồng**, không phải xác suất đúng sai tuyệt đối của một học thuyết khoa học.

---

## 2. Báo cáo tóm tắt đệ trình Chủ tọa

Mô hình kiến trúc hai tầng là một **phương án thiết kế mô phỏng khả thi về mặt kỹ thuật, có thể đưa vào lập trình và đo kiểm**. Các hệ thống lý thuyết về mô hình năm nhân cách Big Five, vòng tròn quan hệ tương tác (interpersonal circumplex), hệ động lực nhanh–chậm và tín hiệu cảnh báo sớm chuyển pha cung cấp nền tảng ý niệm quý giá. Tuy nhiên, các tài liệu này chưa đủ cơ sở để xác thực rằng sáu biến số của Project Anima là các trục sinh học trực giao, có khả năng bao phủ 100% nhân cách con người hay tái hiện chính xác các hiện tượng lâm sàng ngoài đời thực.

Ba điểm cốt lõi cần hiệu chỉnh ngay từ câu chữ của văn bản:
1. Ràng buộc đại số $C = f(A,V)$ làm triệt tiêu điều kiện ban đầu độc lập của biến $C$, nhưng **không đồng nghĩa** với việc hạng của mọi ma trận dữ liệu mẫu đều bằng 3.
2. Lịch cập nhật trạng thái phân tầng cho 500 NPC giúp giảm **chính xác 60% số lượt tính toán cập nhật biến**, chưa đủ căn cứ để kết luận giúp tiết kiệm 70% thời gian thực thi của CPU.
3. Năm kịch bản kiểm thử tại §7 thực chất là các tình huống thiết kế và kết quả kỳ vọng được mô tả định tính; hoàn toàn chưa có mã nguồn hay nhật ký thực thi để xem đây là các bài benchmark đã vượt qua.

Bên cạnh đó, việc diễn giải não bộ theo sơ đồ tiến hóa tuần tự ba tầng “bò sát → hệ viền → vỏ não” để biện minh cho kiến trúc phần mềm cần phải được bãi bỏ, do mô hình của MacLean đã bị sinh học thần kinh hiện đại ([nguồn S7]) bác bỏ về mặt giải phẫu tiến hóa.

---

## 3. Bảng phân loại luận điểm theo tiến trình cuộc họp

| ID; Vị trí gốc | Nội dung luận điểm và phân loại | Nguồn kiểm chứng / Phép kiểm giải tích | Trạng thái thẩm định; Độ tin cậy | Diễn đạt hoặc phương án đề xuất |
| :--- | :--- | :--- | :--- | :--- |
| **C01**; §2 vòng 1 | Ràng buộc đại số `C = f(A,V)` khiến biến C mất bậc tự do động lực; ma trận trạng thái có “Rank = 3”. *(Toán học)* | Đánh giá ma trận Jacobian của ánh xạ nhúng trạng thái tại §4.1; không phụ thuộc vào dữ liệu tâm lý học. | Phần mất bậc tự do: **Được hỗ trợ**; Nhận định hạng ma trận dữ liệu luôn bằng 3: **Bị phản bác**; Tin cậy cao. | Mô tả đây là một ràng buộc đại số làm giảm chiều địa phương của đa tạp trạng thái, tránh đồng nhất với hạng của mọi ma trận dữ liệu quan sát. |
| **C02**; §2 vòng 1, §3–4 | Việc bổ sung phương trình vi phân (ODE) riêng cho C giúp “đảm bảo tính trực giao”. *(Toán học / Mô hình)* | Phương trình vi phân cấp cho C điều kiện ban đầu riêng; tuy nhiên chưa xây dựng ma trận hiệp phương sai hay hệ đo lường trực giao. | **Được hỗ trợ một phần**; Tin cậy cao. | Diễn đạt lại thành: “C trở thành một biến trạng thái sở hữu quán tính động lực riêng”; tính trực giao cần được định nghĩa và kiểm chứng độc lập. |
| **C03**; §2 vòng 2 | Trạng thái Đóng băng (Freeze) là sự kích hoạt cực đại của SNS kết hợp DVC khóa cứng vận động; nhịp tim đạt 180 bpm; lý thuyết Polyvagal bắt buộc phải tách các trục sinh lý. *(Cơ chế sinh học thần kinh)* | Nguồn [S1] trình bày lý thuyết Polyvagal; nguồn [S2] phản bác các tiền đề sinh học; nghiên cứu bất động phòng vệ [S3] không xác thực cơ chế và chỉ số nhịp tim cụ thể này. | Khung lý thuyết: **Tranh cãi**; Cơ chế SNS/DVC và mốc 180 bpm: **Chưa xác minh**; Tin cậy trung bình–cao. | Sử dụng hai biến kích hoạt và ức chế như các tham số quy ước trong mô phỏng; không đồng nhất máy móc với hai nhánh thần kinh thực vật khi chưa có đo đạc. |
| **C04**; §2 vòng 3 | Hai chiều Hòa đồng (Communion) và Chiếm ưu thế (Agency) trong mô hình circumplex quy định mọi hành vi xã hội đều bắt buộc phải nằm trên hai trục này. *(Mô hình tâm lý)* | Nguồn [S4] mô tả hai chiều không gian; bài báo cũng chỉ ra một số dự đoán lý thuyết bị thực nghiệm bác bỏ và điều chỉnh cực âm của Communion thành sự thờ ơ. | Giá trị biểu diễn của mô hình: **Được hỗ trợ**; Tính cần và đủ phổ quát: **Không được hỗ trợ**; Tin cậy cao. | Xem Warmth và Dominance là hai biến số hữu ích cho tương tác game; bổ sung biến mục tiêu, niềm tin và bối cảnh để xác định trọn vẹn hành vi. |
| **C05**; §2 vòng 4, §3–4 | Khung lý thuyết CB5T/Big Five cho phép ánh xạ định lượng 0/50/80/85/100% vào các trục tọa độ; `Extraversion = D + E_x`, `Agreeableness = W`. *(Lý thuyết + Giả thuyết dự án)* | Nguồn [S5] định nghĩa nét tính cách là tham số điều khiển học; nguồn [S6] phân tích nhân tố xác lập 10 khía cạnh (aspects), không kiểm chứng engine 2+4; không có thang đo độ bao phủ. | Ánh xạ cấu trúc: **Giả thuyết của dự án**; Các tỷ lệ bao phủ: **Chưa xác minh**; Tin cậy cao. | Phân định rạch ròi giữa Nét tính cách ổn định (Trait) và Trạng thái tức thời (State); xây dựng mô hình dự báo và kiểm thử thực nghiệm trước khi công bố tỷ lệ bao phủ. |
| **C06**; §3–5 | Phương án B (kiến trúc hai tầng) là giải pháp kiến trúc tối ưu. *(Thiết kế phần mềm)* | Việc đề xuất phương án kiến trúc là một quyết định kỹ thuật nội bộ; tính đúng đắn sinh học đòi hỏi phải có dữ liệu đo đạc chuyên biệt. | **Mô hình của dự án**; Tin cậy cao. | Giữ nguyên quyết định phê chuẩn của Chủ tọa như một định hướng phát triển sản phẩm, tránh trình bày như một chân lý khoa học tự nhiên. |
| **C07**; §4, §6.1 | Không gian trạng thái $\mathbb{R}^6$ bắt buộc tất cả biến số phải cùng thang thời gian; cấu trúc bó thớ (fiber bundle) tự động sinh ra tương tác ghép, nguyên lý slaving và sụp đổ số chiều. *(Toán học)* | Phản ví dụ hệ nhanh–chậm xây dựng trực tiếp trong $\mathbb{R}^6$ tại §4.4; không gian tích Descartes không tự thân sản sinh hệ phương trình tương tác. | Lập luận toán học bắt buộc: **Bị phản bác**; Tin cậy cao. | Xem cấu trúc 2+4 là giải pháp phân chia lịch tick và quản lý biến; chỉ sử dụng thuật ngữ “slaving” khi đã chứng minh được điều kiện ổn định của đa tạp chậm. |
| **C08**; §4, §6.1 | Kiến trúc hai tầng “khớp hoàn toàn” với mô hình não ba tầng của MacLean. *(Sinh học thần kinh tiến hóa)* | Nguồn [S7] chứng minh mô hình não ba tầng tuần tự không phản ánh đúng tiến trình tiến hóa giải phẫu của hệ thần kinh động vật có xương sống. | **Bị nguồn phản bác** nếu xem là mô tả giải phẫu thần kinh; Tin cậy cao. | Duy trì việc phân tầng nhanh/chậm như một giải pháp kiến trúc phần mềm; loại bỏ việc viện dẫn “não bò sát” như một cơ sở chứng minh khoa học. |
| **C09**; §6.1 | Tần số 10 Hz tương ứng thời hằng sinh học 100 ms; 1 Hz tương ứng 1–3600 s; cấu hình 500 NPC giúp giảm 70% chi phí AI mà không gây độ trễ. *(Hiệu năng tính toán)* | Phép tính từ lịch tick cho thấy số lượt tính toán giảm từ 30.000 xuống 12.000 lượt/giây (§4.5); chưa có kết quả đo profiler hoặc độ trễ thực tế. | Tuyên bố giảm 70% CPU: **Bị phản bác bởi phép đếm số học**; Hiệu năng và độ trễ thực tế: **Chưa xác minh**; Tin cậy cao. | Diễn đạt chính xác: “Giảm 60% số lượt tính toán cập nhật biến trong ví dụ giả định”; cần tiến hành đo kiểm thực tế tải CPU và độ trễ trên cấu hình phần cứng xác định. |
| **C10**; §6.3 | Mô hình hố hút sang chấn Gauss; môi trường an toàn làm phẳng hố; chiến thắng xóa sạch ám ảnh tâm lý. *(Mô hình + Giả thuyết điều trị)* | Phân tích điều kiện dấu của số hạng Gauss tại §4.6; nguồn [S8] chỉ khảo sát tín hiệu cảm xúc trong trầm cảm, không chứng minh cơ chế xóa sang chấn trong game. | Công thức toán học: **Cần chuẩn hóa lại dấu**; Tác dụng điều trị: **Chưa xác minh**; Tin cậy cao. | Đảm bảo hệ số biên độ hố mang dấu xác định; mô tả cơ chế thích nghi như các quy tắc học tập giả định trong thiết kế, tránh cam kết xóa sạch ký ức sau vài biến cố. |
| **C11**; §6.4 | Hệ thống Nemesis là một phiên bản sơ khai của SDE; việc cắt đứt lực ghép tự động sinh ra hành vi báo thù; ngưỡng kích hoạt tự tạo phân nhánh Saddle-node. *(Đối sánh Game / Toán học)* | Bằng sáng chế [S11] chỉ mô tả cơ chế nhân vật theo sự kiện, không đồng nhất với SDE; phân tích giải tích về lực ghép và phân nhánh tại §4.7. | Cơ chế gameplay theo sự kiện: **Được hỗ trợ một phần**; Quy đổi sang SDE / tự sinh báo thù: **Chưa xác minh**; Tin cậy cao. | Xây dựng quy tắc cập nhật bộ nhớ và trọng số quan hệ riêng biệt khi xảy ra sự kiện tử vong; cung cấp lời giải giải tích nếu sử dụng thuật ngữ phân nhánh Saddle-node. |
| **C12**; §7.1–7.5 | Năm kịch bản kiểm thử tạo ra các phản ứng hành vi và giá trị C/V/D/W chính xác như dự kiến. *(Kịch bản thiết kế)* | Biên bản không có mã nguồn, tham số đầy đủ, giá trị seed hay tiêu chí pass/fail; nguồn [S9] chỉ chứng minh suy giảm nhận thức chung khi mất ngủ, không cho mốc 12/24/36h. | **Chưa xác minh như một kết quả thực nghiệm**; Tin cậy cao. | Định danh lại thành “năm kịch bản kiểm thử đề xuất trong thiết kế”; ghi nhận kết quả kỳ vọng và tiến hành đo đạc kết quả thực tế sau khi hoàn thiện engine. |
| **C13**; §7.3 | Hiện tượng suy kiệt ý chí (ego depletion) vận hành như nguồn nhiên liệu cạn kiệt; nét Tận tâm giúp bù đắp hoàn toàn 36 giờ mất ngủ. *(Cơ chế tâm lý học)* | Nguồn [S9] khẳng định tác hại của mất ngủ lên nhận thức; nghiên cứu lặp lại quy mô lớn [S10] cho thấy hiệu ứng ego depletion là rất nhỏ và không có ý nghĩa thống kê. | Tác hại của mất ngủ: **Được hỗ trợ** ở mức khái quát; Cơ chế năng lượng ý chí: **Tranh cãi / Chưa xác minh**; Tin cậy cao. | Xem chi phí tiêu hao ý chí như một tham số điều tiết hành vi trong game, tránh đồng nhất giản đơn với nồng độ glucose sinh học hay một nét tính cách cố định. |
| **C14**; §7.6 | Các tuyên bố: “Đã trực tiếp chạy thử nghiệm”, “các bài benchmark đã vượt qua hoàn toàn”, “chứng minh bao phủ 100% Big Five”. *(Tuyên bố thực nghiệm)* | Không có bất kỳ dữ liệu thực thi, nhật ký vận hành hay thang đo thực nghiệm nào trong hồ sơ. | **Chưa xác minh**; Tin cậy cao. | Chỉnh sửa thành: “Đã xây dựng và thảo luận năm kịch bản kiểm thử giả định trên lý thuyết; toàn bộ các bài benchmark thực nghiệm vẫn đang chờ triển khai”. |

---

## 4. Phân tích chuyên sâu về tri thức khoa học và giải tích toán học

### 4.1. Biến trạng thái, bậc tự do động lực và bản chất hạng ma trận (§2 vòng 1)

Xét hệ thống với ba tọa độ biến thiên độc lập là $A, V, S$ cùng biến số $C$ bị ràng buộc bởi hàm đại số $C = f(A,V)$. Trạng thái quan sát được của hệ thống trong không gian 4 chiều được xác định thông qua ánh xạ nhúng:

$$F(A,V,S) = \big(A, \; V, \; f(A,V), \; S\big)^\top$$

Ngoại trừ các điểm gãy không trơn của hàm ngưỡng (như hàm `max`), ma trận đạo hàm Jacobian $DF$ có dạng:

$$DF = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ \frac{\partial f}{\partial A} & \frac{\partial f}{\partial V} & 0 \\ 0 & 0 & 1 \end{pmatrix}$$

Do ba vector cột của $DF$ luôn độc lập tuyến tính với nhau trên toàn bộ miền khả vi, ảnh của ánh xạ $F$ là một đa tạp con có **chiều địa phương chính xác bằng 3** nằm bên trong $\mathbb{R}^4$. Đây là cơ sở xác đáng của lời phản biện: Hệ thống bị mất đi một bậc tự do động lực, bởi biến $C$ không thể sở hữu một điều kiện ban đầu độc lập mà luôn bị ấn định tức thời theo trạng thái của $A$ và $V$.

Tuy nhiên, nhận định cho rằng “hạng của mọi ma trận trạng thái đều bằng 3” lại là một suy diễn không chính xác về mặt đại số tuyến tính. Một tập hợp các điểm nằm trên một đường cong phi tuyến 1 chiều hoàn toàn có thể trải ra một ma trận dữ liệu có hạng bằng 2 (ví dụ tập hợp các vector hàng $(x, x^2)$ với nhiều giá trị $x$ khác nhau). Tương tự, nếu hàm $f(A,V)$ mang tính phi tuyến mạnh, một ma trận dữ liệu quan sát gồm nhiều mẫu $(A, V, f(A,V), S)$ hoàn toàn có thể đạt **hạng tuyến tính bằng 4**. Do đó, cần phân biệt rạch ròi giữa **chiều nội tại của đa tạp trạng thái** (intrinsic manifold dimension) với **hạng tuyến tính của ma trận dữ liệu mẫu** (sample matrix rank).

Việc bổ sung phương trình vi phân động lực $\frac{dC}{dt} = \frac{C_{\text{target}}(A,V) - C}{\tau} - D_{\text{task}}$ sẽ cấp cho biến $C$ một điều kiện ban đầu độc lập cùng quán tính thời gian riêng, với điều kiện hằng số thời gian $\tau > 0$ và thuật toán lưu trữ trạng thái $C$ liên tục qua các chu kỳ tick thay vì gán đè đại số. Dẫu vậy, phương trình này về bản chất vẫn duy trì liên kết ghép động lực giữa $C$ với $A$ và $V$. Tính độc lập về điều kiện ban đầu không đồng nghĩa với tính trực giao về mặt hình học hay độc lập thống kê. Muốn khẳng định các trục tọa độ là “trực giao”, dự án bắt buộc phải xác lập một metric nội tích cụ thể hoặc kiểm chứng tính triệt tiêu của hiệp phương sai từ dữ liệu thực nghiệm. Phương trình vi phân riêng thuần túy chỉ giải quyết được bài toán giải phóng ràng buộc đại số tức thời.

### 4.2. Kích hoạt sinh lý, ức chế vận động và lý thuyết Polyvagal (§2 vòng 2)

Lý thuyết Polyvagal do Stephen Porges đề xuất ([nguồn S1]) mang lại một góc nhìn giàu tính liên tưởng về mối quan hệ giữa các phân nhánh thần kinh tự chủ và hành vi phòng vệ xã hội. Tuy nhiên, trong giới sinh học thần kinh, công trình tổng quan của Paul Grossman ([nguồn S2]) đã chỉ ra nhiều điểm yếu nghiêm trọng và phản bác năm tiền đề cốt lõi của lý thuyết này về mặt giải phẫu tiến hóa và phương pháp đo đạc điện sinh lý. Do đó, việc khẳng định lý thuyết Polyvagal “chứng minh tính trực giao” cho cấu trúc hai trục của engine là một nhận định thiếu nền tảng thực chứng vững chắc.

Hiện tượng động vật và con người rơi vào trạng thái bất động phòng vệ dưới áp lực đe dọa sinh tử là một chủ đề nghiên cứu thực nghiệm có thật ([nguồn S3]). Tuy nhiên, các tài liệu sinh lý học không hề xác nhận một công thức toán học phổ quát có dạng `SNS = 0.9, DVC = 0.9, Nhịp tim = 180 bpm` như mô tả trong biên bản. Hơn nữa, các phản ứng sinh học khác nhau như chú ý phòng vệ (attentive immobility/freezing), bất động căng trương lực (tonic immobility) và suy sụp hoàn toàn (quiescent immobility/collapse) có cơ chế vận hành rất khác nhau, không nên bị gộp chung thành một trạng thái duy nhất nếu thiếu các tiêu chí đo lường định lượng.

Trong khuôn khổ thiết kế trò chơi, nhóm phát triển hoàn toàn có thể duy trì các biến số tính toán như `activation` (mức độ kích hoạt sinh lý), `motor_inhibition` (mức độ ức chế vận động) và `perceived_threat` (đe dọa nhận thức) để phục vụ việc phân hóa hành vi NPC. Đây là những giải pháp kỹ thuật hợp lý. Dẫu vậy, nếu muốn gắn các biến số này với các nhánh thần kinh cụ thể ngoài đời thực, dự án bắt buộc phải có các phép đo điện sinh lý đối chứng (nhịp tim, biến thiên nhịp tim HRV, trương lực cơ, nhịp thở) và minh định rõ giới hạn của từng chỉ dấu đo lường. Việc sắp đặt hai biến số vào hai chiều của một vector toán học không đủ để chứng minh hai quá trình sinh học đó là độc lập hay trực giao.

### 4.3. Mô hình vòng tròn quan hệ (Circumplex), Big Five và lý thuyết CB5T (§2 vòng 3–4)

Công trình của Leonard Horowitz và cộng sự ([nguồn S4]) đã hệ thống hóa hành vi tương tác xã hội dựa trên hai chiều không gian trực giao: Hòa đồng (Communion) và Chiếm ưu thế (Agency). Hai chiều này rất hữu dụng để phân biệt các kiểu mẫu tính cách trong trò chơi (ví dụ: một thủ lĩnh ấm áp, nâng đỡ đối lập với một thủ lĩnh lạnh lùng, áp đặt). Dẫu vậy, chính nghiên cứu của Horowitz đã ghi nhận nhiều trường hợp dữ liệu thực nghiệm không khớp với dự đoán của mô hình circumplex cổ điển, từ đó phải điều chỉnh lại ý nghĩa học thuật: cực âm của trục Communion thực chất là **sự thờ ơ, lãnh đạm** chứ không mặc định là **sự thù địch**. Do đó, phản ứng phục tùng (Fawn) trong tâm lý học sang chấn không thể được giản lược cơ học thành tổ hợp “Hòa đồng cao + Chiếm ưu thế thấp”; hành vi quan sát bên ngoài hoàn toàn khác biệt với động cơ phòng vệ bên trong—điều mà hai trục tọa độ phẳng không thể nhận diện một cách chắc chắn.

Đối với mô hình năm nhân cách Big Five, cần thiết lập ranh giới học thuật rõ ràng giữa hai khái niệm:
* **Nét tính cách (Trait):** Những khuynh hướng tâm lý sinh học tương đối ổn định và bền vững của một cá nhân qua thời gian và không gian.
* **Trạng thái tức thời (State):** Các giá trị tọa độ tâm lý sinh học biến thiên nhanh theo từng giây, từng phút dưới tác động của hoàn cảnh ($A_{\text{phys}}, V_{\text{bio}}, C, W, D, E_x$).

Lý thuyết Điều khiển học về Nhân cách (Cybernetic Big Five Theory - CB5T) của Colin DeYoung ([nguồn S5]) xác định các nét tính cách Big Five đóng vai trò là **các tham số cơ chế** của hệ thống điều khiển tâm lý (như ngưỡng kích hoạt, độ nhạy phản ứng, tốc độ tiêu hao và hồi phục), trong khi các mục tiêu và chiến lược hành vi cụ thể là các thích nghi đặc trưng (characteristic adaptations). Vì vậy, một mô hình toán học đúng đắn phải ánh xạ:

$$\text{Nét tính cách (Trait)} \;\longrightarrow\; \text{Bộ tham số động lực} \;\{\tau, \text{ngưỡng}, \text{hệ số nhạy}\} \;\longrightarrow\; \text{Quỹ đạo biến thiên của Trạng thái (State)}$$

Việc đồng nhất cơ học giá trị trạng thái tức thời với toàn bộ một nét nhân cách (ví dụ gán ép `Conscientiousness = C(t)`, `Agreeableness = W(t)` hay `Extraversion = D + E_x`) là một sự nhầm lẫn về mặt phương pháp luận. Công trình nghiên cứu về 10 khía cạnh của Big Five ([nguồn S6]) chứng minh cấu trúc nhân cách phong phú hơn nhiều so với việc quy đổi một nét tính cách thành một tọa độ đơn lẻ. Do chưa có bất kỳ nghiên cứu thực nghiệm nào tiến hành đo đạc trên engine Project Anima, các con số khẳng định về tỷ lệ bao phủ như 0%, 50%, 80%, 85%, 100% hoàn toàn thiếu vắng cơ sở dữ liệu mẫu, thang đo chuẩn hóa hay ước lượng sai số khoa học.

### 4.4. Hệ động lực nhanh–chậm, không gian tích và cấu trúc bó thớ (§3, §6.1)

Biên bản cuộc họp lập luận rằng việc đặt trạng thái trong không gian Euclid $\mathbb{R}^6$ sẽ cưỡng bức tất cả sáu biến số phải vận hành trên cùng một thang thời gian. Khẳng định này là không chính xác về mặt toán học giải tích. Ngay trong không gian phẳng $\mathbb{R}^6$, một hệ động lực nhanh–chậm hoàn toàn có thể được thiết lập một cách tự nhiên thông qua hệ phương trình vi phân có chứa tham số vi phân nhỏ:

$$\frac{dx}{dt} = \frac{f(x, y)}{\varepsilon}, \qquad \frac{dy}{dt} = g(x, y), \qquad \text{với } 0 < \varepsilon \ll 1$$

Trong đó vector $x$ đại diện cho hai biến trạng thái nhanh và $y$ đại diện cho bốn biến trạng thái chậm. Tốc độ biến thiên của từng thành phần hoàn toàn do **cấu trúc phương trình và hệ số tham số** quy định, không bị chi phối bởi việc các biến có cùng nằm trong $\mathbb{R}^6$ hay không.

Việc biểu diễn không gian trạng thái dưới dạng tích Descartes $\mathcal{M} = \mathcal{B} \times \mathcal{F}$ thực chất là một cách tổ chức cấu trúc dữ liệu gồm sáu biến tọa độ. Nếu nhìn nhận đây là một không gian bó thớ (fiber bundle), thì đây thuần túy là một **bó thớ tầm thường** (trivial bundle). Bản thân cấu trúc tích hình học không tự thân sinh ra các phương trình liên kết động lực, không tự bẻ cong trường thế năng và cũng không tự động làm suy giảm số chiều của hệ thống.

Để có thể áp dụng một cách khoa học nguyên lý thống lĩnh (slaving principle) của Haken hay chứng minh hiện tượng sụp đổ số chiều, hệ thống bắt buộc phải chứng minh được tính ổn định tiệm cận của các mode nhanh và sự tồn tại của một đa tạp chậm mà quỹ đạo trạng thái sẽ bị hút về. Tương tự, để kết luận có hiện tượng phân nhánh Saddle-node, hệ thống phải xác định được nghiệm cân bằng giải tích $\dot{z} = F(z; \lambda) = 0$ và chứng minh có một trị riêng của ma trận Jacobian đi qua điểm 0 tại giá trị tham số tới hạn $\lambda_{\text{crit}}$. Một điều kiện logic đơn thuần trong mã nguồn như `V_bio < -0.7` chỉ đóng vai trò là một lệnh rẽ nhánh điều kiện (if-else), không đồng nghĩa với một điểm phân nhánh toán học. Cấu trúc hai tầng phân tách tần số cập nhật vẫn là một giải pháp kỹ thuật rất hữu ích cho lập trình game mà không cần thiết phải gắn ghép các tuyên bố hình học phức tạp vượt quá mức độ cần thiết.

Về phương diện tiến hóa thần kinh, việc viện dẫn mô hình não ba tầng của MacLean (“não bò sát ở đáy, hệ viền cảm xúc ở giữa, vỏ não lý trí ở đỉnh”) để bảo vệ tính đúng đắn của kiến trúc hai tầng là một lập luận không còn phù hợp. Công trình tổng quan của Joseph Cesario và cộng sự ([nguồn S7]) đã bác bỏ dứt khoát quan niệm xem sự tiến hóa não bộ như một quá trình bồi đắp tuần tự các lớp giải phẫu riêng biệt. Do đó, dự án có thể tự do mô tả sự tương tác giữa điều hòa sinh lý cơ bản và xử lý nhận thức bậc cao như một giải pháp tổ chức kiến trúc phần mềm, nhưng nên tránh xem mô hình MacLean như một chân lý giải phẫu thần kinh học.

### 4.5. Phân tích chu kỳ tick, chi phí tính toán và bài toán độ trễ (§4, §6.1)

Dựa trên **chính ví dụ số học được đưa ra trong biên bản cuộc họp**, ta có bài toán định lượng cụ thể:
* **Phương án một tầng phẳng (Flat Engine):** Cả 6 biến trạng thái đều cập nhật ở tần số 10 Hz cho 500 NPC:
  $$\text{Tải tính toán} = 500 \times 6 \times 10 = 30.000 \text{ lượt cập nhật biến/giây}$$
* **Phương án phân tầng hai tốc độ (Two-Tier Engine):** 2 biến tầng đáy cập nhật ở 10 Hz, 4 biến tầng trên cập nhật ở 1 Hz cho 500 NPC:
  $$\text{Tải tính toán} = 500 \times (2 \times 10 + 4 \times 1) = 12.000 \text{ lượt cập nhật biến/giây}$$

Mức độ cắt giảm đạt được giữa hai phương án là:

$$\Delta = \frac{30.000 - 12.000}{30.000} = 0,60 \quad (60\%)$$

Như vậy, kiến trúc hai tầng giúp cắt giảm **chính xác 60% số lượt tính toán cập nhật biến**. Phép tính này hoàn toàn không đồng nghĩa với việc hệ thống sẽ giúp tiết kiệm 60% hay 70% tổng thời gian thực thi của CPU. Tổng chi phí tài nguyên phần cứng còn phụ thuộc chặt chẽ vào độ phức tạp của thuật toán giải tích cho từng biến, chi phí tính toán ma trận thẩm định chủ quan (appraisal matrix), chi phí xử lý ngắt sự kiện, việc truy xuất bộ nhớ đệm và các tác vụ đồng bộ hóa khác vốn chưa hề được đo kiểm bằng công cụ profiler. Ngoài ra, việc tần số lấy mẫu là 10 Hz (bước thời gian $\Delta t = 100\text{ ms}$) không đồng nghĩa với việc các quá trình sinh học mô phỏng có hằng số thời gian hồi phục đúng bằng 100 ms; đây là sự nhầm lẫn giữa tần số số học và động lực học vật lý.

Bên cạnh đó, việc cập nhật tầng trên ở tần số 1 Hz đồng nghĩa với việc các biến nhận thức và xã hội sẽ giữ nguyên giá trị trong khoảng thời gian lên tới 1.000 ms giữa hai chu kỳ tick. Điều này có thể gây ra độ trễ nhận thức đáng kể trong các tình huống biến cố khẩn cấp nếu hệ thống không được trang bị cơ chế ngắt sự kiện ngoại lệ (event-driven tick). Tuyên bố cho rằng kiến trúc hai tầng “hoàn toàn không có độ trễ” chỉ có thể được chứng thực thông qua các bài đo kiểm thực tế trên khối lượng tải xác định kết hợp với các chính sách nội suy (interpolation) được thiết kế bài bản.

### 4.6. Hố thế năng sang chấn và hiện tượng suy giảm tốc độ tới hạn (CSD) (§6.3, §7.1, §7.3)

Trong một hệ động lực gradient vận hành theo phương trình $\frac{dS}{dt} = -\nabla U(S)$, một số hạng Gauss muốn đóng vai trò là một **hố thế năng hút** (hút trạng thái tâm lý về phía nó) bắt buộc phải mang **trọng số âm**:

$$U(S) = U_0(S) - a \exp\left[-\frac{1}{2}(S - \mu)^\top \Sigma^{-1} (S - \mu)\right], \qquad \text{với } a \ge 0$$

Dấu âm trước biên độ $a$ đảm bảo rằng tại tâm sang chấn $\mu$, giá trị của số hạng Gauss đạt cực tiểu cục bộ. Để tâm $\mu$ thực sự trở thành một điểm hút ổn định của toàn bộ trường thế năng $U(S)$, hệ thống bắt buộc phải thỏa mãn đồng thời hai điều kiện giải tích:
1. Triệt tiêu gradient của trường thế năng nền tại tâm: $\nabla U_0(\mu) = 0$.
2. Ma trận Hessian (độ cong tổng quát) tại $\mu$ phải là ma trận xác định dương.

Nếu đặt dấu cộng phía trước số hạng Gauss, điểm $\mu$ sẽ biến thành một đỉnh gò thế năng đẩy lùi trạng thái ra xa. Việc chuẩn hóa ma trận hiệp phương sai $\Sigma$ xác định dương là bắt buộc nhằm đảm bảo khoảng cách giữa các biến có đơn vị và thang đo khác nhau mang ý nghĩa hình học nhất quán. Giả thuyết cho rằng tiếp xúc với môi trường an toàn sẽ làm biên độ $a$ suy giảm dần hay việc giành chiến thắng trước kẻ thù sẽ xóa sạch vết tích sang chấn là những quy tắc học tập giả định trong thiết kế trò chơi, chưa phải là quy luật lâm sàng phổ quát đã được chứng minh.

Hiện tượng suy giảm tốc độ tới hạn (Critical Slowing Down - CSD) phản ánh đặc tính hồi phục chậm chạp của hệ thống khi trị riêng chi phối tiến sát về 0 trước khi diễn ra bước chuyển pha trạng thái đột ngột. Nghiên cứu của Eva van de Leemput và cộng sự ([nguồn S8]) đã ghi nhận các tín hiệu cảnh báo sớm như phương sai và độ tự tương quan cảm xúc gia tăng trước ngưỡng khởi phát hoặc thoái lui của cơn trầm cảm lâm sàng. Tuy nhiên, công trình của Fabian Dablander và cộng sự ([nguồn S12]) đã cảnh báo về những rào cản phương pháp luận và điều kiện khắt khe khi ứng dụng các tín hiệu CSD vào các hệ thống tâm lý học phức tạp. Không có bất kỳ tài liệu tham khảo nào cho phép ngoại suy trực tiếp rằng việc thức gác liên tục 36 giờ trong game sẽ tất yếu dẫn tới hiện tượng CSD. Muốn khẳng định một hành vi trong game biểu hiện CSD, dự án bắt buộc phải ghi nhận chuỗi thời gian liên tục, tiến hành đo kiểm hệ số tự tương quan và kiểm soát chặt chẽ nhiễu ngẫu nhiên. Trạng thái mệt mỏi suy kiệt đơn thuần không đồng nghĩa với hiện tượng CSD.

### 4.7. Lực ghép liên cá nhân và cơ chế hoạt động của hệ thống Nemesis (§6.4)

Biên bản cuộc họp thiết lập công thức lực ghép liên cá nhân tác động lên thực thể NPC 1 dưới dạng $F_1 = -k(S_1 - S_2)$ với hệ số $k > 0$. Lực đàn hồi này có tác dụng kéo tọa độ trạng thái của thực thể 1 tiệm cận về phía thực thể 2. Nếu muốn đảm bảo tính tương tác đối xứng, hệ thống bắt buộc phải bổ sung phương trình phản lực cho thực thể 2: $F_2 = -k(S_2 - S_1)$. 

Một lưu ý giải tích mang tính quyết định: Khi thực thể 1 tử vong và hệ thống ngắt liên kết bằng cách gán $k \to 0$, thế năng tương tác đàn hồi $\frac{1}{2}k\|S_1 - S_2\|^2$ sẽ **hoàn toàn biến mất**. Thao tác này đơn thuần triệt tiêu lực kéo lẫn nhau; nó hoàn toàn không tự thân sản sinh ra bất kỳ một xung lực đẩy nào để ép thực thể 2 rơi vào hố thù hận hay kích hoạt hành vi báo thù. Để tái hiện động cơ báo thù, hệ thống bắt buộc phải thiết lập một quy tắc độc lập: biến cố tử vong đóng vai trò như một sự kiện ngoại sinh kích hoạt việc cập nhật bộ nhớ, điều chỉnh trọng số quan hệ và thay đổi mục tiêu hành vi trong hệ thống AI. 

Tương tự, việc khẳng định hệ thống Nemesis trong trò chơi *Middle-earth: Shadow of Mordor* là một phiên bản sơ khai của hệ SDE chỉ là một phép ẩn dụ kỹ thuật; tài liệu bằng sáng chế chính thức ([nguồn S11]) hoàn toàn không công bố cấu trúc thuật toán giải tích này. Ngoài ra, biểu thức lực nhận thức $F_{\text{epistemic}} = \alpha E_x \nabla I_{\text{novelty}}$ tại §7.2 chỉ có nghĩa giải tích nếu mức độ mới lạ $I_{\text{novelty}}$ được định nghĩa như một **trường không gian khả vi liên tục**. Nếu $I_{\text{novelty}}$ chỉ là một điểm số rời rạc của một cổ vật cụ thể, toán tử gradient $\nabla$ sẽ không xác định được giá trị. Các khái niệm toán học như phân nhánh, điểm hút hay cộng hưởng động lực học cần được gắn kết với hệ phương trình tường minh, không thể chỉ dừng lại ở các sơ đồ trực quan định tính.

---

## 5. Đánh giá năm kịch bản kiểm thử tại §7: Ranh giới giữa ý tưởng thiết kế và thực chứng

| Kịch bản | Ý đồ thiết kế kỹ thuật | Khoảng trống phương pháp luận cần hoàn thiện để trở thành bài kiểm thử thực sự |
| :--- | :--- | :--- |
| **7.1 Sập hầm khai khoáng** | Thiết lập hai cấu hình nhân vật với độ nhạy đe dọa sinh học khác nhau nhằm quan sát sự phân hóa hành vi phòng vệ (chiến đấu, tháo chạy hoặc đóng băng). | Cần xác lập hệ phương trình thế năng tường minh, bộ tham số hoàn chỉnh và chính sách lựa chọn hành vi. Khái niệm “đáy hố thế năng phẳng” về mặt giải tích gradient sẽ dẫn đến tốc độ hồi phục *chậm hơn* do độ cong thấp, mâu thuẫn với nhận định “quán tính hồi phục nhanh” nếu không có lực cưỡng bức hỗ trợ. |
| **7.2 Cổ vật ngoài hành tinh** | Khảo sát sự giằng co động lực giữa tính tò mò khám phá và cơ chế né tránh mối đe dọa sinh tử. | Cần định nghĩa trường thông tin $I_{\text{novelty}}$ dưới dạng hàm khả vi, xây dựng hàm thỏa dụng và luật quyết định hành vi. Việc thiếu vắng biến số $E_x$ không đồng nghĩa với việc mọi mô hình 4 trục trước đây đều mất đi tính tò mò, bởi động cơ khám phá hoàn toàn có thể được mô hình hóa qua các hàm thỏa dụng ngoài trục. |
| **7.3 Thức gác 36 giờ liên tục** | Kiểm tra tác động của sự thiếu ngủ, cạn kiệt năng lượng sinh học lên biến dung lượng nhận thức $C$. | Cần công bố phương trình tiêu hao nhận thức tường minh, hàm số liên kết với thời gian mất ngủ và quỹ đạo biến thiên thực tế. Nghiên cứu [S9] xác nhận mất ngủ làm suy giảm nhận thức chung, nhưng nghiên cứu [S10] bác bỏ giả thuyết xem ý chí như một nguồn năng lượng glucose cạn kiệt đơn giản. Hiện tượng CSD tại mốc 36 giờ cần được đo kiểm bằng dữ liệu chuỗi thời gian thực tế. |
| **7.4 Tranh đoạt quyền lực bộ tộc** | Đánh giá sự tương tác giữa các động cơ thống trị quyền lực, hòa đồng xã hội và liên minh bộ tộc. | Các biến số $D, W, E_x$ tự thân không thể sản sinh ra các hành vi phức tạp như thi đấu võ đài, phát động diễn thuyết chính trị hay tự nguyện thoái vị; hệ thống đòi hỏi phải có cây hành vi, mạng lưới quan hệ xã hội và các chính sách hành động cụ thể để hiện thực hóa các quyết định này. |
| **7.5 Tối hậu thư của kẻ tống tiền** | Phân định ranh giới giữa hành vi tương trợ vị tha chân thành, sự phục tùng do sợ hãi (Fawn) và toan tính trục lợi cá nhân. | Mức độ Nhiệt thành (W) cao không thể tự phân định được động cơ đạo đức; hệ thống bắt buộc phải tích hợp thêm các biến số về niềm tin giá trị, kỳ vọng tương hỗ, mức độ đe dọa nhận thức và chiến lược đối phó, tránh việc chẩn đoán phản ứng Fawn thuần túy dựa trên một tọa độ phẳng. |

Để một kịch bản có thể chính thức tuyên bố là **đã vượt qua kiểm định (pass benchmark)**, quy trình kỹ thuật đòi hỏi phải công bố đầy đủ:
1. Phiên bản mã nguồn engine thực thi và bộ cấu hình tham số khởi tạo tường minh.
2. Hệ phương trình giải tích và các quy tắc chuyển đổi trạng thái hoàn chỉnh.
3. Giá trị seed ngẫu nhiên, số lượng mẫu chạy lặp lại và phương pháp thống kê.
4. Tiêu chí định lượng đánh giá đạt/không đạt (pass/fail criteria) được xác lập trước khi chạy.
5. Đồ thị quỹ đạo trạng thái thực tế, tỷ lệ trường hợp thất bại và so sánh đối chứng với các mô hình đường cơ sở (baseline).

Ngay cả khi một hệ thống phần mềm vượt qua toàn bộ các tiêu chí kiểm thử kỹ thuật trên máy tính, kết quả đó mới chỉ chứng minh **tính nhất quán nội tại của thuật toán mô phỏng**, chưa đủ cơ sở để khẳng định tính chân thực về mặt tâm lý học lâm sàng của con người ngoài đời thực.

---

## 6. Danh mục tài liệu tham khảo và phạm vi tiếp cận học thuật

Toàn bộ các liên kết dưới đây dẫn trực tiếp đến các ấn phẩm khoa học chính thức hoặc cơ sở dữ liệu sáng chế quốc tế.  
*Thời điểm truy cập đối soát:* **2026-09-28**.  
*Phạm vi tiếp cận:* Cụm từ “Abstract” minh định việc hội đồng tiếp cận bản tóm tắt học thuật công khai và các phần giới thiệu mở, chưa tiến hành thẩm định toàn văn bài báo. Không có tài liệu nào dưới đây từng thử nghiệm trực tiếp trên engine của Project Anima.

| Mã | Tài liệu tham khảo học thuật | Phạm vi nội dung đã đối soát; Ranh giới hỗ trợ thực tế |
| :--- | :--- | :--- |
| **S1** | Porges, S. W. (2007), [*The polyvagal perspective*](https://pubmed.ncbi.nlm.nih.gov/17049418/), tạp chí *Biological Psychology*, DOI [10.1016/j.biopsycho.2006.06.009](https://doi.org/10.1016/j.biopsycho.2006.06.009). | Bản tóm tắt trên PubMed; trình bày khung lý thuyết Polyvagal về các phân nhánh thần kinh tự chủ, không xác thực cấu trúc hai trục tọa độ của engine. |
| **S2** | Grossman, P. (2023), [*Fundamental challenges and likely refutations of the five basic premises of the polyvagal theory*](https://pubmed.ncbi.nlm.nih.gov/37230290/), tạp chí *Biological Psychology*, DOI [10.1016/j.biopsycho.2023.108589](https://doi.org/10.1016/j.biopsycho.2023.108589). | Bản tóm tắt trên PubMed; bài phản biện học thuật chỉ ra các lỗ hổng giải phẫu và bác bỏ năm tiền đề cốt lõi của lý thuyết Polyvagal. |
| **S3** | Volchan et al. (2017), [*Immobility reactions under threat: A contribution to human defensive cascade and PTSD*](https://pubmed.ncbi.nlm.nih.gov/28131873/), tạp chí *Neuroscience & Biobehavioral Reviews*, DOI [10.1016/j.neubiorev.2017.01.025](https://doi.org/10.1016/j.neubiorev.2017.01.025). | Bản tóm tắt bài tổng quan trên PubMed; phân loại các phản ứng bất động phòng vệ, ghi nhận hiện tượng tim đập nhanh trong bất động căng trương lực, nhưng không xác nhận mốc 180 bpm hay cơ chế DVC cụ thể của kịch bản. |
| **S4** | Horowitz et al. (2006), [*How interpersonal motives clarify the meaning of interpersonal behavior*](https://pubmed.ncbi.nlm.nih.gov/16430329/), tạp chí *Psychological Review*, DOI [10.1207/s15327957pspr1001_4](https://doi.org/10.1207/s15327957pspr1001_4). | Bản tóm tắt trên PubMed; làm rõ hai chiều động cơ Hòa đồng và Chiếm ưu thế trong mô hình circumplex, đồng thời chỉ rõ các giới hạn dự báo của mô hình. |
| **S5** | DeYoung, C. G. (2015), [*Cybernetic Big Five Theory*](https://www.sciencedirect.com/science/article/pii/S0092656614000713), tạp chí *Journal of Research in Personality*, DOI [10.1016/j.jrp.2014.07.004](https://doi.org/10.1016/j.jrp.2014.07.004). | Cổng nhà xuất bản, bản tóm tắt và phần dẫn nhập; định nghĩa nét tính cách là các tham số điều khiển học, thích nghi đặc trưng gồm mục tiêu và chiến lược. |
| **S6** | DeYoung, Quilty & Peterson (2007), [*Between facets and domains: 10 aspects of the Big Five*](https://pubmed.ncbi.nlm.nih.gov/17983306/), tạp chí *Journal of Personality and Social Psychology*, DOI [10.1037/0022-3514.93.5.880](https://doi.org/10.1037/0022-3514.93.5.880). | Bản tóm tắt trên PubMed; phân tích nhân tố xác lập 10 khía cạnh cấu thành năm nét nhân cách Big Five, không đánh giá kiến trúc engine của dự án. |
| **S7** | Cesario, Johnson & Eisthen (2020), [*Your Brain Is Not an Onion With a Tiny Reptile Inside*](https://journals.sagepub.com/doi/10.1177/0963721420917687), tạp chí *Current Directions in Psychological Science*, DOI [10.1177/0963721420917687](https://doi.org/10.1177/0963721420917687). | Cổng nhà xuất bản và văn bản công khai; phản bác dứt khoát quan niệm giải phẫu xem não bộ tiến hóa theo cấu trúc ba tầng xếp lớp tuần tự của MacLean. |
| **S8** | van de Leemput et al. (2014), [*Critical slowing down as early warning for the onset and termination of depression*](https://pubmed.ncbi.nlm.nih.gov/24324144/), tạp chí *PNAS*, DOI [10.1073/pnas.1312114110](https://doi.org/10.1073/pnas.1312114110). | Bản tóm tắt trên PubMed; khảo sát các tín hiệu cảnh báo sớm trong dữ liệu biến thiên cảm xúc của bệnh nhân trầm cảm, không thử nghiệm trên game hay bối cảnh mất ngủ 36 giờ. |
| **S9** | Lowe, Safati & Hall (2017), [*The neurocognitive consequences of sleep restriction*](https://pubmed.ncbi.nlm.nih.gov/28757454/), tạp chí *Neuroscience & Biobehavioral Reviews*, DOI [10.1016/j.neubiorev.2017.07.010](https://doi.org/10.1016/j.neubiorev.2017.07.010). | Bản tóm tắt trên PubMed; phân tích tổng hợp chứng minh tình trạng hạn chế giấc ngủ làm suy giảm nghiêm trọng các chức năng nhận thức tổng quát. |
| **S10** | Hagger et al. (2016), [*A Multilab Preregistered Replication of the Ego-Depletion Effect*](https://journals.sagepub.com/doi/10.1177/1745691616652873), tạp chí *Perspectives on Psychological Science*, DOI [10.1177/1745691616652873](https://doi.org/10.1177/1745691616652873). | Cổng nhà xuất bản; nghiên cứu lặp lại đăng ký trước tại 23 phòng thí nghiệm ($N = 2.141$), cho thấy độ lớn ảnh hưởng của hiện tượng ego depletion gần như bằng $0$ ($d = 0,04$, khoảng tin cậy 95% chứa giá trị 0). |
| **S11** | Warner Bros. Interactive Entertainment, [US11660540B2 — *Nemesis characters, nemesis forts, social vendettas and followers in computer games*](https://patents.google.com/patent/US11660540B2/). | Cơ sở dữ liệu bằng sáng chế; mô tả kiến trúc gameplay quản lý ân oán xã hội của nhân vật Nemesis, hoàn toàn không công bố thuật toán giải tích tương đương với SDE. |
| **S12** | Dablander et al. (2022), [*Anticipating critical transitions in psychological systems using early warning signals*](https://pubmed.ncbi.nlm.nih.gov/34990190/), tạp chí *Nature Reviews Psychology*, PMID 34990190. | Bản tóm tắt trên PubMed; phân tích các điều kiện toán học và rào cản thực tế khi ứng dụng tín hiệu cảnh báo sớm chuyển pha vào các hệ thống tâm lý học. |

---

## 7. Các định hướng xác minh kỹ thuật tiếp theo

1. **Thẩm định toàn văn tài liệu cốt lõi:** Khi triển khai các cơ chế vi mô, cần tiếp cận toàn văn các bài báo nghiên cứu chuyên sâu; tiến hành thẩm định độc lập về mặt sinh lý học thần kinh đối với các phản ứng Đóng băng (Freeze) / Phục tùng (Fawn), các chỉ số biến thiên nhịp tim và giả thuyết năng lượng ý chí. Tuyệt đối không suy diễn các con số kỹ thuật từ các nội dung không có trong bản tóm tắt (abstract).
2. **Chuẩn hóa hệ phương trình và không gian metric:** Xác định rõ ràng ma trận metric khoảng cách, miền xác định của các biến trạng thái, hệ phương trình ghép tương tác liên cá nhân, chính sách lựa chọn hành vi và các quy tắc học tập thích ứng cho kiến trúc 2+4; tiến hành phân tích giải tích tính ổn định để kiểm chứng điều kiện phân nhánh Saddle-node và hiện tượng CSD trên mô hình toán tường minh.
3. **Lượng hóa mức độ bao phủ nhân cách:** Xây dựng phương pháp đo lường khoa học để đánh giá mức độ bao phủ của engine đối với mô hình Big Five trên một tập hợp các nhân vật mẫu độc lập; tạm thời loại bỏ các phát ngôn về tỷ lệ phần trăm bao phủ (85%, 100%) cho đến khi có quy trình đo kiểm và dữ liệu chứng minh.
4. **Triển khai thực nghiệm và đo kiểm hiệu năng thực tế:** Vận hành năm kịch bản kiểm thử trên mã nguồn có khả năng tái lập và dữ liệu thực tế, đồng thời công bố minh bạch các trường hợp thất bại. Tiến hành đo kiểm trực tiếp thời gian thực thi CPU và độ trễ phản ứng bằng công cụ profiler chuyên dụng trên các khối lượng tải xác định, thay cho việc phỏng đoán hiệu năng dựa trên số chu kỳ tick lý thuyết.
5. **Bảo toàn tính toàn vẹn của hồ sơ lịch sử:** Trong trường hợp biên tập lại văn bản cuộc họp gốc trong tương lai, cần ghi rõ lịch sử các phiên bản và dẫn chiếu đầy đủ đến [Biên bản thẩm định phiên 01](../../EvaluationMinutes/2026-09-28-Bien-Ban-Cuoc-Hop-Khao-Sat-Kiem-Dinh-Khong-Gian-Tam-Ly-01.md). Tài liệu bổ sung (supplement) này đóng vai trò là một văn bản phản biện và giải trình học thuật độc lập, không thay thế hay âm thầm sửa đổi các phát biểu nguyên văn của các thành viên trong phiên họp gốc.

