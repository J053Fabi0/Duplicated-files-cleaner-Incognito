# Read before using

The validator public keys inside `constants.ts` are mandatory for this script to work. They are used to get the
shard each node is in and the current committee role, to avoid stopping nodes which are mining.

There are 3 ways to set `constants.ts`:

1. With just validator public keys, as in `constants.expamle1.ts`. This will try to create instructions, relaying
   on the [monitor's API](https://monitor.incognito.org).

2. Setting your own instructions, as in `constants.example2.ts`. This is an alternative if the first option fails
   or if you want to take control over the instructions. `fromNodeIndex` is optional. You could write it like this:

   ```js
   instructions: [
      {
         shardName: "beacon",
         toNodesIndex: [0, 1, 2, 3, 4, 5],
      },
   ],
   ```

   The script will set `fromNodeIndex` to the node who has more files in the shard's directory, effectively
   choosing the most updated to be the seeder. The chosen node will always be one which won't be skipped. Nodes can
   be skipped if they are about or in `COMMITEE` or for other reasons.

3. Same as 2, but with a fullnode as source or any other data source, as in `constants.example3.ts`.

# Dependencies

1. `deno`. See [installation guide](https://deno.land/manual/getting_started/installation)

## To add deno to the path, after installing it.

1. `nano ~/.bashrc`.
1. Add the following two lines at the end or edit PATH accordingly if it already exists:
   `export DENO_INSTALL="/root/.deno"` `export PATH="$DENO_INSTALL/bin:$PATH"`, but substitute `/root` with the
   directory in which deno is installed.
1. Save and close.
1. `cd`.
1. `. .bashrc`.

# How to use

1. Clone the repository in your server and change directory to it.
1. Change to this branch with `git checkout deno`.
1. Copy the `constants.exampleX.ts` you want to `constants.ts`: example `cp constants.example1.ts constants.ts`.
1. Modify `constants.ts` to suit your needs. The validator public keys are needed.
1. Run `deno task run`.

If you want to update the code, run `git pull`.

## Useful flags

`--keep-status`: Only start the nodes that were online before the script started. It keeps nodes offline if they
were offline.

`--skip-checks`: Skip the check for the nodes that are in or about to be in committee.

`--only-offline`: Skip the nodes whose docker is running, so it only deals with offline dockers. This skips the
check for the nodes that are in or about to be in committee.

# Using crontab

With crontab you can configure the script to run every day.

1. Run `crontab -e`
1. Write `0 0 * * * deno task --cwd /root/Duplicated-files-cleaner-Incognito run` at the end of the file, modifying
   the path if yours is different. I recommend runnig the deno command before to see if it works.

# Troubleshooting

If you run into problems, you can safely delete the file located at `db/database.db` and try again. If that doesn't
solve the problem, open an issue.
