The validator public keys inside `constants.js` are mandatory for this script to work. They are used to get the
shard each node is in and the current committee role, to avoid stopping nodes wich are mining.

If you have used this script before, you must migrate the old configuration to the newer one.

# Dependencies

1. node 12.9.0 or higher.
1. npm.

# How to use

1. Clone the repository in your server and change directory to it.
1. Run `npm i`.
1. Copy `constants.example.js` to `constants.js`: `cp constants.example.js constants.js`.
1. Modify `constants.js` to suit your needs. The validator private keys are obligatory.
1. Now you can run `node index.js` every time you want.

If you want to update the code, run `git pull`.

If you run into problems, you can safely delete the file located at `db/database.db` and try again. If that doesn't
solve the problem, open an issue.
