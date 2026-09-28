# Ghi nhớ phiên làm việc: Hội đồng thẩm định và bàn giao biên tập tiếng Việt

**Ngày:** 2026-09-28  
**Dự án:** Project Anima  
**Mục đích:** Giữ toàn bộ quyết định và kết quả của phiên làm việc này để tiếp tục bằng Antigravity. Đây là bản tóm lược; hồ sơ hoạt động gốc và nguồn nằm trong các file được dẫn.

## 1. Ý định và quyết định của chủ tọa

1. Chủ tọa yêu cầu lập **Hội đồng thẩm định hai agent** để kiểm lại kiến thức do các chuyên gia/giáo sư giả lập nêu trong các cuộc họp, tìm nguồn uy tín và phát hiện nguồn bịa, trích dẫn sai hoặc suy luận quá mức.
2. Chủ tọa chọn **tạo hội đồng trước**, chưa rà soát đồng loạt cả bảy biên bản. Hai vai trò được phê duyệt: **Minh Anh Trần** kiểm chứng nguồn; **Quang Huy Lê** kiểm tra toán học, lập luận khoa học và mức suy diễn. Đây là agent mô phỏng, không phải học giả thật hay chứng nhận học thuật độc lập.
3. Hội đồng có thể viết supplement Markdown giải thích chi tiết kiến thức của **từng** cuộc họp khi chủ tọa yêu cầu. Supplement phải nối từng luận điểm với nguồn, nêu bằng chứng trái chiều và giới hạn đọc nguồn; không bịa DOI, số liệu, trích dẫn hay kết quả chạy.
4. **Mỗi phiên hội đồng phải có biên bản thẩm định**, ghi theo quá trình: phạm vi và phiên bản biên bản gốc, nhật ký việc đã làm, nguồn/đoạn đã xem, nhận xét riêng hai agent, bất đồng, phán quyết, giới hạn và bước tiếp. Không ghi kế hoạch như thể đã thực hiện. Phiên tiếp theo tạo file mới, dẫn lại phiên trước.
5. Chủ tọa quy định hội đồng **không ghi hoạt động, câu hỏi, tiến độ hoặc kết luận ra chat**. Chủ tọa giám sát qua biên bản thẩm định. Khi vướng mắc, ghi vào file. Agent điều phối cũng không thay hội đồng tóm tắt nội dung thẩm định trong chat.
6. Chủ tọa chỉ định nơi lưu biên bản thẩm định là `G:\Projects\Researchs\EvaluationMinutes`, tách khỏi biên bản họp gốc trong `MeetingMinutes`. Supplement theo quy trình ở `MeetingMinutes/Supplements`.
7. Sau đó chủ tọa triệu tập hội đồng rà soát [biên bản khảo sát không gian tâm lý](../MeetingMinutes/Bien-Ban-Cuoc-Hop-Khao-Sat-Kiem-Dinh-Khong-Gian-Tam-Ly.md), rồi yêu cầu tạo supplement cho cuộc họp ấy. Hội đồng đã làm hai phiên, chốt biên bản và supplement. Biên bản họp gốc không bị sửa.
8. Yêu cầu mới nhất: cập nhật memory để có thể dùng Antigravity **chỉnh lối viết tiếng Việt tự nhiên hơn cho hai báo cáo**. Việc biên tập là về văn phong; giữ nguyên nội dung khoa học, nhãn chứng cứ, nguồn, số liệu đã kiểm và dấu vết phiên.

## 2. Hồ sơ và đường dẫn quan trọng

