# Higgsfield + Claude Code — Setup Guide

**Trạng thái:** môi trường sẵn sàng, **đã đăng nhập**, **workspace đã chọn**, **chưa tạo bất kỳ asset nào**.
**⚠️ Chặn thực thi:** tài khoản còn **0 credit** (gói free) — không thể sinh asset cho tới khi Project Director quyết định về credit.
**Ngày setup:** 2026-09-24

---

## 1. Mục đích (Purpose)

Chuẩn bị để Claude Code có thể gọi Higgsfield CLI/Skills trong các phiên sau, phục vụ việc **sản xuất asset bên ngoài** cho FandomVerse.

Phiên setup này **không** tạo ảnh/video, **không** tiêu credit, và **không** đưa Higgsfield vào runtime của FandomVerse.

## 2. Ranh giới kiến trúc (Architecture boundary)

> **Higgsfield = EXTERNAL ASSET PRODUCTION TOOL.**
> **Higgsfield ≠ FandomVerse runtime dependency.**

| Được phép | Không được phép |
|---|---|
| Chạy Higgsfield CLI ngoài project để tạo asset | Thêm Higgsfield SDK/API vào `package.json` |
| Đưa file ảnh đã được duyệt vào `public/assets/` sau khi qua quy trình provenance | Gọi Higgsfield API lúc runtime |
| Dùng skill trong phiên Claude Code | Để FandomVerse phụ thuộc mạng vào Higgsfield |

FandomVerse vẫn là SPA client-only, không backend. Mọi asset sinh ra phải đi qua `ASSET_PROVENANCE.md` trước khi vào repo.

**Quan trọng:** pipeline hiện tại là Gemini Batch 01 (14 asset) → review visual/IP → *sau đó* mới cân nhắc Higgsfield. Higgsfield **chưa** được duyệt để thay thế bất kỳ asset nào.

## 3. Môi trường đã phát hiện (Environment detected)

| Thành phần | Giá trị |
|---|---|
| OS | Windows 11 Home Single Language, build 26200 |
| Kiến trúc | AMD64 (x64) |
| PowerShell | 5.1.26100.9549 (Desktop) |
| VS Code | 1.137.0 (x64) |
| Claude Code | 2.1.156 |
| Git | 2.54.0.windows.1 |

## 4. Node / npm

| Thành phần | Phiên bản | Yêu cầu | Kết quả |
|---|---|---|---|
| Node.js | v24.16.0 | `>=14` (theo `engines` của package) | ✅ Đạt |
| npm | 11.13.0 | — | ✅ |
| npx | 11.13.0 | — | ✅ |

**Không nâng cấp gì** — môi trường đã vượt yêu cầu.

## 5. Higgsfield CLI

| Mục | Giá trị |
|---|---|
| Package | `@higgsfield/cli` |
| Phiên bản cài | **1.1.26** (build 2026-09-18) |
| Vị trí | `C:\Users\ASUS\AppData\Roaming\npm\higgsfield.ps1` (global, ngoài project) |
| Bin cung cấp | `higgsfield`, `higgs` |
| Alias nội bộ | `higgsfield`, `higgs`, `hf` |

### ⚠️ Xung đột alias `hf` — phải biết

Máy này đã có **Hugging Face CLI** tại `C:\Users\ASUS\AppData\Local\Programs\Python\Python312\Scripts\hf.exe`.

```
hf --version   →  1.18.0        (Hugging Face Hub CLI — KHÔNG phải Higgsfield)
```

Alias `hf` của Higgsfield **bị che**. Luôn dùng `higgsfield` (hoặc `higgs`), **tuyệt đối không dùng `hf`** cho Higgsfield.

## 6. Skills — trạng thái cài đặt

Đã cài **8 skill** ở chế độ global:

| Skill | Mục đích |
|---|---|
| `higgsfield-generate` | Sinh ảnh/video/3D/audio (30+ model) |
| `higgsfield-brandkit` | Hệ thống nhận diện thương hiệu |
| `higgsfield-product-photoshoot` | Ảnh sản phẩm |
| `higgsfield-marketplace-cards` | Thẻ sản phẩm sàn TMĐT |
| `higgsfield-soul-id` | Huấn luyện nhân vật theo khuôn mặt |
| `higgsfield-video-explainer` | Video giải thích có thuyết minh |
| `higgsfield-websites` | Dựng website/app/game |
| `higgsfield-youtube-thumbnail` | Thumbnail YouTube |

