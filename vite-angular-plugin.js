import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export function angularPlugin() {
  return {
    name: 'angular-typescript-transpile',
    async transform(code, id) {
      // Only process TypeScript files in the renderer
      if (!id.endsWith('.ts') || !id.includes('src/renderer')) {
        return null;
      }

      try {
        // Use tsc to transpile TypeScript to JavaScript
        const { stdout } = await execAsync(`npx tsc --target ES2020 --module ES2020 --moduleResolution node --allowSyntheticDefaultImports --experimentalDecorators --emitDecoratorMetadata --transpileOnly --noEmit false --outDir /tmp ${id}`);
        
        // Return transformed code
        return {
          code: stdout,
          map: null
        };
      } catch (error) {
        console.warn('TypeScript compilation warning:', error.message);
        // Return original code if compilation fails
        return null;
      }
    }
  };
}