| Vai trò | File |
| :--- | :--- |
| Quy trình hội đồng | [agents/validation-council/README.md](../agents/validation-council/README.md) |
| Mẫu biên bản thẩm định | [agents/validation-council/BIEN-BAN-TEMPLATE.md](../agents/validation-council/BIEN-BAN-TEMPLATE.md) |
| Agent kiểm nguồn | [agents/minh-anh-tran/AGENT.md](../agents/minh-anh-tran/AGENT.md), [memory](../agents/minh-anh-tran/memory.md) |
| Agent phản biện tri thức | [agents/quang-huy-le/AGENT.md](../agents/quang-huy-le/AGENT.md), [memory](../agents/quang-huy-le/memory.md) |
| Quy ước lưu thẩm định | [EvaluationMinutes/README.md](../EvaluationMinutes/README.md) |
| Biên bản thẩm định phiên 01, nội dung rà soát chính | [EvaluationMinutes/2026-09-28-Bien-Ban-Cuoc-Hop-Khao-Sat-Kiem-Dinh-Khong-Gian-Tam-Ly-01.md](../EvaluationMinutes/2026-09-28-Bien-Ban-Cuoc-Hop-Khao-Sat-Kiem-Dinh-Khong-Gian-Tam-Ly-01.md) |
| Biên bản thẩm định phiên 02, nhật ký tạo supplement | [EvaluationMinutes/2026-09-28-Bien-Ban-Cuoc-Hop-Khao-Sat-Kiem-Dinh-Khong-Gian-Tam-Ly-02.md](../EvaluationMinutes/2026-09-28-Bien-Ban-Cuoc-Hop-Khao-Sat-Kiem-Dinh-Khong-Gian-Tam-Ly-02.md) |
| Supplement giải thích kiến thức và nguồn | [MeetingMinutes/Supplements/Bien-Ban-Cuoc-Hop-Khao-Sat-Kiem-Dinh-Khong-Gian-Tam-Ly.supplement.md](../MeetingMinutes/Supplements/Bien-Ban-Cuoc-Hop-Khao-Sat-Kiem-Dinh-Khong-Gian-Tam-Ly.supplement.md) |

Chủ tọa gọi là “hai báo cáo” mà chưa chỉ rõ tên file. Hai tài liệu có nội dung đánh giá/giải thích để ưu tiên biên tập là **biên bản thẩm định phiên 01** và **supplement**; **phiên 02** là nhật ký quy trình, cũng có thể cần chỉnh văn phong nếu Antigravity được giao. Hãy kiểm lại phạm vi khi thực hiện, không tự bỏ một file được chủ tọa chỉ định.

## 3. Quy trình bằng chứng của hội đồng

- Tách biên bản họp thành các `claim_id`; Minh Anh tìm nguồn gốc, đọc đúng phần liên quan, ghi mức hỗ trợ và nguồn phản bác. Quang Huy độc lập soát công thức, đơn vị, điều kiện, suy luận và khoảng cách giữa mô hình game với kết quả thực nghiệm.
- Nhãn được dùng: **được hỗ trợ**, **được hỗ trợ một phần**, **tranh cãi/chưa ngã ngũ**, **chưa xác minh**, **bị nguồn phản bác**, **mô hình/giả thuyết của dự án**. Không đổi “chưa xác minh” thành “sai”.
- Phân biệt nguồn chứng minh khái niệm nền với nguồn xác nhận **engine Project Anima**. Một nguồn tham khảo ở cuối biên bản không tự xác nhận tất cả câu phía trên.
- Nếu chỉ đọc abstract/trang công bố, ghi đúng giới hạn ấy. Phiên 01 là rà soát **theo nhóm luận điểm trọng yếu** trên toàn bộ §1–§7, chưa kiểm từng câu hoặc đọc toàn văn mọi nguồn. Phiên 02 bổ sung và kiểm 12 mục nguồn cho supplement; vẫn chưa có mã/data engine để thẩm định các tuyên bố pass.
- Lưu hoạt động ở `EvaluationMinutes`, tránh chat. Chỉ tạo supplement khi chủ tọa yêu cầu. Không sửa âm thầm biên bản gốc.

## 4. Kết quả đã chốt ở phiên 01 và giải thích ở supplement

