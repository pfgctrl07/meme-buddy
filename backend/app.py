import os
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS

from demo_store import (
    predict_label_from_case,
    create_custom_event,
    create_heat,
    create_series,
    compact_number,
    compute_alert,
    compute_confidence,
    get_database_summary,
    get_accuracy_summary,
    find_custom_trend,
    get_leaderboard,
    get_profile,
    join_trend,
    list_custom_trends,
    mark_alerts_read,
    run_backtest,
    utc_now_iso,
)

ROOT = os.path.dirname(os.path.abspath(__file__))
EXTRACTED_BACKEND = os.path.join(
    os.path.dirname(ROOT),
    "backend_inspect",
    "meme-main",
    "meme-coin-predictor",
)

if EXTRACTED_BACKEND not in sys.path:
    sys.path.append(EXTRACTED_BACKEND)

try:
    from model import predict_coin  # type: ignore
    from data.coingecko import get_trending_coins  # type: ignore
except Exception:  # pragma: no cover - graceful fallback when dependencies are missing
    predict_coin = None

    def get_trending_coins():
        return ["pepe", "dogecoin", "shiba-inu"]


DEFAULT_COINS = ["pepe", "dogecoin", "shiba-inu", "bitcoin", "ethereum", "solana"]


app = Flask(__name__)
CORS(app)


def compute_model_score(change, volume, trend_score):
    sentiment = (change / 100) + (trend_score / 100)
    return (
        0.4 * sentiment +
        0.3 * (volume / 100000000) +
        0.3 * (trend_score / 100)
    )


def build_accuracy_summary(coin=None, source_error=None, source_type="uploaded_api"):
    benchmark = get_accuracy_summary(coin)

    if source_error:
        return {
            "label": f"{benchmark['accuracyPct']}% benchmark" if benchmark else "Fallback",
            "value": benchmark["accuracyPct"] if benchmark else None,
            "status": "measured_with_fallback" if benchmark else "unverified",
            "scope": benchmark["scope"] if benchmark else None,
            "sampleSize": benchmark["totalCases"] if benchmark else 0,
            "note": (
                f"Live market APIs were unavailable, so this prediction used the fallback simulator. "
                f"The model rules are benchmarked at {benchmark['accuracyPct']}% across {benchmark['totalCases']} stored cases."
                if benchmark
                else "Live market APIs were unavailable, so this prediction is based on the local fallback simulator."
            ),
        }

    if source_type == "custom_event":
        return {
            "label": "Simulated",
            "value": None,
            "status": "prototype",
            "note": "Custom events use the prototype simulator until enough real outcome data exists to benchmark accuracy.",
        }

    if benchmark:
        return {
            "label": f"{benchmark['accuracyPct']}%",
            "value": benchmark["accuracyPct"],
            "status": "measured",
            "scope": benchmark["scope"],
            "sampleSize": benchmark["totalCases"],
            "note": f"Hackathon benchmark based on {benchmark['totalCases']} stored cases scored with the uploaded model rules.",
        }

    return {
        "label": "Unverified",
        "value": None,
        "status": "needs_backtest",
        "note": "The uploaded API returns live heuristic predictions, but it does not include a historical benchmark dataset, so true accuracy is unknown.",
    }


def build_prediction_analysis(coin, data):
    source_error = data.get("sourceError")
    change = float(data.get("change", 0))
    trend_score = int(data.get("trend_score", 50))
    trust_score_numeric = float(data.get("trust_score", 0.5))
    volume = float(data.get("volume", 0))
    weighted_score = compute_model_score(change, volume, trend_score)
    calibrated_prediction = predict_label_from_case(change, volume, trend_score)

    return {
        "engine": "uploaded_meme_coin_api",
        "source": "fallback_simulator" if source_error else "uploaded_api",
        "usedFallback": bool(source_error),
        "coin": (coin or data.get("coin") or "").upper(),
        "priceChangePct": round(change, 2),
        "trendScoreRaw": trend_score,
        "trustScoreRaw": round(trust_score_numeric, 2),
        "volumeRaw": round(volume),
        "marketCapRaw": round(float(data.get("market_cap", 0))),
        "weightedScore": round(weighted_score, 3),
        "calibratedPrediction": calibrated_prediction,
        "rawModelPrediction": data.get("prediction", "Neutral"),
        "spike": data.get("spike", "Normal"),
        "verdict": data.get("verdict", "Organic"),
        "accuracy": build_accuracy_summary(coin=coin, source_error=source_error),
    }


def build_custom_event_analysis(event):
    weighted_score = round(((event["trendScore"] / 100) * 0.7) + ((event["confidence"] / 100) * 0.3), 3)
    return {
        "engine": "custom_event_simulator",
        "source": "custom_event",
        "usedFallback": False,
        "coin": event["code"],
        "priceChangePct": float(str(event["growth"]).replace("%", "")),
        "trendScoreRaw": event["trendScore"],
        "trustScoreRaw": 0.72 if event["trustScore"] == "Reliable" else 0.35,
        "volumeRaw": 0,
        "marketCapRaw": 0,
        "weightedScore": weighted_score,
        "spike": event["status"],
        "verdict": "Organic" if event["trustScore"] == "Reliable" else "Overhyped",
        "accuracy": build_accuracy_summary(coin=event["code"], source_type="custom_event"),
    }


