// ============================================================
// script.js — Xử lý âm thanh và hiển thị HUD
// ============================================================

console.log('[KillStreak][WebUI] script.js loaded');

// Startup test: TẠO MỚI một div hoàn toàn bằng JS với inline style,
// KHÔNG phụ thuộc class CSS hay element có sẵn.
// Nếu thấy ô màu xanh "JS:OK" góc dưới trái → JS chạy được.
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

// Auto-play kill_normal khi audio đã load xong để test
var _autoTestDone = false;
var _autoTestInterval = setInterval(function() {
    if (_autoTestDone) {
        clearInterval(_autoTestInterval);
        return;
    }
    // Đợi kill_normal load xong hoặc tổng cộng đã quá 8s
    if (_audioBuffers['kill_normal'] || _loadResults.total >= 10 && _loadResults.fail + _loadResults.ok >= _loadResults.total) {
        _autoTestDone = true;
        clearInterval(_autoTestInterval);
        console.log('[KillStreak][WebUI] Auto sound test starting...');
        try {
            playKillSound('kill_normal');
        } catch (e) {
            console.error('[KillStreak][WebUI] Auto sound test threw:', e);
        }
    }
}, 500);
setTimeout(function() {
    if (!_autoTestDone) {
        _autoTestDone = true;
        clearInterval(_autoTestInterval);
        console.log('[KillStreak][WebUI] Auto sound test timeout fallback');
        try { playKillSound('kill_normal'); } catch (e) {}
    }
}, 10000);

// ----------------------------------------
// Marker được gọi từ client Lua qua WebUI:ExecuteJS
// Nếu thấy ô màu vàng "LUA:OK" góc trên phải → client Lua chạy được
// Nếu KHÔNG thấy ô vàng → client __init__.lua không load
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
// label: "KILL" hoặc "RESET"
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

// Thời gian tự động ẩn thông báo (ms)
var STREAK_DISPLAY_MS = 3000;
var ENDED_DISPLAY_MS  = 2000;
var COUNTER_HIDE_MS   = 5000;

var streakTimer   = null;
var endedTimer    = null;
var counterTimer  = null;
var headshotTimer = null;