1. **Bậc tự do khác hạng ma trận.** Nếu $C=f(A,V)$ thì C không có điều kiện đầu riêng; tập trạng thái $(A,V,C,S)$ có chiều địa phương ba ở miền trơn. Mệnh đề “hạng của mọi ma trận trạng thái bằng 3” không theo sau vì hàm phi tuyến có thể làm ma trận mẫu hạng bốn. Thêm ODE cho C tạo biến trạng thái có quán tính riêng, không chứng minh trực giao sinh học hoặc thống kê.
2. **Polyvagal và Freeze.** Nguồn Porges trình bày lý thuyết; Grossman phản biện các tiền đề. Nghiên cứu về tonic immobility tồn tại, nhưng không xác nhận cơ chế SNS/DVC hay nhịp tim 180 bpm cụ thể của biên bản. Hai biến kích hoạt/ức chế là lựa chọn mô phỏng, không phải phép đo thần kinh đã được chứng minh.
3. **Interpersonal circumplex.** Nghiên cứu Horowitz hỗ trợ hai chiều communion/agency như khung mô tả, không chứng minh mọi hành vi xã hội cần đúng hai trục. Bài này sửa cực âm của communion thành **thờ ơ**, không mặc định là thù địch. Fawn không suy chắc từ Warmth + Dominance.
4. **Big Five/CB5T.** Trait ổn định khác state tức thời. Nguồn DeYoung hỗ trợ việc trait liên quan tham số cơ chế và cấu trúc 10 aspect, không xác nhận phép gán `Conscientiousness=C(t)`, `Agreeableness=W(t)` hoặc `Extraversion=D+E_x`. Các tỷ lệ bao phủ 0/50/80/85/100% của biên bản không có thang đo, tập dữ liệu hoặc benchmark.
5. **Hai tầng và toán học.** $\mathbb R^6$ không bắt buộc sáu biến cùng thang thời gian; hệ nhanh–chậm có thể viết ngay trong $\mathbb R^6$. Không gian tích/bó thớ không tự sinh ghép liên tầng, *slaving* hay sụp đổ số chiều. Những hiệu ứng ấy cần phương trình và điều kiện ổn định cụ thể. Não ba tầng MacLean không được dùng như mô tả tiến hóa thần kinh chính xác; Cesario et al. 2020 phản bác cách kể đó.
6. **Hiệu năng.** Theo lịch tick ghi trong biên bản, 500 NPC với 6 biến ×10 Hz = 30.000 cập nhật biến/giây; 2 biến ×10 Hz + 4 biến ×1 Hz = 12.000; giảm **60% số cập nhật biến**, không phải 70% CPU. Không có profiler hoặc số đo latency. Bước tick 100 ms không đồng nghĩa thời hằng sinh học 100 ms.
7. **Hố sang chấn/CSD.** Cần dấu âm và điều kiện trên toàn bộ thế năng để Gaussian thành điểm hút; phải định nghĩa metric/độ rộng. Các nghiên cứu CSD về chuyển trạng thái cảm xúc/trầm cảm không xác nhận sang chấn trong engine hoặc CSD chính xác tại 36 giờ thiếu ngủ. Giảm hố sau vài lần an toàn là luật học đề xuất, chưa là kết quả lâm sàng.
8. **Nemesis.** Lực ghép $-k(S_1-S_2)$ kéo trạng thái về nhau; đặt $k\to0$ chỉ bỏ lực, không tự tạo xung báo thù. Cần luật sự kiện, ký ức, quan hệ và chính sách hành động. Hồ sơ sáng chế Nemesis hỗ trợ phạm vi gameplay, không chứng minh mã nội bộ là FSM hay tương đương SDE. Ngưỡng game không tự chứng minh saddle-node bifurcation.
9. **Năm kịch bản.** Biên bản có tình huống, sơ đồ và đầu ra mong muốn, không có mã, seed, quỹ đạo, tiêu chí pass/fail hay dữ liệu chạy. Các mốc giá trị trong kịch bản không được suy từ phương trình đầy đủ. Câu “trực tiếp chạy thử”, “benchmarks fully passed”, “bao phủ 100% Big Five” **chưa xác minh**. Có thể gọi chúng là năm kịch bản kiểm thử đề xuất. Ngay cả test phần mềm pass vẫn chưa là xác nhận hiệu lực tâm lý ngoài đời.
10. **Ego depletion.** Tổng quan về hạn chế ngủ hỗ trợ suy giảm nhận thức tổng quát; nghiên cứu tái lập Hagger 2016 cho ước lượng ego depletion nhỏ với khoảng tin cậy chứa 0. Không nên trình bày “glucose ý chí” hoặc Conscientiousness bù đúng 36 giờ như quy luật đã chứng minh.

