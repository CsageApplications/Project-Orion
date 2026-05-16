use sqlx::{postgres::PgPoolOptions, PgPool};
use anyhow::Result;

pub async fn connect(database_url: &str) -> Result<PgPool> {
    tracing::info!("Connecting to database...");

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(database_url)
        .await?;

    tracing::info!("Database connection established");
    Ok(pool)
}

pub async fn run_migrations(pool: &PgPool) -> Result<()> {
    tracing::info!("Running database migrations...");
    sqlx::migrate!("./migrations").run(pool).await?;
    tracing::info!("Migrations complete");
    Ok(())
}
