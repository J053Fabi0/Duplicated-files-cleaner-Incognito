console.log(Deno.args);

const flags = {
  // --keep-status: Only start the nodes that were online before the script started.
  keepStatus: Deno.args.includes("--keep-status"),
  // --skip-checks: Skip the check for the nodes that are in or about to be in committee.
  skipChecks: Deno.args.includes("--skip-checks"),
  // --only-offline: Skip the nodes that are online. This skips the check for the nodes that are in or about to be in committee.
  onlyOffline: Deno.args.includes("--only-offline"),
};

console.log(flags);

export default flags;
