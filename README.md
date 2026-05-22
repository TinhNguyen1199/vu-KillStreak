# KillStreak Mod — Battlefield 3 (Venice Unleashed)

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

- **Âm thanh kill thường** — phát khi hạ gục địch bằng đạn thường
- **Âm thanh headshot** — phát riêng khi bắn headshot
- **Hệ thống Kill Streak** — theo dõi số kill liên tiếp, tự động reset khi chết
- **Thông báo HUD** — hiển thị tên streak lớn ở giữa màn hình với hiệu ứng animation
- **Bộ đếm kill** — hiển thị số kill streak hiện tại góc trên phải
- **Thông báo kết thúc streak** — khi bạn chết, HUD hiển thị streak đã đạt được
- **Âm thanh streak riêng** — mỗi mốc streak có file âm thanh riêng
- **Ưu tiên streak quan trọng** — mốc 10 và 15 kills bỏ qua headshot sound, phát streak sound ngay lập tức để không bị át
- **Hệ thống Headshot liên tiếp** — theo dõi headshot liên tiếp, hiển thị thông báo DOUBLE / TRIPLE / MULTI HEADSHOT khi đạt mốc
- **Chống chồng âm** — tự động dừng âm thanh kill cũ trước khi phát âm thanh mới
- **Hoàn toàn tùy chỉnh** — chỉnh màu, font, vị trí HUD và các mốc streak qua config

### Các mốc Kill Streak mặc định

| Số Kill Liên Tiếp | Tên Hiển Thị  | Ưu tiên cao |
|:-----------------:|:-------------:|:-----------:|
| 3                 | KILLING SPREE |             |
| 5                 | RAMPAGE       |             |
| 7                 | DOMINATING    |             |
| 10                | UNSTOPPABLE   | Có          |
| 15                | GODLIKE       | Có          |

### Các mốc Headshot liên tiếp mặc định

| Headshot Liên Tiếp | Tên Hiển Thị    |
|:------------------:|:---------------:|
| 2                  | DOUBLE HEADSHOT |
| 3                  | TRIPLE HEADSHOT |
| 5                  | MULTI HEADSHOT  |

> Chuỗi headshot liên tiếp **reset về 0** ngay khi có một kill không phải headshot, hoặc khi người chơi chết.

---

## Yêu cầu hệ thống

