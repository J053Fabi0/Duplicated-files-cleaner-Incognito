import loki from "lokijs";
import LokiFsSyncAdapter from "../utils/loki-fs-sync-adapter.ts";

// Ejemplos en https://github.com/techfort/LokiJS/wiki/Query-Examples.

// Las opciones de la base de datos.
const dbOptions: Partial<LokiConstructorOptions> &
  Partial<LokiConfigOptions> &
  Partial<ThrottledSaveDrainOptions> = {
  adapter: LokiFsSyncAdapter,
  // autosave: true,
  // El autoupdate funciona extraño. Es mejor usar manualmente db.update();
  // autoupdate: true, // https://github.com/techfort/LokiJS/wiki/Autoupdating-Collections
  // autosaveInterval,
};

// Instanciarla.
const db = new loki(Deno.cwd() + "/db/database.db", dbOptions);

// Cargar la base de datos síncronamente desde el archivo '*.db'.
db.loadDatabase();

export default db;
