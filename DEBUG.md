# KillStreak Mod — Debug Guide

Tài liệu chẩn đoán khi mod KillStreak không hoạt động. Cập nhật theo kết quả debug thực tế (BF3 + VU + Gameface).

---

## 1. Flow hoạt động chuẩn (sau refactor)

```
Server (ext/Server/__init__.lua)              Client (ext/Client/__init__.lua)        WebUI (script.js)
────────────────────────────────              ────────────────────────────────        ─────────────────
Events:Subscribe('Player:Killed')             Events:Subscribe('Extension:Loaded')
  args: (victim, inflictor, position,           → WebUI:Init() + Show() + BringToFront
         weapon, isRoadKill, isHeadShot,        → ExecuteJS('showLuaMarker("LUA:OK (Ext)")')
         wasInRevive)
  victim    = arg1 (Player)                   Events:Subscribe('Level:Loaded')
  inflictor = arg2 (Player, có thể nil)         → ExecuteJS('showLuaMarker("LUA:OK (Lvl)")')
  position  = arg3 (Vec3)
  weapon    = arg4 (string)                   NetEvents:Subscribe('KillStreak:OnKill')
  isRoadKill= arg5                              → ExecuteJS('playKillSound(...)')
  isHeadShot= arg6 (bool)                       → ExecuteJS('updateKillCounter(...)')
  wasInRevive=arg7                              → ExecuteJS('showStreakMessage(...)')
  → NetEvents:SendTo('KillStreak:OnKill',
       killer, totalKills, headshot, ...)
```

**Quan trọng:** `Player:Kill` (KHÔNG có "ed") **KHÔNG fire** khi kill bot trong BF3 VU. Phải dùng `Player:Killed` (signature 7 args ở trên).

---

## 2. Hệ thống test marker

Mod có **5 marker** hiển thị trên màn hình để verify từng tầng hoạt động — không phụ thuộc log console:

| Marker | Vị trí | Màu | Verify | Trigger |
|---|---|---|---|---|
| `KS:OK` | Top-left | Đỏ | HTML render OK, ui.vuic load OK | Inline trong index.html |
| `JS:OK` | Bottom-left | Xanh lá | JavaScript chạy được | IIFE startup trong script.js |
| `LUA:OK (Ext/Lvl/Tick)` | Top-right | Vàng | Client Lua chạy + WebUI:ExecuteJS bridge OK | client `Extension:Loaded` / `Level:Loaded` / `Engine:Update` |
| `NET#N KILL k=X hs=Y` | Bottom-right | Tím | NetEvent server→client OK | client `NetEvents:Subscribe('KillStreak:OnKill')` |
| `SND-XXX ...` | Bottom-right (trên NET) | Đa màu | Audio playback status | playKillSound() |
| Stack diagnostic log | Bottom-right | Đa màu, 8 dòng | API probe + audio load status | showSoundMarker (stacked) |

Thấy đầy đủ KS:OK + JS:OK + LUA:OK + NET# = mod hoạt động đến 95%.

---

## 3. Lịch sử debug — các bug đã fix

### Bug 1: WebUI không render
- **Symptom**: Không thấy gì trong game.
- **Cause**: Thiếu `WebUI:Init()` ở client Lua.
- **Fix**: `Events:Subscribe('Extension:Loaded', function() WebUI:Init(); WebUI:Show() end)`.

### Bug 2: `<audio>` không phát
- **Symptom**: Element load nhưng không có tiếng.
- **Cause**: Gameface không support `<audio>` element.
- **Fix**: Đổi sang `<video>` (kết quả: cũng không phát — xem Bug 6).

### Bug 3: ui.vuic không rebuild
- **Symptom**: Sửa HTML/JS không thay đổi gì.
- **Cause**: Cần recompile bằng `vuicc.exe`.
- **Fix**: `vuicc.exe WebUI ui.vuic` mỗi lần sửa WebUI.

### Bug 4: `Player:Kill` không fire cho bot
- **Symptom**: Server log có "Mod loaded" nhưng kill bot không tạo log nào, NetEvent không gửi.
- **Cause**: VU's `Player:Kill` event chỉ fire cho PvP, không fire cho bot kill.
- **Fix**: Dùng `Player:Killed(victim, inflictor, position, weapon, isRoadKill, isHeadShot, wasInRevive)` — fire cho cả PvP lẫn bot kill. Killer ở `arg2 inflictor`, headshot ở `arg6 isHeadShot`.

### Bug 5: Bot trong BF3 là Player object
- **Symptom**: Tracking streak cho bot (vô nghĩa).
- **Cause**: VU wrap bot thành Player với tên `BOT_<name>`.
- **Fix**: Helper `isBot(player)` check `player.name:sub(1,4) == 'BOT_'`. Skip tracking streak + send NetEvent đến bot.

