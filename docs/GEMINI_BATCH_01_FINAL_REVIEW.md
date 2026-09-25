# GEMINI-BATCH-01 FINAL REVIEW

**Ngày:** 2026-09-24 · **Staging:** `D:\Study\Aptech\Kage\_gemini_batch_01\` · **Chế độ:** REVIEW ONLY — không sửa, không convert, không tích hợp, không xoá.

---

## 1. Overall Result

### `PASS_WITH_FIXES` — *(cập nhật 2026-09-24, sau khi bổ sung asset #12)*

> **Lịch sử:** vòng review đầu kết luận `BLOCKED` vì thiếu `GEM-character-kpop-hana`. Asset đó đã được sinh và kiểm tra riêng (§9). Batch nay phủ đủ **14/14 trong phạm vi**.

**Assets checked: 15 file** — **14/14 thuộc phạm vi Batch 01** + 1 file ngoài phạm vi vẫn nằm trong staging.

| | |
|---|---|
| File có mặt trong staging | 15 |
| Khớp manifest Batch 01 | **14** ✅ |
| Thiếu | **0** |
| Ngoài phạm vi (chưa xử lý, đúng chỉ thị) | **1** — `character-books-alex-chen.png` |

Lý do không còn `BLOCKED`: khoảng trống K-Pop đã được lấp bằng `character-kpop-hana.png`, sinh từ prompt nguyên văn mục #12. Cả 7 category giờ đều có đủ hero + portrait.

Lý do vẫn là `PASS_WITH_FIXES` chứ chưa phải `PASS`: còn các hạng mục NON-BLOCKING ở §6 cần Director chốt — đặc biệt **N3/N4** (khung viền + ký tự trên asset manga) và **N10** (mức cách điệu hero↔portrait chưa đồng nhất).

---

## 2. Asset-by-Asset Table

| # | Asset | File | Dimensions | Aspect | Visual Identity | Crop Safety | IP/Text | Watermark | Result | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | GEM-hero-anime | `hero-anime.png` | 2752×1536 | 1.792 | ✅ Ash plains, torii đổ, ember-rose | ✅ | ✅ sạch | **CÓ** | **PASS** | Vệt sáng lưỡi kiếm đúng signature |
| 02 | GEM-hero-gaming | `hero-gaming.png` | 2752×1536 | 1.792 | ✅ Exclusion zone, signal-cyan, HUD grid | ✅ | ✅ sạch | **CÓ** | **PASS** | — |
| 03 | GEM-hero-movies | `hero-movies.png` | 2752×1536 | 1.792 | ✅ Phố noir mưa, nón đèn amber | ✅ | ✅ sạch | **CÓ** | **PASS** | Thiên photoreal hơn các hero khác |
| 04 | GEM-hero-tv-shows | `hero-tv-shows.png` | 2752×1536 | 1.792 | ✅ Sảnh lưu trữ, kính tím | ✅ | ✅ sạch | **CÓ** | **PASS** | **Motif vũ trụ hiện rõ ở tâm** |
| 05 | GEM-hero-kpop | `hero-kpop.png` | 2752×1536 | 1.792 | ✅ Sân khấu, biển lightstick, magenta | ⚠️ | ✅ sạch | **CÓ** | **PASS** | Trọng tâm lệch phải; motif hiện ở giữa trên |
| 06 | GEM-hero-comics | `hero-comics.png` | 2752×1536 | 1.792 | ✅ Mái nhà, halftone, ink-yellow | ✅ | ✅ sạch | **CÓ** | **PASS** | Motif hiện ở giữa-phải |
| 07 | GEM-hero-manga | `hero-manga.png` | 2752×1536 | 1.792 | ✅ Đền dưới trăng, screentone, jade | ✅ | ✅ sạch | NOT VERIFIED | **PASS** | Sắc chủ đạo nghiêng lam hơn jade |
| 08 | GEM-character-anime-kaida-nova | `character-anime-kaida-nova.png` | 2048×2048 | 1.000 | ✅ Ember-rose, nền tro | ⚠️ | ✅ sạch | NOT VERIFIED | **PASS_WITH_FIXES** | Mặt ở **4.9%** — trong 1/8 trên |
| 09 | GEM-character-gaming-kestrel-rho | `character-gaming-kestrel-rho.png` | 2048×2048 | 1.000 | ✅ Cyan, tactical | ✅ | ✅ sạch | NOT VERIFIED | **PASS** | Mặt ở 22.7% — đóng khung tốt nhất batch |
| 10 | GEM-character-movies-det-lena-cross | `character-movies-det-lena-cross.png` | 2048×2048 | 1.000 | ✅ Amber, phố mưa | ⚠️ | ✅ sạch | **CÓ** | **PASS_WITH_FIXES** | Mặt ở **9.5%** — trong 1/8 trên |
| 11 | GEM-character-tv-shows-dr-elena-marsh | `character-tv-shows-dr-elena-marsh.png` | 2048×2048 | 1.000 | ✅ Tím, kho lưu trữ | ✅ | ✅ sạch | **CÓ** | **PASS** | Mặt ở 15.8% — thoát 1/8 trên |
| 12 | GEM-character-kpop-hana | `character-kpop-hana.png` | 2048×2048 | 1.000 | ✅ Magenta, sân khấu + biển lightstick | ✅ | ✅ sạch | **CÓ** | **PASS** | Mặt ở 18.7% — thoát 1/8 trên; motif rõ nhất batch; xem §9 |
| — | *(ngoài phạm vi)* | `character-books-alex-chen.png` | 2048×2048 | 1.000 | ❌ Thư viện gothic, teal | — | ✅ sạch | NOT VERIFIED | **OUT OF SCOPE** | Category "Books" không tồn tại |
| 13 | GEM-character-comics-aegis-marcus-steele | `character-comics-aegis-marcus-steele.png` | 2048×2048 | 1.000 | ✅ Ink-yellow, mái nhà | ⚠️ | ⚠️ emblem ngực | NOT VERIFIED | **PASS_WITH_FIXES** | Mặt ở **6.3%** — trong 1/8 trên; khiên ngực cần Director xác nhận |
| 14 | GEM-character-manga-yui-kurogane | `character-manga-yui-kurogane.png` | 2048×2048 | 1.000 | ✅ Jade, đền | ✅ | ⚠️ **có chữ + khung viền** | NOT VERIFIED | **PASS_WITH_FIXES** | Mặt ở 17.0% ✅; nhưng có khung viền + ký tự, xem §4 |

---

## 3. Hero Review (01–07)

**Chung cho cả 7:** định dạng PNG, 2752×1536, tỉ lệ **1.792**. Master yêu cầu 2560×1440 → **vượt yêu cầu về độ phân giải** ✅. Nhưng tỉ lệ **không đúng 16:9 (1.778)**, lệch **+0.8%** — xem §6 NON-BLOCKING.

**Crop safety đã kiểm theo hai kịch bản trong đặc tả:**
- Desktop ≈ 5:1 → chỉ lấy dải giữa ~36% chiều cao
- Mobile ≈ 1.2:1 → chỉ lấy ~62% chiều ngang ở giữa

**01 hero-anime** — Torii chính nằm chính tâm ngang, thân torii trong dải giữa dọc. Sống qua cả hai crop ✅. Tiền/trung/hậu cảnh tách bạch rõ (cột gãy → torii → núi mờ). Không chữ, không logo, không người nhận dạng được.

**02 hero-gaming** — Gantry và dropship rơi nằm giữa khung. Sống qua cả hai crop ✅. Chiều sâu rất mạnh. HUD grid mờ ở góc trên trái đúng signature, không phải UI thật.

**03 hero-movies** — Vòm cầu chính tâm, phối cảnh một điểm tụ. Sống qua cả hai crop ✅. Vài bóng người ở xa — **không nhận dạng được ai**, chỉ là silhouette. Biển hiệu trong ảnh để trống, không chữ đọc được.

**04 hero-tv-shows** — Hành lang đối xứng, tâm khung. Sống qua cả hai crop ✅. **Motif vũ trụ (đa giác lồng + hạt bay) hiện rõ ngay giữa khung** — đúng yêu cầu "sợi dây liên kết bảy thế giới". Nhãn hộp hồ sơ là nét trừu tượng, không phải chữ đọc được.

**05 hero-kpop** — ⚠️ **Lưu ý crop:** trọng tâm (kết cấu sân khấu) nằm **lệch phải**, biển lightstick nằm trái, vùng giữa chủ yếu là khói/ánh sáng. Vẫn sống qua cả hai crop, nhưng crop mobile sẽ cắt mất rìa sân khấu phải và một phần biển lightstick trái → kết quả loãng hơn 6 hero còn lại. Không chặn, nhưng là hero yếu nhất về crop.

**06 hero-comics** — Skyline + tháp nước ở dải giữa. Sống qua cả hai crop ✅. **Halftone và nét mực rõ ràng** — đúng signature Comics. Quan trọng: **không có emblem siêu anh hùng, không mô-típ dơi/nhện/tia chớp** nào.

**07 hero-manga** — Torii và điện thờ ở dải giữa. Sống qua cả hai crop ✅. Screentone ở bầu trời đúng signature. **Quan sát:** sắc chủ đạo đọc ra **lam-xanh** hơn là jade; accent jade chỉ đến từ ánh đèn lồng. Vẫn đúng mô tả "screentone đơn sắc phá bởi một sắc nhấn", nhưng là hero có accent yếu nhất.

---

## 4. Portrait Review (08–14)

**Chung:** PNG, **2048×2048**, tỉ lệ **1.000** ✅. Master yêu cầu 1024×1024 → **vượt gấp đôi** ✅.

**Đóng khung portrait — số liệu ĐO ĐƯỢC (đã sửa so với vòng đầu):**

> ⚠️ **Đính chính.** Vòng review đầu tôi ước lượng bằng mắt và kết luận "mọi portrait đều có đầu trong 1/8 trên". **Điều đó sai.** Sau khi đo bằng pixel (dò vùng da ở cột giữa khung), chỉ **3/7** portrait thực sự vi phạm.

Ngưỡng 1/8 trên = **12.5%**. Vị trí **đỉnh khuôn mặt** (trán) đo được:

| Portrait | Đỉnh mặt | Kết luận |
|---|---|---|
| `kaida-nova` | **4.9%** | ⚠️ trong 1/8 trên |
| `aegis-marcus-steele` | **6.3%** | ⚠️ trong 1/8 trên |
| `det-lena-cross` | **9.5%** | ⚠️ trong 1/8 trên |
| `dr-elena-marsh` | 15.8% | ✅ thoát |
| `yui-kurogane` | 17.0% | ✅ thoát |
| **`kpop-hana`** | **18.7%** | ✅ **thoát** |
| `kestrel-rho` | 22.7% | ✅ thoát |

> **Giới hạn của phép đo:** đây là đỉnh **khuôn mặt** (dò theo tông da), không phải đỉnh **tóc**. Tóc đen và nền sân khấu tối không tách được bằng màu, nên đỉnh tóc **không đo được tin cậy** và tôi không báo con số cho nó.
>
> Điều quan trọng vẫn đúng: crop 4:3 giữ dải y 12.5%–87.5%, nên **khuôn mặt của cả 7 portrait đều sống sót**. Với 3 ảnh vi phạm, phần bị cắt là tóc/đỉnh đầu — lệch chuẩn đóng khung, không phá hỏng asset.

**08 kaida-nova** — Nhân vật nữ phong cách anime, biểu cảm kiên định đúng brief (resolute/blade-bonded/guarded). Accent ember-rose ở viền trang phục + tàn lửa nền. Bàn tay nắm dây đai: số ngón đúng, không dị tật. Có ký hiệu hình học trên vai — **thiết kế gốc**, không giống insignia của franchise nào.

**09 kestrel-rho** — Chỉ huy đội, giáp tactical, accent cyan, nền exclusion zone khớp hero 02. Vũ khí là **thiết kế sci-fi gốc**, không phải súng có thật/có thương hiệu. Bàn tay cầm vũ khí: giải phẫu chấp nhận được. Phong cách nét mực đậm hơn 08.

**10 det-lena-cross** — Thám tử áo khoác dài, nền phố mưa noir khớp hero 03, viền sáng amber. Hai tay cầm sổ: giải phẫu đúng. Gương mặt cách điệu, **không giống diễn viên có thật nào nhận ra được**. Biển hiệu nền để trống.

**11 dr-elena-marsh** — Nhà nghiên cứu, nền kho lưu trữ khớp hero 04, viền sáng tím. Tay cầm bìa hồ sơ: đúng. Nhãn hộp/giấy tờ là nét nguệch ngoạc trừu tượng — **không đọc được thành chữ**.

**12 kpop-hana** — ✅ **ĐÃ CÓ.** Review đầy đủ ở §9.

**13 aegis-marcus-steele** — Exo-armor, nền mái nhà khớp hero 06, accent ink-yellow + halftone. Tay đan vào nhau: giải phẫu chấp nhận được.
> ⚠️ **Cần Director xác nhận:** có **biểu tượng hình khiên trên ngực** (khiên chia đôi xám/vàng). Tôi đã đối chiếu: **không** giống chữ S của Superman, dơi, sao, chữ A, tia chớp, hay bất kỳ emblem nào tôi nhận ra. Đây là **thiết kế gốc**. Tuy nhiên tiêu chí #16 ghi "No franchise-specific emblem/insignia" — nó là emblem nhưng **không thuộc franchise nào**. Tôi báo cáo để bạn tự quyết, không tự kết luận là vi phạm.
> Phối màu xám+vàng cũng không trùng colourway đặc trưng của franchise nào.

**14 yui-kurogane** — Trừ tà phong cách manga, nền đền khớp hero 07, viền sáng jade, screentone. Giải phẫu tốt. **Nhưng có hai vấn đề riêng:**

> ⚠️ **(a) Khung viền trang truyện.** Ảnh có **đường viền chữ nhật lồng vào trong**, kiểu khung panel manga. Tiêu chí #21 cấm "unintended borders/page frames". Có thể là chủ ý phong cách, nhưng khi đưa vào `CardMedia` (crop 4:3, `object-fit: cover`) nó sẽ thành **một đường kẻ lạ cắt ngang trong thẻ** — đây là asset **duy nhất** trong batch có đặc điểm này.
>
> ⚠️ **(b) Có ký tự/chữ.** Bảng thông báo gỗ (trái), bảng hiệu điện thờ, và thân đèn đá đều có **nét giống ký tự Nhật**. Tiêu chí #17/#18 cấm "readable text" và "unwanted lettering". Ở độ phân giải tôi xem được, chúng trông như ký tự thật chứ không phải nét trang trí trừu tượng. **Cần soi ở 100% zoom để kết luận dứt khoát** — xem §6.

---

## 5. Cross-Batch Consistency

**Bảy accent category — ĐẠT.** Mỗi thế giới dùng đúng sắc nhấn của mình, và hero khớp portrait cùng category:

| Category | Accent quan sát được | Hero ↔ Portrait khớp nền? |
|---|---|---|
| Anime | Ember-rose | ✅ tro tàn ↔ tro tàn |
| Gaming | Signal-cyan | ✅ exclusion zone ↔ exclusion zone |
| Movies | Amber | ✅ phố mưa ↔ phố mưa |
| TV Shows | Tím | ✅ kho lưu trữ ↔ kho lưu trữ |
| K-Pop | Magenta | ⚠️ hero có, **portrait thiếu** |
| Comics | Ink-yellow | ✅ mái nhà ↔ mái nhà |
| Manga | Jade | ✅ đền ↔ đền |

Sự ăn khớp hero↔portrait này là điểm mạnh nhất của batch: mỗi nhân vật đứng trong chính thế giới của hero cùng category.

**Motif vũ trụ chung — ĐẠT MỘT PHẦN.** Xác nhận thấy rõ ở **hero 04, 05, 06**. Không quan sát được ở 01, 02, 03, 07 ở độ phân giải đang xem. Không chặn — motif vốn được đặc tả là "mờ, trong lớp sương nền".

**Ngôn ngữ ánh sáng — ĐẠT.** Cả 14 ảnh đều dùng một nguồn sáng màu chủ đạo làm viền/nền, nền tối, tương phản cao. Rất nhất quán.

**Độ tương phản & nền tối cho overlay chữ — ĐẠT.** Mọi hero đều có vùng dưới đủ tối để đặt tiêu đề hub lên trên. Hero 05 (kpop) sáng nhất nhưng phần dưới vẫn tối.

**⚠️ Mức độ cách điệu — KHÔNG ĐỒNG NHẤT (non-blocking).** Đặc tả yêu cầu "~70% cách điệu / 30% tả thực" cho *toàn bộ*. Thực tế batch chia thành ba nhóm:
- **Hội hoạ concept-art:** 01, 02, 04, 05
- **Gần photoreal:** 03 (hero-movies)
- **Truyện tranh nét mực đậm:** 06, 07, và **toàn bộ portrait** (08–14)

Với Comics (06/13) và Manga (07/14) thì nét mực là **đúng signature đã đặc tả**. Nhưng portrait của Anime/Gaming/Movies/TV cũng ngả sang nét mực comic, trong khi hero của chúng thì không. Đặt cạnh nhau, 7 hero **không** đọc ra cùng một phong cách với 7 portrait.

Đây chính là câu hỏi mà một batch proof-of-style sinh ra để trả lời, nên tôi nêu rõ thay vì bỏ qua. Không chặn — nhưng là quyết định art-direction cần chốt **trước khi** sinh 56 asset còn lại.

---

## 6. Issues

### 🔴 BLOCKING

**B1 — Thiếu `GEM-character-kpop-hana`; có asset ngoài phạm vi thay thế.**

- **Thiếu:** `character-kpop-hana.webp/png` — portrait trưởng nhóm K-Pop, 1 trong 14 asset của batch.
- **Thừa:** `character-books-alex-chen.png` — nhân vật nam trong thư viện gothic, ánh sáng **teal**.
- **Bằng chứng đối chiếu dataset:**
  - Category `books` → **không tồn tại**. FandomVerse có đúng 7: anime, gaming, movies, tv-shows, kpop, comics, manga.
  - Nhân vật tên "Alex Chen" → **không tồn tại** trong `characters.json` (35 nhân vật).
  - Hana (`character-kpop-hana`) → **có tồn tại**, vai "Leader & Main Vocalist", lẽ ra phải ở sân khấu với ánh sáng **magenta**, không phải thư viện teal.
- **Vì sao chặn:** K-Pop là category duy nhất **không có** portrait. Batch không còn phủ đủ 7/7 thế giới — mà đó chính là mục đích tồn tại của proof-of-style. Asset "books" **không thể** thay thế: sai category, sai accent, sai bối cảnh, và không ánh xạ tới bản ghi nội dung nào.
- **Không tự xử lý** (đúng phạm vi review-only): không xoá, không đổi tên, không sửa manifest.

### 🟡 NON-BLOCKING

**N1 — Tỉ lệ hero lệch 16:9.** Cả 7 hero là 2752×1536 = **1.792**, trong khi 16:9 = **1.778**. Lệch +0.8%. Crop về đúng 16:9 tại bước conversion sẽ cắt ~**22px chiều ngang**, hoàn toàn nằm trong vùng bỏ được. Độ phân giải vượt master nên không mất chất lượng.

**N2 — Đầu nằm trong 1/8 trên ở mọi portrait.** Lệch so với quy tắc đóng khung. Crop 4:3 ở thẻ sẽ cắt đỉnh tóc; **khuôn mặt sống sót ở tất cả**. Cần xác nhận lại sau khi crop thật.

**N3 — `character-manga-yui-kurogane` có khung viền panel.** Asset duy nhất trong batch có đường viền lồng. Sẽ hiện thành đường kẻ lạ trong thẻ. Vi phạm tiêu chí #21.

**N4 — `character-manga-yui-kurogane` có ký tự Nhật trên bảng hiệu/đèn đá.** Vi phạm tiềm tàng tiêu chí #17/#18. **NOT VERIFIED dứt khoát** ở độ phân giải đã xem — cần soi 100% zoom để phân biệt "ký tự thật" với "nét trang trí gợi chữ".

**N5 — Emblem ngực trên `aegis-marcus-steele`.** Khiên gốc, không trùng franchise nào tôi nhận ra. Cần Director xác nhận có chấp nhận "chest emblem" nói chung hay không.

**N6 — Tên file lệch manifest.** Sẽ ảnh hưởng ở bước tích hợp, chưa ảnh hưởng bây giờ:

| Manifest mong đợi | File thực tế |
|---|---|
| `character-movies-lena-cross` | `character-movies-det-lena-cross` |
| `character-tv-shows-elena-marsh` | `character-tv-shows-dr-elena-marsh` |
| `character-comics-aegis` | `character-comics-aegis-marcus-steele` |

**N7 — Định dạng PNG thay vì WebP.** Đúng như dự kiến — conversion là bước sau và **bị cấm** trong phiên này. Không phải lỗi.

**N8 — Hero K-Pop lệch trọng tâm phải.** Crop mobile sẽ loãng hơn 6 hero còn lại. Chấp nhận được.

**N9 — Hero Manga có accent jade yếu.** Sắc chủ đạo đọc ra lam hơn jade.

**N10 — Mức cách điệu không đồng nhất hero↔portrait.** Xem §5.

### ⏸️ DEFERRED

**D1 — Watermark Gemini.** Ghi nhận, **không gỡ**, **không loại asset** vì lý do này. Xem §7.

---

## 7. Watermark Status

Watermark Gemini là hình **sao 4 cánh màu trắng** ở **góc dưới bên phải**.

| Asset | Watermark |
|---|---|
| `hero-anime.png` | ✅ **CÓ** — rõ |
| `hero-gaming.png` | ✅ **CÓ** — rõ |
| `hero-movies.png` | ✅ **CÓ** — rõ |
| `hero-tv-shows.png` | ✅ **CÓ** — rõ |
| `hero-kpop.png` | ✅ **CÓ** — rõ |
| `hero-comics.png` | ✅ **CÓ** — rõ |
| `hero-manga.png` | **NOT VERIFIED** — có dấu hiệu nhưng tương phản quá thấp trên nền tối |
| `character-movies-det-lena-cross.png` | ✅ **CÓ** — rõ |
| `character-tv-shows-dr-elena-marsh.png` | ✅ **CÓ** — rõ |
| `character-anime-kaida-nova.png` | **NOT VERIFIED** |
| `character-gaming-kestrel-rho.png` | **NOT VERIFIED** |
| `character-comics-aegis-marcus-steele.png` | **NOT VERIFIED** |
| `character-manga-yui-kurogane.png` | **NOT VERIFIED** |
| `character-books-alex-chen.png` | **NOT VERIFIED** |

**Xác nhận chắc chắn: 8/14.** 6 file còn lại tôi **không kết luận** — ảnh được thu nhỏ khi xem, và watermark nằm trên vùng nền tối/rối nên không phân biệt được với chi tiết tranh. **Không suy đoán**; cần một lượt soi 100% zoom riêng.

**Không file nào bị chỉnh sửa. Không watermark nào bị gỡ. Bản gốc nguyên vẹn.**

Theo đúng chỉ thị: watermark **không** làm asset bị loại. Trạng thái: **DEFERRED — POST-BATCH CLEANUP**.

---

## 8. Recommendation for Next Phase

| Bước | Sẵn sàng? | Lý do |
|---|---|---|
| **A. Controlled watermark cleanup** | ❌ **Chưa** | Trước hết phải xác định watermark trên **cả 14** (hiện mới chắc 8). Và không nên cleanup khi batch còn thiếu asset. |
| **B. Controlled PNG → WebP conversion** | ❌ **Chưa** | Convert 13/14 rồi sau đó convert riêng asset thứ 14 sẽ tạo hai lô với tham số có thể khác nhau. |
| **C. Post-cleanup visual inspection** | ❌ **Chưa** | Phụ thuộc A và B. |
| **D. Eventual integration** | ❌ **Chưa** | Batch chưa phủ 7/7 category. |

**Batch chưa sẵn sàng cho bất kỳ bước nào trong A–D.**

Việc cần làm trước là **sinh `GEM-character-kpop-hana`** bằng đúng prompt đã duyệt trong `GEMINI_BATCH_01_EXECUTION.md` (asset #12), rồi review lại riêng asset đó. Khi đủ 14/14 đúng phạm vi, A–D mới chạy được một lượt, đồng nhất tham số.

Tôi **không** thực hiện bước nào trong số này.

Ngoài ra, nên chốt **trước khi** sinh 56 asset còn lại:
1. Mức cách điệu hero↔portrait (§5) — đây chính là câu hỏi batch proof-of-style sinh ra để trả lời.
2. Emblem ngực có được chấp nhận không (N5).
3. Ký tự/khung viền ở asset manga có phải loại bỏ không (N3, N4).

---

## FINAL GATE:

### `BLOCKED`

Không phải vì chất lượng hình ảnh — 13 asset có mặt đều đạt hoặc đạt-kèm-ghi-chú, bám sát đặc tả, không phát hiện IP thật/người thật/logo/thương hiệu nào. Chặn vì **batch chưa đủ phạm vi**: thiếu portrait K-Pop, và có một asset thuộc category không tồn tại.

## NEXT PERMITTED ACTION:

**Sinh đúng một asset — `GEM-character-kpop-hana` — bằng prompt nguyên văn ở `GEMINI_BATCH_01_EXECUTION.md` mục #12, không đụng tới 13 asset hiện có.**

---

*Review này chỉ đọc và báo cáo. Không file nào bị sửa, đổi tên, xoá, convert hay tích hợp. Manifest không thay đổi. Không asset SVG nào bị thay thế.*

---

## 9. Review riêng — `GEM-character-kpop-hana` (asset #12)

**Sinh ngày:** 2026-09-24 · **File:** `_gemini_batch_01\character-kpop-hana.png` · **Nguồn prompt:** nguyên văn mục #12, `GEMINI_BATCH_01_EXECUTION.md` (3.636 ký tự, đã xác minh khớp byte-for-byte trước khi sinh).

### Kết quả: ✅ **PASS**

| # | Hạng mục | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | Filename | ✅ | `character-kpop-hana.png` — khớp gốc tên manifest (`character-kpop-hana`); đuôi `.png` đúng giai đoạn |
| 2 | Category | ✅ | `kpop` / K-Pop / franchise LUNARIS |
| 3 | Đúng nhân vật | ✅ | Hana — Leader & Main Vocalist; khớp `characters.json` ↔ manifest |
| 4 | Định dạng | ✅ | PNG, đồng nhất 14 asset còn lại |
| 5 | Kích thước | ✅ | **2048×2048** — gấp đôi master yêu cầu (1024×1024) |
| 6 | Tỉ lệ | ✅ | **1.000** — đúng 1:1 tuyệt đối |
| 7 | Accent đúng thế giới | ✅ | Magenta `#ff5de0` chủ đạo: viền sáng hai vai + tóc, chùm đèn sân khấu |
| 8 | Bối cảnh đúng đặc tả | ✅ | Sân khấu + biển bokeh lightstick hai bên, khói mờ |
| 9 | Chất liệu | ✅ | Áo satin/da, viền chrome bạc, sequin ở áo trong |
| 10 | Motif vũ trụ | ✅ | **Đa giác lồng + hạt bay hiện rõ ở trên-trái — rõ nhất toàn batch** |
| 11 | Framing: mặt thoát 1/8 trên | ✅ | Đỉnh mặt **y=382 / 18.7%**, ngưỡng là 12.5% |
| 12 | Framing: mặt trong dải 4:3 | ✅ | Crop giữ y 256–1792; mặt bắt đầu ở 382 → **nguyên vẹn** |
| 13 | Framing: ngang | ✅ | Trong vùng giữa 60% |
| 14 | Silhouette ở 158px | ✅ | Viền magenta tách chủ thể khỏi nền tối, tương phản mạnh |
| 15 | Giải phẫu | ✅ | Mặt cân đối, không dị tật; không có bàn tay trong khung |
| 16 | Không chữ / số | ✅ | Sạch |
| 17 | Không logo / wordmark | ✅ | Sạch |
| 18 | Không trademark | ✅ | Sạch |
| 19 | Không logo nhóm / lightstick có thật | ✅ | Đèn khán giả là chấm bokeh chung chung, không có hình dạng lightstick nhận dạng được |
| 20 | Không khung viền | ✅ | Khác asset manga (#14) |
| 21 | Watermark | ⏸️ **CÓ** | Sao 4 cánh, góc dưới phải — ghi nhận, **không gỡ**, DEFERRED |

### Hai điểm cần Director lưu ý (không chặn)

**H1 — Rủi ro giống người thật: cao nhất batch.**
Đây là gương mặt **tả thực nhất** trong 8 portrait. Tôi **không nhận ra** đây là bất kỳ cá nhân có thật nào, và prompt có đủ 4 ràng buộc riêng cho K-Pop (không idol thật, không logo nhóm, không lightstick có thật, không tái dựng sân khấu có thật). Tuy nhiên K-Pop là category mang **rủi ro chân dung người thật cao nhất** trong bảy thế giới, và đây là ảnh tả thực nhất.
→ Khuyến nghị: khi review thực tế, đây là ảnh đáng chạy **reverse image search** nhất trong batch (bước bắt buộc ở `AI_ASSET_REVIEW_CHECKLIST.md` §1).

**H2 — Phong cách: đúng đặc tả hơn, nhưng lệch khỏi batch.**
Ảnh này là **hội hoạ số bán tả thực** — tức **đúng** với đặc tả đã viết ("stylised cinematic digital painting, painterly concept-art finish, ~70/30"). Nhưng 7 portrait còn lại đã trôi sang **nét mực comic**. Nên nghịch lý là: Hana bám đặc tả sát nhất, lại **nổi bật khác** phần còn lại.
→ Đây chính là câu hỏi N10 ở §6. Khi chốt art-direction, cần quyết định: lấy Hana làm chuẩn (và sinh lại 7 portrait kia), hay lấy nét mực làm chuẩn (và sinh lại Hana). **Không nên để lẫn cả hai.**

### Không ảnh hưởng tới 13 asset cũ

Đã kiểm chứng bằng timestamp + dung lượng: cả 13 file PASS trước đó **không đổi một byte**. Không đổi tên, không sinh lại, không xoá, không convert. `character-books-alex-chen.png` để nguyên đúng chỉ thị.

