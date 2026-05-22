// ============================================================
// script.js — Xử lý âm thanh và hiển thị HUD
// ============================================================

console.log('[KillStreak][WebUI] script.js loaded');

// Startup test: hiển thị kill counter với "1" trong 2 giây để xác nhận WebUI hoạt động
window.addEventListener('load', function() {
    console.log('[KillStreak][WebUI] Window loaded — startup test');
    updateKillCounter(1);
    setTimeout(function() { updateKillCounter(0); }, 2000);
});

// Thời gian tự động ẩn thông báo (ms)
var STREAK_DISPLAY_MS = 3000;
var ENDED_DISPLAY_MS  = 2000;
var COUNTER_HIDE_MS   = 5000;

var streakTimer   = null;
var endedTimer    = null;
var counterTimer  = null;
var headshotTimer = null;

// ----------------------------------------
// Phát âm thanh theo tên
// soundName: kill_normal | kill_headshot | streak_3 | headshot_double | ...
// ----------------------------------------
var _killSoundIds = [
    'snd-kill-normal', 'snd-kill-headshot',
    'snd-headshot-double', 'snd-headshot-triple', 'snd-headshot-multi',
];

// Dừng tất cả kill-category sounds (không đụng tới streak sounds)
function stopCurrentKillSound() {
    _killSoundIds.forEach(function(id) {
        var el = document.getElementById(id);
        if (el && !el.paused) {
            el.pause();
            el.currentTime = 0;
        }
    });
}

function playKillSound(soundName) {
    console.log('[KillStreak][WebUI] playKillSound:', soundName);
    var map = {
        'kill_normal':      'snd-kill-normal',
        'kill_headshot':    'snd-kill-headshot',
        'headshot_double':  'snd-headshot-double',
        'headshot_triple':  'snd-headshot-triple',
        'headshot_multi':   'snd-headshot-multi',
        'streak_3':         'snd-streak-3',
        'streak_5':         'snd-streak-5',
        'streak_7':         'snd-streak-7',
        'streak_10':        'snd-streak-10',
        'streak_15':        'snd-streak-15',
    };

    var id = map[soundName];
    if (!id) {
        console.warn('[KillStreak][WebUI] Unknown sound name:', soundName);
        return;
    }

    var el = document.getElementById(id);
    if (!el) {
        console.error('[KillStreak][WebUI] Audio element not found for id:', id);
        return;
    }

    el.currentTime = 0;
    var playResult = el.play();
    // Gameface có thể không trả về Promise — kiểm tra trước khi gọi .then/.catch
    if (playResult && typeof playResult.then === 'function') {
        playResult
            .then(function() { console.log('[KillStreak][WebUI] Playing:', soundName); })
            .catch(function(e) { console.warn('[KillStreak][WebUI] Cannot play sound:', soundName, e); });
    }
}

// ----------------------------------------
// Cập nhật bộ đếm kill góc trên phải
// ----------------------------------------
function updateKillCounter(kills) {
    console.log('[KillStreak][WebUI] updateKillCounter:', kills);
    var counter = document.getElementById('kill-counter');
    var number  = document.getElementById('kill-number');

    number.textContent = kills;

    if (kills > 0) {
        counter.classList.remove('hidden');

        // Tự động ẩn sau 5s nếu không có kill mới
        clearTimeout(counterTimer);
        counterTimer = setTimeout(function() {
            counter.classList.add('hidden');
        }, COUNTER_HIDE_MS);
    } else {
        counter.classList.add('hidden');
    }
}

// ----------------------------------------
// Hiển thị thông báo streak lớn
// ----------------------------------------
function showStreakMessage(streakName, kills) {
    console.log('[KillStreak][WebUI] showStreakMessage:', streakName, kills);
    var el       = document.getElementById('streak-message');
    var nameEl   = document.getElementById('streak-name');
    var killsEl  = document.getElementById('streak-kills');

    nameEl.textContent  = streakName;
    killsEl.textContent = kills + ' KILLS';

    // Reset animation bằng cách clone node
    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = '';

    // Tự động ẩn sau STREAK_DISPLAY_MS
    clearTimeout(streakTimer);
    streakTimer = setTimeout(function() {
        el.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(function() {
            el.classList.add('hidden');
            el.style.animation = '';
        }, 500);
    }, STREAK_DISPLAY_MS);
}

// ----------------------------------------
// Hiển thị thông báo headshot liên tiếp
// ----------------------------------------
function showHeadshotMessage(name, count) {
    console.log('[KillStreak][WebUI] showHeadshotMessage:', name, count);
    var el      = document.getElementById('headshot-message');
    var nameEl  = document.getElementById('headshot-name');
    var countEl = document.getElementById('headshot-count');

    nameEl.textContent  = name;
    countEl.textContent = count + 'x';

    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';

    clearTimeout(headshotTimer);
    headshotTimer = setTimeout(function() {
        el.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(function() {
            el.classList.add('hidden');
            el.style.animation = '';
        }, 500);
    }, STREAK_DISPLAY_MS);
}

// ----------------------------------------
// Hiển thị thông báo streak kết thúc
// ----------------------------------------
function showStreakEnded(oldStreak) {
    console.log('[KillStreak][WebUI] showStreakEnded:', oldStreak);
    var el      = document.getElementById('streak-ended');
    var textEl  = document.getElementById('ended-text');
    var countEl = document.getElementById('ended-count');

    textEl.textContent  = 'Streak Ended';
    countEl.textContent = oldStreak + ' kill streak';

    el.classList.remove('hidden');

    clearTimeout(endedTimer);
    endedTimer = setTimeout(function() {
        el.classList.add('hidden');
    }, ENDED_DISPLAY_MS);
}