**Vị trí thật:** `C:\Users\ASUS\.agents\skills\`
**Liên kết cho Claude Code:** `C:\Users\ASUS\.claude\skills\higgsfield-*` (Windows **Junction**)

Cài global có chủ đích để **không tạo file nào trong `D:\Study\Aptech\Kage`**.

> Ghi chú: quá trình cài báo "Failed to install 8 → PromptScript does not support global skill installation". Đây là lỗi của một **agent target khác** (PromptScript), không phải Claude Code. Phần Claude Code đã cài thành công — đã kiểm chứng bằng junction và bằng việc skill hiện ra trong phiên.

## 7. Phương thức xác thực (Authentication)

- **Cơ chế:** OAuth 2.0 PKCE, đăng nhập qua trình duyệt.
- **Không cần API key.** Tài liệu chính thức nêu rõ: *"No API keys to manage or configure."*
- **Trạng thái hiện tại: ĐÃ ĐĂNG NHẬP** — `caosonhs@gmail.com`, gói **free**, **0 credit**.
- **Workspace:** `Private` — đã chọn bằng `higgsfield workspace set <workspace_id>`.
- **Vị trí credential:** không nằm ở các đường dẫn thông thường (`~\.higgsfield`, `%APPDATA%\higgsfield`, `%LOCALAPPDATA%\higgsfield`, `~\.config\higgsfield`) và **không** nằm trong repo. CLI lưu token ở nơi khác (đã quét `%USERPROFILE%` sâu 4 cấp, không thấy file nào tên chứa `higgs` ngoài binary). Không đọc nội dung, không cần biết vị trí chính xác.

> **Bài học quan trọng:** đăng nhập **website** higgsfield.ai *không* xác thực CLI. Phải chạy `higgsfield auth login` trong terminal — đây là hai phiên khác nhau.

Lệnh liên quan:

```
higgsfield auth login     # mở trình duyệt — USER tự thực hiện
higgsfield auth logout    # xoá token cục bộ
higgsfield auth token     # in access token — KHÔNG chạy khi đang chia sẻ màn hình/log
```

> ⚠️ **Không bao giờ** chạy `higgsfield auth token` trong phiên có ghi log hoặc trong report — nó in secret ra màn hình.

## 8. Tích hợp Claude Code

**Trạng thái: READY (setup) / BLOCKED (thực thi vì 0 credit).**

Skill discovery đã hoạt động — cả 8 skill Higgsfield hiện diện trong danh sách skill khả dụng của Claude Code ngay trong phiên setup, không cần khởi động lại VS Code.

Xác thực đã xong. Rào cản còn lại **không phải kỹ thuật** mà là credit: gói free, số dư 0.

## 9. Các lệnh đã dùng trong phiên này

```powershell
# Audit (read-only)
node --version ; npm --version ; npx --version ; git --version
code --version ; claude --version
npm ls -g --depth=0
npm view @higgsfield/cli version
npm view @higgsfield/cli bin
npm view @higgsfield/cli engines

# Cài CLI (global, ngoài project)
npm i -g @higgsfield/cli
higgsfield --version
higgsfield --help
higgsfield auth --help
higgsfield account --help

# Xem trước rồi cài Skills (global)
npx --yes skills --help
npx --yes skills add higgsfield-ai/skills --list
npx --yes skills add higgsfield-ai/skills --global --yes

# Sau khi USER đăng nhập — xác minh (read-only) + chọn workspace (ghi config cục bộ)
higgsfield account status
higgsfield workspace list
higgsfield workspace set <workspace_id>
higgsfield workspace status
```

**Không có lệnh generation nào được chạy.** Mọi lệnh trên đều đọc dữ liệu hoặc ghi config cục bộ; không lệnh nào tiêu credit.

## 10. Lệnh cho các phiên sau

```powershell
# 1) Đăng nhập — ĐÃ XONG (chỉ cần làm lại nếu token hết hạn)
higgsfield auth login

# 1b) Chọn workspace — ĐÃ XONG (bắt buộc, nếu không account status sẽ lỗi)
higgsfield workspace list
higgsfield workspace set <workspace_id>

# 2) Kiểm tra tài khoản + số credit còn lại (read-only, không tốn credit)
higgsfield account status

# 3) Xem model/workflow khả dụng (read-only)
higgsfield model list
higgsfield workflow list

