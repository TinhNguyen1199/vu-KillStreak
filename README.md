# KillStreak Mod — Battlefield 3 (Venice Unleashed)

> [English](#english) | [Tiếng Việt](#tiếng-việt)

---

## English

A Venice Unleashed mod that adds **custom kill sounds** and a **Kill Streak HUD system** to Battlefield 3.

### Features

| Feature | Description |
|---------|-------------|
| **Kill Sound** | Plays a custom sound on every kill |
| **Headshot** | Separate badge and sound for headshot kills |
| **First Blood** | Large red badge + sound for the first kill of the round |
| **Revenge Kill** | Badge + sound when you kill the player who last killed you |
| **Multi-Kill** | Announces Double / Triple / Quad Kill / Rampage within a 4-second window |
| **Kill Streak** | Tracks consecutive kills and shows milestone messages (3 / 5 / 7 / 10 / 15) |
| **Headshot Streak** | Tracks consecutive headshots with dedicated milestones (2 / 3 / 5) |
| **Server Announce** | Broadcasts a player's name server-wide when they reach a 10+ kill streak |
| **Streak Ended** | Shows who ended your streak and plays a contextual sound |

**HUD elements:** Kill counter (top-left), streak progress hint, centered milestone banners with per-streak accent colors, animated multi-kill ribbon, and streak-ended panel.

### Requirements

- Battlefield 3 (Origin / EA App)
- [Venice Unleashed](https://veniceunleashed.net)
- `vuicc.exe` — to compile the WebUI after any changes
- FFmpeg — to convert audio files to `.webm` (only needed when adding custom sounds)

### Installation

**Step 1 — Install Venice Unleashed**

Download and install VU Launcher from [veniceunleashed.net](https://veniceunleashed.net), then log in with your EA account and launch it once to initialize the folders.

**Step 2 — Copy the mod**

Place the `KillStreak` folder into your VU Mods directory:

```
%USERPROFILE%\Documents\Mods\KillStreak\
```

The folder must contain:

```
KillStreak\
├── mod.json
├── ui.vuic        ← pre-compiled WebUI (already included)
└── ext\
```

**Step 3 — Enable the mod**

Open **VU Launcher** → **Mods** tab → find **KillStreak** → toggle it on → launch the game.

> For server use: copy the mod folder into your server's `Mods` directory and add `vars.modList KillStreak` to your server config. Clients connecting to the server will automatically receive the mod.

---

## Tiếng Việt

Mod thêm **âm thanh tùy chỉnh khi hạ gục địch** và hệ thống **Kill Streak** hiển thị trên HUD cho Battlefield 3 thông qua nền tảng Venice Unleashed.

---

## Mục lục

1. [Tính năng](#tính-năng)
2. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
3. [Cài đặt](#cài-đặt)
4. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
5. [Thêm âm thanh tùy chỉnh](#thêm-âm-thanh-tùy-chỉnh)
6. [Cấu hình mod](#cấu-hình-mod)
7. [Cách hoạt động](#cách-hoạt-động)
8. [Tùy chỉnh giao diện HUD](#tùy-chỉnh-giao-diện-hud)
9. [Chạy trên server](#chạy-trên-server)
10. [Khắc phục sự cố](#khắc-phục-sự-cố)
11. [Changelog](#changelog)

---

## Tính năng

### Hệ thống Kill

| Tính năng | Mô tả |
|-----------|-------|
| **Kill thường** | Phát âm thanh mỗi lần hạ gục địch |
| **Headshot** | Badge + âm thanh riêng khi bắn headshot |
| **First Blood** | Badge đỏ lớn + âm thanh khi có kill đầu tiên trong round |
| **Revenge Kill** | Badge + âm thanh khi giết đúng người vừa giết mình |
| **Multi-Kill** | Thông báo khi giết nhiều người trong vòng 4 giây |
| **Kill Streak** | Theo dõi kill liên tiếp, hiển thị thông báo khi đạt mốc |
| **Headshot Streak** | Theo dõi headshot liên tiếp, thông báo riêng khi đạt mốc |
| **Server Announce** | Broadcast tên người chơi lên toàn server khi đạt streak 10+, hiện ở đầu màn hình và clear toàn bộ HUD events đang hiển thị |
| **Streak Ended with Killer** | Thông báo "Streak ended by [PlayerName]" khi chết, kèm sound `shut_down`; nếu chết bởi env/bot phát sound `dead` |

### Các mốc Kill Streak mặc định

| Kills | Tên | Ưu tiên |
|:-----:|-----|:-------:|
| 3  | KILLING SPREE |    |
| 5  | RAMPAGE       |    |
| 7  | DOMINATING    |    |
| 10 | UNSTOPPABLE   | Cao (override headshot sound) |
| 15 | GODLIKE       | Cao (override headshot sound) |

### Các mốc Multi-Kill mặc định (trong vòng 4 giây)

| Kills | Tên |
|:-----:|-----|
| 2 | DOUBLE KILL |
| 3 | TRIPLE KILL |
| 4 | QUAD KILL   |
| 5 | RAMPAGE     |

### Các mốc Headshot liên tiếp mặc định

| Liên tiếp | Tên |
|:---------:|-----|
| 2 | DOUBLE HEADSHOT |
| 3 | TRIPLE HEADSHOT |
| 5 | MULTI HEADSHOT  |

> Chuỗi headshot **reset về 0** ngay khi có kill không phải headshot, hoặc khi người chơi chết.

### HUD

- **Kill Counter** góc trên phải — hiển thị số kill streak hiện tại
- **Streak Progress** bên dưới kill counter — cho biết cần thêm bao nhiêu kill để lên mốc tiếp theo
- **Thông báo Streak Ended** khi chết với streak >= 3

---

## Yêu cầu hệ thống

| Thành phần | Yêu cầu |
|------------|---------|
| Game | Battlefield 3 (mua qua Origin / EA App) |
| Nền tảng mod | [Venice Unleashed](https://veniceunleashed.net) |
| Hệ điều hành | Windows 10 / 11 64-bit |
| Build tool | `vuicc.exe` — compile WebUI thành `ui.vuic` |
| Convert âm thanh | FFmpeg (chuyển `.mp3`/`.wav` → `.webm`) |

> Mod chạy phía **client** (WebUI + âm thanh) và **server** (theo dõi kill). Cần cài trên cả hai để hoạt động đầy đủ.

---

## Cài đặt

### Bước 1 — Cài Venice Unleashed

1. Truy cập [veniceunleashed.net](https://veniceunleashed.net) và tải VU Launcher
2. Đăng nhập bằng tài khoản EA
3. Cài đặt VU và chạy thử một lần để tạo thư mục

### Bước 2 — Copy mod vào thư mục VU

```
%USERPROFILE%\Documents\Mods\KillStreak\
```

Sau khi copy, cấu trúc phải trông như sau:

```
Documents\
└── Mods\
    └── KillStreak\
        ├── mod.json
        ├── ui.vuic          ← file WebUI đã compile
        ├── ext\
        └── sounds_src\      ← file gốc .wav/.mp3 (không cần thiết để chạy)
```

### Bước 3 — Bật mod trong VU Launcher

1. Mở **VU Launcher** → tab **Mods**
2. Tìm **KillStreak** → bật toggle
3. Khởi động game

---

## Cấu trúc thư mục

```
KillStreak/
│
├── mod.json                    ← Metadata (tên, version, mô tả)
├── ui.vuic                     ← WebUI đã compile (build từ WebUI/ bằng vuicc.exe)
│
├── ext/
│   ├── Server/__init__.lua     ← Theo dõi kill, tính streak, gửi NetEvent
│   ├── Client/__init__.lua     ← Nhận event, phát âm thanh, cập nhật HUD
│   └── Shared/config.lua       ← Cấu hình chung (mốc streak, tên sound)
│
├── WebUI/                      ← Nguồn WebUI — compile bằng vuicc.exe để tạo ui.vuic
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── sounds/                 ← Chỉ chứa file .webm
│       ├── kill_normal.webm
│       ├── kill_headshot.webm
│       ├── first_blood.webm
│       ├── revenge_kill.webm
│       ├── headshot_double.webm
│       ├── headshot_triple.webm
│       ├── headshot_multi.webm
│       ├── streak_3.webm
│       ├── streak_5.webm
│       ├── streak_7.webm
│       ├── streak_10.webm
│       └── streak_15.webm
│
└── sounds_src/                 ← File gốc (.wav, .mp3) để backup và convert
    ├── kill_normal.wav
    ├── kill_headshot.mp3
    ├── firstblood.mp3
    ├── revenge_kill.mp3
    └── ...
```

---

## Thêm âm thanh tùy chỉnh

### Định dạng bắt buộc: `.webm`

Gameface (UI engine của Venice Unleashed) **không hỗ trợ** `<audio>`, `AudioContext`, hay Web Audio API. Chỉ hỗ trợ `<video>` với file `.webm` (codec Vorbis).

> File `.wav` hay `.mp3` sẽ **không phát được** — phải convert sang `.webm` trước.

### Convert sang .webm bằng FFmpeg

```bash
ffmpeg -i input.mp3 -c:a libvorbis -b:a 128k -f webm output.webm
ffmpeg -i input.wav -c:a libvorbis -b:a 128k -f webm output.webm
```

Tải FFmpeg tại: [ffmpeg.org/download.html](https://ffmpeg.org/download.html)

### Danh sách file âm thanh

| File `.webm` | Khi nào phát |
|--------------|-------------|
| `kill_normal.webm`     | Mỗi lần kill thường |
| `kill_headshot.webm`   | Headshot đơn (hoặc khi chưa đạt mốc headshot streak) |
| `first_blood.webm`     | Kill đầu tiên trong round |
| `revenge_kill.webm`    | Giết người vừa giết mình |
| `headshot_double.webm` | 2 headshot liên tiếp |
| `headshot_triple.webm` | 3 headshot liên tiếp |
| `headshot_multi.webm`  | 5 headshot liên tiếp |
| `streak_3.webm`        | 3 kills liên tiếp |
| `streak_5.webm`        | 5 kills liên tiếp |
| `streak_7.webm`        | 7 kills liên tiếp |
| `streak_10.webm`       | 10 kills — UNSTOPPABLE (ưu tiên cao) |
| `streak_15.webm`       | 15 kills — GODLIKE (ưu tiên cao) |
| `unstoppable.webm`     | Server announce khi player khác đạt streak 10+ |
| `shut_down.webm`       | Streak bị kết thúc bởi player khác |
| `dead.webm`            | Streak kết thúc do env/bot/tự chết |
| `double_kill.webm`     | 2 kills trong 4 giây |
| `triple_kill.webm`     | 3 kills trong 4 giây |
| `quad_kill.webm`       | 4 kills trong 4 giây |
| `rampage.webm`         | 5 kills trong 4 giây |

### Thêm sound mới

1. Convert file sang `.webm`, đặt vào `WebUI/sounds/`
2. Thêm `<video>` element vào `WebUI/index.html`:
   ```html
   <video id="snd-ten_sound" src="sounds/ten_sound.webm" preload="auto" style="display:none;position:absolute;"></video>
   ```
3. Thêm vào `_soundIds` trong `WebUI/script.js`:
   ```js
   'ten_sound': 'snd-ten_sound',
   ```
4. Thêm tên sound vào `config.lua` và wire vào logic phù hợp
5. Rebuild: `vuicc.exe WebUI ui.vuic`

### Rebuild WebUI

Mỗi lần sửa file trong `WebUI/` phải rebuild:

```bash
vuicc.exe WebUI ui.vuic
```

Tải `vuicc.exe` tại: [veniceunleashed.net/files/vuicc.exe](https://veniceunleashed.net/files/vuicc.exe)

---

## Cấu hình mod

Mở `ext/Shared/config.lua`:

```lua
KillStreakConfig = {

    -- Mốc Kill Streak
    -- important = true: override headshot sound, phát ngay lập tức
    streaks = {
        { kills = 3,  name = "KILLING SPREE",  sound = "streak_3"  },
        { kills = 5,  name = "RAMPAGE",         sound = "streak_5"  },
        { kills = 7,  name = "DOMINATING",      sound = "streak_7"  },
        { kills = 10, name = "UNSTOPPABLE",     sound = "streak_10", important = true },
        { kills = 15, name = "GODLIKE",         sound = "streak_15", important = true },
    },

    -- Mốc Headshot liên tiếp
    headshotStreaks = {
        { count = 2, name = "DOUBLE HEADSHOT", sound = "headshot_double" },
        { count = 3, name = "TRIPLE HEADSHOT", sound = "headshot_triple" },
        { count = 5, name = "MULTI HEADSHOT",  sound = "headshot_multi"  },
    },

    -- Multi-kill (nhiều kill trong 1 khoảng thời gian)
    multiKillWindow = 4000,  -- ms
    multiKills = {
        { count = 2, name = "DOUBLE KILL", sound = "streak_3"  },
        { count = 3, name = "TRIPLE KILL", sound = "streak_5"  },
        { count = 4, name = "QUAD KILL",   sound = "streak_7"  },
        { count = 5, name = "RAMPAGE",     sound = "streak_10" },
    },

    -- Âm thanh
    killSound       = "kill_normal",
    headshotSound   = "kill_headshot",
    firstBloodSound = "first_blood",
    revengeSound    = "revenge_kill",

    -- Thời gian hiển thị thông báo (giây)
    displayDuration = 3.0,
}
```

---

## Cách hoạt động

```
[Người chơi kill địch]
        │
        ▼
[Server: Player:Killed event]
  - Kiểm tra First Blood (kill đầu tiên trong round)
  - Kiểm tra Revenge Kill (nạn nhân = người vừa giết mình)
  - Tăng kill streak counter
  - Kiểm tra streak milestone (3/5/7/10/15)
  - Tăng/reset consecutive headshot counter
  - Kiểm tra headshot streak milestone
  - Tăng multi-kill counter (reset nếu > 4 giây từ kill trước)
  - Kiểm tra multi-kill milestone (2/3/4/5)
        │
        ├─→ NetEvents:SendTo OnKill → killer
        ├─→ NetEvents:SendTo OnFirstBlood → killer (nếu first blood)
        ├─→ NetEvents:SendTo OnRevenge → killer (nếu revenge)
        ├─→ NetEvents:SendTo OnMultiKill → killer (nếu đạt mốc)
        └─→ NetEvents:SendTo OnServerAnnounce → tất cả player khác (nếu streak important)

[Client: nhận OnKill — ưu tiên âm thanh]
  1. important streak (10/15) → stop queue, phát streak sound ngay
  2. headshot milestone       → stop, phát milestone sound
  3. headshot thường          → stop, phát headshot sound
  4. kill thường              → phát kill_normal
  (streak 3/5/7: delay 300ms rồi phát thêm streak sound)

[Client: nhận OnFirstBlood]
  → Clear queue + stop → phát first_blood sound (override kill_normal)

[Client: nhận OnRevenge / OnMultiKill]
  → requestSoundDelayed(300ms) → kill_normal phát trước, 300ms sau phát revenge/multi sound

[WebUI (JavaScript) — Sound Queue Pattern]
  Lua không thể gọi video.play() trực tiếp (Gameface block media API từ injected context)
  Giải pháp: Lua gọi requestSound() → đẩy vào _soundQueue
             setInterval (50ms) drain queue → gọi video.play() từ page-level context
```

### Ưu tiên âm thanh

```
important streak > headshot milestone > headshot thường > kill thường
```

Multi-kill, First Blood, Revenge sử dụng delay 300ms để kill_normal được nghe trước.

---

## Tùy chỉnh giao diện HUD

> **Lưu ý Gameface**: Không hỗ trợ `display: inline`, `display: inline-block`, CSS Grid, hay table layout. Dùng `display: block` hoặc `display: flex`.

### Vị trí các element HUD

| Element | Vị trí mặc định |
|---------|----------------|
| `#kill-counter` | Top-right: `top: 20px; right: 20px` |
| `#streak-progress` | Dưới kill counter: `top: 56px; right: 20px` |
| `#firstblood-badge` | Giữa màn hình: `top: 6%` |
| `#streak-message` | Giữa màn hình: `top: 6%` |
| `#headshot-badge` | Giữa màn hình: `top: 12%` |
| `#headshot-message` | Giữa màn hình: `top: 16%` |
| `#multikill-badge` | Giữa màn hình: `top: 22%` |
| `#revenge-badge` | Giữa màn hình: `top: 6%` |
| `#server-announce` | Đầu màn hình: `top: 6%` |

### Ví dụ tùy chỉnh

**Đổi màu Kill Counter:**
```css
#kill-counter { color: #00ff88; }
```

**Đổi kích thước chữ Streak:**
```css
#streak-name { font-size: 60px; }
```

**Tắt Server Announce:**
Xóa hoặc comment `NetEvents:Subscribe('KillStreak:OnServerAnnounce', ...)` trong `ext/Client/__init__.lua`.

---

## Chạy trên server

1. Copy thư mục `KillStreak` vào thư mục `Mods` của server VU
2. Trong file cấu hình server, bật mod:
   ```
   vars.modList KillStreak
   ```
3. Client kết nối vào sẽ tự tải `ui.vuic` về máy

> File `ui.vuic` bao gồm toàn bộ WebUI (HTML/CSS/JS + sounds `.webm`). Giữ kích thước mỗi file `.webm` dưới **500 KB** để giảm thời gian load.

---

## Khắc phục sự cố

### Âm thanh không phát

| Nguyên nhân | Giải pháp |
|-------------|-----------|
| File không phải `.webm` | Convert bằng FFmpeg: `ffmpeg -i input.wav -c:a libvorbis -b:a 128k output.webm` |
| File `.webm` chưa có trong `ui.vuic` | Rebuild: `vuicc.exe WebUI ui.vuic` |
| Tên file không khớp `_soundIds` | Kiểm tra mapping trong `script.js` |
| `<video>` element thiếu trong HTML | Kiểm tra `index.html` |

### HUD không hiển thị / element bị ẩn

| Nguyên nhân | Giải pháp |
|-------------|-----------|
| Dùng `display: inline` / `inline-block` | Đổi sang `display: block` hoặc `flex` |
| Dùng `<span>` không có CSS | Đổi sang `<div>` hoặc thêm `display: block` vào CSS |
| Emoji Unicode không có trong font | Thay bằng ký tự ASCII hoặc text thường |
| `ui.vuic` chưa rebuild | Chạy lại `vuicc.exe WebUI ui.vuic` |

### Streak không reset khi chết

- Kiểm tra server có load mod không — xem log có dòng `[KillStreak][SERVER]` không
- Kiểm tra event `Player:Killed` có fire không

### Debug WebUI

Khởi động VU client với flag `-dwebui`, sau đó mở Chrome tại `http://localhost:8884` để dùng DevTools.

---

## Changelog

### v1.6.0 (2026-05-25)
- **Xóa Victim Badge** — bỏ tính năng hiển thị tên người bị kill
- **Streak Ended Sound**: bị kill bởi player → phát `shut_down.webm`; chết bởi env/bot → phát `dead.webm`
- **Server Announce** chuyển lên `top: 6%` (đầu màn hình)
- **Server Announce** clear toàn bộ HUD events đang hiển thị khi trigger
- Convert `shut-down.mp3` và `dead.mp3` → `.webm`

### v1.5.0 (2026-05-25)
- **Victim Badge**: Hiển thị tên người bị kill dạng "ELIMINATED [PlayerName]"
- **Killer Name in Streak Ended**: Thông báo "Streak ended by [PlayerName]" thay vì chỉ số lượng kill
- **Server Announce Sound**: Phát `unstoppable.webm` khi nhận server announcement (streak 10+ của người khác)
- Gửi `victimName` và `killerName` qua NetEvents
- Thêm config option `serverAnnounceSound` (mặc định: "unstoppable")
- Convert `unstoppable.mp3` → `unstoppable.webm` từ sounds_src
- Cập nhật client listeners để nhận expanded event payloads

### v1.4.0 (2026-05-25)
- Fix **display bug**: tất cả `<span>` chuyển sang `<div>` + `display: flex/block` — Gameface không hỗ trợ `display: inline`
- Fix **normal kill sound không nghe được** khi có multi-kill/first blood/revenge cùng lúc:
  - Multi-kill và Revenge dùng `requestSoundDelayed(300ms)` thay vì phát ngay
  - First Blood clear sound queue trước khi phát để override hoàn toàn
- Thêm hàm `clearSoundQueue()` vào JS

### v1.3.0 (2026-05-25)
- Thêm **Revenge Kill** — badge + âm thanh khi giết người vừa giết mình
- Thêm **Server Announce** — broadcast tên player lên toàn server khi đạt streak important
- Thêm âm thanh `revenge_kill.webm`

### v1.2.0 (2026-05-25)
- Thêm **First Blood** — badge đỏ lớn + âm thanh cho kill đầu tiên mỗi round
- Thêm **Kill Streak Progress** — hiển thị "X kills → [mốc tiếp theo]" dưới kill counter
- Thêm âm thanh `first_blood.webm`

### v1.1.0 (2026-05-25)
- Thêm **Multi-Kill system**: Double / Triple / Quad Kill / Rampage (window 4 giây)
- Thêm **Headshot Badge** — badge nhỏ hiện mỗi khi có headshot kill
- Chuyển toàn bộ audio sang `.webm` + `<video>` element (Gameface không hỗ trợ `<audio>`)
- Thêm Sound Queue Pattern: Lua gọi `requestSound()` → JS `setInterval` drain queue → `video.play()` (fix Gameface block media API từ injected context)
- Tất cả text HUD chuyển lên `top: 6–22%` (trước ở giữa màn hình)
- File nguồn `.wav`/`.mp3` chuyển vào `sounds_src/`, chỉ `.webm` trong `WebUI/sounds/`

### v1.0.0 (2026-05-20)
- Phát hành lần đầu
- Kill Streak 5 mốc (3/5/7/10/15)
- Headshot Streak (2/3/5 liên tiếp)
- Kill Counter HUD
- Streak message + Streak Ended animation

---

## Giấy phép

MIT License — tự do sử dụng, chỉnh sửa và phân phối với điều kiện giữ nguyên thông tin tác giả.

---

## Liên hệ & đóng góp

- Báo lỗi: mở **Issue** trên GitHub
- Đóng góp: fork repo và tạo **Pull Request**
- Tài liệu VU: [docs.veniceunleashed.net](https://docs.veniceunleashed.net)
- Cộng đồng VU: [Discord Venice Unleashed](https://discord.gg/venice-unleashed)
