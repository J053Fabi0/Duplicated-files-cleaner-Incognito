/*
  A synchronous version of the Loki Filesystem adapter for node.js

  Intended for diagnostics or environments where synchronous i/o is required.

  This adapter will perform worse than the default LokiFsAdapter but
  is provided for quick adaptation to synchronous code.
*/

const encoder = new TextEncoder();
const LokiFsSyncAdapter: LokiPersistenceAdapter = {
  loadDatabase: function loadDatabase(dbname, callback) {
    try {
      callback(Deno.statSync(dbname).isFile ? Deno.readTextFileSync(dbname) : null);
    } catch (err) {
      // first autoload when file doesn't exist yet
      // should not throw error but leave default
      // blank database.
      if (err.code === "ENOENT") callback(null);

      callback(err);
    }
  },

  saveDatabase: function saveDatabase(dbname, dbstring, callback) {
    try {
      const data = encoder.encode(dbstring);
      Deno.writeFileSync(dbname, data);
      callback();
    } catch (err) {
      callback(err);
    }
  },

  deleteDatabase: function deleteDatabase(dbname, callback) {
    try {
      Deno.removeSync(dbname);
      callback();
    } catch (err) {
      callback(err);
    }
  },
};

export default LokiFsSyncAdapter;
