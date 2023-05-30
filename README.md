# Read before using

The validator public keys inside `constants.jsonc` are mandatory for this script to work. They are used to get the
shard each node is in and the current committee role, to avoid stopping nodes which are mining.

There are 3 ways to set `constants.jsonc`:

1. With just validator public keys, as in `constants.expamle1.jsonc`. This will try to create instructions,
   relaying on the [monitor's API](https://monitor.incognito.org).

2. Setting your own instructions, as in `constants.example2.jsonc`. This is an alternative if the first option
   fails or if you want to take control over the instructions. `fromNodeIndex` is optional. You could write it like
   this:

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

3. Same as 2, but with a fullnode as source or any other data source, as in `constants.example3.jsonc`.

# Dependencies

1. None, not even deno. The binary is self-contained. 🦕 This is the power of `deno compile`.

## To add deno to the path, after installing it.

1. `nano ~/.bashrc`.
1. Add the following two lines at the end or edit PATH accordingly if it already exists:
   `export DENO_INSTALL="/root/.deno"` `export PATH="$DENO_INSTALL/bin:$PATH"`, but substitute `/root` with the
   directory in which deno is installed.
1. Save and close.
1. `cd`.
1. `. .bashrc`.

# How to use

1. Download the binary for your platform from the
   [build folder](https://github.com/J053Fabi0/Duplicated-files-cleaner-Incognito/blob/binaries/build).

   - Linux:
     `wget https://media.githubusercontent.com/media/J053Fabi0/Duplicated-files-cleaner-Incognito/binaries/build/x86_64-unknown-linux-gnu -O duplicatedFilesCleaner`
   - Windows:
     `wget https://media.githubusercontent.com/media/J053Fabi0/Duplicated-files-cleaner-Incognito/binaries/build/x86_64-pc-windows-msvc.exe -O duplicatedFilesCleaner.exe`
   - MacOS:
     `wget https://media.githubusercontent.com/media/J053Fabi0/Duplicated-files-cleaner-Incognito/binaries/build/x86_64-apple-darwin -O duplicatedFilesCleaner`
   - Apple Silicon:
     `wget https://media.githubusercontent.com/media/J053Fabi0/Duplicated-files-cleaner-Incognito/binaries/build/aarch64-apple-darwin -O duplicatedFilesCleaner`

1. Make it executable: `chmod +x duplicatedFilesCleaner`.

1. Download the `constants.jsonc` from one of the examples:
   - [Example 1](https://github.com/J053Fabi0/Duplicated-files-cleaner-Incognito/blob/binaries/constants.example1.jsonc):
     `wget https://raw.githubusercontent.com/J053Fabi0/Duplicated-files-cleaner-Incognito/binaries/constants.example1.jsonc -O constants.jsonc`
   - [Example 2](https://github.com/J053Fabi0/Duplicated-files-cleaner-Incognito/blob/binaries/constants.example2.jsonc):
     `wget https://raw.githubusercontent.com/J053Fabi0/Duplicated-files-cleaner-Incognito/binaries/constants.example2.jsonc -O constants.jsonc`
   - [Example 3](https://github.com/J053Fabi0/Duplicated-files-cleaner-Incognito/blob/binaries/constants.example3.jsonc):
     `wget https://raw.githubusercontent.com/J053Fabi0/Duplicated-files-cleaner-Incognito/binaries/constants.example3.jsonc -O constants.jsonc`
1. Modify `constants.jsonc` to suit your needs. The validator public keys are needed.

1. Run `./duplicatedFilesCleaner` in the same directory as `constants.jsonc` or use `--config` to specify a
   different path for the config file.

## Useful flags

`--config`: Path to the config file. Defaults to `./constants.jsonc` in the current directory.

`--keep-status`: Only start the nodes that were online before the script started. It keeps nodes offline if they
were offline.

`--skip-checks`: Skip the check for the nodes that are in or about to be in committee.

`--only-offline`: Skip the nodes whose docker is running, so it only deals with offline dockers. This skips the
check for the nodes that are in or about to be in committee.

# Using crontab

With crontab you can configure the script to run every day.

1. Run `crontab -e`
1. Write `0 0 * * * /path/to/duplicatedFilesCleaner --config /path/to/constants.jsonc` at the end of the file,
   modifying the path if yours is different. I recommend runnig the deno command before to see if it works.
