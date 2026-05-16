use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use chrono::Utc;
use uuid::Uuid;

use crate::{error::AppResult, AppState};

// ─── Health ───────────────────────────────────────────────────────────────────

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: &'static str,
    pub version: &'static str,
    pub timestamp: String,
}

pub async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        version: env!("CARGO_PKG_VERSION"),
        timestamp: Utc::now().to_rfc3339(),
    })
}

// ─── Robot Status ─────────────────────────────────────────────────────────────

#[derive(Serialize, Clone)]
pub struct RobotStatus {
    pub id: String,
    pub state: String,
    pub battery_pct: u8,
    pub task: Option<String>,
    pub online: bool,
    pub timestamp: String,
}

pub async fn get_robot_status(State(state): State<AppState>) -> Json<RobotStatus> {
    let status = state.robot_state.read().await;
    Json(status.clone())
}

// ─── Robot Commands ───────────────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct CommandRequest {
    pub command: String,
    pub params: Option<serde_json::Value>,
}

#[derive(Serialize)]
pub struct CommandResponse {
    pub id: String,
    pub command: String,
    pub status: &'static str,
    pub message: String,
}

pub async fn send_command(
    State(state): State<AppState>,
    Json(req): Json<CommandRequest>,
) -> AppResult<Json<CommandResponse>> {
    let command = req.command.to_uppercase();

    let allowed = ["PATROL", "DOCK", "FOLLOW", "STOP", "SLEEP", "WAKE"];
    if !allowed.contains(&command.as_str()) {
        return Err(crate::error::AppError::BadRequest(
            format!("Unknown command: {command}"),
        ));
    }

    tracing::info!(command = %command, "Robot command received");

    // Update robot state
    {
        let mut robot = state.robot_state.write().await;
        robot.task = Some(command.clone());
        robot.state = match command.as_str() {
            "STOP" | "DOCK" | "SLEEP" => "IDLE".to_string(),
            _ => "ACTIVE".to_string(),
        };
    }

    // Broadcast updated state to WebSocket clients
    let status = state.robot_state.read().await.clone();
    let _ = state.ws_tx.send(serde_json::to_string(&serde_json::json!({
        "type": "robot_state",
        "data": status,
    })).unwrap_or_default());

    Ok(Json(CommandResponse {
        id: Uuid::new_v4().to_string(),
        command,
        status: "queued",
        message: "Command queued for execution".to_string(),
    }))
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub conversation_id: Option<String>,
}

#[derive(Serialize)]
pub struct ChatResponse {
    pub id: String,
    pub conversation_id: String,
    pub message: String,
    pub role: &'static str,
    pub timestamp: String,
}

pub async fn chat(
    State(state): State<AppState>,
    Json(req): Json<ChatRequest>,
) -> AppResult<Json<ChatResponse>> {
    let conversation_id = req
        .conversation_id
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    tracing::info!(conversation_id = %conversation_id, "Chat request received");

    let reply = state
        .llm
        .complete(&req.message)
        .await
        .map_err(|e| crate::error::AppError::Llm(e.to_string()))?;

    Ok(Json(ChatResponse {
        id: Uuid::new_v4().to_string(),
        conversation_id,
        message: reply,
        role: "assistant",
        timestamp: Utc::now().to_rfc3339(),
    }))
}
