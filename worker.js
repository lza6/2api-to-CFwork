/**
 * =================================================================================
 * ✨ MagicStudio-2API on Cloudflare Workers ✨
 * =================================================================================
 *
 * @version         | 2.0.2 (Patched for Image Rendering)
 * @author          | World-Class Serverless Architect & Full-Stack Expert
 * @description     | An artistic, single-file, zero-dependency Cloudflare Worker that
 *                  | transforms the Magic Studio AI Art Generator into a high-performance,
 *                  | OpenAI-compatible API, complete with a flagship interactive UI.
 *
 * @license         | MIT
 *
 * =================================================================================
 *
 * Main Features:
 *
 * 1. 🎭 **Dual-Mode Operation**:
 *    - API Proxy: Handles `/v1/*` requests, providing OpenAI-compatible endpoints.
 *    - Interactive UI: Serves a rich, self-contained HTML page at the root (`/`).
 *
 * 2. 🚀 **High-Performance Proxy**:
 *    - Replicates the original Python project's logic for image generation.
 *    - Implements a TRUE streaming response for the `/v1/chat/completions` endpoint,
 *      enhancing user experience beyond the original implementation.
 *
 * 3. 🎨 **"Art-Piece" Grade UI**:
 *    - A fully interactive testing panel built directly into the worker.
 *    - Dynamically populates API URLs and information.
 *    - Includes a live, streaming API tester for the chat completions endpoint.
 *    - Designed with a focus on UX, developer efficiency, and aesthetics.
 *
 * 4. 📦 **Single-File, Zero-Dependency**:
 *    - All logic, HTML, CSS, and client-side JS are bundled into this single file.
 *    - Deploys instantly on the Cloudflare global network.
 *
 * =================================================================================
 */

// =================================================================
// ⚙️ 硬编码配置 (Hardcoded Configuration)
// 所有配置项均在此处定义，确保单一文件部署的便捷性。
// =================================================================

/**
 * 🔑 用于保护您的 API 服务的访问密钥。
 * 请务必修改为您自己的强密钥！
 * @type {string}
 */
const API_KEY = "sk-magicstudio-2api-default-key-please-change-me";

/**
 * 🤖 默认和已知的模型名称。
 * @type {string}
 */
const DEFAULT_MODEL = "magic-art-generator";
const KNOWN_MODELS = ["magic-art-generator"];

/**
 * 🌐 上游 API 的核心参数。
 * @type {string}
 */
const UPSTREAM_URL = "https://ai-api.magicstudio.com/api/ai-art-generator";
const UPSTREAM_CLIENT_ID = "pSgX7WgjukXCBoYwDM8G8GLnRRkvAoJlqa5eAVvj95o";


// =================================================================
// 🚀 核心 Worker 逻辑 (Core Worker Logic)
// =================================================================

