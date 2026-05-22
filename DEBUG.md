# KillStreak Mod — Debug Guide

Tài liệu hướng dẫn chẩn đoán khi mod KillStreak không hoạt động (không thấy WebUI / không nghe sound khi đạt killstreak).

---

## 1. Flow hoạt động chuẩn

```
Server (ext/Server/__init__.lua)        Client (ext/Client/__init__.lua)        WebUI (script.js)
────────────────────────────────        ────────────────────────────────        ─────────────────
Events:Subscribe('Player:Kill')         Events:Subscribe('Extension:Loaded')
  → playerKills[id]++                     → WebUI:Init()
  → check streak/headshot milestone       → WebUI:Show()
  → NetEvents:SendTo('KillStreak:OnKill') → WebUI:BringToFront()
                                        NetEvents:Subscribe('KillStreak:OnKill')
                                          → WebUI:ExecuteJS('playKillSound(...)') ─→ playKillSound()
                                          → WebUI:ExecuteJS('updateKillCounter(...)') → updateKillCounter()
                                          → WebUI:ExecuteJS('showStreakMessage(...)') → showStreakMessage()
```

---

## 2. Checklist các thành phần

| Thành phần | Vị trí | Kiểm tra |
|---|---|---|
| Mod metadata | `mod.json` | `"HasVeniceEXT": true`, `"HasWebUI": true` |
| Config | `ext/Shared/config.lua` | 5 streaks + 3 headshot milestones |
| Server Lua | `ext/Server/__init__.lua` | Track kill, send NetEvent |
| Client Lua | `ext/Client/__init__.lua` | Init WebUI, receive NetEvent |
| WebUI HTML | `WebUI/index.html` | 10 `<video>` sound + 2 test div (KS:OK đỏ, JS:OK xanh từ JS) |
| WebUI JS | `WebUI/script.js` | Startup test + handlers |
| WebUI CSS | `WebUI/style.css` | HUD style, KHÔNG dùng grid/inline-block |
| Sounds | `WebUI/sounds/*.wav` | 10 file `.wav`, PCM 16-bit |
| Compiled UI | `ui.vuic` | Header magic `CIUV`, rebuild bằng `vuicc.exe WebUI ui.vuic` |
| Deploy path | `%USERPROFILE%\Documents\Mods\KillStreak\` | Toàn bộ mod ở đây, không phải D:\source |

---

## 3. Quy trình chẩn đoán (4 cấp test)

### Test 1 — HTML render OK?

Vào game, quan sát **ô đỏ "KS:OK"** góc trên trái màn hình (hardcoded inline style trong `index.html`).

- ✅ Thấy ô đỏ → HTML render OK, `ui.vuic` load OK
- ❌ Không thấy ô đỏ → Mod không load / `ui.vuic` không có / WebUI:Init() chưa chạy

### Test 2 — JavaScript chạy được?

Vào game, quan sát **ô xanh "JS:OK"** góc dưới trái màn hình (được tạo bằng `document.createElement` trong `script.js`).

- ✅ Thấy ô xanh → JS bridge OK
- ❌ Không thấy ô xanh nhưng thấy KS:OK → **script.js KHÔNG chạy được** → cần debug qua Chrome DevTools

### Test 3 — Server tracking OK?

Mở console server (cửa sổ vu-server), kill 1 con bot, tìm log:

```
[KillStreak][SERVER] <bạn> killed <bot> | kills=1 hs=false consec_hs=0 | no-streak | no-hs-milestone
[KillStreak][SERVER] NetEvent sent to <bạn> | streakName="" hsName=""
```

- ✅ Có cả 2 dòng → Server Lua chạy đúng, NetEvent đã gửi đi
- ❌ Không có dòng nào → Server không load mod / `Player:Kill` không fire
- ❌ Có dòng "Player:Kill fired but killer or victim is nil — skipped" → bot kill không tính

### Test 4 — Client nhận NetEvent OK?

Mở **client** console **trong game** (phím `~`), hoặc xem file `%USERPROFILE%\Documents\Battlefield 3\vu.log`:

```
[KillStreak][CLIENT] Mod loaded — waiting for Extension:Loaded
[KillStreak][CLIENT] Extension:Loaded fired — calling WebUI:Init()
[KillStreak][CLIENT] Level:Loaded fired — re-init WebUI
[KillStreak][CLIENT] OnKill received | kills=1 headshot=false streak="" consec_hs=0 hs=""
```

- ✅ Có dòng "OnKill received" → Client nhận NetEvent, vấn đề ở JS handler
- ❌ Có 2 dòng đầu nhưng KHÔNG có "OnKill received" → NetEvent không tới client
- ❌ Không có dòng nào → Client Lua không load

---

## 4. Bật WebUI Debug (Chrome DevTools)

Cách chính xác nhất để debug WebUI:

1. Tạo shortcut tới `vu.exe`
2. Right click shortcut → Properties → Target, thêm flag `-dwebui` ở cuối:
   ```
   "C:\Path\To\vu.exe" -dwebui
   ```
3. Chạy game qua shortcut này
4. Mở Chrome trên cùng máy → vào `http://localhost:8884`
5. Click target có tên `KillStreak HUD`
6. **Tab Console** — xem log JS và error đỏ
7. **Tab Network** — kiểm tra `script.js` và `style.css` có status `200` không
8. **Tab Elements** — kiểm tra DOM thực tế

