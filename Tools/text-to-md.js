#!/usr/bin/env node

/**
 * Plain Text to Markdown Converter
 * Converts extracted plain text to basic Markdown with minimal transformation
 * 
 * Usage:
 *   node text-to-md.js <inputTXT> [outputMD]
 *   node text-to-md.js --batch <directory>
 */

const fs = require("fs");
const path = require("path");

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
	};
}

function printUsage() {
	console.log(`
Plain Text to Markdown Converter
Usage: node text-to-md.js <inputTXT> [outputMD]
       node text-to-md.js --batch <directory>

Arguments:
  inputTXT      Path to the plain text file
  outputMD      Optional output file path (auto-generated if not provided)

Batch Mode:
  --batch       Convert all .txt files in a directory to .md
  directory     Directory containing text files

Examples:
  node text-to-md.js document.txt                    # Convert to document.md
  node text-to-md.js doc.txt output.md               # Convert with custom output
  node text-to-md.js --batch ./text-files           # Batch convert all text files
	`);
}

function generateOutputFilename(inputFile) {
	const baseName = path.basename(inputFile, path.extname(inputFile));
	const dir = path.dirname(inputFile);
	return path.join(dir, `${baseName}.md`);
}

/**
 * Convert plain text to Markdown with minimal transformation
 * Preserves structure as found in the source
 */
function convertTextToMarkdown(text) {
	let markdown = text;

	// 1. Remove form-feed characters and standalone page numbers
	markdown = markdown
		.replace(/\f/g, "")
		.replace(/^\s*\d+\s*$/gm, "");

	// 2. Remove printed table of contents block
	markdown = markdown.replace(
		/^Contents[\s\S]+?^\s*Introduction\s*$/m,
		"## Introduction\n"
	);

	// 3. Promote numbered section headers to Markdown headings
	markdown = markdown.replace(
		/^(\d+(\.\d+)*)\.?\s+(.+)$/gm,
		(_, num, _sub, title) => {
			// Only promote if it looks like a heading (short title, not full sentences)
			if (title.length > 150 || title.match(/[,;].*[,;]/)) {
				return _; // Don't convert long prose lines
			}
			const level = num.split(".").length + 1;
			return `${"#".repeat(level)} ${num}. ${title}`;
		}
	);

	// Detect and wrap code blocks (lines starting with common patterns)
	// Look for lines with function, local, etc.
	const lines = markdown.split("\n");
	const result = [];
	let inCodeBlock = false;
	let codeBuffer = [];

	const codeIndicators = [
		/^function\s+\w+[\.:]/,  // function name: or function name. or function name(
		/^local\s+\w+\s*=/,  // local var = (assignment)
		/^\s{4,}\w+/,  // Heavily indented lines (4+ spaces, likely code)
		/^if\s+[\w\.]/,  // if condition
		/^for\s+\w+/,  // for loop
		/^while\s+\w+/,  // while loop
		/^end\s*$/,  // end of block
		/^--/, // Lua comment
	];

	const blockEnders = [
		/^[A-Z][A-Z\s]+$/, // ALL CAPS = likely heading
		/^#{1,6}\s/,
		/^\d+\.\s+/,
		/^[-*]\s+/,
	];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		// 5. Force fencing for known "Code piece" sections
		if (/^Code piece \d+/i.test(line)) {
			if (inCodeBlock) {
				result.push("```lua");
				result.push(...codeBuffer);
				result.push("```");
				inCodeBlock = false;
				codeBuffer = [];
			}
			result.push(`**${line.trim()}**`);
			result.push("");
			continue;
		}

		// Detect code block start
		if (!inCodeBlock && codeIndicators.some(pattern => pattern.test(line)) && trimmed) {
			inCodeBlock = true;
			codeBuffer = [line];
			continue;
		}

		// Detect code block end
		if (
			inCodeBlock &&
			trimmed === "" &&
			!codeIndicators.some(p => p.test(lines[i + 1] || ""))
		) {
			if (codeBuffer.length > 0) {
				result.push("```lua");
				result.push(...codeBuffer);
				result.push("```");
				result.push("");
			}
			inCodeBlock = false;
			codeBuffer = [];
			continue;
		}

		if (inCodeBlock) {
			codeBuffer.push(line);
		} else {
			result.push(line);
		}
	}

	// Close any open code block
	if (inCodeBlock && codeBuffer.length > 0) {
		result.push("```lua");
		result.push(...codeBuffer);
		result.push("```");
	}

	markdown = result.join("\n");

	// Normalize spacing
	markdown = markdown.replace(/\n\n\n+/g, "\n\n");

	// Trim
	markdown = markdown.trim();

	return markdown;
}

async function convertFile(inputFile, outputFile) {
	try {
		if (!fs.existsSync(inputFile)) {
			console.error(`Error: Input file not found: ${inputFile}`);
			return false;
		}

		console.log(`Converting: ${path.basename(inputFile)}`);

		const text = fs.readFileSync(inputFile, "utf-8");
		const markdown = convertTextToMarkdown(text);

		const finalOutputFile = outputFile || generateOutputFilename(inputFile);
		fs.writeFileSync(finalOutputFile, markdown, "utf-8");

		console.log(`✓ Saved: ${path.basename(finalOutputFile)}\n`);
		return true;

	} catch (error) {
		console.error(`Error converting ${inputFile}:`, error.message);
		return false;
	}
}

async function batchConvert(directory) {
	try {
		if (!fs.existsSync(directory)) {
			console.error(`Error: Directory not found: ${directory}`);
			process.exit(1);
		}

		const files = fs.readdirSync(directory)
			.filter(file => file.endsWith(".txt"))
			.map(file => path.join(directory, file));

		if (files.length === 0) {
			console.log(`No text files found in ${directory}`);
			return;
		}

		console.log(`Converting ${files.length} text file(s)...\n`);

		let successCount = 0;
		for (const file of files) {
			const success = await convertFile(file);
			if (success) {
				successCount++;
			}
		}

		console.log(`✓ Conversion complete: ${successCount}/${files.length} files converted`);

	} catch (error) {
		console.error("Error during batch conversion:", error.message);
		process.exit(1);
	}
}

async function main() {
	const options = parseArgs();

	if (options.mode === "batch") {
		await batchConvert(options.directory);
	} else {
		const success = await convertFile(options.inputFile, options.outputFile);
		if (!success) {
			process.exit(1);
		}
	}
}

main();