def normalize_prediction(coin, data):
    raw_coin = (coin or data.get("coin") or "coin").lower()
    upper_coin = raw_coin.upper()
    change = float(data.get("change", 0))
    trend_score = int(data.get("trend_score", 50))
    trust_score_numeric = float(data.get("trust_score", 0.5))
    confidence = compute_confidence(trend_score, trust_score_numeric)
    trust_label = data.get("trust_label", "Moderate")
    calibrated_prediction = predict_label_from_case(change, float(data.get("volume", 0)), trend_score)

    if "Weak" in trust_label:
        trust_score = "Overhyped"
    elif "Strong" in trust_label or "Moderate" in trust_label:
        trust_score = "Reliable"
    else:
        trust_score = trust_label

    alert_type, alert_tone, backend_alert = compute_alert(change, trend_score)

    return {
        "id": raw_coin,
        "coinId": raw_coin,
        "name": f"{upper_coin} Signal",
        "asset": f"${upper_coin}",
        "code": upper_coin,
        "trendScore": trend_score,
        "prediction": calibrated_prediction,
        "trustScore": trust_score,
        "confidence": confidence,
        "growth": f"{change:+.1f}%",
        "participants": compact_number(float(data.get("market_cap", 0)) / 250000),
        "views": compact_number(float(data.get("market_cap", 0)) / 12),
        "clicks": compact_number(float(data.get("volume", 0)) / 150),
        "mentions": compact_number(float(data.get("volume", 0)) / 40),
        "volume": f"${compact_number(data.get('volume', 0))}",
        "marketCap": f"${compact_number(data.get('market_cap', 0))}",
        "price": round(float(data.get("price", 0)), 4),
        "status": data.get("spike") or data.get("verdict") or "Organic",
        "alertType": alert_type,
        "alertTone": alert_tone,
        "heat": create_heat(trend_score, trust_score_numeric),
        "mentionsSeries": create_series(trend_score, 1 if change >= 0 else -1),
        "volumeSeries": create_series(abs(change) * 3 + trust_score_numeric * 40, 1 if change >= 0 else -1),
        "rawPrediction": data,
        "rawModelPrediction": data.get("prediction", "Neutral"),
        "backendAlert": backend_alert,
        "analysis": build_prediction_analysis(coin, data),
    }


def get_coin_prediction(coin):
    fallback = {
        "coin": coin.upper(),
        "price": 0.0012,
        "change": 7.4 if coin.lower() in {"pepe", "dogecoin", "solana"} else 3.1,
        "volume": 42000000,
        "market_cap": 120000000,
        "trend_score": 82 if coin.lower() in {"pepe", "dogecoin"} else 68,
        "spike": "Trend Surge",
        "trust_score": 0.71,
        "trust_label": "Strong & Reliable",
        "prediction": "Bullish" if coin.lower() in {"pepe", "dogecoin", "solana"} else "Neutral",
        "verdict": "Organic",
    }

    if predict_coin is None:
        return fallback

    data = predict_coin(coin)
    if "error" in data:
        return {
            **fallback,
            "sourceError": data["error"],
        }
    return data


def get_event(identifier):
    custom = find_custom_trend(identifier)
    if custom:
        return {
            **custom,
            "analysis": build_custom_event_analysis(custom),
        }

    data = get_coin_prediction(identifier)
    if "error" in data:
        return None
    return normalize_prediction(identifier, data)


def build_alert_item(event):
    return {
        "id": f"{event['code']}-{event['alertType']}",
        "title": event["name"],
        "type": "Buy" if event["alertTone"] == "success" else "Sell" if event["alertTone"] == "danger" else "Spike",
        "detail": event["alertType"],
        "timestamp": "Live",
        "urgency": "high" if event["alertTone"] == "success" else "critical" if event["alertTone"] == "danger" else "medium",
    }


def get_live_events(limit=5):
    source_coins = get_trending_coins() or DEFAULT_COINS
    trending = []
    for coin in source_coins[:limit]:
        event = get_event(coin)
        if event:
            trending.append(event)
    return list_custom_trends() + trending


@app.route("/")
def home():
    return jsonify({"message": "Meme Buddy API running", "status": "ok"})


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/trending")
def trending():
    coins = get_trending_coins() or DEFAULT_COINS
    return jsonify({"trending": coins})


@app.route("/predict/<coin>")
def predict(coin):
    data = get_coin_prediction(coin)
    if "error" in data:
        return jsonify({"status": "error", "message": data["error"]}), 404
    return jsonify({"status": "success", "data": data})


