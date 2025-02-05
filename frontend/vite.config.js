export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist', // Ensure this matches your publish directory in Netlify
  },
});
