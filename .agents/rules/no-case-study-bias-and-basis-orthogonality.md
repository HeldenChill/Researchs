# QUY TẮC: LOẠI BỎ THIÊN KIẾN CASE STUDY & TÁCH BẠCH KHÔNG GIAN VỚI TOÁN TỬ
(ANTI-CASE-STUDY BIAS & BASIS-OPERATOR ORTHOGONALITY RULE)

## 1. Nguyên Tắc Cốt Lõi:
1. **Cách ly tuyệt đối giữa các Case Study (Strict Case-Study Isolation):**
   * Các nghiên cứu trước (Project Anima, Big Five, Forest_Bloom, mô hình SDE Langevin) là **các trường hợp nghiên cứu cụ thể**, không phải là định nghĩa của Lý thuyết Không Gian Logic tổng quát.
   * TUYỆT ĐỐI KHÔNG mang các con số bất biến (như "5 trục", "6 không gian"), các thuật ngữ tâm lý học (như somatics, volition, Langevin) hay các giả định toán học liên tục của dự án này áp đặt lên một game khác.

2. **Tách bạch bản thể: Không Gian (Space) vs Hành Động (Action) vs Toán Tử (Operator):**
   * **Không Gian Trạng Thái (State Space $\mathcal{S}$):** Chứa các biến số biến thiên theo thời gian phản ánh thực thể đang ở trạng thái nào (ví dụ: $HP, SP$, Count hiệu ứng, Kho tài nguyên).
   * **Không Gian Hành Động (Action Space $\mathcal{A}$):** Chứa các lựa chọn và tham số kỹ năng mà người chơi/AI có thể kích hoạt (ví dụ: Base Power, số Coin, màu Sin của chiêu, cách nối chuỗi lệnh).
   * **Toán Tử Chuyển Trạng Thái (Transition Operators $\hat{\mathbb{O}}$):** Là **hàm biến đổi** $(\mathcal{S} \times \mathcal{A} \xrightarrow{\hat{\mathcal{O}}} \mathcal{S}')$, KHÔNG PHẢI LÀ MỘT KHÔNG GIAN.
   * *Nghiêm cấm:* Không được nhét Bộ phân giải (Resolver/Clash) hay Ma trận tương khắc (Affinity Matrix) vào làm một "Trục Cơ Sở", vì đó là các Toán tử và Tham số cấu hình, không phải biến trạng thái.

3. **Bác bỏ "Con số thiêng" (No Sacred Dimensional Numbers):**
   * Số chiều của một không gian logic phải được rút trích thuần túy từ **số bậc tự do độc lập thực tế** của trò chơi đó. Không được ép về số 5 hay bất kỳ con số tượng trưng nào.

4. **Trực ngôn phản biện - Không đồng thuận dễ dãi:**
   * Nếu người dùng hoặc mô hình đưa ra một phân loại nhập nhằng giữa Toán tử và Không gian, AI bắt buộc phải phản biện, chỉ rõ lỗi phân loại bản thể (Category Mistake) trước khi thực thi.