---

## 5. Các lỗi đã biết / Workaround Gameface

| Vấn đề | Workaround |
|---|---|
| `<audio>` không play | Dùng `<video>` thay thế, src vẫn `.wav` |
| `window.addEventListener('load', ...)` không fire | Dùng IIFE chạy ngay khi script load |
| `display: inline-block`, `display: inline`, CSS Grid không work | Dùng `display: block` hoặc `display: flex` |
| Promise của `.play()` đôi khi không có | Check `if (playResult && playResult.then)` trước khi gọi `.catch` |
| Element không tìm thấy ngay khi script.js chạy | `<script>` để cuối `<body>`, sau khi DOM render |
| `WebUI:Load(url)` không tồn tại | Dùng `WebUI:Init()` thay vào |

---

## 6. Quy trình build & deploy

Mỗi khi sửa file trong `WebUI/`:

```powershell
# Trong D:\source\project\bf3\
.\vuicc.exe WebUI ui.vuic

# Copy ui.vuic mới sang Mods folder (ghi đè)
Copy-Item ui.vuic "$env:USERPROFILE\Documents\Mods\KillStreak\ui.vuic" -Force
```

Mỗi khi sửa file `.lua` trong `ext/`:

```powershell
# Copy toàn bộ ext sang Mods folder (ghi đè)
Copy-Item -Recurse -Force ext "$env:USERPROFILE\Documents\Mods\KillStreak\"
```

Sau khi copy, **restart cả VU server và VU client** rồi test lại.

> Mẹo: Có thể dùng junction để tránh copy mỗi lần:
> ```cmd
> mklink /J "%USERPROFILE%\Documents\Mods\KillStreak" "D:\source\project\bf3"
> ```
> Khi đó mod folder trong Documents là symlink tới repo dev — sửa code sẽ áp dụng ngay sau khi restart VU (vẫn cần rebuild `ui.vuic` khi sửa WebUI).

---

## 7. Ma trận triệu chứng → Nguyên nhân

| KS:OK | JS:OK | Log Server | Log Client | Sound | Nguyên nhân |
|:---:|:---:|:---:|:---:|:---:|---|
| ❌ | ❌ | ❌ | ❌ | ❌ | Mod chưa deploy hoặc chưa bật trong VU Launcher |
| ❌ | ❌ | ✅ | ❌ | ❌ | `ui.vuic` thiếu / không load → rebuild + copy |
| ✅ | ❌ | ✅ | ❌/✅ | ❌ | `script.js` không chạy → check Chrome DevTools |
| ✅ | ✅ | ✅ | ❌ | ❌ | Client Lua không load → check `require('__shared/config')` path |
| ✅ | ✅ | ✅ | ✅ (chỉ load) | ❌ | NetEvent không tới client → kiểm tra `killer` có phải Player object không |
| ✅ | ✅ | ✅ | ✅ (có OnKill) | ❌ | JS handler lỗi → check Console DevTools, file `.wav` đúng path |
| ✅ | ✅ | ✅ | ✅ (có OnKill) | ✅ (kill normal) nhưng ❌ streak | Sai milestone trong `config.lua` hoặc `<video>` id không khớp |

---

## 8. Trạng thái debug hiện tại (2026-05-22)

- ✅ KS:OK ô đỏ hiển thị → HTML/ui.vuic OK
- ❌ JS:OK ô xanh **chưa test** (vừa thêm vào, đã rebuild ui.vuic, cần deploy + test)
- ✅ Log server có `[KillStreak][SERVER]`
- ❓ Log client `[KillStreak][CLIENT]` — user nói không thấy, cần xác nhận đang check đúng console (phím `~` trong game) hay file `vu.log`

**Bước tiếp theo:**

1. Copy `ui.vuic` mới sang `%USERPROFILE%\Documents\Mods\KillStreak\`
2. Restart VU server + client
3. Vào game, quan sát có thấy ô xanh JS:OK không
4. Mở client console bằng phím `~` trong game, paste lại các dòng `[KillStreak][CLIENT]`
5. Nếu vẫn không xác định được, bật `-dwebui` và mở Chrome DevTools
