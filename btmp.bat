@echo off
:: Create a new Vite React project
@REM npm create vite@latest

:: Install Tailwind CSS and its dependencies
npm install -D tailwindcss postcss autoprefixer

:: Initialize Tailwind CSS configuration
@REM npx tailwindcss init -p

@REM :: Create and update tsconfig.json
@REM echo {
@REM   "files": [],
@REM   "references": [
@REM     {
@REM       "path": "./tsconfig.app.json"
@REM     },
@REM     {
@REM       "path": "./tsconfig.node.json"
@REM     }
@REM   ],
@REM   "compilerOptions": {
@REM     "baseUrl": ".",
@REM     "paths": {
@REM       "@/*": ["./src/*"]
@REM     }
@REM   }
@REM } > tsconfig.json

@REM :: Create and update tsconfig.app.json
@REM echo {
@REM   "compilerOptions": {
@REM     "baseUrl": ".",
@REM     "paths": {
@REM       "@/*": [
@REM         "./src/*"
@REM       ]
@REM     }
@REM   }
@REM } > tsconfig.app.json

:: Install node types
npm i -D @types/node

:: Update vite.config.ts
@REM echo import path from "path"
@REM echo import react from "@vitejs/plugin-react"
@REM echo import { defineConfig } from "vite"
@REM echo.
@REM echo export default defineConfig({
@REM   plugins: [react()],
@REM   resolve: {
@REM     alias: {
@REM       "@": path.resolve(__dirname, "./src"),
@REM     },
@REM   },
@REM }) > vite.config.ts

:: Initialize Shadcn UI setup
npx shadcn@latest init
