# KillStreak Mod — Test Cases

> Dùng để kiểm tra thủ công trong game. Mỗi test ghi rõ **điều kiện**, **kết quả mong đợi** và **cách verify**.

---

## 1. Kill Thường

### TC-01: Kill thường không phải headshot
- **Điều kiện**: Giết 1 địch bằng súng thường (không headshot), chưa có kill nào trước đó
- **Mong đợi**:
  - [ ] Âm thanh `kill_normal` phát
  - [ ] Kill counter hiện `1`
  - [ ] Streak progress hiện `2 kills → KILLING SPREE`
  - [ ] Không có badge nào xuất hiện

### TC-02: Kill bằng headshot (đầu tiên)
- **Điều kiện**: Giết 1 địch bằng headshot
- **Mong đợi**:
  - [ ] Âm thanh `kill_headshot` phát (không phải `kill_normal`)
  - [ ] Badge `HEADSHOT` xuất hiện rồi tự ẩn sau ~1.5s
  - [ ] Kill counter hiện `1`
  - [ ] Streak progress hiện `2 kills → KILLING SPREE`

### TC-03: Kill bằng vehicle / môi trường (không có killer)
- **Điều kiện**: Địch chết do xe, nước, rơi xuống vực (inflictor = nil)
- **Mong đợi**:
  - [ ] Không có âm thanh nào phát cho người chơi
  - [ ] Kill counter không thay đổi
  - [ ] Server log: `env death`

### TC-04: Tự giết (self-kill)
- **Điều kiện**: Người chơi tự làm mình chết (lựu đạn, C4...)
- **Mong đợi**:
  - [ ] Không có âm thanh kill nào phát
  - [ ] Streak của người chơi đó reset về 0
  - [ ] Server log: `self-killed — skipped`

---

## 2. Kill Streak

### TC-05: Đạt mốc 3 kills — KILLING SPREE
- **Điều kiện**: Giết 3 địch liên tiếp không chết (kill 3 không nhất thiết phải headshot)
- **Mong đợi**:
  - [ ] Âm thanh `kill_normal` hoặc `kill_headshot` phát trước
  - [ ] 300ms sau: âm thanh `streak_3` phát
  - [ ] Badge `KILLING SPREE` + `3 KILLS` xuất hiện giữa màn hình
  - [ ] Kill counter hiện `3`
  - [ ] Streak progress hiện `2 kills → RAMPAGE`

### TC-06: Đạt mốc 5 kills — RAMPAGE
- **Điều kiện**: 5 kills liên tiếp
- **Mong đợi**:
  - [ ] Âm thanh `streak_5` phát sau 300ms
  - [ ] Badge `RAMPAGE` + `5 KILLS`
  - [ ] Streak progress hiện `2 kills → DOMINATING`

### TC-07: Đạt mốc 7 kills — DOMINATING
- **Điều kiện**: 7 kills liên tiếp
- **Mong đợi**:
  - [ ] Âm thanh `streak_7` phát sau 300ms
  - [ ] Badge `DOMINATING` + `7 KILLS`
  - [ ] Streak progress hiện `3 kills → UNSTOPPABLE`

### TC-08: Đạt mốc 10 kills — UNSTOPPABLE (important)
- **Điều kiện**: 10 kills liên tiếp
- **Mong đợi**:
  - [ ] Âm thanh `streak_10` phát **ngay lập tức** (không delay, override headshot sound)
  - [ ] Badge `UNSTOPPABLE` + `10 KILLS`
  - [ ] Streak progress ẩn (đã qua mốc cao nhất gần nhất)
  - [ ] **Tất cả player khác** thấy Server Announce: `[Tên] is UNSTOPPABLE! — 10 KILLS`

### TC-09: Đạt mốc 15 kills — GODLIKE (important)
- **Điều kiện**: 15 kills liên tiếp
- **Mong đợi**:
  - [ ] Âm thanh `streak_15` phát ngay lập tức
  - [ ] Badge `GODLIKE` + `15 KILLS`
  - [ ] **Tất cả player khác** thấy Server Announce: `[Tên] is GODLIKE! — 15 KILLS`

