import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n✅  Credify API running at http://localhost:${PORT}/api`);
  console.log(`🗄️  Database: Neon PostgreSQL`);
  console.log(`📌  Press Ctrl+C to stop\n`);
});
