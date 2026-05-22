-- ============================================================
-- CLIENT: Nhận sự kiện từ server, phát âm thanh và hiển thị HUD
-- ============================================================

require('__shared/config')  -- nạp config dùng chung

print('[KillStreak][CLIENT] Mod loaded — waiting for Extension:Loaded')

Events:Subscribe('Extension:Loaded', function()
    print('[KillStreak][CLIENT] Extension:Loaded fired — calling WebUI:Init()')
    WebUI:Init()
    WebUI:Show()
end)

local currentStreak = 0  -- số kill streak hiện tại của người chơi này

-- ----------------------------------------
-- Hàm: Phát âm thanh theo tên file
-- soundName: tên file trong thư mục audio/ (không cần đuôi .wav)
-- ----------------------------------------
local function playSound(soundName)
    -- Gửi lệnh sang WebUI để phát âm thanh HTML5
    WebUI:ExecuteJS(string.format("playKillSound('%s')", soundName))
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
NetEvents:Subscribe('KillStreak:OnKill', function(kills, headshot, streakName, streakSound, streakImportant, consecutiveHeadshots, hsName, hsSound)
    print(string.format('[KillStreak][CLIENT] OnKill received | kills=%d headshot=%s streak="%s" consec_hs=%d hs="%s"',
        kills or 0, tostring(headshot),
        streakName or '', consecutiveHeadshots or 0, hsName or ''))

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

    -- Hiển thị thông báo headshot milestone nếu đạt mốc
    if hsStreak ~= nil then
        showHeadshotMessage(hsStreak.name, consecutiveHeadshots or 0)
    end

    -- Hiển thị streak message + phát streak sound nếu đạt mốc kill
    if streak ~= nil then
        showStreakMessage(streak.name, currentStreak)
        if not importantStreak then
            local timer = Timer()
            timer:Start(0.3)
            timer:Subscribe('Update', function(t, dt)
                if t.time >= 0.3 then
                    playSound(streak.sound)
                    t:Destroy()
                end
            end)
        end
    end
end)

-- ----------------------------------------
-- Nhận sự kiện reset từ server
-- ----------------------------------------
NetEvents:Subscribe('KillStreak:OnReset', function(oldStreak)
    print('[KillStreak][CLIENT] OnReset received | oldStreak=' .. tostring(oldStreak))
    currentStreak = 0
    updateKillCounter(0)

    -- Nếu streak trước đó >= 3 thì hiển thị "Streak ended"
    if oldStreak >= 3 then
        WebUI:ExecuteJS(string.format("showStreakEnded(%d)", oldStreak))
    end
end)
