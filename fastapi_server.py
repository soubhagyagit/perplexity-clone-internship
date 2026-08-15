import os
import json
import asyncio
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NexusAI Multi-Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "engine": "NexusAI FastAPI Gateway",
        "version": "1.0.0"
    }

@app.get("/api/search/stream")
async def api_search_stream(
    mode: str = Query(..., description="Agent mode (web, academic, reddit, youtube, writing)"),
    query: str = Query(..., description="User query"),
    history: str = Query("[]", description="JSON array of chat history")
):
    async def event_stream():
        safe_query = query.replace('"', '\\"')
        safe_history = history.replace('"', '\\"')
        cmd = f'npx tsx src/index.ts'

        # Invoke direct agent via Node TS runner
        ts_script = f"""
import {{ dispatchStreamingAgent }} from './src/agents/index.js';
const emitter = dispatchStreamingAgent('{mode}', '{safe_query}', {history});
emitter.on('data', (d) => console.log(d));
emitter.on('end', () => {{ console.log(JSON.stringify({{ type: 'end' }})); process.exit(0); }});
emitter.on('error', (e) => {{ console.error(JSON.stringify({{ type: 'error', data: String(e) }})); process.exit(1); }});
"""
        proc = await asyncio.create_subprocess_exec(
            "node", "--input-type=module", "-e", ts_script,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=BASE_DIR
        )

        try:
            while True:
                line = await proc.stdout.readline()
                if not line:
                    break
                line_str = line.decode('utf-8', errors='ignore').strip()
                if line_str:
                    yield f"data: {line_str}\n\n"
            await proc.wait()
        except asyncio.CancelledError:
            if proc:
                try:
                    proc.terminate()
                except:
                    pass
            raise
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/api/search/list")
async def api_search_list(
    mode: str = Query(..., description="Agent mode (image, video, suggestion)"),
    query: str = Query("", description="User query"),
    history: str = Query("[]", description="JSON array of chat history")
):
    safe_query = query.replace('"', '\\"')
    ts_script = f"""
import {{ dispatchListAgent }} from './src/agents/index.js';
try {{
  const res = await dispatchListAgent('{mode}', '{safe_query}', {history});
  console.log(JSON.stringify({{ success: true, mode: '{mode}', data: res }}));
  process.exit(0);
}} catch(e) {{
  console.error(JSON.stringify({{ success: false, error: String(e) }}));
  process.exit(1);
}}
"""
    proc = await asyncio.create_subprocess_exec(
        "node", "--input-type=module", "-e", ts_script,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        cwd=BASE_DIR
    )
    stdout, stderr = await proc.communicate()
    out_str = stdout.decode('utf-8', errors='ignore').strip()
    
    try:
        return json.loads(out_str)
    except:
        return {"success": False, "error": stderr.decode('utf-8', errors='ignore') or "Execution failed"}

if os.path.exists(PUBLIC_DIR):
    app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="public")
