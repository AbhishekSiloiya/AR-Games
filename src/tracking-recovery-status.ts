export type RecoveryCheck = {ok:boolean;message:string};
export type RecoveryStatus = {message:string;progress:number};
// Display the existing tracking assessment; this helper never decides when play resumes.
export function trackingRecoveryStatus(checks:RecoveryCheck[],steady:boolean,progress:number):RecoveryStatus {
  const missing=checks.findIndex(check=>!check.ok);
  return {
    message:missing>=0?`${checks.length>1?`Player ${missing+1}: `:''}${checks[missing].message}`:steady?'Hold steady — almost ready':'Stand naturally and hold still',
    progress:steady&&Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0,
  };
}