# 4) Ước tính chi phí TRƯỚC khi tạo — luôn làm bước này trước
higgsfield generate cost <model> --prompt "..."
```

Trong Claude Code, gọi skill bằng tên, ví dụ `higgsfield-generate`. **Chỉ gọi khi đã có phê duyệt rõ ràng của Project Director.**

## 11. Quy tắc an toàn credit

1. **Không tạo asset nếu không có phê duyệt rõ ràng** cho batch đó.
2. **Luôn chạy `higgsfield generate cost` trước** mọi lệnh tạo.
3. **Luôn kiểm tra `higgsfield account status`** trước một batch lớn.
4. Không dùng skill `higgsfield-websites`, `higgsfield-video-explainer`, `higgsfield-soul-id` cho FandomVerse — nằm ngoài phạm vi dự án.
5. Mọi lệnh có chữ `generate`, `create`, `train`, `render`, `publish`, `deploy` đều phải coi là **có tính phí** cho đến khi chứng minh ngược lại.
6. Tính đến thời điểm lập tài liệu này: **0 generation, 0 ảnh, 0 video, 0 credit tiêu thụ.**
7. **Số dư hiện tại là 0 credit (gói free).** Mọi lệnh generation sẽ thất bại hoặc đòi nạp tiền. **Không nạp credit nếu không có phê duyệt rõ ràng của Project Director.**

## 12. Quy tắc bảo mật

1. Không ghi password/token/API key vào bất kỳ file nào trong repo.
2. Không tạo `.env` cho Higgsfield — CLI không cần.
3. Không chạy `higgsfield auth token` trong phiên có log.
4. Credential nằm ở thư mục người dùng, **ngoài** repo — không bao giờ commit.
5. `.gitignore` đã bao phủ `.env`, `.env.local`, `.env.*.local`.
6. Nếu phát hiện secret trong repo: dừng, không in ra, xử lý riêng.

## 13. Quy tắc cô lập FandomVerse

| Ràng buộc | Trạng thái |
|---|---|
| `package.json` không đổi | ✅ |
| Lockfile không đổi | ✅ |
| Không thêm dependency | ✅ |
| `src/` không đổi | ✅ |
| `public/` không đổi | ✅ |
| Không có `.claude/` hay `.agents/` trong project | ✅ (cài global) |
| 161 SVG thủ tục vẫn nguyên vẹn | ✅ |

Nếu sau này có asset Higgsfield được duyệt, nó phải đi qua `ASSET_PROVENANCE.md` giống hệt asset Gemini — bao gồm ghi nhận công cụ, ngày tạo, prompt, và **không** khai báo là "copyright-free" nếu chưa kiểm chứng điều khoản nền tảng (xem D-045).

## 14. Hạn chế đã biết

1. **Số dư 0 credit (gói free)** → không thể sinh asset. Đây là hạn chế lớn nhất hiện nay, và là quyết định về ngân sách chứ không phải kỹ thuật.
2. **Alias `hf` bị che** bởi Hugging Face CLI (mục 5).
3. `INSTALL.md` của repo chính thức liệt kê 9 skill; repo thực tế hiện cung cấp **8** (không có `higgsfield-game-generation`; phần game art đã gộp vào `higgsfield-websites`).
4. `INSTALL.md` đề xuất cài CLI bằng `curl … | sh` (không phù hợp Windows). Trang chính thức `higgsfield.ai/cli` dùng `npm i -g @higgsfield/cli` — đây là cách đã dùng.
5. Một số skill yêu cầu công cụ phụ (`bun`, Playwright Chromium, ImageMagick, LibreOffice) **chưa** được cài. Chưa cần cho việc sinh ảnh cơ bản.
6. Mức tiêu thụ credit của từng model vẫn **chưa kiểm chứng** — cần chạy `higgsfield generate cost <model>` (read-only) trước mỗi batch.
7. Vị trí lưu token của CLI không xác định được qua quét thông thường; không ảnh hưởng vận hành, và đã xác nhận **không** nằm trong repo.

## 15. Bước tiếp theo được khuyến nghị

1. ~~Đăng nhập~~ — **đã xong** (`caosonhs@gmail.com`).
2. ~~Chọn workspace~~ — **đã xong** (`Private`).
3. **Quyết định về credit.** Số dư 0; không thể sinh asset. Việc nạp credit nằm ngoài thẩm quyền của phiên setup này.
4. **Dừng lại.** Không tạo asset nào cho đến khi Project Director quyết định — pipeline hiện tại vẫn là **Gemini Batch 01 (14 asset) → review visual/IP**. Higgsfield chỉ được cân nhắc *sau* bước đó.
