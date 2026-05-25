// ============================================================
// script.js — Xử lý âm thanh và hiển thị HUD
// Audio: dùng <video> với file .webm (Gameface không hỗ trợ <audio> hay AudioContext)
// ============================================================

console.log('[KillStreak][WebUI] script.js loaded');

// Startup test: ô màu xanh "JS:OK" góc dưới trái → JS chạy được
(function() {
    try {
        var jsTest = document.createElement('div');
        jsTest.id = 'js-test-marker';
        jsTest.textContent = 'JS:OK';
        jsTest.style.cssText = 'position:fixed; bottom:10px; left:10px; ' +
            'background:#00aa00; color:#ffffff; font-size:28px; ' +
            'padding:8px 16px; z-index:9999; font-family:Arial,sans-serif;';
        document.body.appendChild(jsTest);
        console.log('[KillStreak][WebUI] JS:OK marker appended');
    } catch (e) {
        console.error('[KillStreak][WebUI] JS startup test threw:', e);
    }
}());

// Thời gian tự động ẩn thông báo (ms)
var STREAK_DISPLAY_MS = 3000;
var ENDED_DISPLAY_MS  = 2000;
var COUNTER_HIDE_MS   = 5000;

var streakTimer   = null;
var endedTimer    = null;
var counterTimer  = null;
var headshotTimer = null;

// ----------------------------------------
// Diagnostic log — stacked, giữ 8 dòng gần nhất
// ----------------------------------------
var _diagLogLines = [];
function showSoundMarker(text, color) {
    try {
        _diagLogLines.push({ text: text, color: color || '#444444' });
        if (_diagLogLines.length > 8) _diagLogLines.shift();
        var container = document.getElementById('snd-test-marker');
        if (!container) {
            container = document.createElement('div');
            container.id = 'snd-test-marker';
            container.style.cssText = 'position:fixed; bottom:60px; right:10px; ' +
                'z-index:9999; font-family:Arial,sans-serif; ' +
                'display:flex; flex-direction:column; gap:2px; align-items:flex-end;';
            document.body.appendChild(container);
        }
        container.innerHTML = '';
        for (var i = 0; i < _diagLogLines.length; i++) {
            var line = _diagLogLines[i];
            var lineEl = document.createElement('div');
            lineEl.textContent = line.text;
            lineEl.style.cssText = 'background:' + line.color + '; color:#ffffff; ' +
                'font-size:14px; padding:4px 10px;';
            container.appendChild(lineEl);
        }
    } catch (e) {}
}

// ----------------------------------------
// Marker được gọi từ client Lua qua WebUI:ExecuteJS
// Ô màu vàng "LUA:OK" góc trên phải → client Lua chạy được
// ----------------------------------------
function showLuaMarker(label) {
    try {
        var existing = document.getElementById('lua-test-marker');
        if (existing) existing.parentNode.removeChild(existing);
        var luaTest = document.createElement('div');
        luaTest.id = 'lua-test-marker';
        luaTest.textContent = label || 'LUA:OK';
        luaTest.style.cssText = 'position:fixed; top:10px; right:10px; ' +
            'background:#ffcc00; color:#000000; font-size:28px; ' +
            'padding:8px 16px; z-index:9999; font-family:Arial,sans-serif;';
        document.body.appendChild(luaTest);
        console.log('[KillStreak][WebUI] LUA marker shown:', label);
    } catch (e) {
        console.error('[KillStreak][WebUI] showLuaMarker threw:', e);
    }
}

// ----------------------------------------
// Đếm số NetEvent nhận được — ô tím góc dưới phải
// ----------------------------------------
var _netEventCount = 0;
function showNetEventMarker(label, info) {
    try {
        _netEventCount++;
        var existing = document.getElementById('net-test-marker');
        if (existing) existing.parentNode.removeChild(existing);
        var marker = document.createElement('div');
        marker.id = 'net-test-marker';
        marker.textContent = 'NET#' + _netEventCount + ' ' + (label || '') + ' ' + (info || '');
        marker.style.cssText = 'position:fixed; bottom:10px; right:10px; ' +
            'background:#aa00cc; color:#ffffff; font-size:24px; ' +
            'padding:8px 16px; z-index:9999; font-family:Arial,sans-serif;';
        document.body.appendChild(marker);
        console.log('[KillStreak][WebUI] NetEvent marker:', label, info);
    } catch (e) {
        console.error('[KillStreak][WebUI] showNetEventMarker threw:', e);
    }
}

// ============================================================
// Audio — dùng <video> element với file .webm
// Theo tài liệu VU: https://docs.veniceunleashed.net/modding/gameface-migration/
// Gameface KHÔNG hỗ trợ <audio> hay AudioContext — chỉ hỗ trợ <video> + WebM
// ============================================================

