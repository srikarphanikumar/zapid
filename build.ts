import * as esbuild from 'esbuild';
import { rimraf } from 'rimraf';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

async function analyzeBundle(metafile: esbuild.Metafile) {
    console.log('\nBundle Analysis:');

    // Get all outputs
    Object.entries(metafile.outputs).forEach(([file, output]) => {
        console.log(`\n📦 ${file}:`);
        console.log(`Size: ${(output.bytes / 1024).toFixed(2)} KB`);

        // Show imports and their sizes
        if (output.imports && output.imports.length > 0) {
            console.log('Imports:');
            output.imports.forEach(imp => {
                console.log(`  - ${imp.path}`);
            });
        }

        // Show exports
        if (output.exports && output.exports.length > 0) {
            console.log('Exports:');
            output.exports.forEach(exp => {
                console.log(`  - ${exp}`);
            });
        }
    });
}

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
        sourcemap: false,
        treeShaking: true,
        metafile: true, // Enable metadata generation
        external: []
    };

    try {
        // Build CJS version
        const cjsResult = await esbuild.build({
            ...commonOptions,
            format: 'cjs',
            outfile: 'dist/index.js'
        });

        // Build ESM version
        const esmResult = await esbuild.build({
            ...commonOptions,
            format: 'esm',
            outfile: 'dist/index.mjs'
        });

        // Generate type declarations
        await execAsync('tsc --project tsconfig.build.json');

        // Analyze bundles
        console.log('\n=== Bundle Analysis ===');
        if (cjsResult.metafile) {
            console.log('\nCommonJS Bundle:');
            await analyzeBundle(cjsResult.metafile);
        }

        if (esmResult.metafile) {
            console.log('\nESM Bundle:');
            await analyzeBundle(esmResult.metafile);
        }

        // Save detailed analysis to a file
        const analysis = {
            cjs: cjsResult.metafile,
            esm: esmResult.metafile
        };
        fs.writeFileSync('bundle-analysis.json', JSON.stringify(analysis, null, 2));

        console.log('\n✅ Build completed successfully!');
        console.log('📊 Detailed analysis saved to bundle-analysis.json');

    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();