// PostgreSQL-backed, durable per-slot claims. Database must enforce PRIMARY KEY (slot_key).
// UNKNOWN is terminal until a human reconciles Facebook state. Never auto-retry a claimed slot.
const STATES=new Set(["PENDING","PROCESSING","PUBLISHED","FAILED","UNKNOWN"]);
export function createPublishingLedger(db) {
 if(!db||typeof db.query!=="function") throw Error("PostgreSQL query client required");
 return {
   async claim(key) {
     if(!/^\d{4}-\d{2}-\d{2}-(morning|evening)$/.test(key)) throw Error("Invalid slot key");
     const result=await db.query(
       "INSERT INTO facebook_publish_ledger(slot_key,status) VALUES($1,'PROCESSING') ON CONFLICT(slot_key) DO NOTHING RETURNING slot_key",
       [key]);
     return result.rows.length===1;
   },
   async finish(key,{status,photoId=null,postId=null}={}) {
     if(!STATES.has(status)||status==="PROCESSING"||status==="PENDING") throw Error("Invalid terminal status");
     const result=await db.query(
       "UPDATE facebook_publish_ledger SET status=$2,photo_id=$3,post_id=$4,updated_at=NOW() WHERE slot_key=$1 AND status='PROCESSING' RETURNING slot_key",
       [key,status,photoId,postId]);
     if(result.rows.length!==1) throw Error("Ledger finish rejected; reconcile manually");
   },
   async markUnknown(key) {
     const result=await db.query(
       "UPDATE facebook_publish_ledger SET status='UNKNOWN',updated_at=NOW() WHERE slot_key=$1 AND status='PROCESSING' RETURNING slot_key",
       [key]);
     return result.rows.length===1;
   },
   async status(key) {
     const result=await db.query("SELECT status,photo_id,post_id FROM facebook_publish_ledger WHERE slot_key=$1",[key]);
     return result.rows[0]??null;
   }
 };
}
