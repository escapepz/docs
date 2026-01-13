#!/bin/bash

# Complete pipeline: PDF -> TXT -> MD

cd "$(dirname "$0")"

if [ -z "$1" ]; then
	echo "Complete PDF to Markdown Pipeline"
	echo ""
	echo "Usage: bash extract-all.sh <pdf-directory>"
	echo ""
	echo "This script:"
	echo "   1. Extracts PDFs to plain text"
	echo "   2. Converts text to Markdown"
	echo ""
	echo "Example:"
	echo "   bash extract-all.sh ../01_Official/42.13_Unstable/Source_Files"
	echo ""
	exit 1
fi

echo "===== Step 1: Extract PDFs to Plain Text ====="
node extract-text.js --batch "$1"

echo ""
echo "===== Step 2: Convert Plain Text to Markdown ====="
node text-to-md.js --batch "$1"

echo ""
echo "Pipeline complete!"
