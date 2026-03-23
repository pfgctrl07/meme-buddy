import json
import sqlite3
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path


DB_PATH = Path(__file__).resolve().parent / "meme_buddy.db"
DEMO_USER_ID = "demo-user"

DEFAULT_USERS = [
    {
        "id": "luna-spark",
        "name": "LunaSpark",
        "handle": "@lunaspark",
        "level": "Trend Oracle",
        "total_points": 12240,
        "win_rate": 82,
        "achievements": ["Trend Oracle", "Top 10 Builder", "Signal Hunter"],
        "activity_series": [18, 22, 24, 29, 31, 35, 39],
    },
    {
        "id": "meme-marshal",
        "name": "MemeMarshal",
        "handle": "@mememarshal",
        "level": "Virality Pro",
        "total_points": 11880,
        "win_rate": 79,
        "achievements": ["Virality Pro", "Hot Streak x5", "Community Core"],
        "activity_series": [16, 18, 21, 24, 27, 29, 34],
    },
    {
        "id": "coin-comet",
        "name": "CoinComet",
        "handle": "@coincomet",
        "level": "Signal Hunter",
        "total_points": 11020,
        "win_rate": 76,
        "achievements": ["Signal Hunter", "Early Signal Expert"],
        "activity_series": [15, 17, 19, 21, 24, 26, 28],
    },
    {
        "id": "hashtag-hex",
        "name": "HashtagHex",
        "handle": "@hashtaghex",
        "level": "Momentum Scout",
        "total_points": 9840,
        "win_rate": 74,
        "achievements": ["Momentum Scout", "Community Core"],
        "activity_series": [11, 13, 15, 18, 21, 23, 24],
    },
    {
        "id": "alpha-ape",
        "name": "AlphaApe",
        "handle": "@alphaape",
        "level": "Community Core",
        "total_points": 9510,
        "win_rate": 71,
        "achievements": ["Community Core", "Trust Hunter"],
        "activity_series": [10, 12, 14, 16, 18, 21, 22],
    },
    {
        "id": "trend-tactician",
        "name": "TrendTactician",
        "handle": "@trendtactician",
        "level": "Analytics Ace",
        "total_points": 8940,
        "win_rate": 69,
        "achievements": ["Analytics Ace", "Watchlist Wizard"],
        "activity_series": [9, 10, 12, 14, 16, 18, 20],
    },
    {
        "id": DEMO_USER_ID,
        "name": "Priyan Nova",
        "handle": "@memebuddy_builder",
        "level": "Prediction Architect",
        "total_points": 28440,
        "win_rate": 78,
        "achievements": ["Top 10 Builder", "Hot Streak x5", "Early Signal Expert", "Trust Hunter"],
        "activity_series": [10, 18, 16, 26, 24, 34, 42],
    },
]

DEFAULT_BACKTEST_CASES = [
    {"coin": "PEPE", "change": 9.4, "volume": 86000000, "trend_score": 88, "trust_score": 0.81, "expected_prediction": "Bullish"},
    {"coin": "PEPE", "change": -4.2, "volume": 18000000, "trend_score": 52, "trust_score": 0.44, "expected_prediction": "Neutral"},
    {"coin": "DOGECOIN", "change": 7.1, "volume": 92000000, "trend_score": 79, "trust_score": 0.77, "expected_prediction": "Bullish"},
    {"coin": "DOGECOIN", "change": -11.6, "volume": 39000000, "trend_score": 58, "trust_score": 0.31, "expected_prediction": "Bearish"},
    {"coin": "SOLANA", "change": 5.3, "volume": 64000000, "trend_score": 74, "trust_score": 0.73, "expected_prediction": "Bullish"},
    {"coin": "SOLANA", "change": -2.8, "volume": 24000000, "trend_score": 61, "trust_score": 0.55, "expected_prediction": "Neutral"},
    {"coin": "BITCOIN", "change": 2.1, "volume": 42000000, "trend_score": 54, "trust_score": 0.62, "expected_prediction": "Neutral"},
    {"coin": "BITCOIN", "change": -8.8, "volume": 76000000, "trend_score": 45, "trust_score": 0.28, "expected_prediction": "Bearish"},
    {"coin": "ETHEREUM", "change": 4.6, "volume": 52000000, "trend_score": 66, "trust_score": 0.67, "expected_prediction": "Bullish"},
    {"coin": "ETHEREUM", "change": -3.9, "volume": 17000000, "trend_score": 47, "trust_score": 0.42, "expected_prediction": "Neutral"},
    {"coin": "SHIBA-INU", "change": 1.2, "volume": 12000000, "trend_score": 71, "trust_score": 0.46, "expected_prediction": "Neutral"},
    {"coin": "SHIBA-INU", "change": -9.7, "volume": 34000000, "trend_score": 43, "trust_score": 0.24, "expected_prediction": "Bearish"},
]