### TC-10: Vượt qua mốc cao nhất (>15 kills)
- **Điều kiện**: Tiếp tục kill sau 15
- **Mong đợi**:
  - [ ] Kill counter tiếp tục tăng
  - [ ] Không có streak badge mới (không có mốc 16/17/...)
  - [ ] Streak progress ẩn

### TC-11: Streak reset khi chết (streak >= 3)
- **Điều kiện**: Đang có streak 5, bị địch giết
- **Mong đợi**:
  - [ ] Kill counter ẩn
  - [ ] Streak progress ẩn
  - [ ] Badge `Streak Ended — 5 kill streak` xuất hiện rồi tự ẩn sau 2s
  - [ ] Server log: `streak reset from 5`

### TC-12: Chết khi streak < 3
- **Điều kiện**: Chết khi có streak 2
- **Mong đợi**:
  - [ ] Kill counter ẩn
  - [ ] **Không** có badge `Streak Ended` (chỉ hiện khi streak >= 3)

---

## 3. Headshot Streak

### TC-13: 2 headshot liên tiếp — DOUBLE HEADSHOT
- **Điều kiện**: Kill 1 = headshot, Kill 2 = headshot (không chết giữa chừng)
- **Mong đợi**:
  - [ ] Kill 1: âm thanh `kill_headshot`, badge `HEADSHOT`
  - [ ] Kill 2: âm thanh `headshot_double` (thay cho `kill_headshot`)
  - [ ] Badge `DOUBLE HEADSHOT` + `2x` xuất hiện
  - [ ] Badge `HEADSHOT` cũng xuất hiện (badge đơn luôn hiện với mọi headshot)

### TC-14: 3 headshot liên tiếp — TRIPLE HEADSHOT
- **Điều kiện**: 3 kills đều là headshot liên tiếp
- **Mong đợi**:
  - [ ] Kill 3: âm thanh `headshot_triple`
  - [ ] Badge `TRIPLE HEADSHOT` + `3x`

### TC-15: 5 headshot liên tiếp — MULTI HEADSHOT
- **Điều kiện**: 5 kills đều là headshot liên tiếp
- **Mong đợi**:
  - [ ] Kill 5: âm thanh `headshot_multi`
  - [ ] Badge `MULTI HEADSHOT` + `5x`

### TC-16: Headshot streak bị reset bởi kill thường
- **Điều kiện**: 2 headshot liên tiếp → kill thường (không headshot)
- **Mong đợi**:
  - [ ] Kill 3 (thường): âm thanh `kill_normal`, headshot counter reset về 0
  - [ ] Kill 4 (headshot): âm thanh `kill_headshot` (không phải `headshot_double` vì streak đã reset)

### TC-17: Headshot streak không bị reset bởi kill streak milestone
- **Điều kiện**: Đang có 2 headshot liên tiếp, kill 3 là headshot VÀ đạt mốc KILLING SPREE
- **Mong đợi**:
  - [ ] Âm thanh `headshot_triple` phát (headshot streak 3)
  - [ ] Badge `TRIPLE HEADSHOT` hiện
  - [ ] Badge `KILLING SPREE` cũng hiện
  - [ ] Âm thanh `streak_3` phát sau 300ms

---

## 4. Multi-Kill

### TC-18: Double Kill (2 kills trong 4 giây)
- **Điều kiện**: Kill 2 địch trong vòng 4 giây
- **Mong đợi**:
  - [ ] Kill 1: `kill_normal` phát
  - [ ] Kill 2: `kill_normal` phát, rồi 300ms sau `double_kill` phát
  - [ ] Badge `DOUBLE KILL` + `2x` xuất hiện