| Thành phần | Yêu cầu |
|------------|---------|
| Game | Battlefield 3 (bản gốc, mua qua Origin / EA App) |
| Nền tảng mod | [Venice Unleashed](https://veniceunleashed.net) (VU) |
| Hệ điều hành | Windows 10 / 11 64-bit |
| RAM | Tối thiểu 8 GB (khuyến nghị 16 GB) |
| File âm thanh | Định dạng `.wav` (PCM, 16-bit, 44100 Hz hoặc 48000 Hz) |

> **Lưu ý:** Mod này chạy phía **client** (WebUI + âm thanh) và **server** (theo dõi kill). Cần cài trên cả server lẫn client để hoạt động đầy đủ.

---

## Cài đặt

### Bước 1 — Cài Venice Unleashed

1. Truy cập [veniceunleashed.net](https://veniceunleashed.net) và tải VU Launcher về
2. Đăng nhập bằng tài khoản EA của bạn
3. Cài đặt VU theo hướng dẫn trên trang chủ
4. Chạy thử VU một lần để nó tạo thư mục cần thiết

### Bước 2 — Tải mod

**Cách A — Tải từ GitHub:**
```
git clone https://github.com/your-username/bf3-killstreak-mod.git
```

**Cách B — Tải ZIP:**
- Nhấn nút **Code → Download ZIP** trên trang GitHub
- Giải nén file ZIP ra

### Bước 3 — Copy mod vào thư mục VU

Copy toàn bộ thư mục mod vào đúng vị trí:

```
%USERPROFILE%\Documents\Mods\KillStreak\
```

Sau khi copy, cấu trúc phải trông như sau:

```
Documents\
└── Mods\
    └── KillStreak\
        ├── mod.json
        ├── ext\
        │   ├── Server\
        │   ├── Client\
        │   └── Shared\
        └── WebUI\
            ├── index.html
            ├── style.css
            ├── script.js
            └── sounds\
```

### Bước 4 — Thêm file âm thanh

Đặt các file `.wav` vào thư mục `WebUI\sounds\` (xem chi tiết tại phần [Thêm âm thanh tùy chỉnh](#thêm-âm-thanh-tùy-chỉnh)).

### Bước 5 — Bật mod trong VU Launcher

1. Mở **VU Launcher**
2. Vào tab **Mods**
3. Tìm **KillStreak** trong danh sách
4. Bật toggle để kích hoạt
5. Khởi động game

---

## Cấu trúc thư mục

```
KillStreak/
│
├── mod.json                    ← Metadata của mod (tên, version, mô tả)
│
├── ext/
│   ├── Server/
│   │   └── __init__.lua        ← Server: theo dõi kill, tính streak, gửi event
│   │
│   ├── Client/
│   │   └── __init__.lua        ← Client: nhận event, phát âm thanh, cập nhật HUD
│   │
│   └── Shared/
│       └── config.lua          ← Cấu hình chung (mốc streak, tên âm thanh)
│
└── WebUI/
    ├── index.html              ← Giao diện HUD (HTML)
    ├── style.css               ← Thiết kế HUD (màu sắc, animation, vị trí)
    ├── script.js               ← Logic âm thanh và hiển thị thông báo
    └── sounds/                 ← Thư mục chứa file âm thanh
        ├── kill_normal.wav     ← Âm thanh kill thường
        ├── kill_headshot.wav   ← Âm thanh headshot
        ├── headshot_double.wav ← Âm thanh DOUBLE HEADSHOT (2 liên tiếp)
        ├── headshot_triple.wav ← Âm thanh TRIPLE HEADSHOT (3 liên tiếp)
        ├── headshot_multi.wav  ← Âm thanh MULTI HEADSHOT  (5 liên tiếp)
        ├── streak_3.wav        ← Âm thanh KILLING SPREE
        ├── streak_5.wav        ← Âm thanh RAMPAGE
        ├── streak_7.wav        ← Âm thanh DOMINATING
        ├── streak_10.wav       ← Âm thanh UNSTOPPABLE
        └── streak_15.wav       ← Âm thanh GODLIKE
```

---

## Thêm âm thanh tùy chỉnh

### Định dạng hỗ trợ

Venice Unleashed WebUI chạy trên Chromium, hỗ trợ các định dạng:

| Định dạng | Khuyến nghị | Ghi chú |
|-----------|:-----------:|---------|
| `.wav`    | Có          | PCM 16-bit, 44100 Hz hoặc 48000 Hz |
| `.mp3`    | Có          | Bitrate 128–320 kbps |
| `.ogg`    | Có          | Chất lượng tốt, file nhỏ |

> Khuyến nghị dùng `.wav` để tránh độ trễ khi phát.

### Tên file bắt buộc

| Tên file               | Khi nào phát |
|------------------------|-------------|
| `kill_normal.wav`      | Mỗi lần kill thường |
| `kill_headshot.wav`    | Headshot đơn lẻ (hoặc mốc headshot liên tiếp chưa đạt) |
| `headshot_double.wav`  | Headshot lần 2 liên tiếp |
| `headshot_triple.wav`  | Headshot lần 3 liên tiếp |
| `headshot_multi.wav`   | Headshot lần 5 liên tiếp |
| `streak_3.wav`         | Đạt 3 kills liên tiếp |
| `streak_5.wav`         | Đạt 5 kills liên tiếp |
| `streak_7.wav`         | Đạt 7 kills liên tiếp |
| `streak_10.wav`        | Đạt 10 kills liên tiếp (ưu tiên cao — át headshot sound) |
| `streak_15.wav`        | Đạt 15 kills liên tiếp (ưu tiên cao — át headshot sound) |

### Nguồn âm thanh miễn phí

Bạn có thể tải âm thanh từ các trang sau (miễn phí, không bản quyền):

- [freesound.org](https://freesound.org) — kho âm thanh cộng đồng lớn nhất
- [zapsplat.com](https://zapsplat.com) — âm thanh game chuyên nghiệp
- [soundbible.com](https://soundbible.com) — đơn giản, dễ dùng

### Chuyển đổi định dạng

Nếu file của bạn không phải `.wav`, dùng **Audacity** (miễn phí) để chuyển đổi:
1. Mở Audacity → File → Import → Audio
2. Chọn file → File → Export → Export as WAV
3. Chọn **PCM 16-bit Signed** → Save

---

## Cấu hình mod

Mở file `ext\Shared\config.lua` để tùy chỉnh:

```lua
KillStreakConfig = {

    -- Danh sách mốc Kill Streak
    -- important = true: streak sound được ưu tiên hoàn toàn, bỏ qua headshot sound
    streaks = {
        { kills = 3,  name = "KILLING SPREE",  sound = "streak_3"  },
        { kills = 5,  name = "RAMPAGE",         sound = "streak_5"  },
        { kills = 7,  name = "DOMINATING",      sound = "streak_7"  },
        { kills = 10, name = "UNSTOPPABLE",     sound = "streak_10", important = true },
        { kills = 15, name = "GODLIKE",         sound = "streak_15", important = true },
    },

    -- Danh sách mốc Headshot liên tiếp
    -- Chuỗi reset về 0 nếu kill không phải headshot, hoặc khi chết
    headshotStreaks = {
        { count = 2, name = "DOUBLE HEADSHOT", sound = "headshot_double" },
        { count = 3, name = "TRIPLE HEADSHOT", sound = "headshot_triple" },
        { count = 5, name = "MULTI HEADSHOT",  sound = "headshot_multi"  },
    },

    -- Tên file âm thanh (không cần đuôi .wav)
    killSound      = "kill_normal",
    headshotSound  = "kill_headshot",

    -- Thời gian hiển thị thông báo streak (giây)
    displayDuration = 3.0,
}
```

### Ví dụ tùy chỉnh

**Thêm mốc Kill Streak mới (20 kills):**
```lua
{ kills = 20, name = "BEYOND GODLIKE", sound = "streak_20", important = true },
```
Sau đó thêm file `WebUI\sounds\streak_20.wav`, thêm thẻ `<audio>` vào `WebUI\index.html`:
```html
<audio id="snd-streak-20" src="sounds/streak_20.wav" preload="auto"></audio>
```
Và thêm vào bảng `map` trong `WebUI\script.js`:
```js
'streak_20': 'snd-streak-20',
```

**Thêm mốc Headshot liên tiếp mới (4 lần):**
```lua
{ count = 4, name = "QUAD HEADSHOT", sound = "headshot_quad" },
```
Sau đó thêm file `WebUI\sounds\headshot_quad.wav`, thêm thẻ `<audio>` vào `WebUI\index.html`:
```html
<audio id="snd-headshot-quad" src="sounds/headshot_quad.wav" preload="auto"></audio>
```
Thêm vào `_killSoundIds` trong `WebUI\script.js` (để hàm `stopCurrentKillSound` có thể dừng nó):
```js
var _killSoundIds = [
    ...,
    'snd-headshot-quad',
];
```
Và thêm vào bảng `map`:
```js
'headshot_quad': 'snd-headshot-quad',
```

**Đổi tên hiển thị:**
```lua
{ kills = 5, name = "SIÊU NHÂN", sound = "streak_5" },
```

---

## Cách hoạt động

```
[Người chơi kill địch]
        │
        ▼
[Server: Player:Kill event]
  - Tăng kill counter
  - Kiểm tra kill streak mốc
  - Tăng/reset consecutive headshot counter
  - Kiểm tra headshot streak mốc
        │
        ▼
[Server → Client: NetEvents:SendTo]
  Gửi: (tổng kills, headshot?, killStreak?, consecutiveHeadshots, hsStreak?)
        │
        ▼
[Client: nhận event — ưu tiên âm thanh]
  1. important streak  → stop sound cũ, phát streak sound ngay
  2. headshot milestone → stop sound cũ, phát milestone sound ngay
  3. headshot thường   → stop sound cũ, phát headshot sound
  4. kill thường       → phát kill sound
  (streak không quan trọng: delay 0.3s rồi phát thêm streak sound)
        │
        ▼
[WebUI (JavaScript)]
  - stopCurrentKillSound() — dừng kill-category sound đang phát
  - Phát âm thanh .wav mới
  - Hiển thị thông báo kill streak (nếu có)
  - Hiển thị thông báo headshot milestone (nếu có)
  - Chạy animation

[Người chơi chết]
  → Server reset kill counter VÀ headshot counter về 0
  → Client ẩn counter, hiện "Streak Ended"
```

---

## Tùy chỉnh giao diện HUD

Mở file `WebUI\style.css` để chỉnh giao diện.

### Đổi màu chữ Kill Counter

```css
#kill-counter {
    color: #ff6600;  /* ← đổi màu tại đây, ví dụ: #00ff88 = xanh lá */
}
```

### Đổi vị trí Kill Counter

```css
#kill-counter {
    top: 20px;    /* khoảng cách từ trên */
    right: 20px;  /* khoảng cách từ phải */
    /* left: 20px; ← dùng nếu muốn đặt bên trái */
}
```

### Đổi kích thước chữ Streak

```css
#streak-name {
    font-size: 48px;  /* ← tăng/giảm tại đây */
}
```

### Đổi vị trí thông báo Streak

```css
#streak-message {
    top: 30%;  /* ← 30% từ trên màn hình, đổi thành 20% để lên cao hơn */
}
```

### Tùy chỉnh thông báo Headshot liên tiếp

Thông báo headshot hiển thị ở `top: 50%` (bên dưới streak message) với tông màu xanh cyan để phân biệt.

**Đổi màu chữ:**
```css
#headshot-name {
    text-shadow:
        0 0 10px #00ccff,   /* ← đổi màu glow */
        0 0 28px #0066ff,
        2px 2px 0 #000;
}