BULLISH_SCORE_THRESHOLD = 0.55
BEARISH_SCORE_THRESHOLD = 0.10
STRONG_BULLISH_CHANGE = 4.0
STRONG_BULLISH_TREND = 65
STRONG_BEARISH_CHANGE = -7.0
STRONG_BEARISH_TREND_CAP = 60


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def compact_number(number):
    if number >= 1_000_000:
        return f"{number / 1_000_000:.1f}M"
    if number >= 1_000:
        return f"{number / 1_000:.1f}K"
    return str(int(round(number)))


def parse_compact_number(value):
    text = str(value).strip().upper().replace("$", "")
    multiplier = 1
    if text.endswith("M"):
        multiplier = 1_000_000
        text = text[:-1]
    elif text.endswith("K"):
        multiplier = 1_000
        text = text[:-1]
    return float(text or 0) * multiplier


def compute_confidence(trend_score, trust_score):
    value = ((trend_score / 100) * 0.65 + trust_score * 0.35) * 100
    return max(35, min(99, int(round(value))))


def compute_alert(change, trend_score):
    if change > 5 and trend_score > 70:
        return "Strong Growth Signal", "success", "🚨 STRONG BUY SIGNAL"
    if change < -5:
        return "Decline Warning", "danger", "⚠️ SELL ALERT"
    return "Watchlist Drift", "warning", "No strong signal"


def create_series(seed, direction=1):
    base = max(10, round(seed))
    values = []
    for index in range(8):
        modifier = index * 6 if direction > 0 else (7 - index) * 6
        values.append(max(6, round(base * 0.45 + modifier + (2 if index % 2 == 0 else -1))))
    return values


def create_heat(score, trust_score):
    base = max(1, min(5, round(score / 20)))
    trust_boost = 1 if trust_score > 0.7 else -1 if trust_score < 0.4 else 0
    values = []
    for index in range(12):
        drift = 1 if index % 4 == 0 else 0
        values.append(max(1, min(5, base + trust_boost + drift - (1 if index % 5 == 0 else 0))))
    return values


def score_uploaded_model(change, volume, trend_score):
    sentiment = (change / 100) + (trend_score / 100)
    return (
        0.4 * sentiment +
        0.3 * (volume / 100000000) +
        0.3 * (trend_score / 100)
    )


def predict_label_from_case(change, volume, trend_score):
    score = score_uploaded_model(change, volume, trend_score)

    if change <= STRONG_BEARISH_CHANGE and trend_score < STRONG_BEARISH_TREND_CAP:
        return "Bearish"
    if change >= STRONG_BULLISH_CHANGE and trend_score >= STRONG_BULLISH_TREND:
        return "Bullish"
    if score > BULLISH_SCORE_THRESHOLD:
        return "Bullish"
    if score < BEARISH_SCORE_THRESHOLD:
        return "Bearish"
    return "Neutral"


