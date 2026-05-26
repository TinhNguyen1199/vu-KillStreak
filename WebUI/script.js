// ============================================================
// script.js — Xử lý âm thanh và hiển thị HUD
// Audio: dùng <video> với file .webm (Gameface không hỗ trợ <audio> hay AudioContext)
// ============================================================

// console.log('[KillStreak][WebUI] script.js loaded');

/* DISABLED - JS:OK marker
(function() {
    try {
        var jsTest = document.createElement('div');
        jsTest.id = 'js-test-marker';
        jsTest.textContent = 'JS:OK';
        jsTest.style.cssText = 'position:fixed; bottom:10px; left:10px; ' +
            'background:#00aa00; color:#ffffff; font-size:28px; ' +
            'padding:8px 16px; z-index:9999; font-family:Arial,sans-serif;';
        document.body.appendChild(jsTest);
        // console.log('[KillStreak][WebUI] JS:OK marker appended');
    } catch (e) {
        // console.error('[KillStreak][WebUI] JS startup test threw:', e);
    }
}());
*/

// Thời gian tự động ẩn thông báo (ms)
var STREAK_DISPLAY_MS = 3000;
var ENDED_DISPLAY_MS  = 2000;
var COUNTER_HIDE_MS   = 5000;

var streakTimer   = null;
var endedTimer    = null;
var counterTimer  = null;
var headshotTimer = null;

// ----------------------------------------
// Diagnostic log — DISABLED (uncomment for testing)
// ----------------------------------------
var _diagLogLines = [];
function showSoundMarker(text, color) {
    /* DISABLED
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
    */
}

// ----------------------------------------
// Marker được gọi từ client Lua qua WebUI:ExecuteJS — DISABLED
// ----------------------------------------
function showLuaMarker(label) {
    /* DISABLED
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
        // console.log('[KillStreak][WebUI] LUA marker shown:', label);
    } catch (e) {
        // console.error('[KillStreak][WebUI] showLuaMarker threw:', e);
    }
    */
}

// ----------------------------------------
// Đếm số NetEvent nhận được — DISABLED (uncomment for testing)
// ----------------------------------------
var _netEventCount = 0;
function showNetEventMarker(label, info) {
    /* DISABLED
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
        // console.log('[KillStreak][WebUI] NetEvent marker:', label, info);
    } catch (e) {
        // console.error('[KillStreak][WebUI] showNetEventMarker threw:', e);
    }
    */
}

// ============================================================
// Audio — dùng <video> element tạo động (Gameface không hỗ trợ <audio> hay AudioContext)
// Mỗi lần play tạo <video> mới để tránh lỗi "không replay được" trên static elements
// ============================================================

// ============================================================
// Sound Queue — Lua không thể gọi video.play() trực tiếp qua ExecuteJS
// (Gameface block media call từ injected script context).
// Giải pháp: Lua gọi requestSound() để đẩy vào queue,
// setInterval bên dưới drain queue từ page-level JS context.
// ============================================================
var _soundQueue = [];
var _isPlaying = false;

function requestSound(name) {
    setTimeout(function() {
        _soundQueue.push({ name: name, delay: 0 });
    }, 0);
}

function clearSoundQueue() {
    _soundQueue = [];
}

function requestSoundDelayed(name, delayMs) {
    setTimeout(function() {
        _soundQueue.push({ name: name, delay: 0 });
    }, delayMs || 0);
}

setInterval(function() {
    if (_soundQueue.length === 0) return;
    if (_isPlaying) return;
    var item = _soundQueue.shift();
    playKillSound(item.name);
}, 50);

// ============================================================
// Priority Queue — dành riêng cho adrenaline, không bị block bởi âm thanh khác
// ============================================================
var _adrQueue = [];
var _adrPlaying = false;

function requestAdrenalineSound() {
    _adrQueue.push({ name: 'adrenaline' });
}

function clearAdrenalineQueue() {
    _adrQueue = [];
}