### Bug 6: Gameface không xuất audio qua HTMLMediaElement
- **Symptom**: `<video>` báo "playing" nhưng `currentTime=0.00` sau 200ms, không nghe tiếng.
- **Cause**: Gameface fake "playing state" mà không thực sự xuất audio qua HTMLMediaElement.
- **Status**: ❌ Chưa fix được.

### Bug 7: Gameface không có Web Audio API
- **Symptom**: `window.AudioContext === undefined`, `window.webkitAudioContext === undefined`.
- **Cause**: Build Gameface của VU không bundle Web Audio API.
- **Status**: ❌ Không thể fallback sang `AudioContext` + `AudioBufferSourceNode`.

---

## 4. Player:Killed signature (BF3 VU)

```lua
Events:Subscribe('Player:Killed', function(victim, inflictor, position, weapon, isRoadKill, isHeadShot, wasInRevive)
    -- victim     : Player (always non-nil, có thể là bot)
    -- inflictor  : Player or nil (nil = chết môi trường, fall damage, suicide)
    -- position   : Vec3 (vị trí victim chết)
    -- weapon     : string (tên súng, "Death" cho env-kill)
    -- isRoadKill : boolean (bị xe đụng)
    -- isHeadShot : boolean (headshot)
    -- wasInRevive: boolean (bị giết khi đang revive)
end)
```

Phát hiện được bằng diagnostic dump (xem section 7 — diagnostic script).

---

## 5. Quy trình build & deploy (2 máy)

**Máy dev**: `D:\source\project\bf3\`
**Máy test**: `%USERPROFILE%\Documents\Mods\KillStreak\`

```powershell
# Trên máy dev
.\vuicc.exe WebUI ui.vuic
```

Sau đó copy 4 file sang máy test:
- `ui.vuic` (mỗi khi sửa WebUI/)
- `ext/Client/__init__.lua` (khi sửa client Lua)
- `ext/Server/__init__.lua` (khi sửa server Lua)
- `ext/Shared/config.lua` (khi sửa config)

Restart VU server + client trên máy test.

---

## 6. Ma trận chẩn đoán (cập nhật)

| KS:OK | JS:OK | LUA:OK | NET# | SND | Nguyên nhân |
|:---:|:---:|:---:|:---:|:---:|---|
| ❌ | — | — | — | — | Mod chưa deploy / `ui.vuic` không có / chưa bật trong VU Launcher |
| ✅ | ❌ | — | — | — | `script.js` không chạy → bug script |
| ✅ | ✅ | ❌ | — | — | Client Lua không load → check deploy `ext/Client/` |
| ✅ | ✅ | ✅ | ❌ | — | NetEvent không tới client → server không send (kiểm tra event name, dùng `Player:Killed` không phải `Player:Kill`) |
| ✅ | ✅ | ✅ | ✅ | ❌ | **Gameface không xuất audio** — vấn đề engine, không phải code |

---

## 7. Diagnostic snippets

### 7.1. Probe Player:Killed signature
Khi không biết event signature, dump tất cả args:

```lua
Events:Subscribe('Player:Killed', function(victim, ...)
    local args = {...}
    local nArgs = select('#', ...)
    local out = 'victim=' .. (victim and victim.name or 'nil') .. ' nArgs=' .. nArgs
    for i = 1, nArgs do
        out = out .. ' arg' .. (i+1) .. '=' .. tostring(args[i])
    end
    print(out)
    NetEvents:Broadcast('KillStreak:Diag', 'Killed', out)
end)
```

### 7.2. Broadcast debug NetEvent (server → tất cả client)
```lua
NetEvents:Broadcast('KillStreak:Diag', label, info)  -- KHÔNG dùng BroadcastLocal!
```
`BroadcastLocal` chỉ fire trên server, không gửi tới client.

### 7.3. JS marker stacked (không ghi đè)
```javascript
var _diagLogLines = [];
function showSoundMarker(text, color) {
    _diagLogLines.push({ text: text, color: color || '#444444' });
    if (_diagLogLines.length > 8) _diagLogLines.shift();
    // ... render container with all lines
}
```
Không dùng `removeChild` + tạo mới single element vì sẽ mất history.

### 7.4. Probe vendor audio APIs trong Gameface
```javascript
var apis = ['AudioContext', 'webkitAudioContext', 'HTMLAudioElement', 'Audio',
            'cohtml', 'engine', 'gameface', 'frostbite'];
