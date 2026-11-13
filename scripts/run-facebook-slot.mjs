import "dotenv/config";
import {runSlot} from "../src/slot-runner.mjs";
import {createGitHubLedger,createSafeLedger} from "../src/github-ledger.mjs";
const env=process.env;
const ledger=env.AUTO_PUBLISH_ENABLED==="true"?createGitHubLedger({env}):createSafeLedger();
const result=await runSlot({ledger,env});
console.log(JSON.stringify(result,null,2));
