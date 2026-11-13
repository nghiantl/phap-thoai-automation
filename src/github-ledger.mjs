// GitHub-only durable per-slot claims. GitHub's create-ref endpoint rejects
// duplicate ref names atomically (422); never use a read-then-write lock.
// A claimed slot is NEVER automatically retried, even after failure or crash.
const KEY=/^\d{4}-\d{2}-\d{2}-(morning|evening)$/;
export function createGitHubLedger({env=process.env,fetchImpl=globalThis.fetch}={}) {
 const repository=env.GITHUB_REPOSITORY;
 const token=env.GITHUB_TOKEN;
 const sha=env.GITHUB_SHA;
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository||"")) throw Error("GITHUB_REPOSITORY missing");
 if(!token||!sha||!/^[a-f0-9]{40}$/.test(sha)) throw Error("GitHub token or commit SHA missing");
 const base="https://api.github.com/repos/"+repository+"/git/refs";
 const headers={Authorization:"Bearer "+token,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"};
 const request=async(path,options={})=>fetchImpl(base+path,{...options,headers});
 return {
   async claim(key) {
     if(!KEY.test(key)) throw Error("Invalid slot key");
     const ref="refs/tags/facebook-ledger/claimed/"+key;
     const response=await request("",{method:"POST",body:JSON.stringify({ref,sha})});
     if(response.status===201) return true;
     if(response.status===422) {
       // 422 also means validation error: verify the precise ref exists.
       const check=await request("/tags/facebook-ledger/claimed/"+key,{method:"GET"});
       if(check.status===200) return false;
       throw Error("GitHub ledger claim validation failed; publishing blocked");
     }
     throw Error("GitHub ledger claim failed: HTTP "+response.status);
   },
   async finish(key,{status}={}) {
     if(!KEY.test(key)||!["PUBLISHED","FAILED","UNKNOWN"].includes(status)) throw Error("Invalid ledger finish");
     // State markers are append-only refs; claimed marker remains the durable lock.
     const ref="refs/tags/facebook-ledger/"+status.toLowerCase()+"/"+key;
     const response=await request("",{method:"POST",body:JSON.stringify({ref,sha})});
     if(response.status!==201) throw Error("GitHub ledger state write failed: HTTP "+response.status);
   },
   async markUnknown(key) {return this.finish(key,{status:"UNKNOWN"});}
 };
}
// Compatibility: explicit fail-closed ledger for dry-run scripts.
export function createSafeLedger() {
 return {async claim(){throw Error("No production ledger configured; publishing blocked");},
   async finish(){throw Error("No production ledger configured");}};
}