def init_db():
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS custom_trends (
                id TEXT PRIMARY KEY,
                coin_id TEXT NOT NULL,
                name TEXT NOT NULL,
                asset TEXT NOT NULL,
                code TEXT NOT NULL UNIQUE,
                trend_score INTEGER NOT NULL,
                prediction TEXT NOT NULL,
                trust_score TEXT NOT NULL,
                confidence INTEGER NOT NULL,
                growth TEXT NOT NULL,
                participants TEXT NOT NULL,
                views TEXT NOT NULL,
                clicks TEXT NOT NULL,
                mentions TEXT NOT NULL,
                volume TEXT NOT NULL,
                market_cap TEXT NOT NULL,
                price REAL NOT NULL,
                status TEXT NOT NULL,
                alert_type TEXT NOT NULL,
                alert_tone TEXT NOT NULL,
                description TEXT,
                heat_json TEXT NOT NULL,
                mentions_series_json TEXT NOT NULL,
                volume_series_json TEXT NOT NULL,
                source TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                handle TEXT NOT NULL UNIQUE,
                level TEXT NOT NULL,
                total_points INTEGER NOT NULL,
                win_rate INTEGER NOT NULL,
                achievements_json TEXT NOT NULL,
                activity_series_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS memberships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                event_code TEXT NOT NULL,
                joined_at TEXT NOT NULL,
                UNIQUE(user_id, event_code)
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS joins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT NOT NULL,
                joined_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS alert_reads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                alert_id TEXT NOT NULL,
                read_at TEXT NOT NULL,
                UNIQUE(user_id, alert_id)
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS backtest_cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                coin TEXT NOT NULL,
                change_pct REAL NOT NULL,
                volume REAL NOT NULL,
                trend_score INTEGER NOT NULL,
                trust_score REAL NOT NULL,
                expected_prediction TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS backtest_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                coin TEXT NOT NULL,
                scope TEXT NOT NULL,
                total_cases INTEGER NOT NULL,
                correct_cases INTEGER NOT NULL,
                accuracy_pct REAL NOT NULL,
                details_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )

        user_count = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if user_count == 0:
            for user in DEFAULT_USERS:
                connection.execute(
                    """
                    INSERT INTO users (
                        id, name, handle, level, total_points, win_rate,
                        achievements_json, activity_series_json, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        user["id"],
                        user["name"],
                        user["handle"],
                        user["level"],
                        user["total_points"],
                        user["win_rate"],
                        json.dumps(user["achievements"]),
                        json.dumps(user["activity_series"]),
                        utc_now_iso(),
                    ),
                )

        backtest_count = connection.execute("SELECT COUNT(*) FROM backtest_cases").fetchone()[0]
        if backtest_count == 0:
            for case in DEFAULT_BACKTEST_CASES:
                connection.execute(
                    """
                    INSERT INTO backtest_cases (
                        coin, change_pct, volume, trend_score, trust_score,
                        expected_prediction, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        case["coin"],
                        case["change"],
                        case["volume"],
                        case["trend_score"],
                        case["trust_score"],
                        case["expected_prediction"],
                        utc_now_iso(),
                    ),
                )


def serialize_event(event):
    stored = deepcopy(event)
    stored["heat_json"] = json.dumps(stored.pop("heat"))
    stored["mentions_series_json"] = json.dumps(stored.pop("mentionsSeries"))
    stored["volume_series_json"] = json.dumps(stored.pop("volumeSeries"))
    stored["coin_id"] = stored.pop("coinId")
    stored["trend_score"] = stored.pop("trendScore")
    stored["market_cap"] = stored.pop("marketCap")
    stored["trust_score"] = stored.pop("trustScore")
    stored["alert_type"] = stored.pop("alertType")
    stored["alert_tone"] = stored.pop("alertTone")
    stored["created_at"] = stored.pop("createdAt")
    return stored


def deserialize_event(row):
    if not row:
        return None

    return {
        "id": row["id"],
        "coinId": row["coin_id"],
        "name": row["name"],
        "asset": row["asset"],
        "code": row["code"],
        "trendScore": row["trend_score"],
        "prediction": row["prediction"],
        "trustScore": row["trust_score"],
        "confidence": row["confidence"],
        "growth": row["growth"],
        "participants": row["participants"],
        "views": row["views"],
        "clicks": row["clicks"],
        "mentions": row["mentions"],
        "volume": row["volume"],
        "marketCap": row["market_cap"],
        "price": row["price"],
        "status": row["status"],
        "alertType": row["alert_type"],
        "alertTone": row["alert_tone"],
        "description": row["description"],
        "heat": json.loads(row["heat_json"]),
        "mentionsSeries": json.loads(row["mentions_series_json"]),
        "volumeSeries": json.loads(row["volume_series_json"]),
        "source": row["source"],
        "createdAt": row["created_at"],
    }


def deserialize_user(row):
    if not row:
        return None
    return {
        "id": row["id"],
        "name": row["name"],
        "handle": row["handle"],
        "level": row["level"],
        "totalPoints": f"{row['total_points']:,}",
        "eventsJoined": "0",
        "winRate": f"{row['win_rate']}%",
        "achievements": json.loads(row["achievements_json"]),
        "activitySeries": json.loads(row["activity_series_json"]),
    }


def fetch_user(user_id=DEMO_USER_ID):
    with get_connection() as connection:
        row = connection.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return deserialize_user(row)


