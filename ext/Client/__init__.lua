-- ============================================================
-- CLIENT: Nhận sự kiện từ server, phát âm thanh và hiển thị HUD
-- ============================================================

require('__shared/config')  -- nạp config dùng chung

print('[KillStreak][CLIENT] Mod loaded — waiting for Extension:Loaded')

Events:Subscribe('Extension:Loaded', function()
    print('[KillStreak][CLIENT] Extension:Loaded fired — calling WebUI:Init()')
    WebUI:Init()
    WebUI:Show()
    WebUI:BringToFront()
    -- Inject marker từ Lua để verify client Lua đã chạy (không phụ thuộc log console) -- DISABLED
    -- WebUI:ExecuteJS("showLuaMarker('LUA:OK (Ext)')")
end)

-- Re-init khi vào map (Extension:Loaded có thể fire trước khi session sẵn sàng)
Events:Subscribe('Level:Loaded', function()
    print('[KillStreak][CLIENT] Level:Loaded fired — re-init WebUI')
    WebUI:Init()
    WebUI:Show()
    WebUI:BringToFront()
    -- WebUI:ExecuteJS("showLuaMarker('LUA:OK (Lvl)')")
end)

-- Update tick — gọi 1 lần sau khi engine sẵn sàng để bắt trường hợp Extension/Level event không fire
local _luaMarkerShown = false
Events:Subscribe('Engine:Update', function()
    if not _luaMarkerShown then
        _luaMarkerShown = true
        print('[KillStreak][CLIENT] Engine:Update fired — first tick')
        -- WebUI:ExecuteJS("showLuaMarker('LUA:OK (Tick)')")
    end
end)

local currentStreak = 0  -- số kill streak hiện tại của người chơi này

-- ----------------------------------------
-- Hàm: Phát âm thanh theo tên file
-- soundName: tên file trong thư mục audio/ (không cần đuôi .wav)
-- ----------------------------------------
local function playSound(soundName)
    -- Dùng requestSound thay vì gọi playKillSound trực tiếp:
    -- Gameface block video.play() từ injected ExecuteJS context,
    -- requestSound() đẩy vào queue để setInterval (page-level JS) xử lý.
    WebUI:ExecuteJS(string.format("requestSound('%s')", soundName))
end

-- ----------------------------------------
-- Hàm: Hiển thị thông báo Kill Streak lên màn hình
-- ----------------------------------------
local function showStreakMessage(streakName, kills)
    WebUI:ExecuteJS(string.format("showStreakMessage('%s', %d)", streakName, kills))
end

-- ----------------------------------------
-- Hàm: Hiển thị thông báo headshot liên tiếp
-- ----------------------------------------
local function showHeadshotMessage(name, count)
    WebUI:ExecuteJS(string.format("showHeadshotMessage('%s', %d)", name, count))
end

-- ----------------------------------------
-- Hàm: Hiển thị số kill count nhỏ góc màn hình
-- ----------------------------------------
local function updateKillCounter(kills)
    WebUI:ExecuteJS(string.format("updateKillCounter(%d)", kills))
end

-- ----------------------------------------
-- Nhận sự kiện kill từ server (nhận primitives, tái tạo objects ở client)
-- ----------------------------------------
NetEvents:Subscribe('KillStreak:OnKill', function(kills, headshot, streakName, streakSound, streakImportant, consecutiveHeadshots, hsName, hsSound, victimName)
    print(string.format('[KillStreak][CLIENT] OnKill received | kills=%d headshot=%s streak="%s" consec_hs=%d victim="%s"',
        kills or 0, tostring(headshot),
        streakName or '', consecutiveHeadshots or 0, victimName or ''))

    -- Marker để verify NetEvent đã tới client (không phụ thuộc log)
    -- WebUI:ExecuteJS(string.format("showNetEventMarker('KILL', 'k=%d hs=%s')",
    --     kills or 0, tostring(headshot)))

    -- Tái tạo streak objects từ primitives
    local streak = nil
    if streakName and streakName ~= '' then
        streak = { name = streakName, sound = streakSound, important = streakImportant == true }
    end
    local hsStreak = nil
    if hsName and hsName ~= '' then
        hsStreak = { name = hsName, sound = hsSound }
    end

    currentStreak = kills or 0

    -- Cập nhật counter trên HUD
    updateKillCounter(currentStreak)

    -- Streak progress: tìm mốc tiếp theo
    local nextStreak = nil
    for _, s in ipairs(KillStreakConfig.streaks) do
        if s.kills > currentStreak then
            nextStreak = s
            break
        end
    end
    if nextStreak then
        local remaining = nextStreak.kills - currentStreak
        WebUI:ExecuteJS(string.format("updateStreakProgress('%s', %d)", nextStreak.name, remaining))
    else
        WebUI:ExecuteJS("updateStreakProgress('', 0)")
    end

    local importantStreak = streak ~= nil and streak.important == true

    -- Ưu tiên âm thanh: important streak > headshot milestone > headshot thường > kill thường
    if importantStreak then
        WebUI:ExecuteJS('stopCurrentKillSound()')
        playSound(streak.sound)
    elseif hsStreak ~= nil then
        WebUI:ExecuteJS('stopCurrentKillSound()')
        playSound(hsStreak.sound)
    elseif headshot then
        WebUI:ExecuteJS('stopCurrentKillSound()')
        playSound(KillStreakConfig.headshotSound)
    else
        playSound(KillStreakConfig.killSound)
    end

    -- Hiển thị badge headshot đơn cho mọi headshot kill
    if headshot then
        WebUI:ExecuteJS(string.format('showHeadshotBadge(%d)', consecutiveHeadshots or 1))
    end

-- DISABLED: headshot text removed, icons only
--[[
    if hsStreak ~= nil then
        showHeadshotMessage(hsStreak.name, consecutiveHeadshots or 0)
    end
--]]

    -- Hiển thị streak message + phát streak sound nếu đạt mốc kill
    if streak ~= nil then
        showStreakMessage(streak.name, currentStreak)
        if not importantStreak then
            -- Delay nhỏ để kill_normal phát trước, sau đó phát streak sound
            WebUI:ExecuteJS(string.format("requestSoundDelayed('%s', 300)", streak.sound))
        end
    end
end)

