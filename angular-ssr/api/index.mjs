const { reqHandler, backendReady } = await import("../dist/game-sage/server/server.mjs");
await backendReady;

export default reqHandler;