### TC-19: Triple Kill (3 kills trong 4 giây)
- **Điều kiện**: Kill 3 địch, mỗi kill cách nhau < 4 giây
- **Mong đợi**:
  - [ ] Kill 3: `kill_normal` + 300ms sau `triple_kill`
  - [ ] Badge `TRIPLE KILL` + `3x`

### TC-20: Quad Kill (4 kills trong 4 giây)
- **Điều kiện**: 4 kills, mỗi kill < 4 giây từ kill trước
- **Mong đợi**:
  - [ ] Badge `QUAD KILL` + `4x` + âm thanh `quad_kill`

### TC-21: Rampage (5+ kills trong 4 giây)
- **Điều kiện**: 5 kills liên tiếp, mỗi kill < 4 giây
- **Mong đợi**:
  - [ ] Badge `RAMPAGE` + `5x` + âm thanh `rampage`
  - [ ] Kill 6, 7... vẫn trigger `RAMPAGE` (mốc cuối cùng lặp lại)

### TC-22: Multi-kill window reset khi chờ > 4 giây
- **Điều kiện**: Kill 1, chờ 5 giây, kill 2
- **Mong đợi**:
  - [ ] Kill 2 **không** trigger Double Kill (window đã hết)
  - [ ] Server log: `elapsed > 4000ms`

### TC-23: Multi-kill kết hợp Kill Streak
- **Điều kiện**: Kill 1 và 2 trong vòng 4 giây, kill 3 là mốc KILLING SPREE
- **Mong đợi**:
  - [ ] Kill 2: `kill_normal` + 300ms `double_kill` (multi-kill sound)
  - [ ] Kill 3: `kill_normal` + 300ms `streak_3` (streak sound)
  - [ ] Cả 2 badge xuất hiện: `DOUBLE KILL` và `KILLING SPREE`

---

## 5. First Blood

### TC-24: First Blood — kill đầu tiên trong round
- **Điều kiện**: Kill đầu tiên của toàn round (chưa ai kill ai)
- **Mong đợi**:
  - [ ] Badge `FIRST BLOOD` màu đỏ xuất hiện
  - [ ] Âm thanh `first_blood` phát (override `kill_normal` — không nghe thấy `kill_normal`)
  - [ ] Kill counter hiện `1`

### TC-25: First Blood chỉ xảy ra 1 lần mỗi round
- **Điều kiện**: Sau khi first blood đã được claimed, các kill tiếp theo
- **Mong đợi**:
  - [ ] Kill 2, 3, 4... không trigger First Blood badge nữa
  - [ ] Âm thanh trở về `kill_normal` / `kill_headshot` bình thường

### TC-26: First Blood reset khi load map mới
- **Điều kiện**: Round kết thúc, load map mới, kill đầu tiên
- **Mong đợi**:
  - [ ] First Blood badge xuất hiện lại
  - [ ] Server log: `Level loaded — first blood reset`

### TC-27: First Blood bằng headshot
- **Điều kiện**: Kill đầu tiên là headshot
- **Mong đợi**:
  - [ ] Badge `FIRST BLOOD` hiện
  - [ ] Badge `HEADSHOT` hiện
  - [ ] Âm thanh `first_blood` phát (không phải `kill_headshot`)

---

## 6. Revenge Kill

### TC-28: Revenge Kill cơ bản
- **Điều kiện**: Địch A giết bạn → bạn giết lại địch A
- **Mong đợi**:
  - [ ] Badge `REVENGE` xuất hiện
  - [ ] Âm thanh `kill_normal` phát trước, 300ms sau `revenge_kill` phát
  - [ ] Kill counter tăng bình thường

### TC-29: Revenge không trigger nếu giết người khác
- **Điều kiện**: Địch A giết bạn → bạn giết địch B (không phải A)
- **Mong đợi**:
  - [ ] Không có badge `REVENGE`
  - [ ] Kill bình thường

### TC-30: Revenge chỉ trigger 1 lần
- **Điều kiện**: Địch A giết bạn → bạn giết A (revenge) → bạn giết A lần 2
- **Mong đợi**:
  - [ ] Lần 1 giết A: badge `REVENGE` xuất hiện
  - [ ] Lần 2 giết A: không có badge `REVENGE` (đã cleared sau lần đầu)