-- Helper: escape single quotes cho JS string
local function jsEscape(s)
    return (s or ''):gsub("'", "\\'")
end

-- ----------------------------------------
-- Nhận sự kiện Revenge từ server
-- ----------------------------------------
NetEvents:Subscribe('KillStreak:OnRevenge', function()
    print('[KillStreak][CLIENT] OnRevenge received')
    WebUI:ExecuteJS("showRevengeBadge()")
    -- Delay 300ms để kill_normal phát trước rồi mới phát revenge sound
    WebUI:ExecuteJS(string.format("requestSoundDelayed('%s', 300)", KillStreakConfig.revengeSound))
end)

-- ----------------------------------------
-- Nhận Server Announce (streak của người khác)
-- ----------------------------------------
NetEvents:Subscribe('KillStreak:OnServerAnnounce', function(killerName, streakName, kills)
    print(string.format('[KillStreak][CLIENT] OnServerAnnounce: %s %s (%d)',
        killerName or '', streakName or '', kills or 0))
    WebUI:ExecuteJS(string.format("showServerAnnounce('%s', '%s', %d)",
        jsEscape(killerName), jsEscape(streakName), kills or 0))

    -- Phát sound unstoppable khi có server announce
    playSound(KillStreakConfig.serverAnnounceSound)
end)

-- ----------------------------------------
-- Nhận sự kiện First Blood từ server
-- ----------------------------------------
NetEvents:Subscribe('KillStreak:OnFirstBlood', function()
    print('[KillStreak][CLIENT] OnFirstBlood received')
    WebUI:ExecuteJS("showFirstBloodBadge()")
    -- Clear queue và stop sound hiện tại để first_blood override hoàn toàn kill_normal
    WebUI:ExecuteJS("clearSoundQueue()")
    WebUI:ExecuteJS("stopCurrentKillSound()")
    WebUI:ExecuteJS(string.format("requestSound('%s')", KillStreakConfig.firstBloodSound))
end)

-- ----------------------------------------
-- Nhận sự kiện multi-kill từ server
-- ----------------------------------------
NetEvents:Subscribe('KillStreak:OnMultiKill', function(count, name, sound)
    print(string.format('[KillStreak][CLIENT] OnMultiKill received | count=%d name="%s" sound="%s"',
        count or 0, name or '', sound or ''))
    WebUI:ExecuteJS(string.format("showMultiKillBadge('%s', %d)", name or '', count or 0))
    if sound and sound ~= '' then
        -- Delay 300ms để kill_normal phát trước rồi mới phát multi-kill sound
        WebUI:ExecuteJS(string.format("requestSoundDelayed('%s', 300)", sound))
    end
end)

-- ----------------------------------------
-- Nhận sự kiện reset từ server
-- ----------------------------------------
NetEvents:Subscribe('KillStreak:OnReset', function(oldStreak, killerName)
    print(string.format('[KillStreak][CLIENT] OnReset received | oldStreak=%d killerName="%s"',
        oldStreak or 0, killerName or ''))
    -- WebUI:ExecuteJS(string.format("showNetEventMarker('RESET', 'old=%d')", oldStreak or 0))
    currentStreak = 0
    updateKillCounter(0)
    WebUI:ExecuteJS("updateStreakProgress('', 0)")

    -- Nếu streak trước đó >= 3 thì hiển thị "Streak ended" với tên killer
    if oldStreak >= 3 then
        local killer = killerName or ''
        WebUI:ExecuteJS(string.format("showStreakEnded(%d, '%s')", oldStreak, jsEscape(killer)))
    end
end)