def create_custom_event(name, asset, description):
    base_code = "".join(ch for ch in asset.upper() if ch.isalnum())[:6] or "MEME"
    code = f"{base_code}42"
    trust_score = 0.72
    trend_score = 78
    confidence = compute_confidence(trend_score, trust_score)

    event = {
        "id": code.lower(),
        "coinId": code.lower(),
        "name": name,
        "asset": asset,
        "code": code,
        "trendScore": trend_score,
        "prediction": "Bullish",
        "trustScore": "Reliable",
        "confidence": confidence,
        "growth": "+12.4%",
        "participants": "120",
        "views": "84.0K",
        "clicks": "3.4K",
        "mentions": "11.8K",
        "volume": "$640.0K",
        "marketCap": "$2.1M",
        "price": 0,
        "status": "Fresh launch momentum",
        "alertType": "Watchlist Drift",
        "alertTone": "warning",
        "description": description,
        "heat": create_heat(trend_score, trust_score),
        "mentionsSeries": create_series(trend_score, 1),
        "volumeSeries": create_series(48, 1),
        "source": "custom",
        "createdAt": utc_now_iso(),
    }

    stored = serialize_event(event)
    columns = ", ".join(stored.keys())
    placeholders = ", ".join([":" + key for key in stored.keys()])

    with get_connection() as connection:
        connection.execute(
            f"INSERT OR REPLACE INTO custom_trends ({columns}) VALUES ({placeholders})",
            stored,
        )

    return deepcopy(event)


def list_custom_trends():
    with get_connection() as connection:
        rows = connection.execute("SELECT * FROM custom_trends ORDER BY datetime(created_at) DESC").fetchall()
    return [deserialize_event(row) for row in rows]


def find_custom_trend(identifier):
    normalized = (identifier or "").lower()
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT * FROM custom_trends
            WHERE lower(id) = ? OR lower(code) = ? OR lower(coin_id) = ?
            LIMIT 1
            """,
            (normalized, normalized, normalized),
        ).fetchone()
    return deserialize_event(row)


def get_membership_count(code):
    with get_connection() as connection:
        row = connection.execute(
            "SELECT COUNT(*) FROM memberships WHERE upper(event_code) = ?",
            (code.upper(),),
        ).fetchone()
    return row[0] if row else 0


def sync_custom_trend_participants(code):
    event = find_custom_trend(code)
    if not event:
        return None

    membership_count = get_membership_count(code)
    base_count = max(120, int(parse_compact_number(event["participants"])))
    event["participants"] = compact_number(base_count + membership_count)
    stored = serialize_event(event)
    assignments = ", ".join([f"{key} = :{key}" for key in stored.keys() if key != "id"])

    with get_connection() as connection:
        connection.execute(f"UPDATE custom_trends SET {assignments} WHERE id = :id", stored)

    return event


def bump_user_after_join(user_id=DEMO_USER_ID):
    with get_connection() as connection:
        row = connection.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            return

        activity_series = json.loads(row["activity_series_json"])
        next_value = (activity_series[-1] if activity_series else 20) + 3
        updated_series = (activity_series + [next_value])[-7:]

        connection.execute(
            """
            UPDATE users
            SET total_points = total_points + 120,
                activity_series_json = ?,
                win_rate = MIN(99, win_rate + 1)
            WHERE id = ?
            """,
            (json.dumps(updated_series), user_id),
        )


def join_trend(code, user_id=DEMO_USER_ID):
    normalized = (code or "").upper()
    joined_at = utc_now_iso()

    with get_connection() as connection:
        connection.execute("INSERT INTO joins (code, joined_at) VALUES (?, ?)", (normalized, joined_at))
        cursor = connection.execute(
            """
            INSERT OR IGNORE INTO memberships (user_id, event_code, joined_at)
            VALUES (?, ?, ?)
            """,
            (user_id, normalized, joined_at),
        )
        created_membership = cursor.rowcount > 0

    if created_membership:
        bump_user_after_join(user_id)
        sync_custom_trend_participants(normalized)

    return {
        "success": True,
        "joined": True,
        "code": normalized,
        "mocked": False,
        "alreadyJoined": not created_membership,
    }


def get_leaderboard():
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, name, total_points, level
            FROM users
            ORDER BY total_points DESC, name ASC
            LIMIT 20
            """
        ).fetchall()

    entries = []
    for index, row in enumerate(rows, start=1):
        entries.append(
            {
                "rank": index,
                "name": row["name"],
                "points": f"{row['total_points']:,}",
                "badge": row["level"],
            }
        )
    return entries


