import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const sharedPath = path.resolve(rootDir, 'src/shared');
const featuresPath = path.resolve(rootDir, 'src/features');

export default defineConfig({
 resolve: {
 alias: {
 '@shared': sharedPath,
 '@features': featuresPath,
 }
 },
 test: {
 environment: 'jsdom',
 globals: true,
 setupFiles: './tests/setupTests.js',
 include: ['tests/**/*.test.{js,jsx,ts,tsx}', 'src/**/*.test.{js,jsx,ts,tsx}'],
 }
});