#headshot-count {
    color: #66eeff;  /* ← đổi màu số đếm */
}
```

**Đổi vị trí:**
```css
#headshot-message {
    top: 50%;  /* ← đổi để tránh chồng với streak message ở top: 30% */
}
```

**Đổi kích thước:**
```css
#headshot-name {
    font-size: 36px;  /* ← nhỏ hơn streak-name (48px) để phân cấp rõ */
}
```

---

## Chạy trên server

Để mod hoạt động trên server công cộng:

1. Copy thư mục `KillStreak` vào thư mục `Mods` của server VU
2. Trong file cấu hình server (`startup.txt` hoặc RCON), bật mod:
   ```
   vars.modList KillStreak
   ```
3. Người chơi kết nối vào server sẽ tự động tải phần WebUI về máy

> **Lưu ý:** File âm thanh (`.wav`) được tải từ server về máy client khi kết nối. Kích thước file âm thanh nên giữ dưới **500 KB** mỗi file để giảm thời gian tải.

---

## Khắc phục sự cố

### Âm thanh không phát

| Nguyên nhân | Giải pháp |
|-------------|-----------|
| File `.wav` đặt sai thư mục | Kiểm tra lại `WebUI\sounds\` |
| Tên file không khớp | Đảm bảo tên đúng như bảng ở trên |
| Định dạng file không hỗ trợ | Chuyển sang PCM 16-bit WAV bằng Audacity |
| WebUI bị tắt trong VU | Vào VU settings, bật WebUI |

### HUD không hiển thị

| Nguyên nhân | Giải pháp |
|-------------|-----------|
| Mod chưa được bật | Kiểm tra tab Mods trong VU Launcher |
| Lỗi JavaScript | Mở VU console (phím `~`), tìm dòng lỗi màu đỏ |
| File `index.html` thiếu | Kiểm tra thư mục `WebUI\` |

### Streak không reset khi chết

- Kiểm tra kết nối đến server (mod cần server-side script chạy)
- Xem log server VU có dòng `[KillStreak]` không — nếu không có nghĩa server chưa load mod

### Xem log để debug

Trong VU console (phím `~`):
```
-- Xem log server
rcon.say "log"
```

Log server sẽ in các dòng như:
```
[KillStreak] PlayerName kills: 1 | hs streak: 1
[KillStreak] PlayerName kills: 2 | hs streak: 2
[KillStreak] PlayerName kills: 3 | hs streak: 0
[KillStreak] PlayerName died. Streak reset from 3
```

Cột `hs streak` cho thấy chuỗi headshot liên tiếp hiện tại. Giá trị `0` nghĩa là kill vừa rồi không phải headshot và chuỗi đã bị reset.

---

## Changelog

### v1.1.0 (2026-05-21)
- Thêm hệ thống **Headshot liên tiếp**: theo dõi chuỗi headshot, thông báo DOUBLE / TRIPLE / MULTI HEADSHOT
- Thêm **ưu tiên streak quan trọng**: mốc 10 và 15 kills bỏ qua headshot sound, phát streak sound ngay
- Thêm **chống chồng âm**: `stopCurrentKillSound()` dừng kill-category sound cũ trước khi phát sound mới
- Thêm CSS và DOM element riêng cho headshot milestone message (tông xanh cyan, vị trí `top: 50%`)
- Cần thêm 3 file âm thanh mới: `headshot_double.wav`, `headshot_triple.wav`, `headshot_multi.wav`

### v1.0.0 (2026-05-20)
- Phát hành lần đầu
- Hệ thống Kill Streak với 5 mốc (3 / 5 / 7 / 10 / 15 kills)
- Âm thanh kill thường và headshot
- HUD counter góc trên phải
- Thông báo streak lớn với animation
- Thông báo "Streak Ended" khi chết

---

## Giấy phép

Dự án này được phát hành theo giấy phép **MIT License** — bạn được tự do sử dụng, chỉnh sửa và phân phối lại với điều kiện giữ nguyên thông tin tác giả.

---

## Liên hệ & đóng góp

- Báo lỗi: mở **Issue** trên trang GitHub
- Đóng góp code: fork repo và tạo **Pull Request**
- Tài liệu Venice Unleashed: [docs.veniceunleashed.net](https://docs.veniceunleashed.net)
- Cộng đồng VU: [Discord Venice Unleashed](https://discord.gg/venice-unleashed)
