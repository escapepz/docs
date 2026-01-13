@echo off
REM Complete pipeline: PDF -> TXT -> MD

cd /d "%~dp0"

if "%1"=="" (
	echo Complete PDF to Markdown Pipeline
	echo.
	echo Usage: extract-all.bat ^<pdf-directory^>
	echo.
	echo This script:
	echo   1. Extracts PDFs to plain text
	echo   2. Converts text to Markdown
	echo.
	echo Example:
	echo   extract-all.bat ..\01_Official\42.13_Unstable\Source_Files
	echo.
	pause
	exit /b 1
)

echo ===== Step 1: Extract PDFs to Plain Text =====
call node extract-text.js --batch "%1"

echo.
echo ===== Step 2: Convert Plain Text to Markdown =====
call node text-to-md.js --batch "%1"

echo.
echo Pipeline complete!
pause
