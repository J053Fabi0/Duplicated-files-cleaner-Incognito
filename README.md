# Read before using

## Dependencies

1. `deno`. See [installation guide](https://deno.land/manual/getting_started/installation)

### To add deno to the path, after installing it.

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
1. Copy `constants.example1.ts` to `constants.ts`: `cp constants.example1.ts constants.ts`.
1. Modify `constants.ts` to suit your needs.
1. Run `deno task run --help` to see the possible commands.

If you want to update the code, run `git pull`.

# Using the script

#### To run the script

```bash
deno task run
```

#### To run the script in a specific directory

```bash
deno task run --cwd /path/to/directory
```

#### To copy some shard's files from a node to another

```bash
deno task run copy [fromNodeIndex] [toNodeIndex] [...shards=[beacon]]
```

##### Examples

- _Copy the beacon shard from node 0 to node 1_

```bash
deno task run copy 0 1
```

- _Copy the beacon and shard2 from node 0 to node 1_

```bash
deno task run copy 0 1 beacon shard2
```

- _You could also just use the shard index_

```bash
deno task run copy 0 1 beacon 2
```

#### To move some shard's files from a node to another

It uses the same syntax as `copy`.

```bash
deno task run move [fromNodeIndex] [toNodeIndex] [...shards=[beacon]]
```

#### To get the status and total files of each node's shards

```bash
deno task run info [...nodeIndexes=all]
```

##### Examples

- _Get the status of all nodes_

```bash
deno task run info
```

- _Get the status of node 0 and 1_

```bash
deno task run info 0 1
```

# Using crontab

With crontab you can configure the script to run every day.

1. Run `crontab -e`
1. Write `0 0 * * * deno task --cwd /root/Duplicated-files-cleaner-Incognito run` at the end of the file, modifying
   the path if yours is different. I recommend runnig the command before to see if it works.

# Troubleshooting

If you run into problems, you can safely delete the file located at `db/database.db` and try again. If that doesn't
solve the problem, open an issue.
