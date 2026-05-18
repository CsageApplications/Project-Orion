use anyhow::{bail, Result};
use reqwest::multipart;

use crate::config::Config;

#[derive(Clone)]
pub struct SttClient {
    client: reqwest::Client,
    api_key: Option<String>,
}

impl SttClient {
    pub fn new(config: &Config) -> Self {
        Self {
            client: reqwest::Client::new(),
            api_key: config.elevenlabs_api_key.clone(),
        }
    }

    /// Transcribe raw audio bytes (webm/mp4/wav) and return the transcript string.
    pub async fn transcribe(&self, audio: Vec<u8>, mime: &str) -> Result<String> {
        let key = self
            .api_key
            .as_deref()
            .ok_or_else(|| anyhow::anyhow!("ELEVENLABS_API_KEY not set"))?;

        // Determine file extension from mime type
        let ext = mime_to_ext(mime);

        let part = multipart::Part::bytes(audio)
            .file_name(format!("audio.{ext}"))
            .mime_str(mime)?;

        let form = multipart::Form::new()
            .text("model_id", "scribe_v1")
            .part("file", part);

        let res = self
            .client
            .post("https://api.elevenlabs.io/v1/speech-to-text")
            .header("xi-api-key", key)
            .multipart(form)
            .send()
            .await?;

        if !res.status().is_success() {
            let status = res.status();
            let body = res.text().await.unwrap_or_default();
            bail!("ElevenLabs STT error {status}: {body}");
        }

        let json: serde_json::Value = res.json().await?;
        let text = json["text"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("No 'text' field in STT response: {json}"))?
            .trim()
            .to_string();

        Ok(text)
    }
}

fn mime_to_ext(mime: &str) -> &str {
    match mime {
        "audio/webm" | "audio/webm;codecs=opus" => "webm",
        "audio/mp4" | "audio/x-m4a" => "mp4",
        "audio/ogg" | "audio/ogg;codecs=opus" => "ogg",
        "audio/wav" | "audio/wave" => "wav",
        _ => "webm", // default — browsers typically record webm
    }
}