### TC-31: Revenge bị hủy nếu bạn giết người khác trước
- **Điều kiện**: Địch A giết bạn → bạn giết địch B → bạn giết địch A
- **Mong đợi**:
  - [ ] Giết B: kill bình thường, revenge với A vẫn còn hiệu lực
  - [ ] Giết A: badge `REVENGE` xuất hiện (revenge không bị cancel bởi kill người khác)

### TC-32: Revenge kết hợp First Blood
- **Điều kiện**: Địch A giết bạn (first blood của địch) → bạn giết lại A (kill đầu tiên của bạn)
- **Mong đợi**:
  - [ ] Badge `FIRST BLOOD` và `REVENGE` đều hiện
  - [ ] Âm thanh `first_blood` phát (first blood override kill_normal, revenge delay 300ms sau)

---

## 7. Server Announce

### TC-33: Server Announce khi có người đạt UNSTOPPABLE
- **Điều kiện**: Player A đạt 10 kills liên tiếp
- **Mong đợi** (từ góc nhìn của **Player B** — người khác):
  - [ ] Badge xuất hiện: `[Tên A]` / `is UNSTOPPABLE!` / `10 KILLS`
  - [ ] Badge màu xanh lam, ở giữa màn hình vị trí `top: 35%`
  - [ ] Tự ẩn sau ~4 giây
- **Mong đợi** (từ góc nhìn của **Player A** — người đạt streak):
  - [ ] Không nhận Server Announce (chỉ nhận streak message bình thường)

### TC-34: Server Announce khi có người đạt GODLIKE
- **Điều kiện**: Player A đạt 15 kills liên tiếp
- **Mong đợi** (Player B):
  - [ ] Badge: `[Tên A]` / `is GODLIKE!` / `15 KILLS`

### TC-35: Không có Server Announce cho streak thường (< 10)
- **Điều kiện**: Player A đạt KILLING SPREE (3 kills), RAMPAGE (5), DOMINATING (7)
- **Mong đợi** (Player B):
  - [ ] Không có Server Announce badge nào xuất hiện

---

## 8. Streak Progress

### TC-36: Streak progress hiển thị đúng
- **Điều kiện**: Kill lần lượt 1, 2, 3, 4, 5...
- **Mong đợi**:
  - [ ] 1 kill: `2 kills → KILLING SPREE`
  - [ ] 2 kills: `1 kill → KILLING SPREE`
  - [ ] 3 kills (đạt KILLING SPREE): `2 kills → RAMPAGE`
  - [ ] 4 kills: `1 kill → RAMPAGE`
  - [ ] 5 kills (đạt RAMPAGE): `2 kills → DOMINATING`
  - [ ] 14 kills: `1 kill → GODLIKE`
  - [ ] 15 kills (đạt GODLIKE): streak progress ẩn

### TC-37: Streak progress ẩn khi chết
- **Điều kiện**: Đang hiện `2 kills → RAMPAGE`, bị địch giết
- **Mong đợi**:
  - [ ] Streak progress biến mất

---

## 9. Bot

### TC-38: Không track streak khi bot là killer
- **Điều kiện**: Bot (tên bắt đầu bằng `BOT_`) giết người chơi
- **Mong đợi**:
  - [ ] Không có event nào gửi về client của bot
  - [ ] Server log: `(bot) killed ... — no streak tracking`

### TC-39: Streak reset đúng khi người chơi bị bot giết
- **Điều kiện**: Người chơi có streak 5, bị bot giết
- **Mong đợi**:
  - [ ] Streak của người chơi reset về 0
  - [ ] Badge `Streak Ended — 5 kill streak` xuất hiện ở client người chơi
  - [ ] Headshot streak cũng reset

