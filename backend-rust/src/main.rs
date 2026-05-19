use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::{broadcast, RwLock};
use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

mod api;
mod config;
mod db;
mod error;
mod llm;
mod robot;
mod stt;
mod tts;
mod ws;

use api::RobotStatus;
use config::Config;
use llm::LlmClient;
use stt::SttClient;
use tts::TtsClient;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub robot_state: Arc<RwLock<RobotStatus>>,
    pub ws_tx: broadcast::Sender<String>,
    pub llm: Arc<LlmClient>,
    pub tts: Arc<TtsClient>,
    pub stt: Arc<SttClient>,
    pub command_log: Arc<RwLock<Vec<api::CommandRecord>>>,
    pub chat_history: Arc<RwLock<Vec<api::ChatHistoryEntry>>>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load config
    let config = Config::from_env()?;

    // Init tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "orion=debug,tower_http=debug".into()),
        )
        .init();

    tracing::info!("Orion backend starting...");

    // Database (optional — skip if DATABASE_URL not set or unreachable)
    // let pool = db::connect(&config.database_url).await?;
    // db::run_migrations(&pool).await?;

    // WebSocket broadcast channel
    let (ws_tx, _) = ws::create_channel();

    // Build app state
    let state = AppState {
        config: Arc::new(config.clone()),
        robot_state: Arc::new(RwLock::new(RobotStatus::default_state())),
        ws_tx,
        llm: Arc::new(LlmClient::new(&config)),
        tts: Arc::new(TtsClient::new(&config)),
        stt: Arc::new(SttClient::new(&config)),
        command_log: Arc::new(RwLock::new(Vec::new())),
        chat_history: Arc::new(RwLock::new(Vec::new())),
    };

    // CORS
    let cors = CorsLayer::new()
        .allow_origin(
            config.frontend_origin.parse::<axum::http::HeaderValue>()?,
        )
        .allow_methods(Any)
        .allow_headers(Any);

    // Router
    let app = Router::new()
        // Health
        .route("/health", get(api::health))
        // Robot
        .route("/api/robot/status", get(api::get_robot_status))
        .route("/api/robot/command", post(api::send_command))
        // Chat
        .route("/api/chat", post(api::chat))
        .route("/api/chat/history", get(api::get_chat_history))
        // TTS
        .route("/api/tts", post(api::tts))
        // STT
        .route("/api/stt", post(api::stt))
        // Command history
        .route("/api/robot/commands", get(api::get_commands))
        // WebSocket
        .route("/ws", get(ws::ws_handler))
        .with_state(state.clone())
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    // ── Telemetry broadcast loop ─────────────────────────────────────
    {
        let telem = state;
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(5));
            loop {
                interval.tick().await;

                // Drain battery by 1 pct per tick (min 0)
                {
                    let mut robot = telem.robot_state.write().await;
                    if robot.battery_pct > 0 {
                        robot.battery_pct -= 1;
                    }
                    robot.timestamp = chrono::Utc::now().to_rfc3339();
                }

                let robot = telem.robot_state.read().await.clone();

                // Deterministic simulated cpu/memory based on unix seconds
                let secs = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs();
                let cpu_pct = 20u8 + (secs % 40) as u8;
                let memory_pct = 40u8 + (secs / 3 % 30) as u8;

                let msg = serde_json::to_string(&serde_json::json!({
                    "type": "telemetry",
                    "data": {
                        "battery_pct": robot.battery_pct,
                        "state": robot.state,
                        "cpu_pct": cpu_pct,
                        "memory_pct": memory_pct,
                        "timestamp": robot.timestamp,
                    }
                }))
                .unwrap_or_default();

                let _ = telem.ws_tx.send(msg);
            }
        });
    }

    let addr = format!("{}:{}", config.host, config.port);
    tracing::info!("Listening on http://{addr}");

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