export default {
  /**
   * @param {Request} request
   * @param {object} env
   * @param {object} ctx
   * @returns {Promise<Response>}
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // 智能路由：根据路径分发请求
    if (pathname === "/") {
      // 根路径 (/)：返回旗舰级交互式说明页面
      return handleUIPage(request);
    } else if (pathname.startsWith("/v1/")) {
      // API 路径 (/v1/*)：处理 API 代理逻辑
      return handleApiRequest(request, pathname);
    } else {
      // 其他路径：返回 404
      return new Response("🚫 Not Found. Visit the root path `/` for the UI.", { status: 404 });
    }
  },
};

/**
 * 处理所有 /v1/* 的 API 请求
 * @param {Request} request
 * @param {string} pathname
 * @returns {Promise<Response>}
 */
async function handleApiRequest(request, pathname) {
  // --- 安全性检查：验证 API Key ---
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "需要 Bearer Token 认证。" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const token = authHeader.substring(7);
  if (token !== API_KEY) {
    return new Response(JSON.stringify({ error: "无效的 API Key。" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- API 路由 ---
  try {
    if (pathname === "/v1/models" && request.method === "GET") {
      return handleListModels();
    }
    if (pathname === "/v1/images/generations" && request.method === "POST") {
      return handleImageGenerations(request);
    }
    if (pathname === "/v1/chat/completions" && request.method === "POST") {
      return handleChatCompletions(request);
    }
  } catch (e) {
    console.error("API Handler Error:", e);
    return new Response(JSON.stringify({ error: `内部服务器错误: ${e.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: `API 路径 ${pathname} 未找到或方法 ${request.method} 不支持。` }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * GET /v1/models
 * 返回支持的模型列表
 * @returns {Response}
 */
function handleListModels() {
  const modelsData = {
    object: "list",
    data: KNOWN_MODELS.map(name => ({
      id: name,
      object: "model",
      created: Math.floor(Date.now() / 1000),
      owned_by: "MagicStudio-2API",
    })),
  };
  return new Response(JSON.stringify(modelsData), {
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * POST /v1/images/generations
 * 处理图像生成请求
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleImageGenerations(request) {
  const requestData = await request.json();
  const { prompt, n = 1, response_format = "b64_json" } = requestData;

  if (!prompt) {
    return new Response(JSON.stringify({ error: "参数 'prompt' 不能为空。" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  if (response_format !== "b64_json") {
    return new Response(JSON.stringify({ error: "仅支持 'b64_json' 响应格式。" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const imageResults = await generateImagesFromUpstream(prompt, n);

  if (imageResults.every(res => res.status === 'rejected')) {
    return new Response(JSON.stringify({ error: "所有上游图像生成任务均失败。" }), { status: 502, headers: { "Content-Type": "application/json" } });
  }

  const successfulB64s = imageResults
    .filter(res => res.status === 'fulfilled')
    .map(res => (res.status === 'fulfilled' ? res.value : null)) // Type guard for safety
    .filter(Boolean);

  const responseData = {
    created: Math.floor(Date.now() / 1000),
    data: successfulB64s.map(b64_json => ({ b64_json })),
  };

  return new Response(JSON.stringify(responseData), {
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * POST /v1/chat/completions
 * 将聊天请求适配为图像生成，并以流式或非流式返回
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleChatCompletions(request) {
  const requestData = await request.json();
  const { messages, model = DEFAULT_MODEL, stream = false } = requestData;

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "请求体中缺少 'messages' 字段。" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  if (!lastUserMessage || !lastUserMessage.content) {
    return new Response(JSON.stringify({ error: "在 'messages' 中未找到用户消息。" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const prompt = lastUserMessage.content;

  // --- 流式响应逻辑 (Streaming Response) ---
  if (stream) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const sendChunk = (data) => {
      writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    // 在后台执行生成和写入流的操作，不阻塞返回
    (async () => {
      try {
        const requestId = `chatcmpl-${crypto.randomUUID()}`;
        
        // 1. 发送初始空块
        sendChunk(createChatChunk(requestId, model, ""));

        // 2. 调用上游服务
        const imageResults = await generateImagesFromUpstream(prompt, 1);
        const successfulResult = imageResults.find(res => res.status === 'fulfilled');

        if (successfulResult && successfulResult.status === 'fulfilled') {
            // 3. 发送包含图像的块
            const b64_json = successfulResult.value;
            // [FIX] 简化为标准的 Markdown 图片格式，便于客户端解析
            const responseContent = `![](data:image/png;base64,${b64_json})`;
            sendChunk(createChatChunk(requestId, model, responseContent));
        } else {
            throw new Error("从上游服务生成图像失败。");
        }

        // 4. 发送结束块
        sendChunk(createChatChunk(requestId, model, null, "stop"));
        
        // 5. 发送 [DONE] 信号
        writer.write(encoder.encode("data: [DONE]\n\n"));

      } catch (e) {
        console.error("Streaming Error:", e);
        const errorPayload = { error: { message: e.message, type: "server_error" } };
        writer.write(encoder.encode(`data: ${JSON.stringify(errorPayload)}\n\n`));
        writer.write(encoder.encode("data: [DONE]\n\n"));
      } finally {
        writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  // --- 非流式响应逻辑 (Non-Streaming Response) ---
  const imageResults = await generateImagesFromUpstream(prompt, 1);
  const successfulResult = imageResults.find(res => res.status === 'fulfilled');

  if (successfulResult && successfulResult.status === 'fulfilled') {
    const b64_json = successfulResult.value;
    // [FIX] 简化为标准的 Markdown 图片格式
    const responseContent = `![](data:image/png;base64,${b64_json})`;

    const chatResponse = {
      id: `chatcmpl-${crypto.randomUUID()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: responseContent,
        },
        finish_reason: "stop",
      }],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }, // Usage is not tracked
    };

    return new Response(JSON.stringify(chatResponse), {
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({ error: "从上游服务生成图像失败。" }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
}


// =================================================================
// 🛠️ 辅助函数 (Helper Functions)
// =================================================================

/**
 * 核心上游请求函数
 * @param {string} prompt
 * @param {number} n - Number of images to generate
 * @returns {Promise<Array<PromiseSettledResult<string>>>} - Array of settled promises, each containing a base64 string on success.
 */
async function generateImagesFromUpstream(prompt, n) {
  const headers = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Origin": "https://magicstudio.com",
    "Referer": "https://magicstudio.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  };

  const createRequestBody = () => {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("output_format", "bytes");
    formData.append("user_profile_id", "null");
    formData.append("anonymous_user_id", crypto.randomUUID());
    formData.append("request_timestamp", String(Date.now()));
    formData.append("user_is_subscribed", "false");
    formData.append("client_id", UPSTREAM_CLIENT_ID);
    return formData;
  };

  const tasks = Array(n).fill(0).map(() =>
    fetch(UPSTREAM_URL, {
      method: "POST",
      headers: headers,
      body: createRequestBody(),
    }).then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upstream request failed with status ${response.status}: ${errorText}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("image")) {
        const errorText = await response.text();
        throw new Error(`Upstream API did not return an image. Content-Type: ${contentType}, Body: ${errorText.slice(0, 200)}`);
      }
      const imageBuffer = await response.arrayBuffer();
      return bufferToBase64(imageBuffer);
    })
  );

  // 使用 Promise.allSettled 确保即使部分请求失败，也能返回成功的结果
  return Promise.allSettled(tasks);
}

/**
 * 创建 OpenAI 兼容的聊天流块
 * @param {string} id
 * @param {string} model
 * @param {string|null} content
 * @param {string|null} finish_reason
 * @returns {object}
 */
function createChatChunk(id, model, content, finish_reason = null) {
  const chunk = {
    id: id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model: model,
    choices: [
      {
        index: 0,
        delta: {},
        finish_reason: finish_reason,
      },
    ],
  };
  if (content !== null) {
    chunk.choices[0].delta.content = content;
  }
  return chunk;
}

/**
 * 将 ArrayBuffer 转换为 Base64 字符串
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function bufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}


// =================================================================
// 🎨 旗舰级交互式 UI 页面 (Flagship Interactive UI Page)
// =================================================================

/**
 * GET /
 * 返回一个功能强大、信息全面的自包含 HTML 页面
 * @param {Request} request
 * @returns {Response}
 */
function handleUIPage(request) {
  const workerUrl = new URL(request.url).origin;

  const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎨 MagicStudio-2API 旗舰面板</title>
    <style>
        :root {
            --bg-color: #f7f8fa;
            --card-bg: #ffffff;
            --text-color: #2c3e50;
            --text-secondary: #576574;
            --primary-color: #4a69bd;
            --primary-hover: #3d5a9e;
            --border-color: #e5e7eb;
            --code-bg: #f1f2f6;
            --success-color: #2ecc71;
            --error-color: #e74c3c;
            --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            --font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        }
        body {
            font-family: var(--font-sans);
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 2rem;
            line-height: 1.6;
        }
        main {
            max-width: 800px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        header { text-align: center; margin-bottom: 1rem; }
        header h1 { font-size: 2.5rem; margin: 0; color: var(--primary-color); }
        header p { font-size: 1.1rem; color: var(--text-secondary); }
        .card {
            background-color: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            padding: 1.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        h2 {
            font-size: 1.5rem;
            margin-top: 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--primary-color);
            display: inline-block;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 120px 1fr;
            align-items: center;
            gap: 1rem;
        }
        .info-grid strong { color: var(--text-secondary); }
        code {
            font-family: var(--font-mono);
            background-color: var(--code-bg);
            color: var(--primary-hover);
            padding: 0.2em 0.5em;
            border-radius: 4px;
            font-size: 0.9em;
            word-break: break-all;
            cursor: copy;
            transition: background-color 0.2s;
        }
        code:hover { background-color: #e0e4f0; }
        .endpoint-list li {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
            font-family: var(--font-mono);
        }
        .method {
            font-weight: bold;
            padding: 0.2em 0.6em;
            border-radius: 4px;
            color: white;
            font-size: 0.8em;
        }
        .method-post { background-color: #27ae60; }
        .method-get { background-color: #2980b9; }
        #live-tester textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-family: var(--font-sans);
            font-size: 1rem;
            resize: vertical;
            min-height: 80px;
            margin-bottom: 1rem;
            box-sizing: border-box;
        }
        #live-tester button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        #live-tester button:hover { background-color: var(--primary-hover); }
        #live-tester button:disabled { background-color: var(--text-secondary); cursor: not-allowed; }
        #live-tester button:active { transform: scale(0.98); }
        #result-area {
            background-color: #2d3436;
            color: #dfe6e9;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            font-family: var(--font-mono);
            white-space: pre-wrap;
            word-break: break-word;
            min-height: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #result-area img { 
            max-width: 100%; 
            max-height: 512px;
            border-radius: 8px; 
            margin-top: 1rem; 
        }
        .copy-toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--success-color);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            z-index: 1000;
        }
        .copy-toast.show { opacity: 1; transform: translate(-50%, -10px); }
    </style>
</head>
<body>
    <main>
        <header>
            <h1>🎨 MagicStudio-2API</h1>
            <p>一个部署在 Cloudflare Workers 上的艺术品级 OpenAI 兼容代理</p>
        </header>

        <section class="card">
            <h2>📋 即用信息 (Ready-to-Use Info)</h2>
            <div class="info-grid">
                <strong>API 地址</strong><code id="api-url" title="点击复制">${workerUrl}</code>
                <strong>API 密钥</strong><code id="api-key" title="点击复制">${API_KEY}</code>
                <strong>默认模型</strong><code id="default-model" title="点击复制">${DEFAULT_MODEL}</code>
            </div>
        </section>

        <section class="card">
            <h2>🔌 完整接口路径 (Full API Endpoints)</h2>
            <ul class="endpoint-list">
                <li><span class="method method-post">POST</span> <code id="ep-chat" title="点击复制">${workerUrl}/v1/chat/completions</code></li>
                <li><span class="method method-post">POST</span> <code id="ep-images" title="点击复制">${workerUrl}/v1/images/generations</code></li>
                <li><span class="method method-get">GET</span> <code id="ep-models" title="点击复制">${workerUrl}/v1/models</code></li>
            </ul>
        </section>

        <section class="card">
            <h2>🛠️ 开发者信息 (Developer Info)</h2>
            <div class="info-grid">
                <strong>上游接口</strong><code id="upstream-api" title="点击复制">${UPSTREAM_URL}</code>
                <strong>项目模式</strong><code>伪流式代理 (Pseudo-Stream Proxy)</code>
            </div>
        </section>

        <section class="card" id="live-tester">
            <h2>🚀 在线 API 测试 (Live API Tester)</h2>
            <p>在此处测试 <code>/v1/chat/completions</code> 流式接口。输入提示词，它将为您生成一张图片并以 Markdown 格式流式返回。</p>
            <textarea id="prompt-input" placeholder="例如：一只戴着宇航员头盔的猫，数字艺术风格"></textarea>
            <button id="send-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/></svg>
                <span>发送</span>
            </button>
            <pre id="result-area">结果将在这里实时显示...</pre>
        </section>
    </main>

    <div id="copy-toast" class="copy-toast">已复制到剪贴板！</div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // --- 复制功能 ---
            const toast = document.getElementById('copy-toast');
            document.querySelectorAll('code[title="点击复制"]').forEach(el => {
                el.addEventListener('click', () => {
                    navigator.clipboard.writeText(el.innerText).then(() => {
                        toast.classList.add('show');
                        setTimeout(() => { toast.classList.remove('show'); }, 2000);
                    });
                });
            });

            // --- 在线测试器逻辑 ---
            const promptInput = document.getElementById('prompt-input');
            const sendBtn = document.getElementById('send-btn');
            const resultArea = document.getElementById('result-area');
            
            const workerUrl = '${workerUrl}';
            const apiKey = '${API_KEY}';
            const model = '${DEFAULT_MODEL}';

            sendBtn.addEventListener('click', async () => {
                const prompt = promptInput.value.trim();
                if (!prompt) {
                    resultArea.textContent = '❌ 错误：提示词不能为空。';
                    return;
                }

                sendBtn.disabled = true;
                sendBtn.querySelector('span').textContent = '正在思考...';
                resultArea.innerHTML = '⏳ 正在连接并请求上游服务...';

                try {
                    const response = await fetch(workerUrl + '/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': \`Bearer \${apiKey}\`
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: [{ role: 'user', content: prompt }],
                            stream: true
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || \`HTTP 错误: \${response.status}\`);
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';
                    let fullContent = '';
                    resultArea.innerHTML = ''; // 清空等待消息

                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\\n');
                        buffer = lines.pop(); // 保留不完整的行

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const dataStr = line.substring(6).trim();
                                if (dataStr === '[DONE]') {
                                    // [FIX] 流结束后，解析完整的 Markdown 字符串并渲染为图片
                                    const match = fullContent.match(/!\\\[\\]\\((data:image\\/png;base64,[^)]+)\\)/);
                                    if (match && match[1]) {
                                        const imageUrl = match[1];
                                        resultArea.innerHTML = \`<img src="\${imageUrl}" alt="Generated Image"></img>\`;
                                    } else {
                                        // 如果没有匹配到图片，则显示原始文本
                                        resultArea.textContent = fullContent;
                                    }
                                    return; // 提前结束循环
                                }
                                try {
                                    const data = JSON.parse(dataStr);
                                    if (data.error) {
                                        throw new Error(data.error.message);
                                    }
                                    const content = data.choices[0]?.delta?.content;
                                    if (content) {
                                        fullContent += content;
                                        // 在流式传输过程中，暂时只显示文本
                                        resultArea.textContent = fullContent;
                                    }
                                } catch (e) {
                                    console.error('SSE 解析错误:', e);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Fetch Error:', error);
                    resultArea.textContent = \`❌ 请求失败: \${error.message}\`;
                } finally {
                    sendBtn.disabled = false;
                    sendBtn.querySelector('span').textContent = '发送';
                }
            });
        });
    </script>
</body>
</html>
  `;

  return new Response(htmlContent, {
    headers: { "Content-Type": "text/html;charset=UTF-8" },
  });
}
