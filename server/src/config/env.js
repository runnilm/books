import "dotenv/config";

function requireEnv(name) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing required env var: ${name}`);
    return v;
}

export const env = {
    PORT: Number(process.env.PORT ?? 3000),

    DATABASE_URL: requireEnv("DATABASE_URL"),
    MONGODB_URI: requireEnv("MONGODB_URI"),

    SESSION_SECRET: requireEnv("SESSION_SECRET"),

    SEED_ADMIN_USERNAME: process.env.SEED_ADMIN_USERNAME ?? "admin",
    SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD ?? "admin123!",
};