setInterval(function() {
    if (_adrQueue.length === 0 || _adrPlaying) return;
    _adrPlaying = true;
    var item = _adrQueue.shift();
    var vid = document.createElement('video');
    vid.src = 'sounds/' + item.name + '.webm';
    vid.preload = 'auto';
    vid.style.cssText = 'position:absolute; width:0; height:0; pointer-events:none;';
    document.body.appendChild(vid);
    vid.play();
    vid.addEventListener('ended', function() {
        _adrPlaying = false;
        if (document.body.contains(vid)) {
            document.body.removeChild(vid);
        }
    });
}, 50);

// Kill categories — dừng âm thanh cũ trước khi phát mới
var _killCategories = ['kill_normal', 'kill_headshot', 'headshot_double', 'headshot_triple', 'headshot_multi'];
var _currentKillVideo = null;

function stopCurrentKillSound() {
    _isPlaying = false;
    if (_currentKillVideo) {
        try {
            _currentKillVideo.pause();
            _currentKillVideo.src = '';
            if (document.body.contains(_currentKillVideo)) {
                document.body.removeChild(_currentKillVideo);
            }
        } catch (e) {}
        _currentKillVideo = null;
    }
}

function playKillSound(soundName) {
    // console.log('[KillStreak][WebUI] playKillSound:', soundName);

    // Nếu là kill sound, dừng kill sound đang phát trước
    if (_killCategories.indexOf(soundName) !== -1) {
        stopCurrentKillSound();
    }

    // Tạo <video> element động — mỗi lần play là element mới, tránh lỗi "không replay"
    var vid = document.createElement('video');
    vid.src = 'sounds/' + soundName + '.webm';
    vid.preload = 'auto';
    vid.style.cssText = 'position:absolute; width:0; height:0; pointer-events:none;';
    document.body.appendChild(vid);

    _isPlaying = true;

    // Track video hiện tại nếu là kill sound
    if (_killCategories.indexOf(soundName) !== -1) {
        _currentKillVideo = vid;
    }

    // Dọn dẹp sau khi play xong
    vid.addEventListener('ended', function() {
        _isPlaying = false;
        if (document.body.contains(vid)) {
            document.body.removeChild(vid);
        }
    });

    try {
        var result = vid.play();
        if (result && typeof result.then === 'function') {
            result.then(function() {
                // console.log('[KillStreak][WebUI] Playing:', soundName);
                // showSoundMarker('SND-PLAY ' + soundName, '#008800');
            }).catch(function(e) {
                // console.error('[KillStreak][WebUI] play() rejected:', soundName, e);
                // showSoundMarker('SND-ERR ' + soundName + ': ' + (e.message || e), '#cc0000');
                _isPlaying = false;
                if (document.body.contains(vid)) document.body.removeChild(vid);
            });
        } else {
            // showSoundMarker('SND-PLAY ' + soundName, '#008800');
        }
    } catch (e) {
        // console.error('[KillStreak][WebUI] playKillSound threw:', e);
        // showSoundMarker('SND-THROW ' + soundName + ': ' + e.message, '#cc0000');
        _isPlaying = false;
        if (document.body.contains(vid)) document.body.removeChild(vid);
    }
}

// ----------------------------------------
// Cập nhật bộ đếm kill góc trên phải
// ----------------------------------------
function updateKillCounter(kills) {
    // console.log('[KillStreak][WebUI] updateKillCounter:', kills);
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
    // console.log('[KillStreak][WebUI] showStreakMessage:', streakName, kills);
    var el      = document.getElementById('streak-message');
    var nameEl  = document.getElementById('streak-name');
    var killsEl = document.getElementById('streak-kills');

    nameEl.textContent  = streakName;
    killsEl.textContent = kills + ' KILLS';

    var _classMap = {
        'KILLING SPREE': 'sk-killingspree',
        'RAMPAGE':       'sk-rampage',
        'DOMINATING':    'sk-dominating',
        'UNSTOPPABLE':   'sk-unstoppable',
        'GODLIKE':       'sk-godlike',
    };
    var cssClass = _classMap[streakName] || '';
    el.className = 'hidden';
    if (cssClass) el.classList.add(cssClass);

    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = '';

    clearTimeout(streakTimer);
    streakTimer = setTimeout(function() {
        el.classList.add('hidden');
        el.style.animation = '';
    }, 3100);
}