for (var i = 0; i < apis.length; i++) {
    if (typeof window[apis[i]] !== 'undefined') {
        showSoundMarker('API ' + apis[i] + '=' + typeof window[apis[i]]);
    }
}
```

---

## 8. Gameface audio: các approach đã thử

| Approach | Kết quả | Ghi chú |
|---|:---:|---|
| `<audio src="...wav">` + `.play()` | ❌ | Element load, không xuất tiếng |
| `<video src="...wav">` + `.play()` | ❌ | "playing" state nhưng `currentTime=0` mãi |
| `el.muted=false; el.volume=1.0; el.play()` | ❌ | Không thay đổi gì |
| Web Audio API (`AudioContext + decodeAudioData + AudioBufferSourceNode`) | ❌ | `AudioContext === undefined` |
| Vendor API (`cohtml`/`engine`/`gameface`) | ❓ | Đang probe |

### Phương án còn lại nếu probe fail

1. **VU native Lua audio** — dùng `ResourceManager` / `Sound` để play built-in BF3 sounds (announcer, achievement). Cần GUID của asset có sẵn trong BF3. Phức tạp setup.
2. **Custom WAV asset registration** — đăng ký WAV file như Frostbite asset thông qua bundle. Cực kỳ phức tạp, cần hiểu Frostbite asset pipeline.
3. **Drop sound feature** — chỉ giữ HUD streak/headshot, không có âm thanh.
4. **External process** — không khả thi, VU sandbox không cho launch process ngoài.

---

## 9. VU API references

### Events
| Event | Khi nào fire | Args |
|---|---|---|
| `Extension:Loaded` | Mod load xong (client) | () |
| `Level:Loaded` | Map load xong (client+server) | () |
| `Engine:Update` | Mỗi tick (client+server) | (dt) |
| `Player:Kill` | PvP kill **(không fire cho bot)** | (killer, victim, weapon, headshot) |
| `Player:Killed` | **Bất kỳ kill nào** (bot + env + pvp) | (victim, inflictor, position, weapon, isRoadKill, isHeadShot, wasInRevive) |
| `Player:Left` | Player thoát game | (player) |

### NetEvents
| Method | Mô tả |
|---|---|
| `NetEvents:SendTo(name, player, ...)` | Server → 1 client cụ thể |
| `NetEvents:Broadcast(name, ...)` | Server → tất cả client |
| `NetEvents:BroadcastLocal(name, ...)` | **CHỈ trên server**, không gửi client |
| `NetEvents:Subscribe(name, fn)` | Client subscribe |

### WebUI
| Method | Mô tả |
|---|---|
| `WebUI:Init()` | Khởi tạo (gọi trong `Extension:Loaded`) |
| `WebUI:Show()` / `WebUI:Hide()` | Hiện/ẩn WebUI |
| `WebUI:BringToFront()` / `WebUI:SendToBack()` | Z-order |
| `WebUI:ExecuteJS(script)` | Gọi JS từ Lua |
| ~~`WebUI:Load(url)`~~ | **KHÔNG tồn tại** |

---

## 10. Gameface constraints

### CSS không hỗ trợ
- `display: grid`
- `display: inline`, `display: inline-block`
- `table-layout`
- Một số property khác chưa rõ

### CSS hỗ trợ
- `display: block`, `display: flex`
- `position: fixed/absolute/relative`
- Animation, transition cơ bản
- `text-shadow`, `box-shadow`

### JavaScript không hỗ trợ
- `Web Audio API` (`AudioContext`, `decodeAudioData`)
- `window.addEventListener('load', ...)` không reliable → dùng IIFE chạy ngay khi script load
- `Promise` từ `.play()` đôi khi không trả về

### HTML
- `<audio>` element: load được nhưng không xuất tiếng
- `<video>` element: tương tự, có thể phát visual nhưng audio bị câm

---

## 11. Trạng thái debug hiện tại

✅ Đã verify hoạt động:
- KS:OK + JS:OK + LUA:OK (Lvl) + NET#X KILL hiển thị đầy đủ
- Server detect kill bot bằng `Player:Killed`
- NetEvent server → client OK
- HUD streak message + counter render đúng

❌ Vấn đề duy nhất còn lại:
- **Audio không phát** (Gameface limitation, không phải bug code)

🔄 Đang chờ:
- Kết quả probe vendor API (`cohtml`/`engine`/`gameface`) để quyết định approach cuối

---

## 12. Bước tiếp theo

1. Copy `ui.vuic` mới (đã có probe vendor API + stacked diagnostic) sang máy test
2. Vào game, paste lại tất cả dòng `API X=YYY` xuất hiện ở góc dưới phải
3. Quyết định:
   - Nếu có vendor API → inspect tiếp tìm hàm play sound
   - Nếu không có → chuyển sang VU Lua native audio HOẶC drop sound
