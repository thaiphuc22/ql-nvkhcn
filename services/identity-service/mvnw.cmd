@echo off
setlocal EnableExtensions EnableDelayedExpansion

for %%I in ("%~dp0.") do set "PROJECT_DIR=%%~fI"
set "WRAPPER_DIR=%PROJECT_DIR%\.mvn\wrapper"
set "WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar"

if "%JAVA_HOME%"=="" (
  echo ERROR: JAVA_HOME is not set. 1>&2
  exit /b 1
)
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo ERROR: JAVA_HOME does not point to a JDK: %JAVA_HOME% 1>&2
  exit /b 1
)

if not exist "%WRAPPER_JAR%" (
  if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%"
  for /f "tokens=1,* delims==" %%A in ('findstr /b "wrapperUrl=" "%WRAPPER_DIR%\maven-wrapper.properties"') do set "WRAPPER_URL=%%B"
  echo Downloading Maven Wrapper...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Invoke-WebRequest -UseBasicParsing -Uri '!WRAPPER_URL!' -OutFile '%WRAPPER_JAR%'"
  if errorlevel 1 exit /b 1
)

"%JAVA_HOME%\bin\java.exe" %MAVEN_OPTS% -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%PROJECT_DIR%" org.apache.maven.wrapper.MavenWrapperMain %*
exit /b %ERRORLEVEL%
