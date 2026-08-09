@echo off
REM Start portable MongoDB with a local dbpath.
setlocal
cd /d "%~dp0"

if not exist "mongodb\bin\mongod.exe" (
    echo MongoDB not found. Extract mongodb.zip into mongodb\ first:
    echo   tar -xf mongodb\mongodb.zip -C mongodb\ --strip-components=1
    exit /b 1
)

if not exist "mongodb\data" mkdir "mongodb\data"

echo Starting MongoDB on port 27017 (dbpath: mongodb\data)...
mongodb\bin\mongod.exe --dbpath "mongodb\data" --port 27017
