import app from './app.js';
import config from './config/env.config.js';
import { connectDB } from './config/db.config.js';
import { initSocket } from './sockets/socket.js';

try {
  await connectDB();

  const httpServer = app.listen(config.port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${config.port} (${config.nodeEnv})`);
  });

  initSocket(httpServer);
} catch (error) {
  console.error(`❌ No se pudo iniciar el servidor: ${error.message}`);
  process.exit(1);
}
