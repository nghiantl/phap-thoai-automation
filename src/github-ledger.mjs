// Durable GitHub repository issue-based claims prevent duplicate scheduled attempts.
// A unique per-slot issue title is NOT atomic on GitHub; fail closed for publishing until
// a transactional store with unique-key insertion is configured.
export function createSafeLedger() {
 return {
   async claim() {throw Error("No atomic durable ledger configured; live publishing blocked");},
   async finish() {throw Error("No durable ledger configured")}
 };
}