// Diagnostic log — stacked, giữ 8 dòng gần nhất (không ghi đè)
var _diagLogLines = [];
function showSoundMarker(text, color) {
    try {
        _diagLogLines.push({ text: text, color: color || '#444444' });
        if (_diagLogLines.length > 8) {
            _diagLogLines.shift();
        }
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

// ============================================================
// Web Audio API — fallback khi HTMLMediaElement (<video>/<audio>) không
// thực sự xuất audio trong Gameface
// ============================================================
var _audioCtx = null;
var _audioBuffers = {};   // name -> AudioBuffer
var _audioCtxState = 'init';

(function initAudioCtx() {
    // Probe các audio + vendor API có sẵn trong Gameface
    var apis = [
        'AudioContext', 'webkitAudioContext', 'OfflineAudioContext',
        'HTMLAudioElement', 'Audio',
        'cohtml', 'engine', 'gameface', 'frostbite'
    ];
    for (var i = 0; i < apis.length; i++) {
        var k = apis[i];
        var t = typeof window[k];
        if (t !== 'undefined') {
            showSoundMarker('API ' + k + '=' + t, '#666666');
        }
    }

    try {
        var Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) {
            _audioCtxState = 'no-ctor';
            showSoundMarker('AUDIO: no AudioContext', '#cc0000');
            console.error('[KillStreak][WebUI] AudioContext not available');
            return;
        }
        _audioCtx = new Ctor();
        _audioCtxState = _audioCtx.state || 'unknown';
        console.log('[KillStreak][WebUI] AudioContext created, state=' + _audioCtxState);
        showSoundMarker('AUDIO ctx=' + _audioCtxState, '#0066aa');
    } catch (e) {
        _audioCtxState = 'throw';
        console.error('[KillStreak][WebUI] AudioContext init failed:', e);
        showSoundMarker('AUDIO init throw: ' + e.message, '#cc0000');
    }
}());

var _soundFiles = {
    'kill_normal':     'sounds/kill_normal.wav',
    'kill_headshot':   'sounds/kill_headshot.wav',
    'headshot_double': 'sounds/headshot_double.wav',
    'headshot_triple': 'sounds/headshot_triple.wav',
    'headshot_multi':  'sounds/headshot_multi.wav',
    'streak_3':        'sounds/streak_3.wav',
    'streak_5':        'sounds/streak_5.wav',
    'streak_7':        'sounds/streak_7.wav',
    'streak_10':       'sounds/streak_10.wav',
    'streak_15':       'sounds/streak_15.wav',
};

var _loadResults = { ok: 0, fail: 0, total: 0 };

function _loadOneSound(name, url) {
    _loadResults.total++;
    if (!_audioCtx) {
        _loadResults.fail++;
        return;
    }
    try {
        fetch(url)
            .then(function(r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.arrayBuffer();
            })
            .then(function(ab) {
                return new Promise(function(resolve, reject) {
                    // decodeAudioData hỗ trợ cả callback style và Promise style
                    var decoded = _audioCtx.decodeAudioData(ab, resolve, reject);
                    if (decoded && typeof decoded.then === 'function') {
                        decoded.then(resolve, reject);
                    }
                });
            })
            .then(function(buf) {
                _audioBuffers[name] = buf;
                _loadResults.ok++;
                console.log('[KillStreak][WebUI] Loaded:', name, 'dur=' + buf.duration.toFixed(2) + 's');
                showSoundMarker('AUDIO loaded ' + _loadResults.ok + '/' + _loadResults.total, '#008800');
            })
            .catch(function(e) {
                _loadResults.fail++;
                console.error('[KillStreak][WebUI] Load failed:', name, e);
                showSoundMarker('AUDIO load FAIL ' + name + ': ' + (e.message || e), '#cc0000');
            });
    } catch (e) {
        _loadResults.fail++;
        console.error('[KillStreak][WebUI] _loadOneSound threw:', e);
    }
}

// Load tất cả sound files khi WebUI startup
(function loadAllSounds() {
    if (!_audioCtx) return;
    for (var name in _soundFiles) {
        if (_soundFiles.hasOwnProperty(name)) {
            _loadOneSound(name, _soundFiles[name]);
        }
    }
}());

// Track AudioBufferSourceNode đang play cho từng "kill-category" sound
// để stopCurrentKillSound() có thể dừng được
var _currentKillSources = {};

function stopCurrentKillSound() {
    var killNames = ['kill_normal', 'kill_headshot',
        'headshot_double', 'headshot_triple', 'headshot_multi'];
    killNames.forEach(function(n) {
        var src = _currentKillSources[n];
        if (src) {
            try { src.stop(0); } catch (e) {}
            _currentKillSources[n] = null;
        }
    });
}

function playKillSound(soundName) {
    console.log('[KillStreak][WebUI] playKillSound:', soundName);

    if (!_audioCtx) {
        showSoundMarker('SND-NOCTX ' + soundName, '#cc0000');
        return;
    }

    var buf = _audioBuffers[soundName];
    if (!buf) {
        console.warn('[KillStreak][WebUI] Buffer not loaded:', soundName,
            '(ok=' + _loadResults.ok + ' fail=' + _loadResults.fail +
            ' total=' + _loadResults.total + ')');
        showSoundMarker('SND-NOBUF ' + soundName, '#cc6600');
        return;
    }

    // Resume AudioContext nếu bị suspend (autoplay policy)
    if (_audioCtx.state === 'suspended') {
        try { _audioCtx.resume(); } catch (e) {}
    }

    try {
        var src = _audioCtx.createBufferSource();
        src.buffer = buf;
        var gain = _audioCtx.createGain();
        gain.gain.value = 1.0;
        src.connect(gain);
        gain.connect(_audioCtx.destination);

        // Track source for stop
        var killCategories = ['kill_normal', 'kill_headshot',
            'headshot_double', 'headshot_triple', 'headshot_multi'];
        if (killCategories.indexOf(soundName) !== -1) {
            _currentKillSources[soundName] = src;
        }

        src.start(0);
        console.log('[KillStreak][WebUI] Playing via WebAudio:', soundName);
        showSoundMarker('SND-PLAY ' + soundName + ' state=' + _audioCtx.state, '#008800');
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