// Map tên sound → id của <video> element trong HTML
var _soundIds = {
    'kill_normal':     'snd-kill_normal',
    'kill_headshot':   'snd-kill_headshot',
    'headshot_double': 'snd-headshot_double',
    'headshot_triple': 'snd-headshot_triple',
    'headshot_multi':  'snd-headshot_multi',
    'streak_3':        'snd-streak_3',
    'streak_5':        'snd-streak_5',
    'streak_7':        'snd-streak_7',
    'streak_10':       'snd-streak_10',
    'streak_15':       'snd-streak_15',
};

// Kiểm tra video elements load được không khi startup
(function checkVideoElements() {
    var ok = 0;
    var fail = 0;
    for (var name in _soundIds) {
        if (!_soundIds.hasOwnProperty(name)) continue;
        var el = document.getElementById(_soundIds[name]);
        if (el) {
            ok++;
        } else {
            fail++;
            console.error('[KillStreak][WebUI] Missing video element for:', name);
        }
    }
    console.log('[KillStreak][WebUI] Video elements: ok=' + ok + ' fail=' + fail);
    showSoundMarker('VIDEO elements: ' + ok + ' ok, ' + fail + ' fail',
        fail === 0 ? '#008800' : '#cc0000');
}());

// Tự động test phát âm thanh sau 2s (đủ thời gian preload)
setTimeout(function() {
    console.log('[KillStreak][WebUI] Auto sound test: playing kill_normal');
    playKillSound('kill_normal');
}, 2000);

// ============================================================
// Auto test toàn bộ sound sau 2 phút vào game
// Phát tuần tự 10 sound, mỗi cái cách nhau 3 giây
// ============================================================
(function scheduleFullSoundTest() {
    var _allSounds = [
        'kill_normal',
        'kill_headshot',
        'headshot_double',
        'headshot_triple',
        'headshot_multi',
        'streak_3',
        'streak_5',
        'streak_7',
        'streak_10',
        'streak_15'
    ];
    var INTERVAL_MS = 3000;   // 3 giây giữa mỗi sound
    var START_DELAY  = 120000; // 2 phút (120 000ms)

    setTimeout(function() {
        console.log('[KillStreak][WebUI] === FULL SOUND TEST START ===');
        showSoundMarker('=== SOUND TEST START ===', '#0055aa');

        for (var i = 0; i < _allSounds.length; i++) {
            (function(idx, name) {
                setTimeout(function() {
                    console.log('[KillStreak][WebUI] SoundTest [' + (idx + 1) + '/' + _allSounds.length + ']: ' + name);
                    showSoundMarker('TEST [' + (idx + 1) + '/' + _allSounds.length + '] ' + name, '#0055aa');
                    playKillSound(name);
                }, idx * INTERVAL_MS);
            })(i, _allSounds[i]);
        }

        // Thông báo kết thúc
        setTimeout(function() {
            console.log('[KillStreak][WebUI] === FULL SOUND TEST DONE ===');
            showSoundMarker('=== SOUND TEST DONE ===', '#005500');
        }, _allSounds.length * INTERVAL_MS);

    }, START_DELAY);
}());

// Kill categories — dừng âm thanh cũ trước khi phát mới
var _killCategories = ['kill_normal', 'kill_headshot', 'headshot_double', 'headshot_triple', 'headshot_multi'];

function stopCurrentKillSound() {
    _killCategories.forEach(function(name) {
        var id = _soundIds[name];
        if (!id) return;
        var vid = document.getElementById(id);
        if (!vid) return;
        try {
            vid.pause();
            vid.currentTime = 0;
        } catch (e) {}
    });
}

function playKillSound(soundName) {
    console.log('[KillStreak][WebUI] playKillSound:', soundName);

    var id = _soundIds[soundName];
    if (!id) {
        showSoundMarker('SND-UNKNOWN ' + soundName, '#cc0000');
        return;
    }

    var vid = document.getElementById(id);
    if (!vid) {
        showSoundMarker('SND-NOEL ' + soundName, '#cc0000');
        return;
    }

    // Nếu là kill sound, dừng kill sound đang phát trước
    if (_killCategories.indexOf(soundName) !== -1) {
        stopCurrentKillSound();
    }

    try {
        vid.currentTime = 0;
        var result = vid.play();
        // play() trả về Promise trong một số engine
        if (result && typeof result.then === 'function') {
            result.then(function() {
                console.log('[KillStreak][WebUI] Playing:', soundName);
                showSoundMarker('SND-PLAY ' + soundName, '#008800');
            }).catch(function(e) {
                console.error('[KillStreak][WebUI] play() rejected:', soundName, e);
                showSoundMarker('SND-ERR ' + soundName + ': ' + (e.message || e), '#cc0000');
            });
        } else {
            showSoundMarker('SND-PLAY ' + soundName, '#008800');
        }
    } catch (e) {
        console.error('[KillStreak][WebUI] playKillSound threw:', e);
        showSoundMarker('SND-THROW ' + soundName + ': ' + e.message, '#cc0000');
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
    var el      = document.getElementById('streak-message');
    var nameEl  = document.getElementById('streak-name');
    var killsEl = document.getElementById('streak-kills');

    nameEl.textContent  = streakName;
    killsEl.textContent = kills + ' KILLS';

    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = '';

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
