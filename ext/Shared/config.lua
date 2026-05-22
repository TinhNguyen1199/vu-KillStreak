-- ============================================================
-- Config: Chỉnh các thông số tại đây
-- ============================================================

KillStreakConfig = {

    -- Danh sách các mốc Kill Streak
    -- kills = số kill liên tiếp, name = tên hiển thị, sound = tên file âm thanh
    streaks = {
        { kills = 3,  name = "KILLING SPREE",  sound = "streak_3"  },
        { kills = 5,  name = "RAMPAGE",         sound = "streak_5"  },
        { kills = 7,  name = "DOMINATING",      sound = "streak_7"  },
        { kills = 10, name = "UNSTOPPABLE",     sound = "streak_10", important = true },
        { kills = 15, name = "GODLIKE",         sound = "streak_15", important = true },
    },

    -- Các mốc headshot liên tiếp
    headshotStreaks = {
        { count = 2, name = "DOUBLE HEADSHOT", sound = "headshot_double" },
        { count = 3, name = "TRIPLE HEADSHOT", sound = "headshot_triple" },
        { count = 5, name = "MULTI HEADSHOT",  sound = "headshot_multi"  },
    },

    -- Âm thanh khi kill thường
    killSound = "kill_normal",

    -- Âm thanh khi headshot
    headshotSound = "kill_headshot",

    -- Thời gian hiển thị thông báo streak trên màn hình (giây)
    displayDuration = 3.0,
}
