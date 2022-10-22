# Read before using

The validator public keys inside `constants.ts` are mandatory for this script to work. They are used to get the
shard each node is in and the current committee role, to avoid stopping nodes which are mining.

There are 3 ways to set `constants.ts`:

1. With just validator public keys, as in `constants.expamle1.ts`. This will try to create instructions, relaying
   on the [monitor's API](https://monitor.incognito.org).
2. Setting your own instructions, as in `constants.example2.ts`. This is an alternative if the first option fails
   or if you want to take control over the instructions.
3. Same as 2, but with a fullnode as source or any other data source, as in `constants.example3.ts`.

# Dependencies

1. `deno`. See [installation guide](https://deno.land/manual/getting_started/installation).

# How to use

1. Clone the repository in your server and change directory to it.
1. Change to this branch with `git checkout deno`.
1. Copy the `constants.exampleX.ts` you want to `constants.ts`: example `cp constants.example1.ts constants.ts`.
1. Modify `constants.ts` to suit your needs. The validator public keys are needed.
1. Run `deno task run`.

If you want to update the code, run `git pull`.

# Using crontab

With crontab you can configure the script to run every day.

1. Run `crontab -e`
1. Write `0 0 * * * deno task --cwd /root/Duplicated-files-cleaner-Incognito run` at the end of the file, modifying
   the path if yours is different. I recommend runnig the deno command before to see if it works.

# Troubleshooting

If you run into problems, you can safely delete the file located at `db/database.db` and try again. If that doesn't
solve the problem, open an issue.
