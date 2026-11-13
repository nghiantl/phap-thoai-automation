export function assertDraftMode(env = process.env) {
  if (env.AUTO_PUBLISH_ENABLED !== "false") {
    throw new Error("Phase D requires AUTO_PUBLISH_ENABLED=false");
  }
}
export function envValue(name, env = process.env) {
  const value = env[name];
  if (!value) throw new Error("Missing environment variable: " + name);
  return value;
}
