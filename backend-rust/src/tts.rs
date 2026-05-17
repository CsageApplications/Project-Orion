use anyhow::{bail, Result};
use serde_json::json;

use crate::config::Config;

#[derive(Clone)]
pub struct TtsClient {
    client: reqwest::Client,
    api_key: Option<String>,
    voice_id: String,
}

impl TtsClient {
    pub fn new(config: &Config) -> Self {
        Self {
            client: reqwest::Client::new(),
            api_key: config.elevenlabs_api_key.clone(),
            voice_id: config.elevenlabs_voice_id.clone(),
        }
    }

    /// Synthesise `text` and return raw MP3 bytes.
    pub async fn synthesise(&self, text: &str) -> Result<Vec<u8>> {
        let key = self
            .api_key
            .as_deref()
            .ok_or_else(|| anyhow::anyhow!("ELEVENLABS_API_KEY not set"))?;

        let url = format!(
            "https://api.elevenlabs.io/v1/text-to-speech/{}",
            self.voice_id
        );

        let body = json!({
            "text": text,
            "model_id": "eleven_turbo_v2_5",
            "voice_settings": {
                "stability": 0.45,
                "similarity_boost": 0.80,
                "style": 0.15,
                "use_speaker_boost": true
            }
        });

        let res = self
            .client
            .post(&url)
            .header("xi-api-key", key)
            .header("Content-Type", "application/json")
            .header("Accept", "audio/mpeg")
            .json(&body)
            .send()
            .await?;

        if !res.status().is_success() {
            let status = res.status();
            let body = res.text().await.unwrap_or_default();
            bail!("ElevenLabs error {status}: {body}");
        }

        let bytes = res.bytes().await?;
        Ok(bytes.to_vec())
    }
}
