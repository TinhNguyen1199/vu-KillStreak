-- ============================================================
-- SERVER: Theo dõi kill và gửi sự kiện về client
-- ============================================================

require('__shared/config')  -- nạp config dùng chung

print('[KillStreak][SERVER] Mod loaded — streaks: ' .. #KillStreakConfig.streaks .. ', hs milestones: ' .. #KillStreakConfig.headshotStreaks)

local playerKills     = {}  -- bảng lưu số kill của từng người chơi: { [playerId] = số_kill }
local playerHeadshots = {}  -- số headshot liên tiếp: { [playerId] = số_headshot_liên_tiếp }

-- ----------------------------------------
-- Hàm: tìm headshot streak milestone khớp đúng mốc
-- ----------------------------------------
local function getHeadshotStreak(count)
    for _, hs in ipairs(KillStreakConfig.headshotStreaks) do
        if count == hs.count then
            return hs
        end
    end
    return nil
end

-- ----------------------------------------
-- Hàm: tìm streak phù hợp với số kill hiện tại
-- ----------------------------------------
local function getStreak(kills)
    local result = nil
    for _, streak in ipairs(KillStreakConfig.streaks) do
        if kills >= streak.kills then
            result = streak  -- lấy streak cao nhất đạt được
        end
    end
    return result
end

-- ----------------------------------------
-- Sự kiện: Người chơi hạ gục địch
-- ----------------------------------------
Events:Subscribe('Player:Kill', function(killer, victim, weapon, headshot)
    -- Bỏ qua nếu tự bắn hoặc không có killer
    if killer == nil or victim == nil then
        print('[KillStreak][SERVER] Player:Kill fired but killer or victim is nil — skipped')
        return
    end
    if killer == victim then
        print('[KillStreak][SERVER] ' .. killer.name .. ' self-killed — skipped')
        return
    end

    local id = killer.id

    -- Khởi tạo bộ đếm nếu chưa có
    if playerKills[id] == nil then
        playerKills[id] = 0
    end

    -- Tăng kill count
    playerKills[id] = playerKills[id] + 1
    local totalKills = playerKills[id]

    -- Track headshot liên tiếp: tăng nếu headshot, reset nếu không
    if headshot then
        playerHeadshots[id] = (playerHeadshots[id] or 0) + 1
    else
        playerHeadshots[id] = 0
    end
    local consecutiveHeadshots = playerHeadshots[id]

    -- Tìm xem có đạt kill streak mới không
    local streak = nil
    for _, s in ipairs(KillStreakConfig.streaks) do
        if totalKills == s.kills then
            streak = s
            break
        end
    end

    -- Tìm xem có đạt headshot streak milestone không
    local hsStreak = getHeadshotStreak(consecutiveHeadshots)

    local streakInfo  = streak   and ('streak=' .. streak.name)   or 'no-streak'
    local hsInfo      = hsStreak and ('hs-milestone=' .. hsStreak.name) or 'no-hs-milestone'
    print(string.format('[KillStreak][SERVER] %s killed %s | kills=%d hs=%s consec_hs=%d | %s | %s',
        killer.name, victim.name, totalKills, tostring(headshot), consecutiveHeadshots, streakInfo, hsInfo))

    -- Gửi thông tin về client của người kill
    NetEvents:SendTo('KillStreak:OnKill', killer, totalKills, headshot, streak, consecutiveHeadshots, hsStreak)
    print('[KillStreak][SERVER] NetEvent sent to ' .. killer.name)
end)

-- ----------------------------------------
-- Sự kiện: Người chơi bị chết → reset streak
-- ----------------------------------------
Events:Subscribe('Player:Killed', function(player, killer, weapon, headshot)
    if player == nil then
        print('[KillStreak][SERVER] Player:Killed fired but player is nil — skipped')
        return
    end

    local id = player.id
    local oldStreak = playerKills[id] or 0
    playerKills[id]     = 0
    playerHeadshots[id] = 0

    print(string.format('[KillStreak][SERVER] %s died — streak reset from %d', player.name, oldStreak))
    NetEvents:SendTo('KillStreak:OnReset', player, oldStreak)
end)

-- ----------------------------------------
-- Sự kiện: Người chơi thoát game → xóa dữ liệu
-- ----------------------------------------
Events:Subscribe('Player:Left', function(player)
    if player ~= nil then
        print('[KillStreak][SERVER] ' .. player.name .. ' left — data cleared')
        playerKills[player.id]     = nil
        playerHeadshots[player.id] = nil
    end
end)
