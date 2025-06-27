# Angular Development Server in Docker Container - Host Binding Issue

## Problem
When running Angular development server inside a Docker container, accessing the app from the host machine fails with `ERR_EMPTY_RESPONSE` even though port mapping is configured correctly.

## Root Cause
Angular's development server (`ng serve`) by default binds to `localhost` (127.0.0.1) which only accepts connections from within the same network namespace. In a Docker container, this means only connections from inside the container are accepted.

## Solution
Use the `--host 0.0.0.0` flag to bind the Angular server to all network interfaces, making it accessible from outside the container.

## Commands

### ❌ Incorrect (doesn't work from host)
```bash
ng serve --port 8888
```

### ✅ Correct (accessible from host)
```bash
ng serve --port 8888 --host 0.0.0.0
```

## Docker Port Mapping Context
In our setup:
- Container port: 8888 (Angular dev server)
- Host port: 18888 (mapped via Docker)
- Docker run command includes: `-p 18888:8888`

## Access URLs
- **From inside container**: `http://localhost:8888`
- **From host machine**: `http://localhost:18888`

## Alternative Configuration
You can also configure this in `angular.json`:

```json
{
  "serve": {
    "builder": "@angular/build:dev-server",
    "options": {
      "host": "0.0.0.0",
      "port": 8888
    }
  }
}
```

## Verification
Test if the server is responding from inside the container:
```bash
curl -s http://localhost:8888 | head -10
```

## Notes
- This issue is common when developing Angular apps in Docker containers
- The `--host 0.0.0.0` flag is essential for container-based development
- Always verify the server is accessible from both inside and outside the container
- This applies to other development servers (React, Vue, etc.) as well

## Date
June 27, 2025

## Project
EmbroideryQuant - Angular 20+ Image Quantization Application
