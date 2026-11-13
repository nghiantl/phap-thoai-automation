import "dotenv/config";
import {runSlot} from "../src/slot-runner.mjs";
import {createSafeLedger} from "../src/github-ledger.mjs";
const result=await runSlot({ledger:createSafeLedger()});
console.log(JSON.stringify(result,null,2));
