import "dotenv/config";
import {checkFacebookPage} from "../src/facebook-readonly.mjs";
const result=await checkFacebookPage();
console.log(JSON.stringify(result,null,2));
console.log("READ ONLY: no Facebook content was created.");
