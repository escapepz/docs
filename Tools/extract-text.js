#!/usr/bin/env node

/**
 * PDF to Plain Text Extraction Script
 * Extracts readable text preserving semantic structure
 * 
 * Usage:
 *   node extract-text.js <inputPDF> [outputTXT]
 *   node extract-text.js --batch <directory>
 */

const fs = require("fs");
const path = require("path");
const { Poppler } = require("node-poppler");

function parseArgs() {
	const args = process.argv.slice(2);
	
	if (args.length === 0) {
		printUsage();
		process.exit(1);
	}

	if (args[0] === "--batch" && args[1]) {
		return {
			mode: "batch",
			directory: args[1],
		};
	}

	return {
		mode: "single",
		inputFile: args[0],
		outputFile: args[1] || null,
		pageRange: null,
	};
}

function printUsage() {
	console.log(`
PDF to Plain Text Extractor
Usage: node extract-text.js <inputPDF> [outputTXT]
       node extract-text.js --batch <directory>

Arguments:
  inputPDF      Path to the PDF file
  outputTXT     Optional output file path (auto-generated if not provided)

Batch Mode:
  --batch       Extract text from all PDFs in a directory
  directory     Directory containing PDF files

Examples:
  node extract-text.js document.pdf                    # Extract to document.txt
  node extract-text.js doc.pdf output.txt              # Extract with custom output
  node extract-text.js --batch ./pdf-files            # Batch extract all PDFs
	`);
}

function generateOutputFilename(inputFile) {
	const baseName = path.basename(inputFile, path.extname(inputFile));
	const dir = path.dirname(inputFile);
	return path.join(dir, `${baseName}.txt`);
}

async function extractText(inputFile, outputFile) {
	try {
		if (!fs.existsSync(inputFile)) {
			console.error(`Error: Input file not found: ${inputFile}`);
			return false;
		}

		console.log(`Extracting: ${path.basename(inputFile)}`);

		const poppler = new Poppler();
		const finalOutputFile = outputFile || generateOutputFilename(inputFile);

		const options = {
			outputEncoding: "UTF-8",
			// Do NOT use maintainLayout - we want reading order, not visual layout
			noDiagonalText: false,
			noPageBreaks: false, // Preserve page structure
		};

		const result = await poppler.pdfToText(inputFile, finalOutputFile, options);

		console.log(`✓ Extracted: ${path.basename(finalOutputFile)}`);
		return true;

	} catch (error) {
		console.error(`Error extracting ${inputFile}:`, error.message);
		return false;
	}
}

async function batchExtract(directory) {
	try {
		if (!fs.existsSync(directory)) {
			console.error(`Error: Directory not found: ${directory}`);
			process.exit(1);
		}

		// Find all PDF files recursively
		const files = fs.readdirSync(directory)
			.filter(file => file.endsWith(".pdf"))
			.map(file => path.join(directory, file));

		if (files.length === 0) {
			console.log(`No PDF files found in ${directory}`);
			return;
		}

		console.log(`Extracting text from ${files.length} PDF file(s)...\n`);

		let successCount = 0;
		for (const file of files) {
			const success = await extractText(file);
			if (success) {
				successCount++;
			}
		}

		console.log(`\n✓ Batch extraction complete: ${successCount}/${files.length} files processed`);

	} catch (error) {
		console.error("Error during batch extraction:", error.message);
		process.exit(1);
	}
}

async function main() {
	const options = parseArgs();

	if (options.mode === "batch") {
		await batchExtract(options.directory);
	} else {
		const success = await extractText(options.inputFile, options.outputFile);
		if (!success) {
			process.exit(1);
		}
	}
}

main();