// ----------------------------------------
// Hiển thị badge headshot đơn (mỗi khi có headshot kill)
// ----------------------------------------
var _headshotBadgeTimer = null;
function showHeadshotBadge(count) {
    var el = document.getElementById('headshot-badge');
    if (!el) return;

    count = count || 1;
    if (count > 5) count = 5;

    el.innerHTML = '';
    for (var i = 0; i < count; i++) {
        var icon = document.createElement('div');
        icon.className = 'headshot-icon';
        el.appendChild(icon);
    }

    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';

    clearTimeout(_headshotBadgeTimer);
    _headshotBadgeTimer = setTimeout(function() {
        el.style.animation = 'fadeOut 0.4s ease forwards';
        setTimeout(function() {
            el.classList.add('hidden');
            el.style.animation = '';
        }, 400);
    }, 1500);
}

// ----------------------------------------
// Hiển thị thông báo headshot liên tiếp
// ----------------------------------------
function showHeadshotMessage(name, count) {
    // console.log('[KillStreak][WebUI] showHeadshotMessage:', name, count);
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
// Cập nhật streak progress bên dưới kill counter
// ----------------------------------------
function updateStreakProgress(nextName, remaining) {
    var el     = document.getElementById('streak-progress');
    var textEl = document.getElementById('progress-text');
    if (!el || !textEl) return;
    if (!nextName || nextName === '') {
        el.classList.add('hidden');
        return;
    }
    var label = remaining === 1 ? '1 kill' : remaining + ' kills';
    textEl.textContent = label + ' > ' + nextName;
    el.classList.remove('hidden');
}

// ----------------------------------------
// Hiển thị badge Revenge
// ----------------------------------------
var _revengeBadgeTimer = null;
function showRevengeBadge() {
    // console.log('[KillStreak][WebUI] showRevengeBadge');
    var el = document.getElementById('revenge-badge');
    if (!el) return;
    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
    clearTimeout(_revengeBadgeTimer);
    _revengeBadgeTimer = setTimeout(function() {
        el.classList.add('hidden');
        el.style.animation = '';
    }, 2700);
}

// ----------------------------------------
// Clear tất cả HUD events đang hiển thị (dùng khi server announce xuất hiện)
// ----------------------------------------
function clearAllHudEvents() {
    var ids = [
        'revenge-badge', 'firstblood-badge', 'headshot-badge',
        'headshot-message', 'multikill-badge', 'streak-message', 'streak-ended'
    ];
    for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el) { el.classList.add('hidden'); el.style.animation = ''; }
    }
    clearTimeout(_revengeBadgeTimer);
    clearTimeout(_firstBloodTimer);
    clearTimeout(_headshotBadgeTimer);
    clearTimeout(headshotTimer);
    clearTimeout(_multiKillTimer);
    clearTimeout(streakTimer);
    clearTimeout(endedTimer);
}

// ----------------------------------------
// Hiển thị Server Announce (streak của người khác)
// ----------------------------------------
var _serverAnnounceTimer = null;
function showServerAnnounce(killerName, streakName, kills) {
    // console.log('[KillStreak][WebUI] showServerAnnounce:', killerName, streakName, kills);
    clearAllHudEvents();
    var el       = document.getElementById('server-announce');
    var nameEl   = document.getElementById('announce-name');
    var streakEl = document.getElementById('announce-streak');
    var killsEl  = document.getElementById('announce-kills');
    if (!el) return;
    nameEl.textContent   = killerName;
    streakEl.textContent = 'is ' + streakName + '!';
    killsEl.textContent  = kills + ' KILLS';
    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
    clearTimeout(_serverAnnounceTimer);
    _serverAnnounceTimer = setTimeout(function() {
        el.classList.add('hidden');
        el.style.animation = '';
    }, 3600);
}

// ----------------------------------------
// Hiển thị badge First Blood
// ----------------------------------------
var _firstBloodTimer = null;
function showFirstBloodBadge() {
    // console.log('[KillStreak][WebUI] showFirstBloodBadge');
    var el = document.getElementById('firstblood-badge');
    if (!el) return;
    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
    clearTimeout(_firstBloodTimer);
    _firstBloodTimer = setTimeout(function() {
        el.classList.add('hidden');
        el.style.animation = '';
    }, 2700);
}



