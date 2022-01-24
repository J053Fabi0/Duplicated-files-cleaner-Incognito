# Disclamer
If you decide not to provide the public keys of your nodes inside constants.js, do not run this scrpit if one or more of
your nodes are in committee. In case it is about to enter committee, like in 1 epoch, I wouldn't worry, because this
script is really fast: it will probably run in less than 1 minute.

Provide the public keys if you don't want to worry about checking if one ore more nodes is in committee; all nodes that
are in committee will be skipped and its containers wont be stopped.

# Dependencies
1. node.
1. npm.

# How to use

1. Clone the repository in your server and change directory to it.
1. Run `npm i`.
1. Rename `constants.example.js` to `constants.js`.
1. Modify `constants.js` to suit your needs.
1. Now you can run `node index.js` every time you want.
