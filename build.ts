import * as esbuild from 'esbuild';
import { rimraf } from 'rimraf';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
    // Clean dist folder
    await rimraf('./dist');

    // Common build options
    const commonOptions: esbuild.BuildOptions = {
        entryPoints: ['src/index.ts'],
        bundle: true,
        minify: true,
        platform: 'neutral',
        target: ['node14', 'es2018'],
        sourcemap: false, // Remove sourcemaps for production
        treeShaking: true,
        external: [], // No external dependencies
    };

    try {
        // Build CJS version
        await esbuild.build({
            ...commonOptions,
            format: 'cjs',
            outfile: 'dist/index.js',
        });

        // Build ESM version
        await esbuild.build({
            ...commonOptions,
            format: 'esm',
            outfile: 'dist/index.mjs',
        });

        // Generate only necessary type declarations
        await execAsync('tsc --project tsconfig.build.json');

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();