// ----------------------------------------
// Hiển thị thông báo streak kết thúc (có thể có killer name)
// ----------------------------------------
function showStreakEnded(oldStreak, killerName) {
    // console.log('[KillStreak][WebUI] showStreakEnded:', oldStreak, killerName);
    var el      = document.getElementById('streak-ended');
    var textEl  = document.getElementById('ended-text');
    var countEl = document.getElementById('ended-count');

    el.className = 'hidden';

    if (killerName && killerName.length > 0) {
        textEl.textContent  = 'Streak Ended';
        countEl.textContent = 'by ' + killerName + ' (' + oldStreak + ' kills)';
        el.classList.add('ended-by-player');
        playKillSound('shut_down');
    } else {
        textEl.textContent  = 'Streak Ended';
        countEl.textContent = oldStreak + ' kill streak';
        el.classList.add('ended-env');
        playKillSound('dead');
    }

    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';

    clearTimeout(endedTimer);
    endedTimer = setTimeout(function() {
        el.classList.add('hidden');
        el.style.animation = '';
    }, 2300);
}

// ============================================================
// Adrenaline Mode — canvas-based enhanced fullscreen overlay
// ============================================================
var _adrAnimId = null;
var _adrStartTime = 0;
var _adrDuration = 10000;

window.showAdrenaline = function(durationMs) {
    var canvas = document.getElementById('adrenaline-overlay');
    if (!canvas) return;

    _adrDuration = durationMs || 10000;
    _adrStartTime = performance.now();

    var dpr = window.devicePixelRatio || 1;
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    if (_adrAnimId) {
        cancelAnimationFrame(_adrAnimId);
        _adrAnimId = null;
    }

    function draw() {
        var now = performance.now();
        var elapsed = now - _adrStartTime;
        var progress = Math.min(elapsed / _adrDuration, 1);

        var t = (now % 800) / 800;
        var beat;
        if (t < 0.12) {
            beat = 0.6 + 0.4 * Math.sin(t / 0.12 * Math.PI);
        } else if (t < 0.3) {
            beat = 0.4 + 0.6 * Math.sin((t - 0.12) / 0.18 * Math.PI);
        } else {
            beat = 0.4;
        }

        ctx.clearRect(0, 0, w, h);

        // Layer 1: Vignette
        var vigR = Math.max(w, h) * 0.65;
        var grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, vigR);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, 'rgba(180,0,0,0)');
        grad.addColorStop(1, 'rgba(180,0,0,' + (0.18 * beat) + ')');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Layer 2: Inner glow
        ctx.save();
        ctx.shadowColor = 'rgba(220,30,30,' + (0.2 * beat) + ')';
        ctx.shadowBlur = 80;
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        // Layer 3: Pulsing border bars
        var bw = Math.max(3, Math.round(w * 0.004));
        var br = Math.round(180 + 75 * beat);
        var bg = Math.round(15 + 40 * beat);
        var bb = Math.round(15 + 40 * beat);
        var ba = 0.3 + 0.7 * beat;

        ctx.shadowColor = 'rgba(0,0,0,0)';
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(' + br + ',' + bg + ',' + bb + ',' + ba + ')';
        ctx.fillRect(0, 0, w, bw);
        ctx.fillRect(0, h - bw, w, bw);
        ctx.fillRect(0, 0, bw, h);
        ctx.fillRect(w - bw, 0, bw, h);

        // Layer 4: Inner edge highlight
        ctx.strokeStyle = 'rgba(255,80,80,' + (0.12 * beat) + ')';
        ctx.lineWidth = 1;
        ctx.strokeRect(bw, bw, w - bw * 2, h - bw * 2);

        if (progress >= 1) {
            _adrAnimId = null;
            window.hideAdrenaline();
            return;
        }

        _adrAnimId = requestAnimationFrame(draw);
    }

    draw();
};

window.hideAdrenaline = function() {
    if (_adrAnimId) {
        cancelAnimationFrame(_adrAnimId);
        _adrAnimId = null;
    }
    var canvas = document.getElementById('adrenaline-overlay');
    if (canvas) {
        var dpr = window.devicePixelRatio || 1;
        var ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
};
