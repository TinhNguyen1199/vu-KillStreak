-- ============================================================
-- Config: Chỉnh các thông số tại đây
-- ============================================================

KillStreakConfig = {

    -- Danh sách các mốc Kill Streak
    -- kills = số kill liên tiếp, name = tên hiển thị, sound = tên file âm thanh
    streaks = {
        { kills = 3,  name = "KILLING SPREE",  sound = "streak_3",  important = true },
        { kills = 5,  name = "RAMPAGE",         sound = "streak_5",  important = true },
        { kills = 7,  name = "DOMINATING",      sound = "streak_7",  important = true },
        { kills = 10, name = "UNSTOPPABLE",     sound = "streak_10", important = true },
        { kills = 15, name = "GODLIKE",         sound = "streak_15", important = true },
    },

    -- Các mốc headshot liên tiếp
    headshotStreaks = {
        { count = 2, name = "DOUBLE HEADSHOT", sound = "headshot_double" },
        { count = 3, name = "TRIPLE HEADSHOT", sound = "headshot_triple" },
        { count = 5, name = "MULTI HEADSHOT",  sound = "headshot_multi"  },
    },

    -- Âm thanh First Blood
    firstBloodSound = "first_blood",

    -- Âm thanh Revenge
    revengeSound = "revenge_kill",

    -- Âm thanh khi kill thường
    killSound = "kill_normal",

    -- Âm thanh khi headshot
    headshotSound = "kill_headshot",

    -- Âm thanh khi Server Announce (streak quan trọng của người khác)
    serverAnnounceSound = "unstoppable",

    -- Thời gian hiển thị thông báo streak trên màn hình (giây)
    displayDuration = 3.0,

    -- Enhanced Notifications settings
    enhancedNotifications = {
        showKillerInStreakEnded = true,  -- Hiển thị tên người kill streak
        showStreakEndedMessage  = true,  -- Hiển thị thông báo khi streak ended >= 3
    },

    -- Multi-kill: giết nhiều người trong khoảng thời gian ngắn
    multiKillWindow = 4000,  -- ms, window tính từ kill trước
    multiKills = {
        { count = 2, name = "DOUBLE KILL", sound = "double_kill" },
        { count = 3, name = "TRIPLE KILL", sound = "triple_kill" },
        { count = 4, name = "QUAD KILL",   sound = "quad_kill"   },
        { count = 5, name = "RAMPAGE",     sound = "rampage"     },
    },
}
