use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::IntoResponse,
};
use futures::{sink::SinkExt, stream::StreamExt};
use tokio::sync::broadcast;

use crate::AppState;

pub fn create_channel() -> (broadcast::Sender<String>, broadcast::Receiver<String>) {
    broadcast::channel(64)
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: AppState) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.ws_tx.subscribe();

    // Send initial robot state on connect
    let initial = state.robot_state.read().await.clone();
    let msg = serde_json::to_string(&serde_json::json!({
        "type": "robot_state",
        "data": initial,
    }))
    .unwrap_or_default();

    if sender.send(Message::Text(msg.into())).await.is_err() {
        return;
    }

    tracing::info!("WebSocket client connected");

    // Spawn task to forward broadcast messages to this client
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if sender.send(Message::Text(msg.into())).await.is_err() {
                break;
            }
        }
    });

    // Handle incoming messages from the client
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Text(text) => {
                    tracing::debug!("WS received: {text}");
                }
                Message::Close(_) => break,
                Message::Ping(_) => {}
                _ => {}
            }
        }
    });

    // If either task exits, abort the other
    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    }

    tracing::info!("WebSocket client disconnected");
}