Hồ sơ nguồn cụ thể gồm **S1–S12** trong supplement, với URL/DOI và phạm vi đã đọc. Hai agent đã kiểm lại supplement; Minh Anh sửa metadata/tên bài S3 thành Volchan et al. (2017), Quang Huy làm rõ điều kiện để hạng Gaussian là điểm hút của toàn thế năng. Biên bản gốc giữ nguyên, SHA-256 lúc kiểm: `9400A0C821438737D6C89FD0F0967D883C60FF74080EBB66252ED5C6F5A8DF54`.

## 5. Bàn giao cho Antigravity: biên tập văn phong tiếng Việt

**Mục tiêu:** Viết tiếng Việt tự nhiên, rõ nghĩa, dễ đọc cho chủ tọa. Ưu tiên biên tập **biên bản thẩm định phiên 01** và **supplement**; phiên 02 là nhật ký nguồn gốc và cần giữ tính chính xác nếu được đưa vào phạm vi. Bản gốc của cuộc họp chưa được chủ tọa yêu cầu sửa trong phiên này.

**Được phép chỉnh văn phong:** chia câu dài, thay từ dịch máy hoặc khoa trương bằng từ thông dụng, giảm lặp, chuyển câu bị động khi cần, thống nhất thuật ngữ tiếng Việt và ký hiệu, sửa tiêu đề/bảng cho dễ tra, giữ giọng bình tĩnh và có điều kiện. Với các trích dẫn ngắn từ biên bản, không sửa để tạo cảm giác đó là lời nói nguyên văn khác.

**Bắt buộc giữ nguyên nội dung kiểm chứng:** `claim_id` C01–C14, MA-01–MA-10, QH-01–QH-11; nhãn trạng thái và mức bất định; con số **60% cập nhật biến** đối lập với tuyên bố **70% CPU**; khác biệt trait/state; giới hạn đọc nguồn; nguồn S1–S12 và DOI/URL; kết luận năm kịch bản **chưa có bằng chứng đã chạy**; lập luận toán học về hạng/chiều, Gaussian, hệ nhanh–chậm và lực ghép. Không biến mô hình dự án thành thực nghiệm, không đổi “chưa xác minh” thành “sai/đã chứng minh”.

**Bắt buộc giữ vết hồ sơ:** đường dẫn gốc, liên kết chéo, mốc phiên 01/02, nhật ký việc thực sự đã làm, ý kiến riêng hai agent và các giới hạn truy cập. Khi sửa biên bản thẩm định sau khi phiên đã chốt, giữ bản gốc hoặc ghi rõ phiên chỉnh sửa theo quy trình hội đồng; đừng xóa lịch sử hoạt động để văn bản “mượt” hơn. Nếu chỉ chỉnh supplement, ghi phiên bản/chỉnh sửa theo phạm vi chủ tọa giao. Việc sửa văn phong không phải thẩm định nguồn mới.

**Kiểm trước khi bàn giao:** đọc lại từng phát biểu trước/sau sửa để đảm bảo cùng mức chắc chắn; kiểm bảng nguồn và liên kết Markdown; giữ công thức, đơn vị và các con số; chạy `git diff --check`. Nếu Antigravity phát hiện một lỗi nội dung mới, ghi rõ đó là phát hiện mới và đưa lại hội đồng thẩm định thay vì lặng lẽ sửa như lỗi văn phong.
