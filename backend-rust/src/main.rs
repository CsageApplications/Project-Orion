use std::sync::Arc;
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
mod ws;

use api::RobotStatus;
use config::Config;
use llm::LlmClient;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub robot_state: Arc<RwLock<RobotStatus>>,
    pub ws_tx: broadcast::Sender<String>,
    pub llm: Arc<LlmClient>,
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
        // WebSocket
        .route("/ws", get(ws::ws_handler))
        .with_state(state)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let addr = format!("{}:{}", config.host, config.port);
    tracing::info!("Listening on http://{addr}");

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
