-- ============================================================
-- SERVER: Theo dõi kill và gửi sự kiện về client
-- Dùng event `Player:Killed` (fire cho cả kill bot lẫn PvP)
-- Signature: (victim, inflictor, position, weapon, isRoadKill, isHeadShot, wasInRevive)
-- ============================================================

require('__shared/config')

print('[KillStreak][SERVER] Mod loaded — streaks: ' .. #KillStreakConfig.streaks
    .. ', hs milestones: ' .. #KillStreakConfig.headshotStreaks)

local playerKills     = {}
local playerHeadshots = {}
local playerMultiKill = {}  -- id -> { count, lastKillTime }
local firstBloodClaimed = false
local lastKilledBy    = {}  -- playerId -> id của người vừa giết họ

-- ----------------------------------------
-- Helper
-- ----------------------------------------
local function pname(p)
    if p == nil then return 'nil' end
    local ok, n = pcall(function() return p.name end)
    if ok and n then return n end
    return tostring(p)
end

-- Bot detection: BF3/NAT-bots dùng tiền tố BOT_
local function isBot(player)
    if player == nil then return false end
    local n = player.name or ''
    return n:sub(1, 4) == 'BOT_'
end

local function getHeadshotStreak(count)
    for _, hs in ipairs(KillStreakConfig.headshotStreaks) do
        if count == hs.count then
            return hs
        end
    end
    return nil
end

-- ----------------------------------------
-- Reset first blood khi load map mới
-- ----------------------------------------
Events:Subscribe('Level:Loaded', function()
    firstBloodClaimed = false
    print('[KillStreak][SERVER] Level loaded — first blood reset')
end)

-- ----------------------------------------
-- Event chính: Player:Killed
-- ----------------------------------------
Events:Subscribe('Player:Killed', function(victim, inflictor, position, weapon, isRoadKill, isHeadShot, wasInRevive)
    if victim == nil then
        print('[KillStreak][SERVER] Player:Killed but victim=nil — skipped')
        return
    end

    local killer   = inflictor   -- có thể nil (env death) hoặc Player object
    local headshot = isHeadShot == true

    -- ===== 1. Xử lý reset streak của VICTIM (chỉ nếu là real player) =====
    if not isBot(victim) then
        local vid = victim.id
        local oldStreak = playerKills[vid] or 0
        playerKills[vid]     = 0
        playerHeadshots[vid] = 0
        print(string.format('[KillStreak][SERVER] %s died — streak reset from %d',
            victim.name, oldStreak))
        NetEvents:SendTo('KillStreak:OnReset', victim, oldStreak)
    end

    -- ===== 2. Bỏ qua nếu không có killer hoặc tự sát =====
    if killer == nil then
        print(string.format('[KillStreak][SERVER] %s died with no killer (weapon=%s) — env death',
            pname(victim), tostring(weapon)))
        return
    end
    if killer == victim then
        print(string.format('[KillStreak][SERVER] %s self-killed — skipped', pname(killer)))
        return
    end

    -- ===== 3. Tăng kill count cho KILLER (chỉ track real player) =====
    if isBot(killer) then
        print(string.format('[KillStreak][SERVER] %s (bot) killed %s — no streak tracking',
            killer.name, pname(victim)))
        return
    end

    local kid = killer.id
    if playerKills[kid] == nil then
        playerKills[kid] = 0
    end
    playerKills[kid] = playerKills[kid] + 1
    local totalKills = playerKills[kid]

    -- Headshot streak: tăng nếu hs, reset nếu không
    if headshot then
        playerHeadshots[kid] = (playerHeadshots[kid] or 0) + 1
    else
        playerHeadshots[kid] = 0
    end
    local consecutiveHeadshots = playerHeadshots[kid]

    -- ===== 4. Multi-kill tracking =====
    local now = SharedUtils:GetTimeMS()
    local mk  = playerMultiKill[kid] or { count = 0, lastKillTime = 0 }
    local elapsed = now - mk.lastKillTime

    if elapsed <= KillStreakConfig.multiKillWindow then
        mk.count = mk.count + 1
    else
        mk.count = 1  -- window hết, kill này bắt đầu window mới
    end
    mk.lastKillTime = now
    playerMultiKill[kid] = mk

    -- Tìm multi-kill milestone (count == đúng mốc, hoặc count >= mốc cao nhất)
    local multiKill = nil
    local maxMK = KillStreakConfig.multiKills[#KillStreakConfig.multiKills]
    if mk.count >= maxMK.count then
        multiKill = maxMK  -- Rampage và cao hơn đều dùng mốc cuối
    else
        for _, m in ipairs(KillStreakConfig.multiKills) do
            if mk.count == m.count then
                multiKill = m
                break
            end
        end
    end

    -- ===== 5. Tìm kill streak milestone =====
    local streak = nil
    for _, s in ipairs(KillStreakConfig.streaks) do
        if totalKills == s.kills then
            streak = s
            break
        end
    end
    local hsStreak = getHeadshotStreak(consecutiveHeadshots)

    local streakInfo  = streak     and ('streak=' .. streak.name)        or 'no-streak'
    local hsInfo      = hsStreak  and ('hs=' .. hsStreak.name)           or 'no-hs'
    local mkInfo      = multiKill and ('mk=' .. multiKill.name .. '(' .. mk.count .. 'x)') or 'no-mk'
    print(string.format('[KillStreak][SERVER] %s killed %s | kills=%d hs=%s mk=%dx elapsed=%dms | %s | %s | %s',
        killer.name, pname(victim), totalKills, tostring(headshot), mk.count, elapsed,
        streakInfo, hsInfo, mkInfo))

    -- ===== 6. Revenge =====
    if not isBot(victim) and lastKilledBy[kid] == victim.id then
        lastKilledBy[kid] = nil
        print(string.format('[KillStreak][SERVER] REVENGE: %s killed %s', killer.name, pname(victim)))
        NetEvents:SendTo('KillStreak:OnRevenge', killer)
    end
    -- Ghi nhận: victim vừa bị killer giết (để victim trả thù sau)
    if not isBot(victim) then
        lastKilledBy[victim.id] = kid
    end

    -- ===== 6. First Blood =====
    if not firstBloodClaimed then
        firstBloodClaimed = true
        print(string.format('[KillStreak][SERVER] FIRST BLOOD: %s', killer.name))
        NetEvents:SendTo('KillStreak:OnFirstBlood', killer)
    end

    -- ===== 8. Gửi NetEvent kill chính =====
    local streakName      = streak   and streak.name            or ''
    local streakSound     = streak   and streak.sound           or ''
    local streakImportant = streak   ~= nil and streak.important == true
    local hsName          = hsStreak and hsStreak.name          or ''
    local hsSound         = hsStreak and hsStreak.sound         or ''

    NetEvents:SendTo('KillStreak:OnKill', killer,
        totalKills, headshot,
        streakName, streakSound, streakImportant,
        consecutiveHeadshots, hsName, hsSound)

    -- ===== 9. Server Announce — broadcast streak quan trọng lên tất cả =====
    if streak ~= nil and streak.important == true then
        local allPlayers = PlayerManager:GetPlayers()
        for _, p in ipairs(allPlayers) do
            if p.id ~= kid then
                NetEvents:SendTo('KillStreak:OnServerAnnounce', p, killer.name, streak.name, totalKills)
            end
        end
        print(string.format('[KillStreak][SERVER] ServerAnnounce broadcast: %s %s (%d kills)',
            killer.name, streak.name, totalKills))
    end

    -- ===== 10. Gửi NetEvent multi-kill nếu đạt mốc =====
    if multiKill ~= nil then
        NetEvents:SendTo('KillStreak:OnMultiKill', killer,
            mk.count, multiKill.name, multiKill.sound)
        print(string.format('[KillStreak][SERVER] MultiKill sent to %s | %s (%dx)',
            killer.name, multiKill.name, mk.count))
    end
end)

-- ----------------------------------------
-- Player thoát game → xóa dữ liệu
-- ----------------------------------------
Events:Subscribe('Player:Left', function(player)
    if player ~= nil then
        print('[KillStreak][SERVER] ' .. player.name .. ' left — data cleared')
        playerKills[player.id]     = nil
        playerHeadshots[player.id] = nil
        playerMultiKill[player.id] = nil
        lastKilledBy[player.id]    = nil
    end
end)
