use chrono::Utc;
use serde::Serialize;

use crate::api::RobotStatus;

impl RobotStatus {
    pub fn default_state() -> Self {
        Self {
            id: "orion-1".to_string(),
            state: "STANDBY".to_string(),
            battery_pct: 100,
            task: None,
            online: false,
            timestamp: Utc::now().to_rfc3339(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct TelemetryEvent {
    pub event_type: String,
    pub message: String,
    pub timestamp: String,
}

impl TelemetryEvent {
    pub fn new(event_type: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            event_type: event_type.into(),
            message: message.into(),
            timestamp: Utc::now().to_rfc3339(),
        }
    }
}
