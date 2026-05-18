use std::env;
use anyhow::Result;

#[derive(Debug, Clone)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub jwt_secret: String,
    pub openai_api_key: Option<String>,
    pub anthropic_api_key: Option<String>,
    pub llm_provider: LlmProvider,
    pub llm_model: String,
    pub frontend_origin: String,
    pub elevenlabs_api_key: Option<String>,
    pub elevenlabs_voice_id: String,
}

#[derive(Debug, Clone)]
pub enum LlmProvider {
    OpenAi,
    Anthropic,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        dotenvy::dotenv().ok();

        let llm_provider = match env::var("LLM_PROVIDER")
            .unwrap_or_else(|_| "openai".to_string())
            .to_lowercase()
            .as_str()
        {
            "anthropic" => LlmProvider::Anthropic,
            _ => LlmProvider::OpenAi,
        };

        Ok(Self {
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()?,
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgres://orion:password@localhost:5432/orion".to_string()),
            jwt_secret: env::var("JWT_SECRET")
                .unwrap_or_else(|_| "dev_secret_change_in_production".to_string()),
            openai_api_key: env::var("OPENAI_API_KEY").ok(),
            anthropic_api_key: env::var("ANTHROPIC_API_KEY").ok(),
            llm_model: env::var("LLM_MODEL")
                .unwrap_or_else(|_| "gpt-4o".to_string()),
            llm_provider,
            frontend_origin: env::var("FRONTEND_ORIGIN")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),
            elevenlabs_api_key: env::var("ELEVENLABS_API_KEY").ok(),
            elevenlabs_voice_id: env::var("ELEVENLABS_VOICE_ID")
                .unwrap_or_else(|_| "pNInz6obpgDQGcFmaJgB".to_string()), // Adam
        })
    }
}