def get_profile(user_id=DEMO_USER_ID):
    profile = fetch_user(user_id)
    if not profile:
        return None

    with get_connection() as connection:
        joined_count = connection.execute(
            "SELECT COUNT(*) FROM memberships WHERE user_id = ?",
            (user_id,),
        ).fetchone()[0]

    profile["eventsJoined"] = str(joined_count)
    return profile


def mark_alerts_read(alert_ids, user_id=DEMO_USER_ID):
    ids = [alert_id for alert_id in alert_ids if alert_id]
    if not ids:
        return 0

    with get_connection() as connection:
        for alert_id in ids:
            connection.execute(
                """
                INSERT OR REPLACE INTO alert_reads (user_id, alert_id, read_at)
                VALUES (?, ?, ?)
                """,
                (user_id, alert_id, utc_now_iso()),
            )
    return len(ids)


def _fetch_backtest_cases(coin=None):
    with get_connection() as connection:
        if coin:
            rows = connection.execute(
                "SELECT * FROM backtest_cases WHERE upper(coin) = ? ORDER BY id ASC",
                (coin.upper(),),
            ).fetchall()
        else:
            rows = connection.execute("SELECT * FROM backtest_cases ORDER BY id ASC").fetchall()
    return rows


def run_backtest(coin=None):
    rows = _fetch_backtest_cases(coin)
    scope = "coin" if coin and rows else "global"
    if not rows and coin:
        rows = _fetch_backtest_cases()

    details = []
    correct = 0
    for row in rows:
        predicted = predict_label_from_case(row["change_pct"], row["volume"], row["trend_score"])
        is_correct = predicted == row["expected_prediction"]
        if is_correct:
            correct += 1
        details.append(
            {
                "coin": row["coin"],
                "predicted": predicted,
                "expected": row["expected_prediction"],
                "correct": is_correct,
                "changePct": row["change_pct"],
                "trendScore": row["trend_score"],
                "trustScore": row["trust_score"],
            }
        )

    total = len(details)
    accuracy = round((correct / total) * 100, 1) if total else 0.0
    summary = {
        "coin": coin.upper() if coin else "ALL",
        "scope": scope,
        "totalCases": total,
        "correctCases": correct,
        "accuracyPct": accuracy,
        "details": details,
        "measuredAt": utc_now_iso(),
    }

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO backtest_runs (
                coin, scope, total_cases, correct_cases, accuracy_pct, details_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                summary["coin"],
                scope,
                total,
                correct,
                accuracy,
                json.dumps(details),
                summary["measuredAt"],
            ),
        )

    return summary


def get_accuracy_summary(coin=None):
    upper_coin = coin.upper() if coin else None
    rows = _fetch_backtest_cases(upper_coin)
    if len(rows) < 2:
        rows = _fetch_backtest_cases()
        scope = "global"
        display_coin = "ALL"
    else:
        scope = "coin"
        display_coin = upper_coin

    total = len(rows)
    if total == 0:
        return None

    correct = 0
    for row in rows:
        predicted = predict_label_from_case(row["change_pct"], row["volume"], row["trend_score"])
        if predicted == row["expected_prediction"]:
            correct += 1

    accuracy = round((correct / total) * 100, 1)
    return {
        "coin": display_coin,
        "scope": scope,
        "totalCases": total,
        "correctCases": correct,
        "accuracyPct": accuracy,
    }


def get_database_summary():
    with get_connection() as connection:
        trends = connection.execute("SELECT COUNT(*) FROM custom_trends").fetchone()[0]
        users = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        memberships = connection.execute("SELECT COUNT(*) FROM memberships").fetchone()[0]
        alert_reads = connection.execute("SELECT COUNT(*) FROM alert_reads").fetchone()[0]
        backtest_cases = connection.execute("SELECT COUNT(*) FROM backtest_cases").fetchone()[0]
        backtest_runs = connection.execute("SELECT COUNT(*) FROM backtest_runs").fetchone()[0]

    return {
        "database": str(DB_PATH),
        "customTrends": trends,
        "users": users,
        "memberships": memberships,
        "alertReads": alert_reads,
        "backtestCases": backtest_cases,
        "backtestRuns": backtest_runs,
    }


init_db()