### TC-40: Không track khi người chơi giết bot
- **Điều kiện**: Người chơi giết bot (victim là bot)
- **Mong đợi**:
  - [ ] Kill streak tăng bình thường (bot là nạn nhân thì vẫn count)
  - [ ] *(Cần xác nhận behavior — tùy design)*

---

## 10. Edge Cases

### TC-41: Người chơi rời game đang có streak cao
- **Điều kiện**: Player A đang có streak 10, disconnect
- **Mong đợi**:
  - [ ] Server xóa data: `playerKills`, `playerHeadshots`, `playerMultiKill`, `lastKilledBy`
  - [ ] Server log: `left — data cleared`
  - [ ] Không có memory leak

### TC-42: Nhiều kill streak và multi-kill đồng thời
- **Điều kiện**: Kill thứ 3 liên tiếp (KILLING SPREE) cũng là kill thứ 2 trong 4 giây (DOUBLE KILL)
- **Mong đợi**:
  - [ ] Badge `KILLING SPREE` hiện
  - [ ] Badge `DOUBLE KILL` hiện
  - [ ] `kill_normal` phát trước
  - [ ] 300ms sau: `double_kill` phát (multi-kill sound)
  - [ ] 300ms sau: `streak_3` phát (streak sound)
  - [ ] *(2 sound delay 300ms có thể play đè nhau — chấp nhận được)*

### TC-43: First Blood + Revenge cùng lúc
- **Điều kiện**: Địch A giết bạn (bạn chưa có kill nào) → bạn giết lại A (kill đầu tiên của bạn)
- **Mong đợi**:
  - [ ] Badge `FIRST BLOOD` hiện
  - [ ] Badge `REVENGE` hiện
  - [ ] Âm thanh `first_blood` phát (clear queue, override `kill_normal`)
  - [ ] Âm thanh `revenge_kill` phát 300ms sau `first_blood`

### TC-44: Kill streak tiếp tục sau khi không đạt mốc
- **Điều kiện**: Kills: 1, 2, 4, 5 (không có mốc ở kill 4)
- **Mong đợi**:
  - [ ] Kill 3 không phải mốc → không có streak badge, nhưng counter tăng
  - [ ] Kill 5 đạt RAMPAGE → badge `RAMPAGE` hiện

### TC-45: Headshot streak + Kill streak milestone cùng kill
- **Điều kiện**: Đang có 2 headshot liên tiếp, kill thứ 3 là headshot VÀ là kill thứ 3 trong streak (KILLING SPREE)
- **Mong đợi**:
  - [ ] Âm thanh `headshot_triple` phát (headshot milestone override headshot thường)
  - [ ] Badge `TRIPLE HEADSHOT` + `3x` hiện
  - [ ] Badge `KILLING SPREE` + `3 KILLS` hiện
  - [ ] Âm thanh `streak_3` phát sau 300ms

### TC-46: WebUI chưa load khi kill event tới
- **Điều kiện**: Kill xảy ra ngay sau khi vào game, trước khi WebUI init xong
- **Mong đợi**:
  - [ ] Không crash
  - [ ] Có thể mất 1 event, nhưng không ảnh hưởng các kill sau

---

## Checklist Khởi Động

Khi vào game lần đầu, kiểm tra các marker debug:

- [ ] `KS:OK` (đỏ, góc trên trái) → WebUI render được
- [ ] `JS:OK` (xanh, góc dưới trái) → JavaScript chạy được
- [ ] `LUA:OK` (vàng, góc trên phải) → Client Lua chạy được
- [ ] Sau 2 giây: âm thanh `kill_normal` tự phát (auto sound test)
- [ ] Log: `Video elements: 16 ok, 0 fail` (16 video elements)

---

## Ghi chú khi test

- Dùng flag `-dwebui` khi khởi động client để mở DevTools tại `http://localhost:8884`
- Xem log server trong VU console để verify các event đã fire
- Mỗi test nên reset bằng cách chết 1 lần để clear streak trước khi test case tiếp theo
- Các test multi-kill cần 2+ người chơi hoặc bot