@app.route("/alert/<coin>")
def alert(coin):
    data = get_coin_prediction(coin)
    if "error" in data:
        return jsonify({"status": "error", "message": data["error"]}), 404

    _, _, alert_message = compute_alert(float(data["change"]), int(data["trend_score"]))
    return jsonify({"coin": coin, "alert": alert_message, "data": data})


@app.route("/api/dashboard")
def api_dashboard():
    events = get_live_events(limit=3)
    active_event = events[0] if events else None
    return jsonify(
        {
            "stats": [
                {"label": "Views", "value": active_event["views"], "detail": active_event["marketCap"], "icon": "eye-outline", "tone": "#3EC8FF"},
                {"label": "Clicks", "value": active_event["clicks"], "detail": active_event["status"], "icon": "navigate-outline", "tone": "#5B7CFF"},
                {"label": "Mentions", "value": active_event["mentions"], "detail": active_event["volume"], "icon": "megaphone-outline", "tone": "#8A5CFF"},
                {"label": "Confidence", "value": f"{active_event['confidence']}%", "detail": active_event["trustScore"], "icon": "pulse-outline", "tone": "#39D98A"},
            ]
            if active_event
            else [],
            "trendingEvents": events,
            "leaderboardPreview": get_leaderboard()[:3],
            "alertsPreview": [build_alert_item(event) for event in events[:2]],
            "activeEvent": active_event,
        }
    )


@app.route("/api/discovery")
def api_discovery():
    sort = request.args.get("sort", "top_gaining")
    items = [
        {
            "id": event["id"],
            "coinId": event["coinId"],
            "code": event["code"],
            "name": event["name"],
            "asset": event["asset"],
            "symbol": event["asset"],
            "score": event["trendScore"],
            "growth": event["growth"],
            "prediction": event["prediction"],
            "trust": event["trustScore"],
            "activity": event["status"],
        }
        for event in get_live_events(limit=6)
    ]

    if sort == "most_active":
        items.sort(key=lambda item: item["score"], reverse=True)
    elif sort == "high_trust":
        items.sort(key=lambda item: 0 if item["trust"] == "Reliable" else 1)
    else:
        items.sort(key=lambda item: float(item["growth"].replace("%", "")), reverse=True)

    return jsonify(items)


@app.route("/api/alerts")
def api_alerts():
    events = get_live_events(limit=5)
    return jsonify([build_alert_item(event) for event in events])


@app.route("/api/alerts/read", methods=["POST"])
def api_alerts_read():
    payload = request.get_json(silent=True) or {}
    count = mark_alerts_read(payload.get("ids", []))
    return jsonify({"success": True, "read": True, "count": count})


@app.route("/api/trends", methods=["POST"])
def api_create_trend():
    payload = request.get_json(silent=True) or {}
    event = create_custom_event(
        payload.get("name", "Demo Trend"),
        payload.get("asset", "$DEMO"),
        payload.get("description", ""),
    )
    return jsonify({"success": True, "created": True, "event": event}), 201


@app.route("/api/trends/join", methods=["POST"])
def api_join_trend():
    payload = request.get_json(silent=True) or {}
    code = payload.get("code", "").strip()
    if not code:
        return jsonify({"success": False, "message": "Event code is required"}), 400
    event = get_event(code)
    if not event:
        return jsonify({"success": False, "message": f"Trend not found: {code}"}), 404

    result = join_trend(code)
    return jsonify({**result, "event": event})


@app.route("/api/trends/<identifier>")
def api_trend_detail(identifier):
    event = get_event(identifier)
    if not event:
        return jsonify({"success": False, "message": f"Trend not found: {identifier}"}), 404
    return jsonify(event)


@app.route("/api/trends/<identifier>/analytics")
def api_trend_analytics(identifier):
    event = get_event(identifier)
    if not event:
        return jsonify({"success": False, "message": f"Trend not found: {identifier}"}), 404
    return jsonify(
        {
            "mentionsSeries": event["mentionsSeries"],
            "volumeSeries": event["volumeSeries"],
            "heat": event["heat"],
        }
    )


@app.route("/api/trends/<identifier>/leaderboard")
def api_trend_leaderboard(identifier):
    if not get_event(identifier):
        return jsonify({"success": False, "message": f"Trend not found: {identifier}"}), 404
    return jsonify(get_leaderboard())


@app.route("/api/leaderboard")
def api_leaderboard():
    return jsonify(get_leaderboard())


@app.route("/api/profile/me")
def api_profile():
    profile = get_profile()
    return jsonify(profile or {})


@app.route("/api/profile/me/activity")
def api_profile_activity():
    profile = get_profile()
    return jsonify({"activitySeries": profile["activitySeries"] if profile else []})


@app.route("/api/db/status")
def api_db_status():
    return jsonify(get_database_summary())


@app.route("/api/backtest")
@app.route("/api/backtest/<coin>")
def api_backtest(coin=None):
    return jsonify(run_backtest(coin))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5001"))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
