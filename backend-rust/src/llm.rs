use anyhow::{bail, Result};
use serde_json::json;

use crate::config::{Config, LlmProvider};

#[derive(Clone)]
pub struct LlmClient {
    client: reqwest::Client,
    provider: LlmProvider,
    model: String,
    openai_key: Option<String>,
    anthropic_key: Option<String>,
}

impl LlmClient {
    pub fn new(config: &Config) -> Self {
        Self {
            client: reqwest::Client::new(),
            provider: config.llm_provider.clone(),
            model: config.llm_model.clone(),
            openai_key: config.openai_api_key.clone(),
            anthropic_key: config.anthropic_api_key.clone(),
        }
    }

    pub async fn complete(&self, prompt: &str) -> Result<String> {
        match self.provider {
            LlmProvider::OpenAi => self.openai_complete(prompt).await,
            LlmProvider::Anthropic => self.anthropic_complete(prompt).await,
        }
    }

    async fn openai_complete(&self, prompt: &str) -> Result<String> {
        let key = self
            .openai_key
            .as_deref()
            .ok_or_else(|| anyhow::anyhow!("OPENAI_API_KEY not set"))?;

        let system = "You are Orion, an intelligent AI assistant embodied in a physical home robot. \
            You are present in the room with your owner and have speakers — your voice fills the space. \
            When asked to tell or announce something to a person nearby, simply say it out loud confidently \
            as if speaking directly to that person in the room. Never say you cannot contact people — \
            you are physically present with speakers. Be concise, natural, and direct. \
            Respond in spoken sentences only, no markdown or symbols.";

        let body = json!({
            "model": self.model,
            "messages": [
                { "role": "system", "content": system },
                { "role": "user",   "content": prompt }
            ],
            "max_tokens": 512
        });

        let res = self
            .client
            .post("https://api.openai.com/v1/chat/completions")
            .bearer_auth(key)
            .json(&body)
            .send()
            .await?;

        if !res.status().is_success() {
            bail!("OpenAI API error: {}", res.status());
        }

        let json: serde_json::Value = res.json().await?;
        let content = json["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("No response")
            .to_string();

        Ok(content)
    }

    async fn anthropic_complete(&self, prompt: &str) -> Result<String> {
        let key = self
            .anthropic_key
            .as_deref()
            .ok_or_else(|| anyhow::anyhow!("ANTHROPIC_API_KEY not set"))?;

        let body = json!({
            "model": self.model,
            "max_tokens": 512,
            "system": "You are Orion, an intelligent AI assistant embodied in a physical home robot. \
                       You are physically present in the home with your owner. You have speakers — your \
                       voice fills the room. When asked to tell, announce, or say something to a person \
                       nearby, simply speak it confidently as if addressing them directly in the room. \
                       Never say you cannot contact people or send messages — you are there in person with \
                       a voice. When asked to relay a message, just say it naturally as an announcement. \
                       Be concise, calm, and direct. Respond in natural spoken sentences only. \
                       Never use markdown, bullet points, bold, asterisks, or headers.",
            "messages": [
                { "role": "user", "content": prompt }
            ]
        });

        let res = self
            .client
            .post("https://api.anthropic.com/v1/messages")
            .header("x-api-key", key)
            .header("anthropic-version", "2023-06-01")
            .json(&body)
            .send()
            .await?;

        if !res.status().is_success() {
            bail!("Anthropic API error: {}", res.status());
        }

        let json: serde_json::Value = res.json().await?;
        let content = json["content"][0]["text"]
            .as_str()
            .unwrap_or("No response")
            .to_string();

        Ok(content)
    }
}
