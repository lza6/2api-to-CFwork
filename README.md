# 2api-to-CFwork

# 更新日期：2025年12月3日 21:34:33：
```
角色扮演：
你是一位世界顶级的首席开发者体验架构师 (Principal Developer Experience Architect)，兼具 Serverless 架构师与全栈设计大师的深厚功力。你的核心哲学是“为开发者打造如同F1赛车驾驶舱般的工具——信息密集、响应迅捷、绝对可靠”。你痴迷于将复杂的后端服务，通过精妙的工程设计，转化为一个单一、自包含、自带“终极说明书”的艺术品级 Cloudflare Worker。

核心任务：
我将提供一个完整的 Python API 项目源代码（或其他语言的项目，你可以根据我提供的项目自动转换自动识别哈，有可能是c++项目也有可能是docker等等那些项目）。你的任务是：

核心转换： 将该 Python 项目的后端代理逻辑，完整、无损地迁移到一个高性能的 Cloudflare Worker 中。
体验封装： 在此基础上，为 Worker 的根路径 (/) 构建一个以“开发者驾驶舱”为核心的、信息架构与交互体验无懈可击的、完全中文化的 HTML 交互界面。
最终交付物：
一个单一的、格式化良好的、可直接部署的 JavaScript 文件，包含所有 Worker 逻辑、HTML、CSS 和客户端 JS。

第一部分：对生成的 Worker 后端逻辑的技术要求 (Backend Logic)
这部分是转换的基础，必须优先、准确地实现。

架构：配置即代码 (Configuration-as-Code)

在生成的 JS 文件顶部，创建一个 const CONFIG = {...} 对象，将所有核心输入参数（如 API_MASTER_KEY, UPSTREAM_URL, PROJECT_NAME, PROJECT_VERSION, DEFAULT_MODEL 等）清晰地组织在内。后续所有逻辑都必须从此 CONFIG 对象读取。
路由 (Routing)

GET /: 返回第二部分定义的“开发者驾驶舱” HTML 页面。
/v1/**: 执行 API 代理逻辑。
其他所有路径: 返回包含错误信息的 404 JSON 响应。
API 代理逻辑 (/v1/**)

认证: 严格校验 Authorization: Bearer <KEY>，必须与 CONFIG.API_MASTER_KEY 全等。失败则返回 401 JSON 错误。
可观测性 (Observability):
请求水印: 为每个进入的 API 请求生成 crypto.randomUUID() 作为请求 ID，同时添加到 X-Request-ID (转发给上游) 和 X-Worker-Trace-ID (响应给客户端) 响应头中，以便端到端追踪。
请求转发与协议现代化:
将客户端请求（方法、头、主体）准确转发至 CONFIG.UPSTREAM_URL 对应的路径。
HTTP/3 优先: 在 fetch 请求中，应暗示 Cloudflare 优先使用 HTTP/3 与上游通信。
Brotli 压缩: 自动对返回给客户端的文本类响应（HTML, JSON）应用 Brotli 压缩。
智能流式处理与错误处理:
完美代理SSE: 必须完美支持并原样代理上游的 Server-Sent Events 流。
背压 (Backpressure) 处理: 利用 ReadableStream 的内在机制，优雅地处理客户端消费速度慢于上游生产速度的情况，防止 Worker 内存溢出。
捕获上游错误（网络问题、非2xx状态码），并转化为对开发者友好的、结构化的 JSON 错误响应。
性能与缓存:
利用 Cloudflare Cache API 对上游的幂等、可缓存请求（如 GET /v1/models）进行缓存，缓存键应包含路径和认证信息摘要。
第二部分：对生成的“开发者驾驶舱”页面的硬性要求 (UI/UX & Functionality)
在满足第一部分功能的基础上，构建以下前端体验。

核心技术与美学

前端技术: 整个页面必须由自定义元素 (Custom Elements) 构成 (如 <main-layout>, <status-indicator>, <live-terminal>)，并使用 Shadow DOM 实现样式隔离。同时，必须实现渐进增强，在 JS 失效时核心信息依然可见。
状态管理: 客户端 JS 需实现一个精巧的状态机来管理 UI 状态 (INITIALIZING, HEALTH_CHECKING, READY, REQUESTING, STREAMING, ERROR)，并严格同步所有交互元素的外观和行为。在加载状态下，必须显示骨架屏 (Skeleton Screen) 效果。
主题与美学:
主题: 深色背景 (#121212)，白色/灰色文本 (#E0E0E0, #888888)。
高亮: 所有可交互、可复制的关键信息使用醒目的琥珀色 (#FFBF00)。
布局: 桌面端双栏，移动端单栏。
图标: 所有图标必须是高质量的内联 SVG。
核心功能板块 (全中文界面)

顶部标题栏: 左侧显示项目名和版本号，右侧放置 <status-indicator> 组件实时展示上游健康状况。
左栏：📋 即用情报 (Actionable Intelligence)
使用 <info-panel> 组件，清晰展示 API 地址、API 密钥（带复制和显/隐功能）、默认模型。
右栏：🚀 实时交互终端 (Live Terminal)
使用 <live-terminal> 组件，包含：
AI 输出窗口: 支持 Markdown 的流式响应显示。
请求日志 & 性能洞察: 以虚拟滚动表格展示历史请求（ID, 状态, TTFB, 总耗时, 速率），并实时计算最近10次的成功率和平均耗时。
指令输入区: 支持自动增高的 <textarea> 和状态同步的 发送/取消 按钮。
附加情报区 (Collapsible Sections)
使用 <details> 元素实现，默认折叠。
[ ⚙️ 主流客户端集成指南 ]: 使用 <client-guides> 组件，通过 Tab 展示 ChatGPT-Next-Web, LobeChat, cURL, Python 的预填值配置块。
[ 🔌 兼容接口参考 ]: 表格列出所有代理的 API 接口及方法。
[ 🛠️ 调试与复现工具箱 ]: 展示 上游接口、项目模式，并提供“查看上次请求详情”和“一键复现 cURL”的功能。
最终指令：
现在，请严格遵循以上这份包含后端逻辑和前端体验的完整蓝图，结合我接下来提供的 Python 项目源代码，开始转换，生成那个单一、完整、自包含且可立即部署的“艺术品级” JavaScript Worker 文件。

注释也要中文化哈，还有就是web界面使用说明一定要中文化

我最终只想要稳定部署无bug无错误的

类似于这种错误你要比避免：
ncaught SyntaxError: Invalid or unexpected token at worker.js:345:20

我下方可以给你几个我的成功品你可以参考参考一下，当然你更好的要面向汉化，比如web汉化啊，模型名名称汉化啊等等的，还有相对应的web UI界面要有实时日志调试面板啊（只有web UI带啊，其他cherry studio等等那些不用带调试日志的输出），这样更容易看出问题等等的，当然你还要适配openAI兼容接口等等的适配我cherry studio软件等等那些聊天软件ide等等的使用，还有就是呢这个比如有些文本对话啊等等的你要适配沉浸式翻译浏览器扩展插件等等的，因为这样子可以极大解决这个全方位适配性全面性，还有其他更多你可以自由想象，一定要能便利帮助好用户的和开发者的。比如说这些技术点啊你根据实际项目都要集成好噢， OpenAI API格式兼容 · 多模态视觉模型支持 · 自动Cookie持久化 · 上游服务伪装 · 实时轮询机制 · Base64图片处理 · 自动模型ID映射 · 流式响应支持 · CORS跨域处理 · 开发者Web UI · 图片上传代理 · Markdown渲染 · 画廊预览下载 · 进度条动画等等不限于这些。
你可以参考的代码（知识库、成品项目）如下：

比如做到真匿名等等你可以参考这个：
/**
 * =================================================================================
 * 项目: pixarmory-2api (Cloudflare Worker 单文件版)
 * 版本: 1.0.0 (代号: Phantom Artist)
 * 作者: 首席AI执行官 (Principal AI Executive Officer)
 * 协议: 奇美拉协议 · 综合版 (Project Chimera: Synthesis Edition)
 * 日期: 2025-12-03
 * 
 * [核心特性]
 * 1. [无痕伪装] 自动生成 Vercel 追踪 ID 和浏览器指纹，模拟匿名用户，无需 Cookie 即可运行。
 * 2. [多模态支持] 完美兼容 OpenAI Vision 格式，支持 Base64 图片自动上传至 PixArmory R2 存储桶。
 * 3. [多图参考] 突破性支持多张参考图（Web UI 支持多选，API 支持多 image_url）。
 * 4. [开发者驾驶舱] 内置全中文、高颜值的调试界面，包含实时日志和 cURL 生成器。
 * =================================================================================
 */

// --- [第一部分: 核心配置 (Configuration-as-Code)] ---
const CONFIG = {
  // 项目元数据
  PROJECT_NAME: "pixarmory-2api",
  PROJECT_VERSION: "1.0.0",
  
  // 安全配置 (建议在 Cloudflare 环境变量中设置)
  API_MASTER_KEY: "1", 
  
  // 上游配置
  UPSTREAM_ORIGIN: "https://pixarmory.org",
  
  // 模型列表 (映射到 PixArmory 的内部逻辑)
  // 用户可以使用这些模型名称来触发服务
  MODELS: [
    "pixarmory-v1",
    "pixarmory-flux",
    "gpt-4o",      // 兼容性映射
    "dall-e-3",    // 兼容性映射
    "midjourney"   // 兼容性映射
  ],
  DEFAULT_MODEL: "pixarmory-v1",

  // 伪装配置 - 浏览器指纹池
  USER_AGENTS: [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
  ]
};

// --- [第二部分: Worker 入口与路由] ---
export default {
  async fetch(request, env, ctx) {
    // 环境变量覆盖
    const apiKey = env.API_MASTER_KEY || CONFIG.API_MASTER_KEY;
    // 允许通过环境变量注入 Cookie，虽然 PixArmory 匿名可用，但带上 Cookie 可能更稳定
    const staticCookie = env.PIXARMORY_COOKIE || ""; 
    
    request.ctx = { apiKey, staticCookie };

    const url = new URL(request.url);

    // 1. CORS 预检
    if (request.method === 'OPTIONS') return handleCorsPreflight();

    // 2. 路由分发
    if (url.pathname === '/') return handleUI(request);
    if (url.pathname.startsWith('/v1/')) return handleApi(request);
    if (url.pathname === '/proxy/upload') return handleProxyUpload(request); // 代理前端上传
    
    return createErrorResponse(`路径未找到: ${url.pathname}`, 404, 'not_found');
  }
};

// --- [第三部分: 核心业务逻辑 (Identity & Logic)] ---

// 1. 身份管理器：生成高度逼真的匿名身份
class IdentityManager {
  static getHeaders(staticCookie = "") {
    const ua = CONFIG.USER_AGENTS[Math.floor(Math.random() * CONFIG.USER_AGENTS.length)];
    const requestId = crypto.randomUUID();
    
    // [关键] 构造伪造的 Vercel ID，格式参考抓包数据: cdg1::iad1::mtcrb-1764766848386-58e792ec999f
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 14);
    const vercelId = `cdg1::iad1::${randomPart}-${timestamp}-${Math.random().toString(16).substring(2, 10)}`;
    
    const headers = {
      "Host": "pixarmory.org",
      "Origin": "https://pixarmory.org",
      "Referer": "https://pixarmory.org/",
      "User-Agent": ua,
      "Accept": "*/*",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Content-Type": "application/json",
      "x-vercel-id": vercelId,
      "x-request-id": requestId,
      "priority": "u=1, i",
      "sec-ch-ua": '"Chromium";v="120", "Google Chrome";v="120", "Not_A Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    };

    // 如果有静态 Cookie 则使用，否则不发送 Cookie (模拟纯匿名新用户)
    if (staticCookie) {
      headers["Cookie"] = staticCookie;
    }

    return headers;
  }
}

// 2. 上传逻辑：处理 R2 预签名上传 (两阶段)
async function uploadImageToR2(fileBlob, fileName, fileType, ctx) {
  const headers = IdentityManager.getHeaders(ctx.staticCookie);
  
  // Phase 1: 获取上传 URL
  // 抓包: POST /api/upload-url
  const initRes = await fetch(`${CONFIG.UPSTREAM_ORIGIN}/api/upload-url`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      fileName: fileName,
      fileType: fileType,
      fileSize: fileBlob.size
    })
  });

  if (!initRes.ok) {
    throw new Error(`获取上传地址失败: ${initRes.status} ${await initRes.text()}`);
  }

  const initData = await initRes.json();
  const { uploadUrl, accessUrl } = initData;

  // Phase 2: 执行 PUT 上传到 Cloudflare R2
  // 注意：上传到 R2 需要移除大部分 headers，只保留 Content-Type 等
  const uploadHeaders = {
    "Content-Type": fileType,
    "User-Agent": headers["User-Agent"]
  };

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: uploadHeaders,
    body: fileBlob
  });

  if (!uploadRes.ok) {
    throw new Error(`上传图片到 R2 失败: ${uploadRes.status}`);
  }

  return accessUrl;
}

// 3. 生成逻辑：调用核心 API
async function generateImage(prompt, imageUrls = [], ctx) {
  const headers = IdentityManager.getHeaders(ctx.staticCookie);
  
  // 构造 Payload
  // 抓包: {"imageUrls":[...], "prompt":"...", "toolType":"general"}
  const payload = {
    imageUrls: imageUrls, // 支持多张图片
    prompt: prompt,
    toolType: "general"
  };

  const res = await fetch(`${CONFIG.UPSTREAM_ORIGIN}/api/process-image`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`生成请求失败 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  
  // 处理响应
  // 抓包显示成功时直接返回 processedImageUrl
  if (data.processedImageUrl) {
    return {
      url: data.processedImageUrl,
      creditsUsed: data.creditsUsed,
      remainingCredits: data.remainingCredits
    };
  } else if (data.taskId) {
    // 如果返回 taskId，说明变成了异步 (虽然抓包是同步的，但为了健壮性预留分支)
    // 简单起见，这里抛出错误，或者后续可以实现轮询
    throw new Error("上游返回了异步任务 ID，当前版本暂不支持轮询模式 (请重试)。");
  } else if (data.error) {
    throw new Error(`上游业务错误: ${data.error}`);
  } else {
    throw new Error("上游响应格式未知: " + JSON.stringify(data));
  }
}

// --- [第四部分: API 接口处理] ---

async function handleApi(request) {
  if (!verifyAuth(request)) return createErrorResponse('Unauthorized', 401, 'unauthorized');

  const url = new URL(request.url);
  const requestId = `req-${crypto.randomUUID()}`;

  if (url.pathname === '/v1/models') {
    return new Response(JSON.stringify({
      object: 'list',
      data: CONFIG.MODELS.map(id => ({ id, object: 'model', created: Date.now(), owned_by: 'pixarmory' }))
    }), { headers: corsHeaders({ 'Content-Type': 'application/json' }) });
  }

  if (url.pathname === '/v1/chat/completions') {
    return handleChatCompletions(request, requestId);
  }
  
  if (url.pathname === '/v1/images/generations') {
    return handleImageGenerations(request, requestId);
  }

  return createErrorResponse('Not Found', 404, 'not_found');
}

// 处理 Chat 接口 (适配 Cherry Studio / NextChat)
async function handleChatCompletions(request, requestId) {
  try {
    const body = await request.json();
    const messages = body.messages || [];
    const lastMsg = messages[messages.length - 1];
    
    let prompt = "";
    let imageUrls = [];

    // 1. 解析多模态消息 (OpenAI Vision 格式)
    if (Array.isArray(lastMsg.content)) {
      for (const part of lastMsg.content) {
        if (part.type === 'text') prompt += part.text;
        if (part.type === 'image_url') {
          const url = part.image_url.url;
          if (url.startsWith('data:')) {
            // Base64 图片，需要上传
            const fileData = dataURLtoBlob(url);
            // 并发上传所有图片
            const uploadedUrl = await uploadImageToR2(fileData.blob, `upload-${Date.now()}.${fileData.ext}`, fileData.type, request.ctx);
            imageUrls.push(uploadedUrl);
          } else {
            // 普通 URL，直接使用 (PixArmory 支持 R2 链接，如果是外部链接可能需要中转，这里假设客户端传的是可访问链接)
            imageUrls.push(url); 
          }
        }
      }
    } else {
      prompt = lastMsg.content;
    }

    // 2. 兼容性处理：如果 Prompt 是 JSON (WebUI 传参 hack)，尝试解析
    try {
      if (typeof prompt === 'string' && prompt.trim().startsWith('{')) {
        const parsed = JSON.parse(prompt);
        if (parsed.prompt) prompt = parsed.prompt;
        if (parsed.imageUrls && Array.isArray(parsed.imageUrls)) {
            imageUrls = imageUrls.concat(parsed.imageUrls);
        }
      }
    } catch(e) {}

    if (!prompt && imageUrls.length === 0) throw new Error("Prompt 不能为空");

    // 3. 执行生成
    const result = await generateImage(prompt, imageUrls, request.ctx);
    
    // 4. 构造 Markdown 响应
    const content = `![Generated Image](${result.url})\n\n**Prompt:** ${prompt}\n**Credits:** Used ${result.creditsUsed}, Remaining ${result.remainingCredits}`;

    // 5. 模拟流式输出 (为了兼容性)
    if (body.stream) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();
      
      (async () => {
        const chunk = {
          id: requestId, object: 'chat.completion.chunk', created: Math.floor(Date.now()/1000),
          model: body.model, choices: [{ index: 0, delta: { content }, finish_reason: null }]
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        
        const end = {
          id: requestId, object: 'chat.completion.chunk', created: Math.floor(Date.now()/1000),
          model: body.model, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }]
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(end)}\n\n`));
        await writer.write(encoder.encode('data: [DONE]\n\n'));
        await writer.close();
      })();

      return new Response(readable, { headers: corsHeaders({ 'Content-Type': 'text/event-stream' }) });
    }

    // 6. 非流式响应
    return new Response(JSON.stringify({
      id: requestId, object: 'chat.completion', created: Math.floor(Date.now()/1000),
      model: body.model, choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }]
    }), { headers: corsHeaders({ 'Content-Type': 'application/json' }) });

  } catch (e) {
    return createErrorResponse(e.message, 500, 'internal_error');
  }
}

// 处理 Image 接口 (标准 DALL-E 格式)
async function handleImageGenerations(request, requestId) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    // 图像接口通常只传 prompt，不支持参考图，除非扩展协议
    const result = await generateImage(prompt, [], request.ctx);
    
    return new Response(JSON.stringify({
      created: Math.floor(Date.now()/1000),
      data: [{ url: result.url, revised_prompt: prompt }]
    }), { headers: corsHeaders({ 'Content-Type': 'application/json' }) });
  } catch (e) {
    return createErrorResponse(e.message, 500, 'internal_error');
  }
}

// 代理上传接口 (供 WebUI 使用)
async function handleProxyUpload(request) {
  if (!verifyAuth(request)) return createErrorResponse('Unauthorized', 401, 'unauthorized');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) throw new Error("No file provided");

    const accessUrl = await uploadImageToR2(file, file.name, file.type, request.ctx);
    
    return new Response(JSON.stringify({ success: true, url: accessUrl }), {
      headers: corsHeaders({ 'Content-Type': 'application/json' })
    });
  } catch (e) {
    return createErrorResponse(e.message, 500, 'upload_failed');
  }
}

// --- 辅助函数 ---

function verifyAuth(request) {
  const auth = request.headers.get('Authorization');
  const key = request.ctx.apiKey;
  if (key === "1") return true;
  return auth === `Bearer ${key}`;
}

function createErrorResponse(msg, status, code) {
  return new Response(JSON.stringify({ error: { message: msg, type: 'api_error', code } }), {
    status, headers: corsHeaders({ 'Content-Type': 'application/json' })
  });
}

function corsHeaders(headers = {}) {
  return {
    ...headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function handleCorsPreflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

// Base64 DataURL 转 Blob
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return { blob: new Blob([u8arr], { type: mime }), type: mime, ext: mime.split('/')[1] };
}

// --- [第四部分: 开发者驾驶舱 UI (WebUI)] ---
function handleUI(request) {
  const origin = new URL(request.url).origin;
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME} - 开发者驾驶舱</title>
    <style>
      :root { --bg: #121212; --panel: #1E1E1E; --border: #333; --text: #E0E0E0; --primary: #FFBF00; --accent: #007AFF; }
      body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); margin: 0; height: 100vh; display: flex; overflow: hidden; }
      .sidebar { width: 380px; background: var(--panel); border-right: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; overflow-y: auto; }
      .main { flex: 1; display: flex; flex-direction: column; padding: 20px; }
      
      .box { background: #252525; padding: 12px; border-radius: 6px; border: 1px solid var(--border); margin-bottom: 15px; }
      .label { font-size: 12px; color: #888; margin-bottom: 5px; display: block; }
      .code-block { font-family: monospace; font-size: 12px; color: var(--primary); word-break: break-all; background: #111; padding: 8px; border-radius: 4px; cursor: pointer; }
      
      input, select, textarea { width: 100%; background: #333; border: 1px solid #444; color: #fff; padding: 8px; border-radius: 4px; margin-bottom: 10px; box-sizing: border-box; }
      button { width: 100%; padding: 10px; background: var(--primary); border: none; border-radius: 4px; font-weight: bold; cursor: pointer; color: #000; }
      button:disabled { background: #555; cursor: not-allowed; }
      
      .upload-area { border: 1px dashed #555; border-radius: 4px; padding: 20px; text-align: center; cursor: pointer; transition: 0.2s; background-size: cover; background-position: center; position: relative; min-height: 80px; display: flex; align-items: center; justify-content: center; }
      .upload-area:hover { border-color: var(--primary); background-color: #2a2a2a; }
      .upload-text { font-size: 12px; color: #888; pointer-events: none; z-index: 2; text-shadow: 0 1px 2px black; }
      .preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 5px; margin-top: 10px; }
      .preview-item { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #444; }
      
      .chat-window { flex: 1; background: #000; border: 1px solid var(--border); border-radius: 8px; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
      .msg { max-width: 80%; padding: 10px 15px; border-radius: 8px; line-height: 1.5; }
      .msg.user { align-self: flex-end; background: #333; color: #fff; }
      .msg.ai { align-self: flex-start; background: #1a1a1a; border: 1px solid #333; width: 100%; max-width: 100%; }
      .msg.ai img { max-width: 100%; border-radius: 4px; margin-top: 10px; display: block; cursor: pointer; }
      
      .log-panel { height: 150px; background: #111; border-top: 1px solid var(--border); padding: 10px; font-family: monospace; font-size: 11px; color: #aaa; overflow-y: auto; }
      .log-entry { margin-bottom: 4px; border-bottom: 1px solid #222; padding-bottom: 2px; }
      .log-time { color: #666; margin-right: 5px; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2 style="margin-top:0">🎨 ${CONFIG.PROJECT_NAME} <span style="font-size:12px;color:#888">v${CONFIG.PROJECT_VERSION}</span></h2>
        
        <div class="box">
            <span class="label">API 密钥</span>
            <div class="code-block" onclick="copy('${request.ctx.apiKey}')">${request.ctx.apiKey}</div>
        </div>

        <div class="box">
            <span class="label">API 接口地址</span>
            <div class="code-block" onclick="copy('${origin}/v1/chat/completions')">${origin}/v1/chat/completions</div>
        </div>

        <div class="box">
            <span class="label">参考图 (图生图 - 可选多张)</span>
            <input type="file" id="file-input" accept="image/*" multiple style="display:none" onchange="handleFileSelect()">
            <div class="upload-area" id="upload-area" onclick="document.getElementById('file-input').click()">
                <span class="upload-text" id="upload-text">点击上传图片 (支持多选)</span>
            </div>
            <div class="preview-grid" id="preview-grid"></div>

            <span class="label" style="margin-top:10px">提示词</span>
            <textarea id="prompt" rows="4" placeholder="描述你想生成的图片..."></textarea>
            
            <button id="btn-gen" onclick="generate()">开始生成</button>
        </div>
    </div>

    <main class="main">
        <div class="chat-window" id="chat">
            <div style="color:#666; text-align:center; margin-top:50px;">
                PixArmory 代理服务就绪。<br>
                支持匿名模式，每次请求自动轮换指纹。<br>
                支持上传多张参考图进行融合生成。
            </div>
        </div>
        <div class="log-panel" id="logs"></div>
    </main>

    <script>
        const API_KEY = "${request.ctx.apiKey}";
        const ENDPOINT = "${origin}/v1/chat/completions";
        const UPLOAD_URL = "${origin}/proxy/upload";
        let uploadedUrls = [];

        function log(msg) {
            const el = document.getElementById('logs');
            const div = document.createElement('div');
            div.className = 'log-entry';
            div.innerHTML = \`<span class="log-time">[\${new Date().toLocaleTimeString()}]</span> \${msg}\`;
            el.appendChild(div);
            el.scrollTop = el.scrollHeight;
        }

        function copy(text) {
            navigator.clipboard.writeText(text);
            log('已复制到剪贴板');
        }

        async function handleFileSelect() {
            const input = document.getElementById('file-input');
            const files = input.files;
            if (!files.length) return;

            const text = document.getElementById('upload-text');
            const grid = document.getElementById('preview-grid');
            
            text.innerText = "上传中...";
            
            // 清空旧数据
            uploadedUrls = [];
            grid.innerHTML = '';

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                try {
                    log(\`开始上传参考图 \${i+1}/\${files.length}...\`);
                    const res = await fetch(UPLOAD_URL, {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + API_KEY },
                        body: formData
                    });
                    const data = await res.json();
                    if (data.success) {
                        uploadedUrls.push(data.url);
                        log(\`参考图 \${i+1} 上传成功: \${data.url}\`);
                        
                        // 添加预览
                        const img = document.createElement('img');
                        img.src = data.url;
                        img.className = 'preview-item';
                        grid.appendChild(img);
                    } else {
                        log(\`上传失败: \${JSON.stringify(data)}\`);
                    }
                } catch (e) {
                    log(\`上传错误: \${e.message}\`);
                }
            }
            
            if (uploadedUrls.length > 0) {
                text.innerText = \`✅ 已上传 \${uploadedUrls.length} 张图片\`;
                text.style.color = "#66BB6A";
            } else {
                text.innerText = "❌ 上传失败";
                text.style.color = "#CF6679";
            }
        }

        function appendMsg(role, html) {
            const div = document.createElement('div');
            div.className = \`msg \${role}\`;
            div.innerHTML = html;
            document.getElementById('chat').appendChild(div);
            div.scrollIntoView({ behavior: "smooth" });
            return div;
        }

        async function generate() {
            const prompt = document.getElementById('prompt').value.trim();
            if (!prompt && uploadedUrls.length === 0) return alert('请输入提示词或上传图片');

            const btn = document.getElementById('btn-gen');
            btn.disabled = true;
            btn.innerText = "生成中...";

            if(document.querySelector('.chat-window').innerText.includes('代理服务就绪')) {
                document.getElementById('chat').innerHTML = '';
            }

            let userHtml = prompt || '[仅参考图]';
            if (uploadedUrls.length > 0) userHtml += \` <span style="font-size:12px;color:#888">[含 \${uploadedUrls.length} 张参考图]</span>\`;
            appendMsg('user', userHtml);
            
            const loadingMsg = appendMsg('ai', '⏳ 正在请求 PixArmory 生成图片 (匿名模式)...');

            try {
                // 构造请求
                let payload = {
                    model: "pixarmory-v1",
                    messages: [{ role: "user", content: prompt }],
                    stream: true
                };

                // 如果有图片，构造多模态消息 (hacky way for WebUI to pass array)
                if (uploadedUrls.length > 0) {
                    payload.messages[0].content = JSON.stringify({
                        prompt: prompt,
                        imageUrls: uploadedUrls
                    });
                }

                log('发送生成请求...');
                log(\`Payload: \${JSON.stringify(payload)}\`);

                const res = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error((await res.json()).error?.message || '生成失败');

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let fullContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6);
                            if (dataStr === '[DONE]') break;
                            try {
                                const json = JSON.parse(dataStr);
                                const content = json.choices[0].delta.content;
                                if (content) fullContent += content;
                            } catch (e) {}
                        }
                    }
                }

                // 解析 Markdown 图片
                const match = fullContent.match(/\\((.*?)\\)/);
                if (match) {
                    const imgUrl = match[1];
                    loadingMsg.innerHTML = \`
                        <div><strong>生成成功</strong></div>
                        <img src="\${imgUrl}" onclick="window.open(this.src)">
                        <div style="margin-top:5px"><a href="\${imgUrl}" download style="color:var(--primary)">下载原图</a></div>
                    \`;
                    log('生成成功: ' + imgUrl);
                } else {
                    loadingMsg.innerText = fullContent;
                }

            } catch (e) {
                loadingMsg.innerHTML = \`<span style="color:#CF6679">❌ 错误: \${e.message}</span>\`;
                log('错误: ' + e.message);
            } finally {
                btn.disabled = false;
                btn.innerText = "开始生成";
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

比如有些需要cookie的你可以看看这个：
/**
 * =================================================================================
 * 项目: akash-2api (Cloudflare Worker 单文件版)
 * 版本: 2.0.0 (代号: Session Injection - 最终修正版)
 * 作者: 首席AI执行官 (Principal AI Executive Officer)
 * 协议: 奇美拉协议 · 综合版 (Project Chimera: Synthesis Edition)
 * 日期: 2025-11-30
 * 
 * [v2.0.0 关键修正]
 * 1. [核心修复] 解决了 403 Unauthorized 问题。必须提供 Cookie (session_token)。
 * 2. [协议适配] 完美支持 Vercel AI SDK 的流式响应解析。
 * 3. [指纹伪装] 严格复刻浏览器指纹，配合 Cookie 通过 WAF。
 * =================================================================================
 */

// --- [第一部分: 核心配置 (Configuration-as-Code)] ---
const CONFIG = {
  // 项目元数据
  PROJECT_NAME: "akash-2api",
  PROJECT_VERSION: "2.0.0",

  // 安全配置 (建议在 Cloudflare 环境变量中设置 API_MASTER_KEY)
  API_MASTER_KEY: "1",

  // 上游服务配置
  UPSTREAM_ORIGIN: "https://chat.akash.network",
  UPSTREAM_API_URL: "https://chat.akash.network/api/chat",

  // --- [关键配置] 凭证 (必须设置) ---
  // 从你的 HAR 文件中提取的 Cookie。
  // 如果部署后失效，请在浏览器 F12 -> Network -> 刷新页面 -> 复制最新请求的 Cookie
  // 格式: "cf_clearance=...; session_token=...; cookie-consent=accepted"
  AKASH_COOKIE: "cf_clearance=GmLSNlNmwSwo2a7Zk7XPOx3L8cDOGEOnbXxO34SRSag-1764488372-1.2.1.1-LNkVukDPqtLDgJv8zhUrZ5DXMLnwKEnFXUKApgSw1lr7HnDdYcouE1HXJHJG0G1FMF_6P7NqP.7Iv14LTLeqxQg.zPmRg7R8XM6_Ff0pwM9aZTBNyA61eTRBYeIHw_ntLFCpW5pWA5UwKwyVGZhRg5FPtqqLhG38RFsxPWkBg.uWxue9Qmgd4q5fi3XeCOcv55v4mnPjOkmiH88RDbsKl33LkJp9k5Gr.CpLfm2FAA0; session_token=543d9ddd7f514c811ec49b134b0c97287e73b06cb700c3c4a13d5903775e3571; cookie-consent=accepted",

  // 伪装头 (必须与 Cookie 来源浏览器的指纹一致)
  HEADERS: {
    "Host": "chat.akash.network",
    "Origin": "https://chat.akash.network",
    "Referer": "https://chat.akash.network/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    "Content-Type": "application/json",
    "Accept": "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "priority": "u=1, i"
  },

  // 模型列表
  MODELS: [
    "DeepSeek-V3.1"
  ],
  DEFAULT_MODEL: "DeepSeek-V3.1"
};

// --- [第二部分: Worker 入口与路由] ---
export default {
  async fetch(request, env, ctx) {
    // 环境变量覆盖
    const apiKey = env.API_MASTER_KEY || CONFIG.API_MASTER_KEY;
    const cookie = env.AKASH_COOKIE || CONFIG.AKASH_COOKIE;
    
    request.ctx = { apiKey, cookie };

    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return handleCorsPreflight();
    if (url.pathname === '/') return handleUI(request);
    if (url.pathname.startsWith('/v1/')) return handleApi(request);
    
    return createErrorResponse(`路径未找到: ${url.pathname}`, 404, 'not_found');
  }
};

// --- [第三部分: API 代理逻辑] ---

async function handleApi(request) {
  if (!verifyAuth(request)) {
    return createErrorResponse('需要 Bearer Token 认证。', 401, 'unauthorized');
  }

  const url = new URL(request.url);
  const requestId = `req-${crypto.randomUUID()}`;

  if (url.pathname === '/v1/models') {
    return handleModelsRequest();
  } else if (url.pathname === '/v1/chat/completions') {
    return handleChatCompletions(request, requestId);
  } else {
    return createErrorResponse(`不支持的 API 路径: ${url.pathname}`, 404, 'not_found');
  }
}

function verifyAuth(request) {
  const authHeader = request.headers.get('Authorization');
  const validKey = request.ctx.apiKey;
  if (validKey === "1") return true; 
  return authHeader && authHeader === `Bearer ${validKey}`;
}

function handleModelsRequest() {
  const modelsData = {
    object: 'list',
    data: CONFIG.MODELS.map(modelId => ({
      id: modelId,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'akash-network',
    })),
  };
  return new Response(JSON.stringify(modelsData), {
    headers: corsHeaders({ 'Content-Type': 'application/json' })
  });
}

async function handleChatCompletions(request, requestId) {
  try {
    const body = await request.json();
    const model = body.model || CONFIG.DEFAULT_MODEL;
    const stream = body.stream !== false;

    // 1. 提取 System Prompt 和 Messages
    let systemPrompt = "";
    let messages = [];
    
    if (body.messages) {
      for (const msg of body.messages) {
        if (msg.role === 'system') {
          systemPrompt += msg.content + "\n";
        } else {
          messages.push({
            role: msg.role,
            content: msg.content,
            parts: [{ type: "text", text: msg.content }] // 严格匹配抓包结构
          });
        }
      }
    }
    
    if (!systemPrompt) systemPrompt = "You are a helpful assistant.";

    // 2. 构造 Akash Payload
    const akashPayload = {
      id: generateRandomId(16),
      messages: messages,
      model: model,
      system: systemPrompt.trim(),
      temperature: String(body.temperature || "0.60"),
      topP: String(body.top_p || "0.95"),
      context: []
    };

    // 3. 准备请求头 (注入 Cookie)
    const headers = {
      ...CONFIG.HEADERS,
      "Cookie": request.ctx.cookie // 关键：注入 Cookie
    };

    // 4. 发送请求
    const response = await fetch(CONFIG.UPSTREAM_API_URL + "/", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(akashPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = errorText;
      try {
        const errJson = JSON.parse(errorText);
        if (errJson.message) errorMsg = errJson.message;
      } catch(e) {}
      
      // 如果是 403，明确提示 Cookie 问题
      if (response.status === 403) {
        errorMsg += " (请检查 AKASH_COOKIE 是否过期或正确填写)";
      }
      
      return createErrorResponse(`上游服务错误 (${response.status}): ${errorMsg}`, response.status, 'upstream_error');
    }

    // 5. 流式处理
    if (stream) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      (async () => {
        try {
          const reader = response.body.getReader();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;
              
              // Vercel AI SDK 格式解析
              // 0:"text" -> 文本增量
              // e:{...} -> 结束/错误
              const match = line.match(/^(\w+):(.*)$/);
              if (match) {
                const type = match[1];
                let contentRaw = match[2];
                
                if (type === '0') {
                  try {
                    const content = JSON.parse(contentRaw);
                    const chunk = createChatCompletionChunk(requestId, model, content);
                    await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
                  } catch (e) {}
                } else if (type === 'e') {
                  // 结束信号
                  const endChunk = createChatCompletionChunk(requestId, model, "", "stop");
                  await writer.write(encoder.encode(`data: ${JSON.stringify(endChunk)}\n\n`));
                }
              }
            }
          }
          await writer.write(encoder.encode('data: [DONE]\n\n'));
        } catch (e) {
          const errChunk = createChatCompletionChunk(requestId, model, `\n\n[Error: ${e.message}]`, "stop");
          await writer.write(encoder.encode(`data: ${JSON.stringify(errChunk)}\n\n`));
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: corsHeaders({ 'Content-Type': 'text/event-stream' })
      });

    } else {
      return createErrorResponse("请使用 stream=true 模式。", 400, 'invalid_request');
    }

  } catch (e) {
    return createErrorResponse(e.message, 500, 'internal_error');
  }
}

// --- 辅助函数 ---

function generateRandomId(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function createChatCompletionChunk(id, model, content, finishReason = null) {
  return {
    id: id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model: model,
    choices: [{ index: 0, delta: content ? { content: content } : {}, finish_reason: finishReason }]
  };
}

function createErrorResponse(message, status, code) {
  return new Response(JSON.stringify({
    error: { message, type: 'api_error', code }
  }), {
    status,
    headers: corsHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  });
}

function handleCorsPreflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders(headers = {}) {
  return {
    ...headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// --- [第四部分: 开发者驾驶舱 UI (WebUI)] ---
function handleUI(request) {
  const origin = new URL(request.url).origin;
  const apiKey = request.ctx.apiKey;
  const cookieStatus = request.ctx.cookie ? "✅ 已配置" : "❌ 未配置 (请在代码 CONFIG 中填写)";
  
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME} - 开发者驾驶舱</title>
    <style>
      :root { --bg: #121212; --panel: #1E1E1E; --border: #333; --text: #E0E0E0; --primary: #FFBF00; --success: #66BB6A; --error: #CF6679; }
      body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); margin: 0; height: 100vh; display: flex; overflow: hidden; }
      .sidebar { width: 380px; background: var(--panel); border-right: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0; }
      .main { flex: 1; display: flex; flex-direction: column; padding: 20px; position: relative; }
      .box { background: #252525; padding: 15px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 20px; }
      .label { font-size: 12px; color: #888; margin-bottom: 8px; display: block; font-weight: 600; }
      .code-block { font-family: monospace; font-size: 12px; color: var(--primary); word-break: break-all; background: #111; padding: 10px; border-radius: 4px; cursor: pointer; }
      input, select, textarea { width: 100%; background: #333; border: 1px solid #444; color: #fff; padding: 10px; border-radius: 4px; margin-bottom: 15px; box-sizing: border-box; }
      button { width: 100%; padding: 12px; background: var(--primary); border: none; border-radius: 4px; font-weight: bold; cursor: pointer; color: #000; }
      button:disabled { background: #555; cursor: not-allowed; }
      .chat-window { flex: 1; background: #000; border: 1px solid var(--border); border-radius: 8px; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
      .msg { max-width: 85%; padding: 15px; border-radius: 8px; line-height: 1.6; word-wrap: break-word; }
      .msg.user { align-self: flex-end; background: #333; color: #fff; }
      .msg.ai { align-self: flex-start; background: #1a1a1a; border: 1px solid #333; }
      .msg.error { color: var(--error); border-color: var(--error); }
      .debug-panel { margin-top: 20px; border-top: 1px solid var(--border); padding-top: 20px; }
      .log-entry { font-family: monospace; font-size: 11px; border-bottom: 1px solid #333; padding: 5px 0; color: #aaa; }
      .log-entry.err { color: var(--error); }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2 style="margin-top:0; display:flex; align-items:center; gap:10px;">
            ⚡ ${CONFIG.PROJECT_NAME} 
            <span style="font-size:12px;color:#888; font-weight:normal; margin-top:4px;">v${CONFIG.PROJECT_VERSION}</span>
        </h2>
        
        <div class="box">
            <span class="label">Cookie 状态</span>
            <div style="color: ${request.ctx.cookie ? 'var(--success)' : 'var(--error)'}; font-weight:bold;">${cookieStatus}</div>
        </div>

        <div class="box">
            <span class="label">API 密钥 (点击复制)</span>
            <div class="code-block" onclick="copy('${apiKey}')">${apiKey}</div>
        </div>

        <div class="box">
            <span class="label">API 接口地址</span>
            <div class="code-block" onclick="copy('${origin}/v1/chat/completions')">${origin}/v1/chat/completions</div>
        </div>

        <div class="box">
            <span class="label">模型选择</span>
            <select id="model">
                ${CONFIG.MODELS.map(m => `<option value="${m}">${m}</option>`).join('')}
            </select>
            
            <span class="label">提示词 (Prompt)</span>
            <textarea id="prompt" rows="5" placeholder="输入你的问题...">你好，请介绍一下你自己。</textarea>
            
            <button id="btn-gen" onclick="sendRequest()">🚀 发送请求</button>
        </div>
        
        <div class="debug-panel">
            <span class="label">实时调试日志</span>
            <div id="debug-log" style="height: 150px; overflow-y: auto; background: #000; padding: 10px; border-radius: 4px;"></div>
        </div>
    </div>

    <main class="main">
        <div class="chat-window" id="chat">
            <div style="color:#666; text-align:center; margin-top:100px;">
                <div style="font-size:40px; margin-bottom:20px;">☁️</div>
                <h3>Akash Network 代理服务就绪</h3>
                <p>支持 DeepSeek-V3.1 等高性能模型。<br>请确保已在代码中配置有效的 Cookie。</p>
            </div>
        </div>
    </main>

    <script>
        const API_KEY = "${apiKey}";
        const ENDPOINT = "${origin}/v1/chat/completions";
        
        function copy(text) {
            navigator.clipboard.writeText(text);
            alert('已复制');
        }

        function log(type, msg) {
            const el = document.getElementById('debug-log');
            const div = document.createElement('div');
            div.className = \`log-entry \${type}\`;
            div.innerText = \`[\${new Date().toLocaleTimeString()}] \${msg}\`;
            el.appendChild(div);
            el.scrollTop = el.scrollHeight;
        }

        function appendMsg(role, text) {
            const div = document.createElement('div');
            div.className = \`msg \${role}\`;
            div.innerText = text;
            document.getElementById('chat').appendChild(div);
            div.scrollIntoView({ behavior: "smooth" });
            return div;
        }

        async function sendRequest() {
            const prompt = document.getElementById('prompt').value.trim();
            if (!prompt) return;

            const btn = document.getElementById('btn-gen');
            btn.disabled = true;
            btn.innerText = '⏳ 处理中...';

            if(document.querySelector('.chat-window').innerText.includes('代理服务就绪')) {
                document.getElementById('chat').innerHTML = '';
            }

            appendMsg('user', prompt);
            const aiMsg = appendMsg('ai', '');
            aiMsg.innerText = "▋";

            log('req', \`发送请求: \${prompt.substring(0, 20)}...\`);

            try {
                const res = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: { 
                        'Authorization': 'Bearer ' + API_KEY, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        model: document.getElementById('model').value,
                        messages: [{ role: 'user', content: prompt }],
                        stream: true
                    })
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(\`HTTP \${res.status}: \${errText}\`);
                }

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let fullText = "";
                aiMsg.innerText = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6);
                            if (dataStr === '[DONE]') continue;
                            try {
                                const data = JSON.parse(dataStr);
                                const content = data.choices[0]?.delta?.content || "";
                                fullText += content;
                                aiMsg.innerText = fullText;
                            } catch (e) {}
                        }
                    }
                }
                log('res', '响应接收完成');

            } catch (e) {
                aiMsg.classList.add('error');
                aiMsg.innerText += \`\n[错误: \${e.message}]\`;
                log('err', e.message);
            } finally {
                btn.disabled = false;
                btn.innerText = '🚀 发送请求';
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}



// =================================================================================
//  项目: aiemojify-2api (Cloudflare Worker 单文件版)
//  版本: 1.2.0 (代号: Visionary Compatibility - 视觉兼容版)
//  作者: 首席AI执行官 (Principal AI Executive Officer)
//  协议: 奇美拉协议 · 综合版 (Project Chimera: Synthesis Edition)
//  日期: 2025-11-28
//
//  [v1.2.0 更新日志]
//  1. [核心功能] 增加对 OpenAI Vision API 格式 (多模态) 的支持。
//     - 现在可以从聊天客户端 (如 Cherry Studio) 直接上传图片进行图生表情。
//  2. [兼容性增强] 新增模型映射功能，可将 gpt-4o 等标准模型ID映射到本服务。
//  3. [代码重构] 增加 Base64 图片上传的辅助函数，优化代码结构。
//  4. [版本迭代] 更新项目版本号及相关注释。
//
//  [v1.1.0 更新日志]
//  1. [UI修复] 修复了参考图上传预览显示不全的问题 (CSS object-fit)。
//  2. [渲染增强] 前端增加 Markdown 解析器，自动将 API 返回的图片链接渲染为画廊。
//  3. [交互优化] 新增实时进度条动画，消除等待焦虑。
//  4. [功能完善] 增加图片一键下载和全屏预览功能。
// =================================================================================

// --- [第一部分: 核心配置 (Configuration-as-Code)] ---
const CONFIG = {
  // 项目元数据
  PROJECT_NAME: "aiemojify-2api",
  PROJECT_VERSION: "1.2.0",

  // 安全配置 (建议在 Cloudflare 环境变量中设置 API_MASTER_KEY)
  API_MASTER_KEY: "1",

  // 上游服务配置
  UPSTREAM_ORIGIN: "https://aiemojify.com",
  UPSTREAM_API_URL: "https://aiemojify.com/api",
  
  // 凭证 (请务必保持此 Cookie 有效，否则无法生成)
  UPSTREAM_COOKIE: "language=en; _ga=GA1.1.905901548.1764302059; crisp-client%2Fsession%2Fe9d40bba-2fba-46de-bc0b-a9a50c9c8c0c=session_3f502514-5b32-402e-a6fe-52506d52c479; crisp-client%2Fsocket%2Fe9d40bba-2fba-46de-bc0b-a9a50c9c8c0c=0; _ga_L6P04Y43V2=GS2.1.s1764302059$o1$g1$t1764302081$j38$l0$h0",
  
  // 伪装头
  USER_AGENT: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",

  // 模型列表
  MODELS: [
    "emoji-gen-v1",
    "emoji-style-birthday"
  ],
  DEFAULT_MODEL: "emoji-gen-v1",

  // [新增] 模型映射 (将常见的视觉模型ID映射到此服务支持的模型)
  // 这使得客户端 (如 Cherry Studio) 可以无缝使用，即使它们配置为 gpt-4o
  MODEL_MAPPINGS: {
    "gpt-4o": "emoji-gen-v1",
    "gpt-4-vision-preview": "emoji-gen-v1",
    "dall-e-3": "emoji-gen-v1", // 方便某些客户端通过此模型ID调用
  },

  // 轮询配置
  POLLING_INTERVAL: 1500, // ms
  POLLING_TIMEOUT: 60000, // ms
};

// --- [第二部分: Worker 入口与路由] ---
export default {
  async fetch(request, env, ctx) {
    // 环境变量覆盖
    const apiKey = env.API_MASTER_KEY || CONFIG.API_MASTER_KEY;
    const cookie = env.UPSTREAM_COOKIE || CONFIG.UPSTREAM_COOKIE;
    
    // 将配置注入请求上下文
    request.ctx = { apiKey, cookie };

    const url = new URL(request.url);

    // 1. CORS 预检
    if (request.method === 'OPTIONS') {
      return handleCorsPreflight();
    }

    // 2. 开发者驾驶舱 (Web UI)
    if (url.pathname === '/') {
      return handleUI(request);
    } 
    // 3. API 路由
    else if (url.pathname.startsWith('/v1/')) {
      return handleApi(request);
    }
    // 4. 代理上传接口 (用于图生表情)
    else if (url.pathname === '/proxy/upload') {
      return handleProxyUpload(request);
    }
    // 404
    else {
      return createErrorResponse(`路径未找到: ${url.pathname}`, 404, 'not_found');
    }
  }
};

// --- [第三部分: API 代理逻辑] ---

async function handleApi(request) {
  if (!verifyAuth(request)) {
    return createErrorResponse('需要 Bearer Token 认证。', 401, 'unauthorized');
  }

  const url = new URL(request.url);
  const requestId = `req-${crypto.randomUUID()}`;

  if (url.pathname === '/v1/models') {
    return handleModelsRequest();
  } else if (url.pathname === '/v1/chat/completions') {
    return handleChatCompletions(request, requestId);
  } else if (url.pathname === '/v1/images/generations') {
    return handleImageGenerations(request, requestId);
  } else {
    return createErrorResponse(`不支持的 API 路径: ${url.pathname}`, 404, 'not_found');
  }
}

function verifyAuth(request) {
  const authHeader = request.headers.get('Authorization');
  const validKey = request.ctx.apiKey;
  if (validKey === "1") return true; 
  return authHeader && authHeader === `Bearer ${validKey}`;
}

function handleModelsRequest() {
  // 合并内置模型和映射模型，并去重，让客户端能看到所有可用模型
  const allModelIds = [...new Set([...CONFIG.MODELS, ...Object.keys(CONFIG.MODEL_MAPPINGS)])];

  const modelsData = {
    object: 'list',
    data: allModelIds.map(modelId => ({
      id: modelId,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'aiemojify-2api',
    })),
  };
  return new Response(JSON.stringify(modelsData), {
    headers: corsHeaders({ 'Content-Type': 'application/json' })
  });
}

async function performGeneration(prompt, imagePath = null, cookie) {
  const headers = {
    "Content-Type": "application/json",
    "Origin": CONFIG.UPSTREAM_ORIGIN,
    "Referer": `${CONFIG.UPSTREAM_ORIGIN}/birthday-emoji-generator`,
    "User-Agent": CONFIG.USER_AGENT,
    "Cookie": cookie,
    "x-uid": "84.235.235.105"
  };

  const payload = {
    "image_style": "birthday emoji generator",
    "prompts": prompt
  };
  if (imagePath) {
    payload.image_path = imagePath;
  }

  const submitRes = await fetch(`${CONFIG.UPSTREAM_API_URL}/emoji/emoji-image`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
  });

  if (!submitRes.ok) {
    throw new Error(`上游提交失败: ${submitRes.status} ${await submitRes.text()}`);
  }

  const submitData = await submitRes.json();
  if (submitData.status !== 100000 || !submitData.data?.task_id) {
    throw new Error(`任务创建失败: ${JSON.stringify(submitData)}`);
  }

  const taskId = submitData.data.task_id;
  
  const startTime = Date.now();
  while (Date.now() - startTime < CONFIG.POLLING_TIMEOUT) {
    const pollUrl = `${CONFIG.UPSTREAM_API_URL}/dash/task-status?task_id=${taskId}&project_name=emoji`;
    const pollRes = await fetch(pollUrl, {
      method: "GET",
      headers: headers
    });

    if (!pollRes.ok) continue;

    const pollData = await pollRes.json();
    
    if (pollData.status === 100000 && pollData.data?.result) {
      return pollData.data.result; 
    }
    
    if (pollData.status === 20008) {
      await new Promise(r => setTimeout(r, CONFIG.POLLING_INTERVAL));
      continue;
    }

    throw new Error(`任务处理失败: ${JSON.stringify(pollData)}`);
  }

  throw new Error("任务轮询超时");
}

/**
 * [新增] 将 Base64 编码的图片数据上传到上游服务
 * @param {string} base64DataUri - "data:image/..." 格式的字符串
 * @param {string} cookie - 用于认证的 cookie
 * @returns {Promise<string>} - 上传成功后返回的图片路径 (image_path)
 */
async function uploadBase64Image(base64DataUri, cookie) {
    const parts = base64DataUri.match(/^data:(image\/.+);base64,(.+)$/);
    if (!parts) throw new Error('无效的 Base64 图片数据 URI');
    
    const mimeType = parts[1];
    const base64 = parts[2];
    const filename = `clipboard-image.${mimeType.split('/')[1] || 'png'}`;

    // atob 在 Cloudflare Workers 环境中是可用的
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const upstreamFormData = new FormData();
    upstreamFormData.append('file', blob, filename);

    const res = await fetch(`${CONFIG.UPSTREAM_API_URL}/dash/upload-image`, {
      method: "POST",
      headers: {
        "User-Agent": CONFIG.USER_AGENT,
        "Origin": CONFIG.UPSTREAM_ORIGIN,
        "Referer": `${CONFIG.UPSTREAM_ORIGIN}/birthday-emoji-generator`,
        "Cookie": cookie
      },
      body: upstreamFormData
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`上游图片上传接口失败: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    if (data.code === 100000 && data.data?.item?.name) {
        return data.data.item.name;
    } else {
        throw new Error(`上游图片上传返回错误: ${JSON.stringify(data)}`);
    }
}


async function handleChatCompletions(request, requestId) {
  try {
    const body = await request.json();
    const messages = body.messages || [];
    const lastMsg = messages.reverse().find(m => m.role === 'user');
    if (!lastMsg) throw new Error("未找到用户消息");

    let prompt = "";
    let imagePath = null;
    const requestedModel = body.model || CONFIG.DEFAULT_MODEL;

    // --- [核心改造] ---
    // 兼容 OpenAI Vision (多模态) API 格式
    if (Array.isArray(lastMsg.content)) {
      const textContent = lastMsg.content.find(item => item.type === 'text');
      const imageContent = lastMsg.content.find(item => item.type === 'image_url');

      prompt = textContent ? textContent.text : "根据这张图片生成一个emoji";

      if (imageContent && imageContent.image_url?.url) {
        const imageUrl = imageContent.image_url.url;
        if (imageUrl.startsWith('data:image')) {
          // 如果是 Base64, 调用新函数上传
          imagePath = await uploadBase64Image(imageUrl, request.ctx.cookie);
        } else {
          // 上游服务不支持直接传 URL, 抛出错误
          throw new Error("暂不支持处理图片 URL，请直接上传图片文件。");
        }
      }
    } 
    // 兼容旧的纯文本或自定义 JSON 格式 (用于 Web UI)
    else if (typeof lastMsg.content === 'string') {
      prompt = lastMsg.content;
      try {
        if (prompt.trim().startsWith('{')) {
          const parsed = JSON.parse(prompt);
          if (parsed.prompt) prompt = parsed.prompt;
          if (parsed.image_path) imagePath = parsed.image_path;
        }
      } catch (e) { /* 解析失败，则视为纯文本 prompt */ }
    } else {
        throw new Error("不支持的消息格式");
    }
    // --- [改造结束] ---

    if (!prompt && !imagePath) throw new Error("Prompt 或图片必须提供至少一个");

    const imageUrls = await performGeneration(prompt, imagePath, request.ctx.cookie);
    
    let markdownContent = `### ✨ 表情包生成成功\n\n`;
    imageUrls.forEach((url, index) => {
      markdownContent += `![Emoji ${index + 1}](${url})\n`;
    });

    if (body.stream) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      (async () => {
        const chunk = {
          id: requestId,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: requestedModel,
          choices: [{ index: 0, delta: { content: markdownContent }, finish_reason: null }]
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        
        const endChunk = {
          id: requestId,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: requestedModel,
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }]
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(endChunk)}\n\n`));
        await writer.write(encoder.encode('data: [DONE]\n\n'));
        await writer.close();
      })();

      return new Response(readable, {
        headers: corsHeaders({ 'Content-Type': 'text/event-stream' })
      });
    } else {
      return new Response(JSON.stringify({
        id: requestId,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: requestedModel,
        choices: [{
          index: 0,
          message: { role: "assistant", content: markdownContent },
          finish_reason: "stop"
        }]
      }), { headers: corsHeaders({ 'Content-Type': 'application/json' }) });
    }

  } catch (e) {
    return createErrorResponse(e.message, 500, 'generation_failed');
  }
}

async function handleImageGenerations(request, requestId) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    
    const imageUrls = await performGeneration(prompt, null, request.ctx.cookie);
    
    const data = imageUrls.map(url => ({ url: url }));

    return new Response(JSON.stringify({
      created: Math.floor(Date.now() / 1000),
      data: data
    }), {
      headers: corsHeaders({ 'Content-Type': 'application/json' })
    });

  } catch (e) {
    return createErrorResponse(e.message, 500, 'generation_failed');
  }
}

async function handleProxyUpload(request) {
  if (!verifyAuth(request)) return createErrorResponse('Unauthorized', 401, 'unauthorized');
  
  try {
    const formData = await request.formData();
    const upstreamFormData = new FormData();
    upstreamFormData.append('file', formData.get('file'));

    const res = await fetch(`${CONFIG.UPSTREAM_API_URL}/dash/upload-image`, {
      method: "POST",
      headers: {
        "User-Agent": CONFIG.USER_AGENT,
        "Origin": CONFIG.UPSTREAM_ORIGIN,
        "Referer": `${CONFIG.UPSTREAM_ORIGIN}/birthday-emoji-generator`,
        "Cookie": request.ctx.cookie
      },
      body: upstreamFormData
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { headers: corsHeaders({'Content-Type': 'application/json'}) });
  } catch (e) {
    return createErrorResponse(e.message, 500, 'upload_failed');
  }
}

function createErrorResponse(message, status, code) {
  return new Response(JSON.stringify({
    error: { message, type: 'api_error', code }
  }), {
    status,
    headers: corsHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  });
}

function handleCorsPreflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders(headers = {}) {
  return {
    ...headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// --- [第四部分: 开发者驾驶舱 UI (WebUI)] ---
function handleUI(request) {
  const origin = new URL(request.url).origin;
  const apiKey = request.ctx.apiKey;
  
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME} - 开发者驾驶舱</title>
    <style>
      :root { 
        --bg: #121212; --panel: #1E1E1E; --border: #333; --text: #E0E0E0; 
        --primary: #FFBF00; --primary-hover: #FFD700; --input-bg: #2A2A2A; 
        --success: #66BB6A; --error: #CF6679;
      }
      body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); margin: 0; height: 100vh; display: flex; overflow: hidden; }
      
      /* 侧边栏 */
      .sidebar { width: 380px; background: var(--panel); border-right: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0; }
      
      /* 主区域 */
      .main { flex: 1; display: flex; flex-direction: column; padding: 20px; position: relative; }
      
      /* 通用组件 */
      .box { background: #252525; padding: 15px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 20px; }
      .label { font-size: 12px; color: #888; margin-bottom: 8px; display: block; font-weight: 600; }
      .code-block { font-family: monospace; font-size: 12px; color: var(--primary); word-break: break-all; background: #111; padding: 10px; border-radius: 4px; cursor: pointer; transition: background 0.2s; }
      .code-block:hover { background: #000; }
      
      input, select, textarea { width: 100%; background: #333; border: 1px solid #444; color: #fff; padding: 10px; border-radius: 4px; margin-bottom: 15px; box-sizing: border-box; font-family: inherit; }
      input:focus, textarea:focus { border-color: var(--primary); outline: none; }
      
      button { width: 100%; padding: 12px; background: var(--primary); border: none; border-radius: 4px; font-weight: bold; cursor: pointer; color: #000; transition: opacity 0.2s; }
      button:hover { opacity: 0.9; }
      button:disabled { background: #555; cursor: not-allowed; }
      
      /* 聊天/结果窗口 */
      .chat-window { flex: 1; background: #000; border: 1px solid var(--border); border-radius: 8px; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
      
      .msg { max-width: 85%; padding: 15px; border-radius: 8px; line-height: 1.6; position: relative; }
      .msg.user { align-self: flex-end; background: #333; color: #fff; border-bottom-right-radius: 2px; }
      .msg.ai { align-self: flex-start; background: #1a1a1a; border: 1px solid #333; width: 100%; max-width: 100%; border-bottom-left-radius: 2px; }
      
      /* 图片画廊 */
      .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin-top: 15px; }
      .img-card { position: relative; border-radius: 8px; overflow: hidden; border: 1px solid #333; transition: transform 0.2s; }
      .img-card:hover { transform: scale(1.02); border-color: var(--primary); }
      .img-card img { width: 100%; height: 150px; object-fit: contain; background: #222; display: block; cursor: zoom-in; }
      .download-btn { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: #fff; text-align: center; padding: 5px; font-size: 12px; text-decoration: none; opacity: 0; transition: opacity 0.2s; }
      .img-card:hover .download-btn { opacity: 1; }

      /* 上传区域 */
      .upload-area { 
        border: 2px dashed #555; padding: 0; text-align: center; cursor: pointer; border-radius: 6px; margin-bottom: 15px; 
        height: 100px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;
        transition: border-color 0.2s;
      }
      .upload-area:hover { border-color: var(--primary); background-color: #2a2a2a; }
      .upload-text { font-size: 13px; color: #aaa; pointer-events: none; z-index: 2; }
      .preview-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; background: #000; opacity: 0.6; z-index: 1; }
      
      /* 进度条 */
      .progress-container { width: 100%; background: #333; height: 6px; border-radius: 3px; margin-top: 10px; overflow: hidden; display: none; }
      .progress-bar { height: 100%; background: var(--primary); width: 0%; transition: width 0.3s ease-out; }
      .status-text { font-size: 12px; color: #888; margin-top: 5px; display: flex; justify-content: space-between; }
      
      /* 动画 */
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      .generating { animation: pulse 1.5s infinite; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2 style="margin-top:0; display:flex; align-items:center; gap:10px;">
            🤪 ${CONFIG.PROJECT_NAME} 
            <span style="font-size:12px;color:#888; font-weight:normal; margin-top:4px;">v${CONFIG.PROJECT_VERSION}</span>
        </h2>
        
        <div class="box">
            <span class="label">API 密钥 (点击复制)</span>
            <div class="code-block" onclick="copy('${apiKey}')">${apiKey}</div>
        </div>

        <div class="box">
            <span class="label">API 接口地址</span>
            <div class="code-block" onclick="copy('${origin}/v1/chat/completions')">${origin}/v1/chat/completions</div>
        </div>

        <div class="box">
            <span class="label">模型选择</span>
            <select id="model">
                ${[...new Set([...CONFIG.MODELS, ...Object.keys(CONFIG.MODEL_MAPPINGS)])].map(m => `<option value="${m}">${m}</option>`).join('')}
            </select>
            
            <span class="label">参考图 (图生表情 - 可选)</span>
            <input type="file" id="file-input" accept="image/*" style="display:none" onchange="handleFile()">
            <div class="upload-area" id="upload-area" onclick="document.getElementById('file-input').click()">
                <span class="upload-text" id="upload-text">点击或拖拽上传图片</span>
            </div>

            <span class="label">提示词 (Prompt)</span>
            <textarea id="prompt" rows="3" placeholder="描述你想生成的表情，例如: 一只正在写代码的猫..."></textarea>
            
            <button id="btn-gen" onclick="generate()">🚀 开始生成</button>
        </div>
        
        <div style="font-size:12px; color:#666; text-align:center;">
            Powered by Cloudflare Workers & Project Chimera
        </div>
    </div>

    <main class="main">
        <div class="chat-window" id="chat">
            <div style="color:#666; text-align:center; margin-top:100px;">
                <div style="font-size:40px; margin-bottom:20px;">🎨</div>
                <h3>AI Emojify 代理服务就绪</h3>
                <p>在左侧输入提示词或上传图片，开始创作你的专属表情包。</p>
            </div>
        </div>
    </main>

    <script>
        const API_KEY = "${apiKey}";
        const ENDPOINT = "${origin}/v1/chat/completions";
        const UPLOAD_URL = "${origin}/proxy/upload";
        let uploadedImagePath = null;
        let progressInterval = null;
        
        function copy(text) {
            navigator.clipboard.writeText(text);
            const el = event.target;
            const originalBg = el.style.background;
            el.style.background = '#333';
            setTimeout(() => el.style.background = originalBg, 200);
        }

        async function handleFile() {
            const input = document.getElementById('file-input');
            const file = input.files[0];
            if (!file) return;

            const area = document.getElementById('upload-area');
            const text = document.getElementById('upload-text');
            
            // 预览 (使用 FileReader)
            const reader = new FileReader();
            reader.onload = (e) => {
                // 清除旧预览
                const oldImg = area.querySelector('.preview-img');
                if(oldImg) oldImg.remove();
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-img';
                area.appendChild(img);
                text.style.display = 'none';
            };
            reader.readAsDataURL(file);

            // 上传
            text.style.display = 'block';
            text.innerText = "⏳ 上传中...";
            text.style.color = "#fff";
            text.style.zIndex = "10";
            
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch(UPLOAD_URL, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + API_KEY },
                    body: formData
                });
                const data = await res.json();
                if (data.code === 100000 && data.data?.item?.name) {
                    uploadedImagePath = data.data.item.name;
                    text.innerText = "✅ 上传成功";
                    text.style.color = "#66BB6A";
                    text.style.textShadow = "0 1px 2px black";
                } else {
                    text.innerText = "❌ 上传失败";
                    text.style.color = "#CF6679";
                    alert('上传失败');
                }
            } catch (e) {
                text.innerText = "❌ 错误";
                alert('上传错误: ' + e.message);
            }
        }

        function appendMsg(role, html) {
            const div = document.createElement('div');
            div.className = \`msg \${role}\`;
            div.innerHTML = html;
            document.getElementById('chat').appendChild(div);
            div.scrollIntoView({ behavior: "smooth" });
            return div;
        }

        // 解析 Markdown 图片链接并生成 HTML
        function parseMarkdownImages(text) {
            const regex = /!\\[.*?\\]\\((.*?)\\)/g;
            let match;
            let imgsHtml = '<div class="gallery">';
            let hasImages = false;
            
            while ((match = regex.exec(text)) !== null) {
                hasImages = true;
                const url = match[1];
                imgsHtml += \`
                    <div class="img-card">
                        <img src="\${url}" onclick="window.open(this.src)">
                        <a href="\${url}" download="emoji.png" class="download-btn" target="_blank">⬇️ 下载</a>
                    </div>
                \`;
            }
            imgsHtml += '</div>';
            return hasImages ? imgsHtml : null;
        }

        async function generate() {
            const prompt = document.getElementById('prompt').value.trim();
            if (!prompt && !uploadedImagePath) return alert('请输入提示词或上传参考图');

            const btn = document.getElementById('btn-gen');
            btn.disabled = true;
            btn.innerHTML = '⏳ 生成中...';

            // 清空欢迎页
            if(document.querySelector('.chat-window').innerText.includes('代理服务就绪')) {
                document.getElementById('chat').innerHTML = '';
            }

            // 显示用户消息
            let userHtml = prompt || '[仅使用参考图]';
            if (uploadedImagePath) userHtml += ' <span style="font-size:12px;color:#888;background:#222;padding:2px 6px;border-radius:4px;">[含参考图]</span>';
            appendMsg('user', userHtml);
            
            // 创建 AI 消息容器 (带进度条)
            const loadingId = 'loading-' + Date.now();
            const loadingMsg = appendMsg('ai', \`
                <div id="\${loadingId}">
                    <div style="margin-bottom:5px;">🤖 正在请求 AI 生成表情...</div>
                    <div class="progress-container" style="display:block">
                        <div class="progress-bar" style="width: 0%"></div>
                    </div>
                    <div class="status-text">
                        <span>处理中</span>
                        <span class="percent">0%</span>
                    </div>
                </div>
            \`);

            // 启动虚假进度条 (因为上游不返回具体进度)
            let progress = 0;
            const progressBar = loadingMsg.querySelector('.progress-bar');
            const percentText = loadingMsg.querySelector('.percent');
            
            progressInterval = setInterval(() => {
                if (progress < 90) {
                    const increment = (95 - progress) * 0.05;
                    progress += increment;
                    if (progress > 95) progress = 95;
                    progressBar.style.width = progress + '%';
                    percentText.innerText = Math.floor(progress) + '%';
                }
            }, 500);

            try {
                // 构造请求体 (使用自定义 JSON 格式)
                let content = JSON.stringify({
                    prompt: prompt,
                    image_path: uploadedImagePath
                });

                const res = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: { 
                        'Authorization': 'Bearer ' + API_KEY, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        model: document.getElementById('model').value,
                        messages: [{ role: 'user', content: content }],
                        stream: false // 使用非流式，方便一次性处理
                    })
                });

                const data = await res.json();
                
                clearInterval(progressInterval);
                progressBar.style.width = '100%';
                percentText.innerText = '100%';

                if (!res.ok) throw new Error(data.error?.message || '生成失败');

                const md = data.choices[0].message.content;
                const galleryHtml = parseMarkdownImages(md);

                if (galleryHtml) {
                    loadingMsg.innerHTML = \`
                        <div style="color:#66BB6A; font-weight:bold; margin-bottom:10px;">✨ 生成成功!</div>
                        \${galleryHtml}
                    \`;
                } else {
                    loadingMsg.innerHTML = \`<div>\${md}</div>\`; // 如果没有图片，显示原始文本
                }

            } catch (e) {
                clearInterval(progressInterval);
                loadingMsg.innerHTML = \`
                    <div style="color:#CF6679; font-weight:bold;">❌ 生成失败</div>
                    <div style="font-size:12px; margin-top:5px; color:#aaa;">\${e.message}</div>
                \`;
            } finally {
                btn.disabled = false;
                btn.innerHTML = '🚀 开始生成';
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    },
  });
}
比较现代化的你看看差不多是这样的啦：
// =================================================================================
//  项目: questionai-2api (Cloudflare Worker 单文件版)
//  版本: 8.1.0 (代号: API Compatibility - 兼容性增强版)
//  作者: 首席AI执行官
//  日期: 2025-11-25
//
//  [v8.1.0 更新日志]
//  1. [智能分流] 区分 Web UI 和 API 客户端。
//  2. [完美兼容] Cherry Studio/NextChat 等客户端不再接收 Debug 日志，解决格式报错。
//  3. [功能保留] Web UI 依然保留完整的右侧实时调试面板。
//  4. [核心继承] 继承 v8.0.0 的所有指纹修复和时序同步逻辑。
// =================================================================================

const CONFIG = {
  PROJECT_NAME: "questionai-2api-v8.1",
  PROJECT_VERSION: "8.1.0",
  API_MASTER_KEY: "1", 
  BASE_URL: "https://questionai.io",
  ENDPOINT_HI: "https://questionai.io/user/hi",
  ENDPOINT_CHAT: "https://questionai.io/workflow/start",
  USER_AGENT: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  MODELS: ["questionai-general", "questionai-math", "questionai-coding", "gpt-4o-mini"],
  DEFAULT_MODEL: "questionai-general",
  
  // 严格匹配抓包数据的 Header
  BUBBLE_BASE_HEADERS: {
    "x-bubble-appname": "questionai",
    "x-bubble-breaking-revision": "5",
    "x-bubble-client-version": "d0f9bbf36a0d3aa20a11d33c4d933f5824d8abf6",
    "x-bubble-client-commit-timestamp": "1764023316000",
    "x-bubble-platform": "web",
    "x-requested-with": "XMLHttpRequest",
    "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  }
};

class Logger {
    constructor() { this.logs = []; }
    add(step, data) {
        const time = new Date().toISOString().split('T')[1].slice(0, -1);
        this.logs.push({ time, step, data });
    }
    get() { return this.logs; }
}

export default {
  async fetch(request, env, ctx) {
    const apiKey = env.API_MASTER_KEY || CONFIG.API_MASTER_KEY;
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return handleCorsPreflight();
    if (url.pathname === '/') return handleUI(request, apiKey);
    if (url.pathname.startsWith('/v1/')) return handleApi(request, apiKey);
    return createErrorResponse(`Path not found: ${url.pathname}`, 404);
  }
};

async function handleApi(request, apiKey) {
  const authHeader = request.headers.get('Authorization');
  if (apiKey && apiKey !== "1") {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return createErrorResponse('Unauthorized', 401);
    if (authHeader.substring(7) !== apiKey) return createErrorResponse('Invalid Key', 403);
  }
  const url = new URL(request.url);
  if (url.pathname === '/v1/models') {
    return new Response(JSON.stringify({
      object: 'list',
      data: CONFIG.MODELS.map(id => ({ id, object: 'model', created: Math.floor(Date.now()/1000), owned_by: 'questionai' })),
    }), { headers: corsHeaders({ 'Content-Type': 'application/json' }) });
  }
  if (url.pathname === '/v1/chat/completions') {
    return handleChatCompletions(request);
  }
  return createErrorResponse('Not Found', 404);
}

// --- ID 生成器 (严格模式) ---
function generateBubbleId(timestamp) {
    const ts = timestamp || Date.now();
    let randomPart = '';
    for (let i = 0; i < 18; i++) randomPart += Math.floor(Math.random() * 10);
    return `${ts}x${randomPart}`;
}

// --- 握手逻辑 ---
async function obtainFreshSession(logger) {
    try {
        logger.add("Handshake", "Requesting /user/hi...");
        const response = await fetch(CONFIG.ENDPOINT_HI, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": CONFIG.USER_AGENT,
                "Origin": CONFIG.BASE_URL,
                "Referer": CONFIG.BASE_URL + "/",
                ...CONFIG.BUBBLE_BASE_HEADERS
            },
            body: "{}"
        });

        const rawSetCookie = response.headers.get("set-cookie");
        logger.add("Handshake Response", { status: response.status, set_cookie: rawSetCookie });

        if (!response.ok) throw new Error(`Handshake failed: ${response.status}`);

        const data = await response.json();
        const userId = data.bubble_session_uid;
        if (!userId) throw new Error("No bubble_session_uid returned");

        let cookieMap = new Map();
        if (rawSetCookie) {
            const cookies = rawSetCookie.split(/,(?=\s*[^;]+=[^;]+)/);
            cookies.forEach(c => {
                const part = c.split(';')[0].trim();
                const [k, v] = part.split('=');
                if (k && v) cookieMap.set(k, v);
            });
        }

        cookieMap.set("questionai_u1main", userId);
        if (!cookieMap.has("_ga")) cookieMap.set("_ga", `GA1.1.${Date.now()}`);
        if (!cookieMap.has("__stripe_mid")) cookieMap.set("__stripe_mid", crypto.randomUUID());

        let cookieString = "";
        for (const [key, value] of cookieMap) {
            cookieString += `${key}=${value}; `;
        }

        return { userId, cookieString };
    } catch (e) {
        logger.add("Handshake Error", e.message);
        throw e;
    }
}

// --- Payload 构造 ---
function buildBubblePayload(userPrompt, userId, timestampBase) {
    const runId = generateBubbleId(timestampBase - 2);
    const serverCallId = generateBubbleId(timestampBase);
    const seedInt = Math.floor(Math.random() * 900000000000000000) + 100000000000000000;

    return {
        "wait_for": [],
        "app_last_change": "38461217590",
        "client_breaking_revision": 5,
        "calls": [{
            "client_state": {
                "element_instances": {
                    "bTTsS": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTUEj:bTTsS", "parent_element_id": "bTTsN" },
                    "bTUEj:bTTsS": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTUEj:bTTsS", "parent_element_id": "bTTsN" },
                    "bTTsX": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTUEj:bTTsX", "parent_element_id": "bTTsM" },
                    "bTUEj:bTTsX": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTUEj:bTTsX", "parent_element_id": "bTTsM" },
                    "bTTsf": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTUEj:bTTsf", "parent_element_id": "bTTse" },
                    "bTUEj:bTTsf": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTUEj:bTTsf", "parent_element_id": "bTTse" },
                    "bTUEj": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTUEj", "parent_element_id": "bTHxD" },
                    "bTTrP": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTUEj", "parent_element_id": "bTHxD" },
                    "bTUEj:bTTrP": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTUEj", "parent_element_id": "bTHxD" },
                    "bTTsN": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTUEj:bTTsN", "parent_element_id": "bTTsM" },
                    "bTUEj:bTTsN": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTUEj:bTTsN", "parent_element_id": "bTTsM" }
                },
                "element_state": {
                    "1348695171700984260__LOOKUP__ElementInstance::bTUEj:bTTsX": {
                        "is_visible": true,
                        "value_that_is_valid": userPrompt,
                        "value": userPrompt
                    },
                    "1348695171700984260__LOOKUP__ElementInstance::bTUEj:bTTsf": {
                        "list_data": {
                            "_class": "ListWrapper",
                            "query": {
                                "t": "Sort",
                                "sorts_list": [{ "sort_field": "Created Date", "descending": false }],
                                "prev": {
                                    "t": "Filter",
                                    "constraints": [{ 
                                        "key": "Created By", 
                                        "value": `1348695171700984260__LOOKUP__${userId}`, 
                                        "constraint_type": "equals" 
                                    }],
                                    "prev": { "t": "All", "type": "custom.chat_ai" }
                                }
                            }
                        }
                    },
                    "1348695171700984260__LOOKUP__ElementInstance::bTUEj:bTTsN": { "group_data": null }
                },
                "other_data": { "Current Page Scroll Position": 0, "Current Page Width": 948 },
                "cache": {},
                "exists": {}
            },
            "run_id": runId,
            "server_call_id": serverCallId,
            "item_id": "bTTvM",
            "element_id": "bTTsS",
            "page_id": "bTGYf",
            "uid_generator": { 
                "timestamp": timestampBase, 
                "seed": seedInt
            },
            "random_seed": Math.random(),
            "current_date_time": timestampBase + 10000,
            "current_wf_params": {}
        }],
        "timezone_offset": -480,
        "timezone_string": "Asia/Shanghai",
        "user_id": userId,
        "should_stream": false,
        "platform": "web"
    };
}

function extractAnswer(data) {
    try {
        const callId = Object.keys(data)[0];
        if (callId && data[callId].step_results) {
            const results = data[callId].step_results;
            for (const key in results) {
                if (results[key].return_value && typeof results[key].return_value === 'object') {
                    const str = JSON.stringify(results[key].return_value);
                    if (str.includes("response1_text")) {
                        const match = str.match(/"response1_text"\s*:\s*"([^"]+)"/);
                        if (match && match[1]) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                    }
                }
            }
        }
    } catch (e) {}
    try {
        const callId = Object.keys(data)[0];
        if (callId && data[callId].step_results && data[callId].step_results.bTTvZ) {
            const choices = data[callId].step_results.bTTvZ.return_value.data._api_c2_choices.query.data;
            if (Array.isArray(choices) && choices.length > 0) {
                const content = choices[0].data["_api_c2_message.content"];
                if (content) return content;
            }
        }
    } catch (e) {}
    return deepMineAnswer(data);
}

function deepMineAnswer(data) {
    let candidates = [];
    function traverse(obj) {
        if (!obj) return;
        if (typeof obj === 'string') {
            if (/^\d{10,}x\d+$/.test(obj)) return;
            if (obj === "Unaut" || obj === "horiz" || obj === "ed") return;
            if (obj.length > 1 && !obj.includes('__LOOKUP__') && !obj.startsWith('http') && !obj.startsWith('data:image') && obj !== "Permission denied" && obj !== "success") {
                candidates.push(obj);
            }
            return;
        }
        if (Array.isArray(obj)) { obj.forEach(item => traverse(item)); return; }
        if (typeof obj === 'object') {
            for (let key in obj) {
                if (['dehydrated', 'parent_element_id', 'id', '_id', 'Created By', 'Modified Date', '_api_c2_id', 'run_id'].includes(key)) continue;
                traverse(obj[key]);
            }
        }
    }
    traverse(data);
    candidates.sort((a, b) => {
        const aScore = (a.match(/[\u4e00-\u9fa5]/g) ? 100 : 0) + a.length;
        const bScore = (b.match(/[\u4e00-\u9fa5]/g) ? 100 : 0) + b.length;
        return bScore - aScore;
    });
    return candidates.length > 0 ? candidates[0] : null;
}

async function handleChatCompletions(request) {
  const logger = new Logger();
  const requestId = `req-${crypto.randomUUID()}`;
  
  try {
    const body = await request.json();
    const messages = body.messages || [];
    
    // 识别是否为 Web UI 请求
    const isWebUI = body.is_web_ui === true;

    let fullPrompt = "";
    messages.forEach(msg => {
        if (msg.role === 'user') fullPrompt += `User: ${msg.content}\n`;
        if (msg.role === 'assistant') fullPrompt += `Assistant: ${msg.content}\n`;
        if (msg.role === 'system') fullPrompt += `System: ${msg.content}\n`;
    });
    fullPrompt += "Assistant:"; 

    // 1. 握手
    const session = await obtainFreshSession(logger);
    const { userId, cookieString } = session;

    // 2. 准备时间戳
    const timestampBase = Date.now();

    // 3. 构造 Payload
    const bubblePayload = buildBubblePayload(fullPrompt, userId, timestampBase);
    
    // 4. 构造 Headers
    const fiberId = generateBubbleId(timestampBase);
    const plId = `${timestampBase}x${Math.floor(Math.random()*1000)}`;

    const chatHeaders = {
        "Content-Type": "application/json",
        "Origin": CONFIG.BASE_URL,
        "Referer": CONFIG.BASE_URL + "/",
        "User-Agent": CONFIG.USER_AGENT,
        "Cookie": cookieString,
        "x-bubble-fiber-id": fiberId,
        "x-bubble-pl": plId,
        ...CONFIG.BUBBLE_BASE_HEADERS
    };

    logger.add("Chat Request", { headers: chatHeaders, payload: bubblePayload });

    // 5. 发送
    const response = await fetch(CONFIG.ENDPOINT_CHAT, {
      method: "POST",
      headers: chatHeaders,
      body: JSON.stringify(bubblePayload)
    });

    if (!response.ok) {
        const errText = await response.text();
        logger.add("Upstream Error", { status: response.status, body: errText });
        throw new Error(`Upstream Error: ${response.status}`);
    }

    const data = await response.json();
    logger.add("Raw Response", data);

    // 6. 提取
    let answer = extractAnswer(data);
    
    if (!answer) {
        const jsonStr = JSON.stringify(data);
        if (jsonStr.includes("Unauthorized") || jsonStr.includes("Permission denied")) {
            answer = "❌ Unauthorized (权限拒绝)。请检查日志中的 Seed 格式和 Header。";
        } else {
            answer = "⚠️ 无法提取回答。请查看日志中的 Raw Response。";
        }
    }

    // 7. 流式输出
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
        // [关键修改] 只有 Web UI 才发送 debug 日志，API 客户端不发送
        if (isWebUI) {
            await writer.write(encoder.encode(`data: ${JSON.stringify({ debug: logger.get() })}\n\n`));
        }

        const chunkSize = 5;
        for (let i = 0; i < answer.length; i += chunkSize) {
            const chunkContent = answer.slice(i, i + chunkSize);
            const chunk = {
                id: requestId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: body.model || CONFIG.DEFAULT_MODEL,
                choices: [{ index: 0, delta: { content: chunkContent }, finish_reason: null }]
            };
            await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            await new Promise(r => setTimeout(r, 10)); 
        }
        const endChunk = {
          id: requestId,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: body.model || CONFIG.DEFAULT_MODEL,
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }]
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(endChunk)}\n\n`));
        await writer.write(encoder.encode('data: [DONE]\n\n'));
        await writer.close();
      })();

      return new Response(readable, {
        headers: corsHeaders({ 'Content-Type': 'text/event-stream' })
      });

  } catch (e) {
      logger.add("Fatal Error", e.message);
      // 如果是 API 调用出错，尽量返回标准 JSON 错误
      return new Response(JSON.stringify({
          error: { message: e.message, type: "server_error", param: null, code: null }
      }), { status: 500, headers: corsHeaders({ 'Content-Type': 'application/json' }) });
  }
}

function createErrorResponse(message, status) {
  return new Response(JSON.stringify({ error: { message } }), { status, headers: corsHeaders() });
}
function handleCorsPreflight() { return new Response(null, { status: 204, headers: corsHeaders() }); }
function corsHeaders(headers = {}) {
  return { ...headers, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
}

// --- Web UI ---
function handleUI(request, apiKey) {
  const origin = new URL(request.url).origin;
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME}</title>
    <style>
      :root { --bg: #0f172a; --panel: #1e293b; --text: #f1f5f9; --primary: #3b82f6; --accent: #10b981; --err: #ef4444; --code-bg: #020617; }
      body { font-family: 'Segoe UI', monospace; background: var(--bg); color: var(--text); margin: 0; height: 100vh; display: flex; overflow: hidden; }
      .container { display: flex; width: 100%; height: 100%; }
      .left-panel { width: 40%; padding: 20px; display: flex; flex-direction: column; border-right: 1px solid #334155; overflow-y: auto; }
      .right-panel { width: 60%; padding: 20px; display: flex; flex-direction: column; background: var(--code-bg); }
      .box { background: var(--panel); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #334155; }
      .label { font-size: 12px; color: #94a3b8; margin-bottom: 5px; display: block; font-weight: bold; }
      input, textarea, select { width: 100%; background: var(--bg); border: 1px solid #475569; color: #fff; padding: 10px; border-radius: 6px; box-sizing: border-box; margin-bottom: 10px; font-family: monospace; }
      button { width: 100%; padding: 12px; background: var(--primary); border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; transition: 0.2s; }
      button:hover { opacity: 0.9; }
      button:disabled { background: #475569; cursor: not-allowed; }
      .chat-window { flex: 1; background: var(--bg); border: 1px solid #334155; border-radius: 8px; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }
      .msg { padding: 10px 14px; border-radius: 8px; line-height: 1.5; font-size: 14px; max-width: 90%; }
      .msg.user { align-self: flex-end; background: var(--primary); color: white; }
      .msg.ai { align-self: flex-start; background: var(--panel); border: 1px solid #334155; }
      .log-window { flex: 1; overflow-y: auto; font-family: 'Consolas', monospace; font-size: 12px; color: #a5b4fc; white-space: pre-wrap; word-break: break-all; }
      .log-entry { margin-bottom: 10px; border-bottom: 1px solid #1e293b; padding-bottom: 10px; }
      .log-key { color: var(--accent); font-weight: bold; }
      .copy-btn { float: right; background: transparent; border: 1px solid #334155; padding: 4px 8px; font-size: 10px; color: #94a3b8; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="left-panel">
            <h3>🛸 ${CONFIG.PROJECT_NAME}</h3>
            <div class="box">
                <span class="label">API Endpoint</span>
                <input type="text" value="${origin}/v1/chat/completions" readonly onclick="this.select()">
                <span class="label">API Key</span>
                <input type="text" value="${apiKey}" readonly onclick="this.select()">
            </div>
            <div class="box">
                <span class="label">模型选择</span>
                <select id="model">
                    ${CONFIG.MODELS.map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
            </div>
            <div class="chat-window" id="chat">
                <div style="text-align:center; color:#64748b; margin-top:20px;">对话区域</div>
            </div>
            <div class="box" style="margin-bottom:0">
                <textarea id="prompt" rows="3" placeholder="输入问题...">你好</textarea>
                <button id="btn" onclick="send()">发送提问</button>
            </div>
        </div>
        <div class="right-panel">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span class="label" style="font-size:14px; color:#fff;">📡 实时调试日志</span>
                <button class="copy-btn" onclick="copyLogs()">复制全部日志</button>
            </div>
            <div class="log-window" id="logs">
                <div style="color:#64748b;">等待请求...<br>日志将显示：握手Cookie、Payload结构、服务器原始响应。</div>
            </div>
        </div>
    </div>
    <script>
        const API_KEY = "${apiKey}";
        const URL = "${origin}/v1/chat/completions";
        let history = [];
        let allLogs = [];

        function appendLog(step, data) {
            const div = document.createElement('div');
            div.className = 'log-entry';
            const time = new Date().toLocaleTimeString();
            const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            div.innerHTML = \`<div><span style="color:#64748b">[\${time}]</span> <span class="log-key">\${step}</span></div><div>\${content}</div>\`;
            document.getElementById('logs').appendChild(div);
            document.getElementById('logs').scrollTop = document.getElementById('logs').scrollHeight;
            allLogs.push({time, step, data});
        }

        function copyLogs() {
            navigator.clipboard.writeText(JSON.stringify(allLogs, null, 2));
            alert('日志已复制到剪贴板');
        }

        function appendChat(role, text) {
            const div = document.createElement('div');
            div.className = 'msg ' + role;
            div.innerText = text;
            document.getElementById('chat').appendChild(div);
            document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
            return div;
        }

        async function send() {
            const input = document.getElementById('prompt');
            const model = document.getElementById('model').value;
            const val = input.value.trim();
            if (!val) return;
            
            const btn = document.getElementById('btn');
            btn.disabled = true;
            btn.innerText = "请求中...";
            
            document.getElementById('logs').innerHTML = ''; 
            allLogs = [];
            
            appendChat('user', val);
            history.push({role: 'user', content: val});
            input.value = '';
            
            const aiMsg = appendChat('ai', '...');
            let fullText = '';

            try {
                const res = await fetch(URL, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
                    // [关键修改] Web UI 请求时带上 is_web_ui: true 标记
                    body: JSON.stringify({ model: model, messages: history, stream: true, is_web_ui: true })
                });

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                aiMsg.innerText = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const jsonStr = line.slice(6);
                            if (jsonStr === '[DONE]') break;
                            try {
                                const json = JSON.parse(jsonStr);
                                // Web UI 专门处理 debug 字段
                                if (json.debug) {
                                    json.debug.forEach(log => appendLog(log.step, log.data));
                                    continue;
                                }
                                const content = json.choices[0].delta.content;
                                if (content) {
                                    fullText += content;
                                    aiMsg.innerText = fullText;
                                }
                            } catch (e) {}
                        }
                    }
                }
                history.push({role: 'assistant', content: fullText});
            } catch (e) {
                aiMsg.innerText = 'Error: ' + e.message;
                appendLog("Client Error", e.message);
            } finally {
                btn.disabled = false;
                btn.innerText = "发送提问";
            }
        }
    </script>
</body>
</html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}


你要保证有日志等等调试日志等等面板，这样更容易在后期排查出问题等等的
// =================================================================================
//  项目: midgenai-2api (Cloudflare Worker 单文件版)
//  版本: 1.0.0 (代号: Chimera Synthesis - Midgen)
//  作者: 首席AI执行官 (Principal AI Executive Officer)
//  协议: 奇美拉协议 · 综合版 (Project Chimera: Synthesis Edition)
//  日期: 2025-11-23
//
//  描述:
//  本文件是一个完全自包含、可一键部署的 Cloudflare Worker。它将 midgenai.com
//  的图像生成服务，无损地转换为一个高性能、兼容 OpenAI 标准的 API。
//  内置"开发者驾驶舱"Web UI，支持参数调整和实时生成预览。
//
// =================================================================================

// --- [第一部分: 核心配置 (Configuration-as-Code)] ---
const CONFIG = {
  // 项目元数据
  PROJECT_NAME: "midgenai-2api",
  PROJECT_VERSION: "1.0.0",
  
  // 安全配置 (建议在 Cloudflare 环境变量中设置 API_MASTER_KEY)
  API_MASTER_KEY: "1", 
  
  // 上游服务配置
  UPSTREAM_URL: "https://www.midgenai.com/api/image-generate",
  ORIGIN_URL: "https://www.midgenai.com",
  REFERER_URL: "https://www.midgenai.com/text-to-image",
  
  // 模型列表
  MODELS: [
    "midgen-v1",
    "midgen-flux",
    "midgen-turbo"
  ],
  DEFAULT_MODEL: "midgen-v1",

  // 默认生成参数
  DEFAULT_STEPS: 100, // 默认最高质量
  DEFAULT_ASPECT_RATIO: "1:1"
};

// --- [第二部分: Worker 入口与路由] ---
export default {
  async fetch(request, env, ctx) {
    // 优先读取环境变量中的密钥
    const apiKey = env.API_MASTER_KEY || CONFIG.API_MASTER_KEY;
    const url = new URL(request.url);

    // 1. 预检请求
    if (request.method === 'OPTIONS') {
      return handleCorsPreflight();
    }

    // 2. 开发者驾驶舱 (Web UI)
    if (url.pathname === '/') {
      return handleUI(request, apiKey);
    } 
    // 3. API 路由
    else if (url.pathname.startsWith('/v1/')) {
      return handleApi(request, apiKey);
    } 
    // 4. 404
    else {
      return createErrorResponse(`路径未找到: ${url.pathname}`, 404, 'not_found');
    }
  }
};

// --- [第三部分: API 代理逻辑] ---

/**
 * API 路由分发
 */
async function handleApi(request, apiKey) {
  // 鉴权
  const authHeader = request.headers.get('Authorization');
  if (apiKey && apiKey !== "1") {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('需要 Bearer Token 认证。', 401, 'unauthorized');
    }
    const token = authHeader.substring(7);
    if (token !== apiKey) {
      return createErrorResponse('无效的 API Key。', 403, 'invalid_api_key');
    }
  }

  const url = new URL(request.url);
  const requestId = `req-${crypto.randomUUID()}`;

  if (url.pathname === '/v1/models') {
    return handleModelsRequest();
  } else if (url.pathname === '/v1/chat/completions') {
    return handleChatCompletions(request, requestId);
  } else if (url.pathname === '/v1/images/generations') {
    return handleImageGenerations(request, requestId);
  } else {
    return createErrorResponse(`不支持的 API 路径: ${url.pathname}`, 404, 'not_found');
  }
}

/**
 * 处理 /v1/models
 */
function handleModelsRequest() {
  const modelsData = {
    object: 'list',
    data: CONFIG.MODELS.map(modelId => ({
      id: modelId,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'midgenai-2api',
    })),
  };
  return new Response(JSON.stringify(modelsData), {
    headers: corsHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  });
}

/**
 * 核心：执行上游图像生成请求
 */
async function performGeneration(prompt, aspectRatio, steps, seed) {
  const payload = {
    prompt: prompt,
    negative_prompt: "", // 暂不支持负向提示词自定义，保持简单
    aspect_ratio: aspectRatio || CONFIG.DEFAULT_ASPECT_RATIO,
    steps: steps || CONFIG.DEFAULT_STEPS,
    seed: seed || 0
  };

  const headers = {
    "Content-Type": "application/json",
    "Origin": CONFIG.ORIGIN_URL,
    "Referer": CONFIG.REFERER_URL,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    // 模拟必要的头部，虽然是匿名，但带上更像浏览器
    "Accept": "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Priority": "u=1, i"
  };

  const response = await fetch(CONFIG.UPSTREAM_URL, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`上游服务错误 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  // 检查是否被拦截或生成失败
  if (data.blocked) {
    throw new Error(`内容被拦截: ${data.error}`);
  }
  if (!data.image) {
    throw new Error("上游未返回图像数据");
  }

  return data.image; // 返回 Base64 字符串 (不带前缀)
}

/**
 * 辅助：解析 OpenAI size 到 Midgen aspect_ratio
 */
function mapSizeToAspectRatio(size) {
  if (!size) return "1:1";
  if (size === "1024x1024") return "1:1";
  if (size === "1024x1792") return "9:16"; // 竖屏
  if (size === "1792x1024") return "16:9"; // 横屏
  // 简单启发式
  const [w, h] = size.split('x').map(Number);
  if (w > h) return "16:9";
  if (h > w) return "9:16";
  return "1:1";
}

/**
 * 处理 /v1/chat/completions (适配聊天客户端)
 */
async function handleChatCompletions(request, requestId) {
  try {
    const body = await request.json();
    const messages = body.messages || [];
    const lastMsg = messages.reverse().find(m => m.role === 'user');
    if (!lastMsg) throw new Error("未找到用户消息");

    const prompt = lastMsg.content;
    // 尝试从 prompt 中解析 JSON 配置 (高级用法)
    let aspectRatio = "1:1";
    let steps = CONFIG.DEFAULT_STEPS;
    let cleanPrompt = prompt;

    // 简单的参数提取逻辑，如果用户输入 "画一只猫 --ar 16:9"
    if (prompt.includes("--ar 16:9")) { aspectRatio = "16:9"; cleanPrompt = prompt.replace("--ar 16:9", ""); }
    else if (prompt.includes("--ar 9:16")) { aspectRatio = "9:16"; cleanPrompt = prompt.replace("--ar 9:16", ""); }
    
    const imageBase64 = await performGeneration(cleanPrompt, aspectRatio, steps, 0);
    
    // 构造 Markdown 图片响应
    const markdownImage = `![Generated Image](data:image/jpeg;base64,${imageBase64})`;
    
    // 模拟流式响应 (为了兼容性，虽然是一次性生成)
    if (body.stream) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      (async () => {
        const chunk = {
          id: requestId,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: body.model || CONFIG.DEFAULT_MODEL,
          choices: [{ index: 0, delta: { content: markdownImage }, finish_reason: null }]
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        
        const endChunk = {
          id: requestId,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: body.model || CONFIG.DEFAULT_MODEL,
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }]
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(endChunk)}\n\n`));
        await writer.write(encoder.encode('data: [DONE]\n\n'));
        await writer.close();
      })();

      return new Response(readable, {
        headers: corsHeaders({ 'Content-Type': 'text/event-stream' })
      });
    } else {
      // 非流式
      return new Response(JSON.stringify({
        id: requestId,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: body.model || CONFIG.DEFAULT_MODEL,
        choices: [{
          index: 0,
          message: { role: "assistant", content: markdownImage },
          finish_reason: "stop"
        }]
      }), { headers: corsHeaders({ 'Content-Type': 'application/json' }) });
    }

  } catch (e) {
    return createErrorResponse(e.message, 500, 'generation_failed');
  }
}

/**
 * 处理 /v1/images/generations (标准绘图接口)
 */
async function handleImageGenerations(request, requestId) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    const size = body.size || "1024x1024";
    const aspectRatio = mapSizeToAspectRatio(size);
    
    const imageBase64 = await performGeneration(prompt, aspectRatio, CONFIG.DEFAULT_STEPS, 0);
    
    return new Response(JSON.stringify({
      created: Math.floor(Date.now() / 1000),
      data: [{ b64_json: imageBase64 }] // 返回 Base64 JSON
    }), {
      headers: corsHeaders({ 'Content-Type': 'application/json' })
    });

  } catch (e) {
    return createErrorResponse(e.message, 500, 'generation_failed');
  }
}

// --- 辅助函数 ---
function createErrorResponse(message, status, code) {
  return new Response(JSON.stringify({
    error: { message, type: 'api_error', code }
  }), {
    status,
    headers: corsHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  });
}

function handleCorsPreflight() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

function corsHeaders(headers = {}) {
  return {
    ...headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// --- [第四部分: 开发者驾驶舱 UI] ---
function handleUI(request, apiKey) {
  const origin = new URL(request.url).origin;
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME} - 开发者驾驶舱</title>
    <style>
      :root { --bg: #121212; --panel: #1E1E1E; --border: #333; --text: #E0E0E0; --primary: #FFBF00; --accent: #007AFF; }
      body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); margin: 0; height: 100vh; display: flex; overflow: hidden; }
      .sidebar { width: 380px; background: var(--panel); border-right: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; overflow-y: auto; }
      .main { flex: 1; display: flex; flex-direction: column; padding: 20px; }
      
      .box { background: #252525; padding: 12px; border-radius: 6px; border: 1px solid var(--border); margin-bottom: 15px; }
      .label { font-size: 12px; color: #888; margin-bottom: 5px; display: block; }
      .code-block { font-family: monospace; font-size: 12px; color: var(--primary); word-break: break-all; background: #111; padding: 8px; border-radius: 4px; cursor: pointer; }
      
      input, select, textarea { width: 100%; background: #333; border: 1px solid #444; color: #fff; padding: 8px; border-radius: 4px; margin-bottom: 10px; box-sizing: border-box; }
      button { width: 100%; padding: 10px; background: var(--primary); border: none; border-radius: 4px; font-weight: bold; cursor: pointer; color: #000; }
      button:disabled { background: #555; cursor: not-allowed; }
      
      .chat-window { flex: 1; background: #000; border: 1px solid var(--border); border-radius: 8px; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
      .msg { max-width: 80%; padding: 10px 15px; border-radius: 8px; line-height: 1.5; }
      .msg.user { align-self: flex-end; background: #333; color: #fff; }
      .msg.ai { align-self: flex-start; background: #1a1a1a; border: 1px solid #333; width: 100%; max-width: 100%; }
      .msg.ai img { max-width: 100%; border-radius: 4px; margin-top: 10px; display: block; }
      
      .status-bar { margin-top: 10px; font-size: 12px; color: #888; display: flex; justify-content: space-between; }
      .spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid #888; border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-right: 5px; }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2 style="margin-top:0">🎨 ${CONFIG.PROJECT_NAME} <span style="font-size:12px;color:#888">v${CONFIG.PROJECT_VERSION}</span></h2>
        
        <div class="box">
            <span class="label">API 密钥 (点击复制)</span>
            <div class="code-block" onclick="copy('${apiKey}')">${apiKey}</div>
        </div>

        <div class="box">
            <span class="label">API 接口地址</span>
            <div class="code-block" onclick="copy('${origin}/v1/chat/completions')">${origin}/v1/chat/completions</div>
        </div>

        <div class="box">
            <span class="label">模型</span>
            <select id="model">
                ${CONFIG.MODELS.map(m => `<option value="${m}">${m}</option>`).join('')}
            </select>
            
            <span class="label">比例 (Aspect Ratio)</span>
            <select id="ratio">
                <option value="1:1">1:1 (方形)</option>
                <option value="16:9">16:9 (横屏)</option>
                <option value="9:16">9:16 (竖屏)</option>
                <option value="4:3">4:3</option>
                <option value="3:4">3:4</option>
            </select>

            <span class="label">步数 (Steps - 质量)</span>
            <input type="range" id="steps" min="10" max="100" value="100" oninput="document.getElementById('steps-val').innerText=this.value">
            <div style="text-align:right; font-size:12px; color:#888" id="steps-val">100</div>

            <span class="label" style="margin-top:10px">提示词</span>
            <textarea id="prompt" rows="4" placeholder="描述你想生成的图片..."></textarea>
            
            <button id="btn-gen" onclick="generate()">生成图片</button>
        </div>
    </div>

    <main class="main">
        <div class="chat-window" id="chat">
            <div style="color:#666; text-align:center; margin-top:50px;">
                MidgenAI 代理服务就绪。<br>
                支持 API 调用或直接在此测试。
            </div>
        </div>
    </main>

    <script>
        const API_KEY = "${apiKey}";
        const ENDPOINT = "${origin}/v1/images/generations";
        
        function copy(text) {
            navigator.clipboard.writeText(text);
            alert('已复制');
        }

        function appendMsg(role, html) {
            const div = document.createElement('div');
            div.className = \`msg \${role}\`;
            div.innerHTML = html;
            document.getElementById('chat').appendChild(div);
            div.scrollIntoView({ behavior: "smooth" });
            return div;
        }

        async function generate() {
            const prompt = document.getElementById('prompt').value.trim();
            if (!prompt) return alert('请输入提示词');

            const btn = document.getElementById('btn-gen');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> 生成中...';

            // 清空欢迎语
            if(document.querySelector('.chat-window').innerText.includes('代理服务就绪')) {
                document.getElementById('chat').innerHTML = '';
            }

            appendMsg('user', prompt);
            const loadingMsg = appendMsg('ai', '<span class="spinner"></span> 正在请求 MidgenAI 生成图片 (约5-10秒)...');

            try {
                // 映射比例到 OpenAI size
                const ratio = document.getElementById('ratio').value;
                let size = "1024x1024";
                if (ratio === "16:9") size = "1792x1024";
                if (ratio === "9:16") size = "1024x1792";

                const res = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: { 
                        'Authorization': 'Bearer ' + API_KEY, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        model: document.getElementById('model').value,
                        prompt: prompt,
                        size: size,
                        n: 1
                    })
                });

                const data = await res.json();
                
                if (!res.ok) throw new Error(data.error?.message || '生成失败');

                const b64 = data.data[0].b64_json;
                loadingMsg.innerHTML = \`
                    <div><strong>生成成功</strong> <span style="font-size:12px;color:#888">(\${ratio})</span></div>
                    <img src="data:image/jpeg;base64,\${b64}" alt="Generated Image">
                    <div class="status-bar">
                        <a href="data:image/jpeg;base64,\${b64}" download="midgen-\${Date.now()}.jpg" style="color:var(--primary)">下载图片</a>
                    </div>
                \`;

            } catch (e) {
                loadingMsg.innerHTML = \`<span style="color:#CF6679">❌ 错误: \${e.message}</span>\`;
            } finally {
                btn.disabled = false;
                btn.innerText = "生成图片";
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Encoding': 'br' // 声明支持 Brotli，虽然 Worker 实际上是自动处理压缩的
    },
  });
}
// =================================================================================
//  项目: umint-2api (Cloudflare Worker 单文件版)
//  版本: 8.0.5 (代号: Chimera Synthesis - Final)
//  作者: 首席AI执行官 (Principal AI Executive Officer)
//  协议: 奇美拉协议 · 综合版 (Project Chimera: Synthesis Edition)
//  日期: 2025-11-10
//
//  描述:
//  本文件是一个完全自包含、可一键部署的 Cloudflare Worker。它将 umint-ai.hf.space
//  的后端服务，无损地转换为一个高性能、兼容 OpenAI 标准的 API，并内置了一个
//  功能强大的"开发者驾驶舱"Web UI，用于实时监控、测试和集成。
//
//  v8.0.5 修正:
//  1. [TypeError] 修正了 `performHealthCheck` 中因未穿透 Shadow DOM 导致无法找到 `status-indicator` 组件的错误。
//  2. [SyntaxError] 修正了 `getCurlGuide` 中因模板字符串多层转义不当导致的客户端语法错误。
//
// =================================================================================
// --- [第一部分: 核心配置 (Configuration-as-Code)] ---
// 架构核心：所有关键参数在此定义，后续逻辑必须从此对象读取。
const CONFIG = {
  // 项目元数据
  PROJECT_NAME: "umint-2api",
  PROJECT_VERSION: "8.0.5",
  // 安全配置
  API_MASTER_KEY: "1", // 密钥设置为 "1"
  // 上游服务配置
  UPSTREAM_URL: "https://umint-ai.hf.space/api/b1235a8f4c2f4b33a99e8a7c87912b3d",
  // 模型映射
  // 从情报中自动识别并提取的模型列表
  MODELS: [
    "moonshotai/kimi-k2-thinking",
    "deepseek-ai/deepseek-r1-0528",
    "deepseek-ai/deepseek-r1-0528-nvidia",
    "deepseek-ai/deepseek-v3.1",
    "deepseek-ai/deepseek-v3.1-terminus",
    "google/gemini-2.5-flash-lite",
    "minimaxai/minimax-m2",
    "moonshotai/kimi-k2-instruct",
    "moonshotai/kimi-k2-instruct-0905",
    "openai/gpt-4.1-nano-2025-04-14",
    "openai/gpt-5-chat-latest",
    "openai/o4-mini-2025-04-16",
    "qwen/qwen3-coder-480b-a35b-instruct",
    "qwen/qwen3-max-thinking",
    "qwen/qwen3-next-80b-a3b-thinking",
    "zai-org/glm-4.6",
  ],
  DEFAULT_MODEL: "moonshotai/kimi-k2-thinking",
};

// --- [第二部分: Worker 入口与路由] ---
// Cloudflare Worker 的主处理函数
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // 根据路径分发请求到不同的处理器
    if (url.pathname === '/') {
      return handleUI(request); // 处理根路径，返回开发者驾驶舱 UI
    } else if (url.pathname.startsWith('/v1/')) {
      return handleApi(request); // 处理 API 请求
    } else {
      // 对于所有其他路径，返回 404 Not Found
      return new Response(
        JSON.stringify({
          error: {
            message: `路径未找到: ${url.pathname}`,
            type: 'invalid_request_error',
            code: 'not_found'
          }
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }
  }
};

// --- [第三部分: API 代理逻辑] ---
/**
 * 处理所有 /v1/ 路径下的 API 请求
 * @param {Request} request - 传入的请求对象
 * @returns {Promise<Response>} - 返回给客户端的响应
 */
async function handleApi(request) {
  // 预检请求处理：对于 OPTIONS 方法，直接返回 CORS 头部，允许跨域访问
  if (request.method === 'OPTIONS') {
    return handleCorsPreflight();
  }

  // 认证检查：验证 Authorization 头部
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createErrorResponse('需要 Bearer Token 认证。', 401, 'unauthorized');
  }
  const token = authHeader.substring(7);
  if (token !== CONFIG.API_MASTER_KEY) {
    return createErrorResponse('无效的 API Key。', 403, 'invalid_api_key');
  }

  const url = new URL(request.url);
  const requestId = `chatcmpl-${crypto.randomUUID()}`;

  // 根据 API 路径执行不同操作
  if (url.pathname === '/v1/models') {
    return handleModelsRequest();
  } else if (url.pathname === '/v1/chat/completions') {
    return handleChatCompletions(request, requestId);
  } else {
    return createErrorResponse(`API 路径不支持: ${url.pathname}`, 404, 'not_found');
  }
}

/**
 * 处理 CORS 预检请求
 * @returns {Response}
 */
function handleCorsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * 创建标准化的 JSON 错误响应
 * @param {string} message - 错误信息
 * @param {number} status - HTTP 状态码
 * @param {string} code - 错误代码
 * @returns {Response}
 */
function createErrorResponse(message, status, code) {
  return new Response(JSON.stringify({
    error: {
      message,
      type: 'api_error',
      code
    }
  }), {
    status,
    headers: corsHeaders({
      'Content-Type': 'application/json; charset=utf-8'
    })
  });
}

/**
 * 处理 /v1/models 请求
 * @returns {Response}
 */
function handleModelsRequest() {
  const modelsData = {
    object: 'list',
    data: CONFIG.MODELS.map(modelId => ({
      id: modelId,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'umint-2api',
    })),
  };
  return new Response(JSON.stringify(modelsData), {
    headers: corsHeaders({
      'Content-Type': 'application/json; charset=utf-8'
    })
  });
}

/**
 * 处理 /v1/chat/completions 请求
 * @param {Request} request - 传入的请求对象
 * @param {string} requestId - 本次请求的唯一 ID
 * @returns {Promise<Response>}
 */
async function handleChatCompletions(request, requestId) {
  try {
    const requestData = await request.json();
    const upstreamPayload = transformRequestToUpstream(requestData);

    const upstreamResponse = await fetch(CONFIG.UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Origin': 'https://umint-ai.hf.space',
        'Referer': 'https://umint-ai.hf.space/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'X-Request-ID': requestId, // 请求水印
      },
      body: JSON.stringify(upstreamPayload),
    });

    if (!upstreamResponse.ok) {
      const errorBody = await upstreamResponse.text();
      console.error(`上游服务错误: ${upstreamResponse.status}`, errorBody);
      return createErrorResponse(`上游服务返回错误 ${upstreamResponse.status}: ${errorBody}`, upstreamResponse.status, 'upstream_error');
    }

    // 检查是否为流式响应
    const contentType = upstreamResponse.headers.get('content-type');
    if (requestData.stream && contentType && contentType.includes('text/event-stream')) {
      // 创建转换流，将上游格式实时转换为 OpenAI 格式
      const transformStream = createUpstreamToOpenAIStream(requestId, requestData.model || CONFIG.DEFAULT_MODEL);
      const [pipedStream] = upstreamResponse.body.tee();

      return new Response(pipedStream.pipeThrough(transformStream), {
        headers: corsHeaders({
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Worker-Trace-ID': requestId, // 响应水印
        }),
      });
    } else {
        // 处理非流式响应 (尽管此 API 主要是流式的，但作为健壮性措施)
        const responseData = await upstreamResponse.json();
        const openAIResponse = transformNonStreamResponse(responseData, requestId, requestData.model || CONFIG.DEFAULT_MODEL);
        return new Response(JSON.stringify(openAIResponse), {
            headers: corsHeaders({
                'Content-Type': 'application/json; charset=utf-8',
                'X-Worker-Trace-ID': requestId,
            }),
        });
    }

  } catch (e) {
    console.error('处理聊天请求时发生异常:', e);
    return createErrorResponse(`处理请求时发生内部错误: ${e.message}`, 500, 'internal_server_error');
  }
}

/**
 * 将 OpenAI 格式的请求体转换为上游服务所需的格式
 * @param {object} requestData - OpenAI 格式的请求数据
 * @returns {object} - 上游服务格式的载荷
 */
function transformRequestToUpstream(requestData) {
  const transformedMessages = requestData.messages.map(msg => ({
    id: `msg-${crypto.randomUUID().slice(0, 12)}`,
    role: msg.role,
    parts: [{
      type: 'text',
      text: msg.content
    }],
  }));

  return {
    tools: {},
    modelId: requestData.model || CONFIG.DEFAULT_MODEL,
    sessionId: `session_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    id: "DEFAULT_THREAD_ID",
    messages: transformedMessages,
    trigger: "submit-message",
  };
}

/**
 * 创建一个 TransformStream 用于将上游 SSE 流转换为 OpenAI 兼容格式
 * @param {string} requestId - 本次请求的唯一 ID
 * @param {string} model - 使用的模型名称
 * @returns {TransformStream}
 */
function createUpstreamToOpenAIStream(requestId, model) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = '';

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 保留不完整的行

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const dataStr = line.substring(5).trim();
          if (dataStr === '[DONE]') {
            // 上游的 [DONE] 信号，我们将在 flush 中发送我们自己的
            continue;
          }
          try {
            const data = JSON.parse(dataStr);
            if (data.type === 'text-delta' && typeof data.delta === 'string') {
              const openAIChunk = {
                id: requestId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: model,
                choices: [{
                  index: 0,
                  delta: { content: data.delta },
                  finish_reason: null,
                }],
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIChunk)}\n\n`));
            }
          } catch (e) {
            console.error('无法解析上游 SSE 数据块:', dataStr, e);
          }
        }
      }
    },
    flush(controller) {
      // 流结束时，发送最终的 [DONE] 块
      const finalChunk = {
        id: requestId,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
          index: 0,
          delta: {},
          finish_reason: 'stop',
        }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    },
  });
}

/**
 * 转换非流式响应 (备用)
 */
function transformNonStreamResponse(responseData, requestId, model) {
    // 这是一个简化的实现，假设非流式响应的结构
    const content = responseData?.choices?.[0]?.message?.content || "";
    return {
        id: requestId,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
            index: 0,
            message: {
                role: "assistant",
                content: content,
            },
            finish_reason: "stop",
        }],
        usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
        },
    };
}


/**
 * 辅助函数，为响应头添加 CORS 策略
 * @param {object} headers - 现有的响应头
 * @returns {object} - 包含 CORS 头的新对象
 */
function corsHeaders(headers = {}) {
  return {
    ...headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// --- [第四部分: 开发者驾驶舱 UI] ---
/**
 * 处理对根路径的请求，返回一个功能丰富的 HTML UI
 * @param {Request} request - 传入的请求对象
 * @returns {Response} - 包含完整 UI 的 HTML 响应
 */
function handleUI(request) {
  const origin = new URL(request.url).origin;
  // 使用模板字符串嵌入完整的 HTML, CSS, 和 JS
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME} - 开发者驾驶舱</title>
    <style>
      /* --- 全局样式与主题 --- */
      :root {
        --bg-color: #121212;
        --sidebar-bg: #1E1E1E;
        --main-bg: #121212;
        --border-color: #333333;
        --text-color: #E0E0E0;
        --text-secondary: #888888;
        --primary-color: #FFBF00; /* 琥珀色 */
        --primary-hover: #FFD700;
        --input-bg: #2A2A2A;
        --error-color: #CF6679;
        --success-color: #66BB6A;
        --font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
        --font-mono: 'Fira Code', 'Consolas', 'Monaco', monospace;
      }
      * { box-sizing: border-box; }
      body {
        font-family: var(--font-family);
        margin: 0;
        background-color: var(--bg-color);
        color: var(--text-color);
        font-size: 14px;
        display: flex;
        height: 100vh;
        overflow: hidden;
      }
      /* --- 骨架屏样式 --- */
      .skeleton {
        background-color: #2a2a2a;
        background-image: linear-gradient(90deg, #2a2a2a, #3a3a3a, #2a2a2a);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
      }
      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    </style>
</head>
<body>
    <!-- 主布局自定义元素 -->
    <main-layout></main-layout>

    <!-- 模板定义 -->
    <template id="main-layout-template">
      <style>
        .layout { display: flex; width: 100%; height: 100vh; }
        .sidebar { width: 380px; flex-shrink: 0; background-color: var(--sidebar-bg); border-right: 1px solid var(--border-color); padding: 20px; display: flex; flex-direction: column; overflow-y: auto; }
        .main-content { flex-grow: 1; display: flex; flex-direction: column; padding: 20px; overflow: hidden; }
        .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); }
        .header h1 { margin: 0; font-size: 20px; }
        .header .version { font-size: 12px; color: var(--text-secondary); margin-left: 8px; }
        .collapsible-section { margin-top: 20px; }
        .collapsible-section summary { cursor: pointer; font-weight: bold; margin-bottom: 10px; }
        @media (max-width: 768px) {
          .layout { flex-direction: column; }
          .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--border-color); }
        }
      </style>
      <div class="layout">
        <aside class="sidebar">
          <header class="header">
            <h1>${CONFIG.PROJECT_NAME}<span class="version">v${CONFIG.PROJECT_VERSION}</span></h1>
            <status-indicator></status-indicator>
          </header>
          <info-panel></info-panel>
          <details class="collapsible-section" open>
            <summary>⚙️ 主流客户端集成指南</summary>
            <client-guides></client-guides>
          </details>
        </aside>
        <main class="main-content">
          <live-terminal></live-terminal>
        </main>
      </div>
    </template>

    <template id="status-indicator-template">
      <style>
        .indicator { display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; transition: background-color: 0.3s; }
        .dot.grey { background-color: #555; }
        .dot.yellow { background-color: #FFBF00; animation: pulse 2s infinite; }
        .dot.green { background-color: var(--success-color); }
        .dot.red { background-color: var(--error-color); }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 191, 0, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(255, 191, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 191, 0, 0); } }
      </style>
      <div class="indicator">
        <div id="status-dot" class="dot grey"></div>
        <span id="status-text">正在初始化...</span>
      </div>
    </template>

    <template id="info-panel-template">
      <style>
        .panel { display: flex; flex-direction: column; gap: 12px; }
        .info-item { display: flex; flex-direction: column; }
        .info-item label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
        .info-value { background-color: var(--input-bg); padding: 8px 12px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; color: var(--primary-color); display: flex; align-items: center; justify-content: space-between; word-break: break-all; }
        .info-value.password { -webkit-text-security: disc; }
        .info-value.visible { -webkit-text-security: none; }
        .actions { display: flex; gap: 8px; }
        .icon-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px; display: flex; align-items: center; }
        .icon-btn:hover { color: var(--text-color); }
        .icon-btn svg { width: 16px; height: 16px; }
        .skeleton { height: 34px; }
      </style>
      <div class="panel">
        <div class="info-item">
          <label>API 端点 (Endpoint)</label>
          <div id="api-url" class="info-value skeleton"></div>
        </div>
        <div class="info-item">
          <label>API 密钥 (Master Key)</label>
          <div id="api-key" class="info-value password skeleton"></div>
        </div>
        <div class="info-item">
          <label>默认模型 (Default Model)</label>
          <div id="default-model" class="info-value skeleton"></div>
        </div>
      </div>
    </template>

    <template id="client-guides-template">
       <style>
        .tabs { display: flex; border-bottom: 1px solid var(--border-color); }
        .tab { padding: 8px 12px; cursor: pointer; border: none; background: none; color: var(--text-secondary); }
        .tab.active { color: var(--primary-color); border-bottom: 2px solid var(--primary-color); }
        .content { padding: 15px 0; }
        pre { background-color: var(--input-bg); padding: 12px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; white-space: pre-wrap; word-break: break-all; position: relative; }
        .copy-code-btn { position: absolute; top: 8px; right: 8px; background: #444; border: 1px solid #555; color: #ccc; border-radius: 4px; cursor: pointer; }
        .copy-code-btn:hover { background: #555; }
       </style>
       <div>
         <div class="tabs"></div>
         <div class="content"></div>
       </div>
    </template>

    <template id="live-terminal-template">
      <style>
        .terminal { display: flex; flex-direction: column; height: 100%; background-color: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
        .output-window { flex-grow: 1; padding: 15px; overflow-y: auto; font-size: 14px; line-height: 1.6; }
        .output-window p { margin: 0 0 1em 0; }
        .output-window pre { background-color: #0d0d0d; padding: 1em; border-radius: 4px; white-space: pre-wrap; font-family: var(--font-mono); }
        .output-window .message { margin-bottom: 1em; }
        .output-window .message.user { color: var(--primary-color); font-weight: bold; }
        .output-window .message.assistant { color: var(--text-color); }
        .output-window .message.error { color: var(--error-color); }
        .input-area { border-top: 1px solid var(--border-color); padding: 15px; display: flex; gap: 10px; align-items: flex-end; }
        textarea { flex-grow: 1; background-color: var(--input-bg); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-color); padding: 10px; font-family: var(--font-family); font-size: 14px; resize: none; min-height: 40px; max-height: 200px; }
        .send-btn { background-color: var(--primary-color); color: #121212; border: none; border-radius: 4px; padding: 0 15px; height: 40px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .send-btn:hover { background-color: var(--primary-hover); }
        .send-btn:disabled { background-color: #555; cursor: not-allowed; }
        .send-btn.cancel svg { width: 24px; height: 24px; }
        .send-btn svg { width: 20px; height: 20px; }
        .placeholder { color: var(--text-secondary); }
      </style>
      <div class="terminal">
        <div class="output-window">
          <p class="placeholder">实时交互终端已就绪。输入指令开始测试...</p>
        </div>
        <div class="input-area">
          <textarea id="prompt-input" rows="1" placeholder="输入您的指令..."></textarea>
          <button id="send-btn" class="send-btn" title="发送">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.544l3.239-1.281a.75.75 0 000-1.39L4.23 6.28a.75.75 0 00-.95-.545L1.865 3.45a.75.75 0 00.95-.826l.002-.007.002-.006zm.002 14.422a.75.75 0 00.95.826l1.415-2.28a.75.75 0 00-.545-.95l-3.239-1.28a.75.75 0 00-1.39 0l-1.28 3.239a.75.75 0 00.544.95l4.95 1.414zM12.75 8.5a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5z"/></svg>
          </button>
        </div>
      </div>
    </template>

    <script>
      // --- [第五部分: 客户端逻辑 (Developer Cockpit JS)] ---

      // --- 配置占位符 (由 Worker 动态注入) ---
      const CLIENT_CONFIG = {
          WORKER_ORIGIN: '__WORKER_ORIGIN__',
          API_MASTER_KEY: '__API_MASTER_KEY__',
          DEFAULT_MODEL: '__DEFAULT_MODEL__',
          MODEL_LIST_STRING: '__MODEL_LIST_STRING__',
          CUSTOM_MODELS_STRING: '__CUSTOM_MODELS_STRING__',
      };

      // --- 状态机 ---
      const AppState = {
        INITIALIZING: 'INITIALIZING',
        HEALTH_CHECKING: 'HEALTH_CHECKING',
        READY: 'READY',
        REQUESTING: 'REQUESTING',
        STREAMING: 'STREAMING',
        ERROR: 'ERROR',
      };
      let currentState = AppState.INITIALIZING;
      let abortController = null;

      // --- 基础组件 ---
      class BaseComponent extends HTMLElement {
        constructor(templateId) {
          super();
          this.attachShadow({ mode: 'open' });
          const template = document.getElementById(templateId);
          if (template) {
            this.shadowRoot.appendChild(template.content.cloneNode(true));
          }
        }
      }

      // --- 自定义元素定义 ---

      // 1. 主布局
      class MainLayout extends BaseComponent {
        constructor() { super('main-layout-template'); }
      }
      customElements.define('main-layout', MainLayout);

      // 2. 状态指示器
      class StatusIndicator extends BaseComponent {
        constructor() {
          super('status-indicator-template');
          this.dot = this.shadowRoot.getElementById('status-dot');
          this.text = this.shadowRoot.getElementById('status-text');
        }
        setState(state, message) {
          this.dot.className = 'dot'; // Reset
          switch (state) {
            case 'checking': this.dot.classList.add('yellow'); break;
            case 'ok': this.dot.classList.add('green'); break;
            case 'error': this.dot.classList.add('red'); break;
            default: this.dot.classList.add('grey');
          }
          this.text.textContent = message;
        }
      }
      customElements.define('status-indicator', StatusIndicator);

      // 3. 信息面板
      class InfoPanel extends BaseComponent {
        constructor() {
          super('info-panel-template');
          this.apiUrlEl = this.shadowRoot.getElementById('api-url');
          this.apiKeyEl = this.shadowRoot.getElementById('api-key');
          this.defaultModelEl = this.shadowRoot.getElementById('default-model');
        }
        connectedCallback() {
          this.render();
        }
        render() {
          const apiUrl = CLIENT_CONFIG.WORKER_ORIGIN + '/v1/chat/completions';
          const apiKey = CLIENT_CONFIG.API_MASTER_KEY;
          const defaultModel = CLIENT_CONFIG.DEFAULT_MODEL;

          this.populateField(this.apiUrlEl, apiUrl);
          this.populateField(this.apiKeyEl, apiKey, true);
          this.populateField(this.defaultModelEl, defaultModel);
        }
        populateField(element, value, isPassword = false) {
            element.classList.remove('skeleton');
            let content = '<span>' + value + '</span>' +
                '<div class="actions">' +
                    (isPassword ? '<button class="icon-btn" data-action="toggle-visibility" title="切换可见性">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l.88-1.473a1.65 1.65 0 012.899 0l.88 1.473a1.65 1.65 0 010 1.18l-.88 1.473a1.65 1.65 0 01-2.899 0l-.88-1.473zM18.45 10.59a1.651 1.651 0 010-1.18l.88-1.473a1.65 1.65 0 012.899 0l.88 1.473a1.65 1.65 0 010 1.18l-.88 1.473a1.65 1.65 0 01-2.899 0l-.88-1.473zM10 17a1.651 1.651 0 01-1.18 0l-1.473-.88a1.65 1.65 0 010-2.899l1.473-.88a1.651 1.651 0 011.18 0l1.473.88a1.65 1.65 0 010 2.899l-1.473.88a1.651 1.651 0 01-1.18 0z" clip-rule="evenodd" /></svg>' +
                    '</button>' : '') +
                    '<button class="icon-btn" data-action="copy" title="复制">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.121A1.5 1.5 0 0117 6.621V16.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 017 16.5v-13z" /><path d="M5 6.5A1.5 1.5 0 016.5 5h3.879a1.5 1.5 0 011.06.44l3.122 3.121A1.5 1.5 0 0115 9.621V14.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 14.5v-8z" /></svg>' +
                    '</button>' +
                '</div>';
            element.innerHTML = content;
            element.querySelector('[data-action="copy"]').addEventListener('click', () => navigator.clipboard.writeText(value));
            if (isPassword) {
                element.querySelector('[data-action="toggle-visibility"]').addEventListener('click', () => element.classList.toggle('visible'));
            }
        }
      }
      customElements.define('info-panel', InfoPanel);

      // 4. 客户端集成指南
      class ClientGuides extends BaseComponent {
        constructor() {
          super('client-guides-template');
          this.tabsContainer = this.shadowRoot.querySelector('.tabs');
          this.contentContainer = this.shadowRoot.querySelector('.content');
        }
        connectedCallback() {
          const guides = {
            'cURL': this.getCurlGuide(),
            'Python': this.getPythonGuide(),
            'LobeChat': this.getLobeChatGuide(),
            'Next-Web': this.getNextWebGuide(),
          };

          Object.keys(guides).forEach((name, index) => {
            const tab = document.createElement('button');
            tab.className = 'tab';
            tab.textContent = name;
            if (index === 0) tab.classList.add('active');
            tab.addEventListener('click', () => this.switchTab(name, guides));
            this.tabsContainer.appendChild(tab);
          });
          this.switchTab(Object.keys(guides)[0], guides);
        }
        switchTab(name, guides) {
          this.tabsContainer.querySelector('.active')?.classList.remove('active');
          this.tabsContainer.querySelector('button:nth-child(' + (Object.keys(guides).indexOf(name) + 1) + ')').classList.add('active');
          this.contentContainer.innerHTML = guides[name];
          this.contentContainer.querySelector('.copy-code-btn')?.addEventListener('click', (e) => {
              const code = e.target.closest('pre').querySelector('code').innerText;
              navigator.clipboard.writeText(code);
          });
        }

        // --- 指南生成函数 (已使用模板字符串重构并修正) ---
        getCurlGuide() {
            return '<pre><button class="copy-code-btn">复制</button><code>curl --location \\'' + CLIENT_CONFIG.WORKER_ORIGIN + '/v1/chat/completions\\' \\\\ <br>--header \\'Content-Type: application/json\\' \\\\ <br>--header \\'Authorization: Bearer ' + CLIENT_CONFIG.API_MASTER_KEY + '\\' \\\\ <br>--data \\'{<br>    "model": "' + CLIENT_CONFIG.DEFAULT_MODEL + '",<br>    "messages": [<br>        {<br>            "role": "user",<br>            "content": "你好，你是什么模型？"<br>        }<br>    ],<br>    "stream": true<br>}\\'</code></pre>';
        }
        getPythonGuide() {
            return '<pre><button class="copy-code-btn">复制</button><code>import openai<br><br>client = openai.OpenAI(<br>    api_key="' + CLIENT_CONFIG.API_MASTER_KEY + '",<br>    base_url="' + CLIENT_CONFIG.WORKER_ORIGIN + '/v1"<br>)<br><br>stream = client.chat.completions.create(<br>    model="' + CLIENT_CONFIG.DEFAULT_MODEL + '",<br>    messages=[{"role": "user", "content": "你好"}],<br>    stream=True,<br>)<br><br>for chunk in stream:<br>    print(chunk.choices[0].delta.content or "", end="")</code></pre>';
        }
        getLobeChatGuide() {
            return '<p>在 LobeChat 设置中，找到 "语言模型" -> "OpenAI" 设置:</p><pre><button class="copy-code-btn">复制</button><code>API Key: ' + CLIENT_CONFIG.API_MASTER_KEY + '<br>API 地址: ' + CLIENT_CONFIG.WORKER_ORIGIN + '<br>模型列表: ' + CLIENT_CONFIG.MODEL_LIST_STRING + '</code></pre>';
        }
        getNextWebGuide() {
            return '<p>在 ChatGPT-Next-Web 部署时，设置以下环境变量:</p><pre><button class="copy-code-btn">复制</button><code>CODE=' + CLIENT_CONFIG.API_MASTER_KEY + '<br>BASE_URL=' + CLIENT_CONFIG.WORKER_ORIGIN + '<br>CUSTOM_MODELS=' + CLIENT_CONFIG.CUSTOM_MODELS_STRING + '</code></pre>';
        }
      }
      customElements.define('client-guides', ClientGuides);

      // 5. 实时终端
      class LiveTerminal extends BaseComponent {
        constructor() {
          super('live-terminal-template');
          this.outputWindow = this.shadowRoot.querySelector('.output-window');
          this.promptInput = this.shadowRoot.getElementById('prompt-input');
          this.sendBtn = this.shadowRoot.getElementById('send-btn');
          this.sendIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.544l3.239-1.281a.75.75 0 000-1.39L4.23 6.28a.75.75 0 00-.95-.545L1.865 3.45a.75.75 0 00.95-.826l.002-.007.002-.006zm.002 14.422a.75.75 0 00.95.826l1.415-2.28a.75.75 0 00-.545-.95l-3.239-1.28a.75.75 0 00-1.39 0l-1.28 3.239a.75.75 0 00.544.95l4.95 1.414zM12.75 8.5a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5z"/></svg>';
          this.cancelIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" /></svg>';
        }
        connectedCallback() {
          this.sendBtn.addEventListener('click', () => this.handleSend());
          this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              this.handleSend();
            }
          });
          this.promptInput.addEventListener('input', this.autoResize);
        }
        autoResize(event) {
            const textarea = event.target;
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
        handleSend() {
          if (currentState === AppState.REQUESTING || currentState === AppState.STREAMING) {
            this.cancelStream();
          } else {
            this.startStream();
          }
        }
        addMessage(role, content) {
            const messageEl = document.createElement('div');
            messageEl.className = 'message ' + role;

            let safeContent = content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            const parts = safeContent.split(/(\`\`\`[\\s\\S]*?\`\`\`)/g);
            const finalHtml = parts.map((part, index) => {
                if (index % 2 === 1) { // This is a code block
                    const codeBlock = part.slice(3, -3);
                    const languageMatch = codeBlock.match(/^(\\w+)\\n/);
                    const language = languageMatch ? languageMatch[1] : '';
                    const codeContent = languageMatch ? codeBlock.substring(languageMatch[0].length) : codeBlock;
                    return '<pre><code class="language-' + language + '">' + codeContent.trim() + '</code></pre>';
                } else {
                    return part.replace(/\\n/g, '<br>');
                }
            }).join('');

            messageEl.innerHTML = finalHtml;
            this.outputWindow.appendChild(messageEl);
            this.outputWindow.scrollTop = this.outputWindow.scrollHeight;
            return messageEl;
        }
        async startStream() {
          const prompt = this.promptInput.value.trim();
          if (!prompt) return;

          setState(AppState.REQUESTING);
          this.outputWindow.innerHTML = ''; // 清空
          this.addMessage('user', prompt);
          const assistantMessageEl = this.addMessage('assistant', '▍');

          abortController = new AbortController();
          try {
            const response = await fetch(CLIENT_CONFIG.WORKER_ORIGIN + '/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + CLIENT_CONFIG.API_MASTER_KEY,
              },
              body: JSON.stringify({
                model: CLIENT_CONFIG.DEFAULT_MODEL,
                messages: [{ role: 'user', content: prompt }],
                stream: true,
              }),
              signal: abortController.signal,
            });

            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.error.message);
            }

            setState(AppState.STREAMING);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\\n').filter(line => line.startsWith('data:'));

              for (const line of lines) {
                const dataStr = line.substring(5).trim();
                if (dataStr === '[DONE]') {
                    assistantMessageEl.textContent = fullContent; // 移除光标
                    break;
                }
                try {
                  const data = JSON.parse(dataStr);
                  const delta = data.choices[0].delta.content;
                  if (delta) {
                    fullContent += delta;
                    assistantMessageEl.textContent = fullContent + '▍';
                    this.outputWindow.scrollTop = this.outputWindow.scrollHeight;
                  }
                } catch (e) {}
              }
            }
          } catch (e) {
            if (e.name !== 'AbortError') {
              this.addMessage('error', '请求失败: ' + e.message);
              setState(AppState.ERROR);
            }
          } finally {
            if (currentState !== AppState.ERROR) {
              setState(AppState.READY);
            }
          }
        }
        cancelStream() {
          if (abortController) {
            abortController.abort();
            abortController = null;
          }
          setState(AppState.READY);
        }
        updateButtonState(state) {
            if (state === AppState.REQUESTING || state === AppState.STREAMING) {
                this.sendBtn.innerHTML = this.cancelIcon;
                this.sendBtn.title = "取消";
                this.sendBtn.classList.add('cancel');
                this.sendBtn.disabled = false;
            } else {
                this.sendBtn.innerHTML = this.sendIcon;
                this.sendBtn.title = "发送";
                this.sendBtn.classList.remove('cancel');
                this.sendBtn.disabled = state !== AppState.READY;
            }
        }
      }
      customElements.define('live-terminal', LiveTerminal);

      // --- 全局状态管理与初始化 ---
      function setState(newState) {
        currentState = newState;
        const terminal = document.querySelector('live-terminal');
        if (terminal) {
            terminal.updateButtonState(newState);
        }
      }

      async function performHealthCheck() {
        const statusIndicator = document.querySelector('main-layout').shadowRoot.querySelector('status-indicator');
        statusIndicator.setState('checking', '检查上游服务...');
        try {
          const response = await fetch(CLIENT_CONFIG.WORKER_ORIGIN + '/v1/models', {
            headers: { 'Authorization': 'Bearer ' + CLIENT_CONFIG.API_MASTER_KEY }
          });
          if (response.ok) {
            statusIndicator.setState('ok', '服务运行正常');
            setState(AppState.READY);
          } else {
            const err = await response.json();
            throw new Error(err.error.message);
          }
        } catch (e) {
          statusIndicator.setState('error', '健康检查失败: ' + e.message);
          setState(AppState.ERROR);
        }
      }

      // --- 应用启动 ---
      document.addEventListener('DOMContentLoaded', () => {
        setState(AppState.INITIALIZING);
        // 确保自定义元素已定义
        customElements.whenDefined('main-layout').then(() => {
            performHealthCheck();
        });
      });

    </script>
</body>
</html>`;

  // --- 动态注入所有需要的配置到 HTML 字符串中 ---
  const finalHtml = html
    .replace(/__WORKER_ORIGIN__/g, origin)
    .replace(/__API_MASTER_KEY__/g, CONFIG.API_MASTER_KEY)
    .replace(/__DEFAULT_MODEL__/g, CONFIG.DEFAULT_MODEL)
    .replace(/__MODEL_LIST_STRING__/g, CONFIG.MODELS.join(', '))
    .replace(/__CUSTOM_MODELS_STRING__/g, CONFIG.MODELS.map(m => `+${m}`).join(','));

  return new Response(finalHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

// =================================================================================
//  项目: veo31-2api (Cloudflare Worker 单文件全功能版)
//  版本: 1.0.4 (终极架构: 客户端/服务端双模轮询 + 完整UI + 图生视频)
//  作者: 首席AI执行官
//  日期: 2025-11-22
//
//  [核心特性]
//  1. 完美解决 Cloudflare 50 子请求限制 (WebUI 采用客户端轮询，API 采用自适应轮询)。
//  2. 支持超长视频生成 (10分钟+)。
//  3. 完整 UI：包含图生视频上传、实时进度条、视频预览、下载功能。
//  4. 兼容性：同时支持 Web 直接使用 和 LobeChat/NextChat/ComfyUI 调用。
// =================================================================================

// --- [第一部分: 核心配置] ---
const CONFIG = {
  PROJECT_NAME: "veo31-2api",
  PROJECT_VERSION: "1.0.4",
  
  // ⚠️ 请在 Cloudflare 环境变量中设置 API_MASTER_KEY，或者修改此处
  API_MASTER_KEY: "1", 
  
  UPSTREAM_ORIGIN: "https://veo31.ai",
  
  // 模型列表
  MODELS: [
    "sora-2-text-to-video",
    "sora-2-image-to-video"
  ],
  DEFAULT_MODEL: "sora-2-text-to-video",
};

// --- [第二部分: Worker 入口路由] ---
export default {
  async fetch(request, env, ctx) {
    // 优先使用环境变量，否则使用代码中的配置
    const apiKey = env.API_MASTER_KEY || CONFIG.API_MASTER_KEY;
    const url = new URL(request.url);
    
    // 1. 开发者驾驶舱 (Web UI)
    if (url.pathname === '/') {
      return handleUI(request, apiKey);
    } 
    // 2. 聊天接口 (流式 - 核心生成逻辑)
    else if (url.pathname === '/v1/chat/completions') {
      return handleChatCompletions(request, apiKey, ctx);
    } 
    // 3. 绘图/视频接口 (非流式 - 兼容旧版)
    else if (url.pathname === '/v1/images/generations') {
      return handleImageGenerations(request, apiKey, ctx);
    }
    // 4. [新增] 状态查询接口 (供 WebUI 客户端轮询使用，绕过 CF 限制)
    else if (url.pathname === '/v1/query/status') {
      return handleStatusQuery(request, apiKey);
    }
    // 5. 模型列表
    else if (url.pathname === '/v1/models') {
      return handleModelsRequest();
    } 
    // 6. 图片上传代理 (图生视频用)
    else if (url.pathname === '/proxy/upload') {
      return handleImageUpload(request, apiKey);
    } 
    // 7. CORS 预检
    else if (request.method === 'OPTIONS') {
      return handleCorsPreflight();
    } 
    else {
      return createErrorResponse(`Endpoint not found: ${url.pathname}`, 404, 'not_found');
    }
  }
};

// --- [第三部分: 核心业务逻辑] ---

/**
 * 执行生成任务的核心函数
 * @param {string} prompt - 提示词
 * @param {string} aspectRatio - 比例
 * @param {string} imageFileName - 图片文件名 (可选)
 * @param {function} onProgress - 进度回调
 * @param {boolean} clientPollMode - 是否开启客户端轮询模式 (WebUI专用)
 */
async function performGeneration(prompt, aspectRatio, imageFileName, onProgress, clientPollMode = false) {
  // A. 构造任务载荷
  const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const payload = {
    prompt: prompt,
    aspectRatio: aspectRatio || "16:9",
    videoId: videoId
  };

  if (imageFileName) {
    payload.image = imageFileName;
  }

  if (onProgress) await onProgress({ status: 'submitting', message: `任务提交中 (ID: ${videoId})...` });

  // B. 提交到上游
  const genResponse = await fetch(`${CONFIG.UPSTREAM_ORIGIN}/api/generate/stream`, {
    method: 'POST',
    headers: getCommonHeaders(),
    body: JSON.stringify(payload)
  });

  if (!genResponse.ok) {
    throw new Error(`上游服务拒绝: ${genResponse.status} - ${genResponse.statusText}`);
  }

  // [关键分支 1] WebUI 模式：立即返回 ID，让前端自己去查
  // 这样 Worker 就可以立即结束，不会占用连接时长和子请求配额
  if (clientPollMode) {
    return { mode: 'async', videoId: videoId };
  }

  // [关键分支 2] API 模式 (LobeChat等)：后端必须保持连接并轮询
  // 采用“自适应等待策略”来节省子请求次数
  let isCompleted = false;
  let videoUrl = null;
  const startTime = Date.now();
  let pollCount = 0;
  
  while (!isCompleted) {
    // 超时检查 (15分钟)
    const elapsed = Date.now() - startTime;
    if (elapsed > 900000) throw new Error("生成超时 (超过15分钟)");

    // 轮询上游状态
    const pollResponse = await fetch(`${CONFIG.UPSTREAM_ORIGIN}/api/webhook?videoId=${videoId}`, {
      method: 'GET',
      headers: getCommonHeaders()
    });
    pollCount++;
    
    const pollData = await pollResponse.json();
    
    if (pollData.status === 'completed') {
      isCompleted = true;
      videoUrl = pollData.videoUrl;
    } else if (pollData.status === 'failed') {
      throw new Error(pollData.error || "上游返回生成失败");
    } else {
      // 计算模拟进度
      let progress = Math.min(99, Math.floor((elapsed / 180000) * 100)); 
      
      if (onProgress) {
        await onProgress({ 
          status: 'processing', 
          progress: progress, 
          state: pollData.status 
        });
      }
      
      // [核心优化] 自适应等待算法 (Adaptive Polling)
      // 目的：在 CF 限制的 50 次请求内，覆盖尽可能长的时间
      let waitTime = 3000; 
      
      if (elapsed < 30000) {
        waitTime = 3000;      // 前30秒: 3秒一次 (快速反馈失败或极速任务)
      } else if (elapsed < 120000) {
        waitTime = 6000;      // 30秒-2分钟: 6秒一次
      } else {
        waitTime = 20000;     // 2分钟后: 20秒一次 (长尾等待，节省请求数)
      }

      // 如果请求次数接近临界值 (45次)，强制拉长等待时间
      if (pollCount > 45) waitTime = 30000;

      await new Promise(r => setTimeout(r, waitTime));
    }
  }
  
  return { mode: 'sync', videoUrl: videoUrl };
}

// 处理 Chat Completions (流式)
async function handleChatCompletions(request, apiKey, ctx) {
  if (!verifyAuth(request, apiKey)) return createErrorResponse('Unauthorized', 401, 'unauthorized');

  let requestData;
  try { requestData = await request.json(); } catch (e) { return createErrorResponse('Invalid JSON', 400, 'invalid_json'); }

  const messages = requestData.messages || [];
  const lastMessage = messages[messages.length - 1]?.content || "";
  
  // 解析参数
  let promptText = lastMessage;
  let aspectRatio = "16:9";
  let imageFileName = null;
  let clientPollMode = false; // 默认为后端轮询 (兼容 API)

  try {
    // 尝试解析前端传来的 JSON 指令
    if (lastMessage.trim().startsWith('{') && lastMessage.includes('prompt')) {
      const parsed = JSON.parse(lastMessage);
      promptText = parsed.prompt || promptText;
      aspectRatio = parsed.aspectRatio || "16:9";
      imageFileName = parsed.imageFileName || null;
      // 前端 UI 会发送这个标志，指示开启客户端轮询
      if (parsed.clientPollMode) clientPollMode = true;
    }
  } catch (e) {}

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  const requestId = `chatcmpl-${crypto.randomUUID()}`;

  ctx.waitUntil((async () => {
    try {
      const result = await performGeneration(promptText, aspectRatio, imageFileName, async (info) => {
        // 仅在后端轮询模式下发送进度，前端轮询模式下由前端自己查
        if (!clientPollMode) {
          if (info.status === 'submitting') {
            await sendSSE(writer, encoder, requestId, `正在提交任务...\n`);
          } else if (info.status === 'processing') {
            await sendSSE(writer, encoder, requestId, `[PROGRESS]${info.progress}%[/PROGRESS]`);
          }
        }
      }, clientPollMode);

      if (result.mode === 'async') {
        // WebUI 模式：只返回 ID，让前端自己去查
        // 发送特殊标记 [TASK_ID:xxx]
        await sendSSE(writer, encoder, requestId, `[TASK_ID:${result.videoId}]`);
      } else {
        // API 模式：等待直到完成，返回最终视频链接
        const markdown = `\n\n![生成的视频](${result.videoUrl})`;
        await sendSSE(writer, encoder, requestId, markdown);
      }

      await writer.write(encoder.encode(`data: [DONE]\n\n`));
      await writer.close();

    } catch (error) {
      await sendSSE(writer, encoder, requestId, `\n\n**错误**: ${error.message}`);
      await writer.write(encoder.encode(`data: [DONE]\n\n`));
      await writer.close();
    }
  })());

  return new Response(readable, {
    headers: corsHeaders({ 'Content-Type': 'text/event-stream' })
  });
}

// [新增] 状态查询代理 (供 WebUI 客户端轮询)
async function handleStatusQuery(request, apiKey) {
  if (!verifyAuth(request, apiKey)) return createErrorResponse('Unauthorized', 401, 'unauthorized');
  
  const url = new URL(request.url);
  const videoId = url.searchParams.get('videoId');
  
  if (!videoId) return createErrorResponse('Missing videoId', 400, 'invalid_request');

  try {
    // 这是一个全新的请求，拥有独立的 50 次子请求配额
    const response = await fetch(`${CONFIG.UPSTREAM_ORIGIN}/api/webhook?videoId=${videoId}`, {
      method: 'GET',
      headers: getCommonHeaders()
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), { headers: corsHeaders({ 'Content-Type': 'application/json' }) });
  } catch (e) {
    return createErrorResponse(e.message, 500, 'upstream_error');
  }
}

// 处理 Image Generations (非流式 - 保持后端轮询)
async function handleImageGenerations(request, apiKey, ctx) {
  if (!verifyAuth(request, apiKey)) return createErrorResponse('Unauthorized', 401, 'unauthorized');

  let requestData;
  try { requestData = await request.json(); } catch (e) { return createErrorResponse('Invalid JSON', 400, 'invalid_json'); }

  const prompt = requestData.prompt;
  const size = requestData.size || "1024x1024"; 
  let aspectRatio = "16:9";
  if (size === "1024x1792") aspectRatio = "9:16";
  if (size === "1024x1024") aspectRatio = "1:1";

  try {
    // 绘图接口通常不支持流式返回ID，所以使用后端轮询模式
    const result = await performGeneration(prompt, aspectRatio, null, null, false);
    return new Response(JSON.stringify({
      created: Math.floor(Date.now() / 1000),
      data: [{ url: result.videoUrl, revised_prompt: prompt }]
    }), {
      headers: corsHeaders({ 'Content-Type': 'application/json' })
    });
  } catch (error) {
    return createErrorResponse(error.message, 500, 'generation_failed');
  }
}

// --- [辅助函数] ---

function createErrorResponse(message, status, code) {
  return new Response(JSON.stringify({ error: { message, type: 'api_error', code } }), {
    status, headers: corsHeaders({ 'Content-Type': 'application/json' })
  });
}

function corsHeaders(headers = {}) {
  return {
    ...headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function handleCorsPreflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function handleModelsRequest() {
  return new Response(JSON.stringify({
    object: 'list',
    data: CONFIG.MODELS.map(id => ({ id, object: 'model', created: Date.now(), owned_by: 'veo31' }))
  }), { headers: corsHeaders({ 'Content-Type': 'application/json' }) });
}

// 图片上传代理
async function handleImageUpload(request, apiKey) {
  if (!verifyAuth(request, apiKey)) return createErrorResponse('Unauthorized', 401, 'unauthorized');
  try {
    const formData = await request.formData();
    const upstreamFormData = new FormData();
    upstreamFormData.append('file', formData.get('file'));
    
    const response = await fetch(`${CONFIG.UPSTREAM_ORIGIN}/api/upload/image`, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Origin': CONFIG.UPSTREAM_ORIGIN,
        'Referer': `${CONFIG.UPSTREAM_ORIGIN}/`
      },
      body: upstreamFormData
    });
    
    const data = await response.json();
    return new Response(JSON.stringify(data), { headers: corsHeaders({'Content-Type': 'application/json'}) });
  } catch (e) {
    return createErrorResponse(e.message, 500, 'upload_failed');
  }
}

async function sendSSE(writer, encoder, requestId, content) {
  const chunk = {
    id: requestId, object: 'chat.completion.chunk', created: Math.floor(Date.now()/1000),
    model: CONFIG.DEFAULT_MODEL, choices: [{ index: 0, delta: { content }, finish_reason: null }]
  };
  await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
}

function verifyAuth(request, validKey) {
  const auth = request.headers.get('Authorization');
  return auth && auth === `Bearer ${validKey}`;
}

function getCommonHeaders() {
  return {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'Origin': CONFIG.UPSTREAM_ORIGIN,
    'Referer': `${CONFIG.UPSTREAM_ORIGIN}/`,
    'Accept': '*/*',
    'Accept-Language': 'zh-CN,zh;q=0.9'
  };
}

// --- [第四部分: 开发者驾驶舱 UI (WebUI 客户端轮询版)] ---
function handleUI(request, apiKey) {
  const origin = new URL(request.url).origin;
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME} - 驾驶舱</title>
    <style>
      :root { --bg: #121212; --panel: #1E1E1E; --border: #333; --text: #E0E0E0; --primary: #FFBF00; --accent: #007AFF; }
      body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); margin: 0; height: 100vh; display: flex; overflow: hidden; }
      .sidebar { width: 380px; background: var(--panel); border-right: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; overflow-y: auto; }
      .main { flex: 1; display: flex; flex-direction: column; padding: 20px; }
      
      /* 组件样式 */
      .box { background: #252525; padding: 12px; border-radius: 6px; border: 1px solid var(--border); margin-bottom: 15px; }
      .label { font-size: 12px; color: #888; margin-bottom: 5px; display: block; }
      .code-block { font-family: monospace; font-size: 12px; color: var(--primary); word-break: break-all; background: #111; padding: 8px; border-radius: 4px; cursor: pointer; }
      .code-block:hover { background: #000; }
      
      input, select, textarea { width: 100%; background: #333; border: 1px solid #444; color: #fff; padding: 8px; border-radius: 4px; margin-bottom: 10px; box-sizing: border-box; }
      button { width: 100%; padding: 10px; background: var(--primary); border: none; border-radius: 4px; font-weight: bold; cursor: pointer; color: #000; }
      button:disabled { background: #555; cursor: not-allowed; }
      
      /* 上传组件 */
      .upload-area { border: 1px dashed #555; border-radius: 4px; padding: 20px; text-align: center; cursor: pointer; transition: 0.2s; background-size: cover; background-position: center; position: relative; min-height: 80px; display: flex; align-items: center; justify-content: center; }
      .upload-area:hover { border-color: var(--primary); background-color: #2a2a2a; }
      .upload-text { font-size: 12px; color: #888; pointer-events: none; }
      
      /* 聊天窗口 */
      .chat-window { flex: 1; background: #000; border: 1px solid var(--border); border-radius: 8px; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
      .msg { max-width: 80%; padding: 10px 15px; border-radius: 8px; line-height: 1.5; }
      .msg.user { align-self: flex-end; background: #333; color: #fff; }
      .msg.ai { align-self: flex-start; background: #1a1a1a; border: 1px solid #333; width: 100%; max-width: 100%; }
      
      /* 进度条 */
      .progress-container { width: 100%; background: #333; height: 6px; border-radius: 3px; margin: 10px 0; overflow: hidden; display: none; }
      .progress-bar { height: 100%; background: var(--primary); width: 0%; transition: width 0.5s; }
      .status-text { font-size: 12px; color: #888; margin-top: 5px; }

      /* 视频播放器 */
      video { width: 100%; max-height: 500px; background: #000; border-radius: 4px; margin-top: 10px; }
      .download-btn { display: inline-block; margin-top: 10px; background: #333; color: #fff; text-decoration: none; padding: 8px 15px; border-radius: 4px; font-size: 14px; border: 1px solid #555; }
      .download-btn:hover { background: #444; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2 style="margin-top:0">🚀 ${CONFIG.PROJECT_NAME} <span style="font-size:12px;color:#888">v${CONFIG.PROJECT_VERSION}</span></h2>
        
        <div class="box">
            <span class="label">API 密钥 (点击复制)</span>
            <div class="code-block" onclick="copy('${apiKey}')">${apiKey}</div>
        </div>

        <div class="box">
            <span class="label">API 接口地址 (Endpoint)</span>
            <span class="label">1. 聊天/视频流式 (Chat)</span>
            <div class="code-block" onclick="copy('${origin}/v1/chat/completions')">${origin}/v1/chat/completions</div>
            <span class="label" style="margin-top:8px">2. 绘图/ComfyUI (Image)</span>
            <div class="code-block" onclick="copy('${origin}/v1/images/generations')">${origin}/v1/images/generations</div>
        </div>

        <div class="box">
            <span class="label">模型</span>
            <select id="model">
                ${CONFIG.MODELS.map(m => `<option value="${m}">${m}</option>`).join('')}
            </select>
            
            <span class="label">比例</span>
            <select id="ratio">
                <option value="16:9">16:9 (横屏)</option>
                <option value="9:16">9:16 (竖屏)</option>
                <option value="1:1">1:1 (方形)</option>
            </select>

            <span class="label">参考图 (图生视频 - 可选)</span>
            <input type="file" id="file-input" accept="image/*" style="display:none" onchange="handleFileSelect()">
            <div class="upload-area" id="upload-area" onclick="document.getElementById('file-input').click()">
                <span class="upload-text" id="upload-text">点击上传图片</span>
            </div>

            <span class="label" style="margin-top:10px">提示词</span>
            <textarea id="prompt" rows="4" placeholder="描述你想生成的视频内容..."></textarea>
            
            <button id="btn-gen" onclick="generate()">开始生成视频</button>
        </div>
    </div>

    <main class="main">
        <div class="chat-window" id="chat">
            <div style="color:#666; text-align:center; margin-top:50px;">
                系统就绪。支持 API 调用或直接在此测试。<br>
                <small>WebUI 已启用客户端轮询模式，支持超长任务。</small>
            </div>
        </div>
    </main>

    <script>
        const API_KEY = "${apiKey}";
        const ENDPOINT = "${origin}/v1/chat/completions";
        const STATUS_ENDPOINT = "${origin}/v1/query/status";
        const UPLOAD_URL = "${origin}/proxy/upload";
        
        let uploadedFileName = null;
        let pollInterval = null;

        function copy(text) {
            navigator.clipboard.writeText(text);
            alert('已复制: ' + text);
        }

        // 图片上传逻辑
        async function handleFileSelect() {
            const input = document.getElementById('file-input');
            const file = input.files[0];
            if (!file) return;

            const area = document.getElementById('upload-area');
            const text = document.getElementById('upload-text');
            
            // 预览
            const reader = new FileReader();
            reader.onload = (e) => {
                area.style.backgroundImage = \`url(\${e.target.result})\`;
                text.style.display = 'none';
            };
            reader.readAsDataURL(file);

            // 上传
            text.style.display = 'block';
            text.innerText = "正在上传...";
            
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch(UPLOAD_URL, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + API_KEY },
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    uploadedFileName = data.fileName; // 保存文件名供生成使用
                    text.innerText = "✅ 上传成功";
                    text.style.color = "#66BB6A";
                    text.style.textShadow = "0 1px 2px black";
                } else {
                    text.innerText = "❌ 上传失败";
                    alert('上传失败: ' + (data.message || '未知错误'));
                }
            } catch (e) {
                text.innerText = "❌ 错误";
                alert('上传请求错误: ' + e.message);
            }
        }

        function appendMsg(role, html) {
            const div = document.createElement('div');
            div.className = \`msg \${role}\`;
            div.innerHTML = html;
            document.getElementById('chat').appendChild(div);
            return div;
        }

        async function generate() {
            const prompt = document.getElementById('prompt').value.trim();
            if (!prompt) return alert('请输入提示词');

            const btn = document.getElementById('btn-gen');
            btn.disabled = true;
            btn.innerText = "提交任务中...";

            if(document.querySelector('.chat-window').innerText.includes('系统就绪')) {
                document.getElementById('chat').innerHTML = '';
            }

            // 显示用户消息
            let userHtml = prompt;
            if (uploadedFileName) {
                userHtml += '<br><span style="font-size:12px; color:#888">[已附带参考图]</span>';
            }
            appendMsg('user', userHtml);
            
            // 创建 AI 回复容器
            const aiContainer = appendMsg('ai', \`
                <div class="status-text">正在连接服务器...</div>
                <div class="progress-container" style="display:block">
                    <div class="progress-bar" style="width: 1%"></div>
                </div>
                <div class="video-area"></div>
            \`);
            
            const progressBar = aiContainer.querySelector('.progress-bar');
            const statusText = aiContainer.querySelector('.status-text');
            const videoArea = aiContainer.querySelector('.video-area');

            try {
                // 1. 提交任务 (开启 clientPollMode)
                // 构造特殊 Prompt 传参 (包含 imageFileName 和 clientPollMode)
                const payloadPrompt = JSON.stringify({
                    prompt: prompt,
                    aspectRatio: document.getElementById('ratio').value,
                    imageFileName: uploadedFileName,
                    clientPollMode: true // 告诉后端：给我 ID，我自己查
                });

                const res = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: document.getElementById('model').value,
                        messages: [{ role: 'user', content: payloadPrompt }],
                        stream: true
                    })
                });

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                let taskId = null;

                // 读取流，获取 Task ID
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    
                    // 检查是否包含任务ID
                    if (buffer.includes('[TASK_ID:')) {
                        const match = buffer.match(/\\[TASK_ID:(.*?)\\]/);
                        if (match) {
                            taskId = match[1];
                            break; // 拿到 ID 就断开流，节省资源
                        }
                    }
                }

                if (!taskId) throw new Error("未获取到任务ID，请检查 API Key 或网络");

                // 2. 客户端轮询 (Client-Side Polling)
                // 此时 Worker 连接已断开，浏览器开始接管
                btn.innerText = "生成中 (可关闭页面)...";
                statusText.innerText = \`任务已提交 (ID: \${taskId})，正在生成...\`;
                
                let startTime = Date.now();
                
                // 清除旧的轮询
                if (pollInterval) clearInterval(pollInterval);

                pollInterval = setInterval(async () => {
                    try {
                        // 每次查询都是一个新的 Worker 请求，不会触发 50 subrequests 限制
                        const statusRes = await fetch(\`\${STATUS_ENDPOINT}?videoId=\${taskId}\`, {
                            headers: { 'Authorization': 'Bearer ' + API_KEY }
                        });
                        const statusData = await statusRes.json();

                        if (statusData.status === 'completed') {
                            clearInterval(pollInterval);
                            progressBar.style.width = '100%';
                            statusText.innerHTML = '<strong>✅ 生成完成</strong>';
                            
                            videoArea.innerHTML = \`
                                <video controls autoplay loop playsinline>
                                    <source src="\${statusData.videoUrl}" type="video/mp4">
                                </video>
                                <div style="display:flex; gap:10px; align-items:center;">
                                    <a href="\${statusData.videoUrl}" download="video.mp4" class="download-btn" target="_blank">⬇️ 下载视频</a>
                                    <span style="font-size:12px; color:#666">右键另存为可保存</span>
                                </div>
                            \`;
                            btn.disabled = false;
                            btn.innerText = "开始生成视频";
                        } else if (statusData.status === 'failed') {
                            clearInterval(pollInterval);
                            statusText.style.color = '#ff4444';
                            statusText.innerText = '生成失败: ' + (statusData.error || '未知错误');
                            btn.disabled = false;
                            btn.innerText = "开始生成视频";
                        } else {
                            // 模拟进度 (因为上游可能不返回具体百分比)
                            const elapsed = Date.now() - startTime;
                            // 假设平均 3 分钟，计算一个虚假进度让用户安心
                            let fakeProgress = Math.min(95, Math.floor((elapsed / 180000) * 100));
                            progressBar.style.width = fakeProgress + '%';
                            statusText.innerText = \`正在生成中... \${fakeProgress}% (状态: \${statusData.status})\`;
                        }
                    } catch (e) {
                        console.error("轮询错误:", e);
                        // 网络错误不停止轮询，继续重试
                    }
                }, 3000); // 每3秒查一次，UI 响应非常快

            } catch (e) {
                statusText.innerText = '请求失败: ' + e.message;
                btn.disabled = false;
                btn.innerText = "开始生成视频";
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}



// =================================================================================
//  项目: vidsme-2api (Cloudflare Worker 单文件版)
//  版本: 2.0.3 (代号: Chimera Synthesis - Robustness)
//  作者: 首席AI执行官 (Principal AI Executive Officer)
//  协议: 奇美拉协议 · 综合版 (Project Chimera: Synthesis Edition)
//  日期: 2025-11-21
//
//  描述:
//  本文件是一个完全自包含、可一键部署的 Cloudflare Worker。它将 chatsweetie.ai (vidsme)
//  的图像生成服务，无损地转换为一个高性能、兼容 OpenAI 标准的 API。
//
//  v2.0.3 修正:
//  1. [Critical] 增加了对非 JSON 响应（如 HTML 错误页）的防御性处理，避免 "Unexpected token <" 崩溃。
//  2. [Security] 重写了 ASN.1 解析器，使其能动态读取 RSA 公钥结构，提高加密兼容性。
//  3. [Network] 优化了请求头伪装，降低被上游 WAF 拦截的概率。
//
// =================================================================================

// --- [第一部分: 核心配置 (Configuration-as-Code)] ---
const CONFIG = {
  // 项目元数据
  PROJECT_NAME: "vidsme-2api",
  PROJECT_VERSION: "2.0.3",
  
  // 安全配置 (请在部署后修改此密钥)
  API_MASTER_KEY: "1", 
  
  // 上游服务配置
  UPSTREAM_BASE_URL: "https://api.vidsme.com/api/texttoimg/v1",
  IMAGE_BASE_URL: "https://art-global.yimeta.ai/",
  
  // 签名参数
  UPSTREAM_APP_ID: "chatsweetie",
  UPSTREAM_STATIC_SALT: "NHGNy5YFz7HeFb",
  UPSTREAM_PUBLIC_KEY: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDa2oPxMZe71V4dw2r8rHWt59gH
W5INRmlhepe6GUanrHykqKdlIB4kcJiu8dHC/FJeppOXVoKz82pvwZCmSUrF/1yr
rnmUDjqUefDu8myjhcbio6CnG5TtQfwN2pz3g6yHkLgp8cFfyPSWwyOCMMMsTU9s
snOjvdDb4wiZI8x3UwIDAQAB
-----END PUBLIC KEY-----`,

  // 轮询配置
  POLLING_INTERVAL: 3000, // 毫秒
  POLLING_TIMEOUT: 240000, // 毫秒

  // 模型列表
  MODELS: ["anime", "realistic", "hentai", "hassaku"],
  DEFAULT_MODEL: "anime",
};

// --- [第二部分: Worker 入口与路由] ---
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 预检请求处理
    if (request.method === 'OPTIONS') {
      return handleCorsPreflight();
    }

    if (url.pathname === '/') {
      return handleUI(request);
    } else if (url.pathname.startsWith('/v1/')) {
      return handleApi(request);
    } else {
      return createErrorResponse(`路径未找到: ${url.pathname}`, 404, 'not_found');
    }
  }
};

// --- [第三部分: 核心逻辑与加密工具] ---

/**
 * Vidsme 签名生成器
 * 包含手写的 ASN.1 解析器和 RSA-PKCS1-v1.5 加密器 (BigInt 实现)
 */
class VidsmeSigner {
  constructor() {
    this.publicKey = CONFIG.UPSTREAM_PUBLIC_KEY;
  }

  generateRandomKey(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
    return result;
  }

  // 动态 ASN.1 解析器 (更健壮)
  parsePem(pem) {
    const b64 = pem.replace(/(-----(BEGIN|END) PUBLIC KEY-----|\n)/g, '');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    let offset = 0;

    function readLen() {
      let len = bytes[offset++];
      if (len & 0x80) {
        let n = len & 0x7f;
        len = 0;
        for (let i = 0; i < n; i++) len = (len << 8) | bytes[offset++];
      }
      return len;
    }

    function readTag() {
      return bytes[offset++];
    }

    // 遍历 ASN.1 结构找到 Modulus 和 Exponent
    // Structure: SEQUENCE -> SEQUENCE (AlgId) -> BIT STRING -> SEQUENCE (Key) -> INTEGER (n) -> INTEGER (e)
    
    readTag(); readLen(); // Outer SEQUENCE
    
    readTag(); let algLen = readLen(); offset += algLen; // AlgorithmIdentifier
    
    readTag(); readLen(); offset++; // BIT STRING + unused bits
    
    readTag(); readLen(); // Inner SEQUENCE (RSAPublicKey)
    
    // Read Modulus (n)
    readTag(); // INTEGER
    let nLen = readLen();
    if (bytes[offset] === 0) { offset++; nLen--; } // Skip leading zero
    let nHex = '';
    for (let i = 0; i < nLen; i++) nHex += bytes[offset++].toString(16).padStart(2, '0');
    
    // Read Exponent (e)
    readTag(); // INTEGER
    let eLen = readLen();
    let eHex = '';
    for (let i = 0; i < eLen; i++) eHex += bytes[offset++].toString(16).padStart(2, '0');

    return { n: BigInt('0x' + nHex), e: BigInt('0x' + eHex) };
  }

  // RSA-PKCS1-v1.5 加密
  rsaEncrypt(data) {
    const { n, e } = this.parsePem(this.publicKey);
    const k = 128; // 1024 bit key
    const msgBytes = new TextEncoder().encode(data);
    
    if (msgBytes.length > k - 11) throw new Error("Message too long");

    // Padding
    const psLen = k - 3 - msgBytes.length;
    const ps = new Uint8Array(psLen);
    crypto.getRandomValues(ps);
    for(let i=0; i<psLen; i++) if(ps[i] === 0) ps[i] = 1;

    const padded = new Uint8Array(k);
    padded[0] = 0x00;
    padded[1] = 0x02;
    padded.set(ps, 2);
    padded[2 + psLen] = 0x00;
    padded.set(msgBytes, 2 + psLen + 1);

    // BigInt Modular Exponentiation
    let mInt = BigInt('0x' + [...padded].map(b => b.toString(16).padStart(2, '0')).join(''));
    let cInt = 1n;
    let base = mInt;
    let exp = e;
    while (exp > 0n) {
        if (exp % 2n === 1n) cInt = (cInt * base) % n;
        base = (base * base) % n;
        exp /= 2n;
    }

    let cHex = cInt.toString(16);
    if (cHex.length % 2) cHex = '0' + cHex;
    const cBytes = new Uint8Array(cHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    
    const finalBytes = new Uint8Array(128);
    finalBytes.set(cBytes, 128 - cBytes.length);

    return btoa(String.fromCharCode(...finalBytes));
  }

  // AES-CBC 加密
  async aesEncrypt(data, keyStr, ivStr) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", enc.encode(keyStr), { name: "AES-CBC" }, false, ["encrypt"]
    );
    const iv = enc.encode(ivStr);
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv: iv },
      key,
      enc.encode(data)
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  async generateSignature() {
    const randomKey = this.generateRandomKey(16);
    const secretKey = this.rsaEncrypt(randomKey);
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomUUID();
    
    const messageToSign = `${CONFIG.UPSTREAM_APP_ID}:${CONFIG.UPSTREAM_STATIC_SALT}:${timestamp}:${nonce}:${secretKey}`;
    const sign = await this.aesEncrypt(messageToSign, randomKey, randomKey);

    return {
      app_id: CONFIG.UPSTREAM_APP_ID,
      t: timestamp.toString(),
      nonce: nonce,
      sign: sign,
      secret_key: secretKey
    };
  }
}

// --- [第四部分: API 代理逻辑] ---

async function handleApi(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader.substring(7) !== CONFIG.API_MASTER_KEY) {
    return createErrorResponse('无效的 API Key', 401, 'unauthorized');
  }

  const url = new URL(request.url);
  const requestId = `req-${crypto.randomUUID()}`;

  if (url.pathname === '/v1/models') {
    return handleModels();
  } else if (url.pathname === '/v1/chat/completions') {
    return handleChatCompletions(request, requestId);
  } else if (url.pathname === '/v1/images/generations') {
    return handleImageGenerations(request, requestId);
  } else {
    return createErrorResponse('不支持的 API 路径', 404, 'not_found');
  }
}

function handleModels() {
  return new Response(JSON.stringify({
    object: 'list',
    data: CONFIG.MODELS.map(id => ({
      id, object: 'model', created: Math.floor(Date.now()/1000), owned_by: 'vidsme-2api'
    }))
  }), { headers: corsHeaders({ 'Content-Type': 'application/json' }) });
}

// 辅助函数：安全的 Fetch，处理非 JSON 响应
async function safeFetch(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    // 如果解析失败，说明返回的不是 JSON (可能是 HTML 错误页)
    throw new Error(`Upstream Error (${response.status}): ${text.substring(0, 200)}...`);
  }

  return { response, data };
}

// 核心：图像生成逻辑
async function generateImage(prompt, model, size = "2:3", userId = null) {
  const signer = new VidsmeSigner();
  // 确保 user_id 长度 >= 64
  const finalUserId = userId || (crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''));
  
  // 1. 提交任务
  const authParams = await signer.generateSignature();
  const apiModel = model === "hassaku" ? "hassaku(hentai)" : model;
  
  const sizeMap = { "1:1": [512, 512], "3:2": [768, 512], "2:3": [512, 768] };
  const [width, height] = sizeMap[size] || [512, 768];

  const payload = {
    prompt: `(masterpiece), best quality, expressiveeyes, perfect face, ${prompt}`,
    model: apiModel,
    user_id: finalUserId,
    height, width
  };

  const submitUrl = `${CONFIG.UPSTREAM_BASE_URL}/task?` + new URLSearchParams(authParams).toString();
  
  // 使用 safeFetch 捕获 HTML 错误
  const { data: submitData } = await safeFetch(submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://chatsweetie.ai',
      'Referer': 'https://chatsweetie.ai/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    body: JSON.stringify(payload)
  });

  if (submitData.code !== 200 || !submitData.data?.job_id) {
    throw new Error(`任务提交失败: ${submitData.msg || JSON.stringify(submitData)}`);
  }

  const jobId = submitData.data.job_id;
  
  // 2. 轮询结果
  const startTime = Date.now();
  while (Date.now() - startTime < CONFIG.POLLING_TIMEOUT) {
    await new Promise(r => setTimeout(r, CONFIG.POLLING_INTERVAL));
    
    const pollAuth = await signer.generateSignature();
    pollAuth.user_id = finalUserId;
    pollAuth.job_id = jobId;
    
    const pollUrl = `${CONFIG.UPSTREAM_BASE_URL}/task?` + new URLSearchParams(pollAuth).toString();
    
    const { data: pollData } = await safeFetch(pollUrl, {
      headers: {
        'Origin': 'https://chatsweetie.ai',
        'Referer': 'https://chatsweetie.ai/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (pollData.code !== 200) continue;
    
    const statusData = pollData.data || {};
    if (statusData.generate_url) {
      return CONFIG.IMAGE_BASE_URL + statusData.generate_url;
    }
    if (statusData.status === 'failed') {
      throw new Error("上游任务处理失败");
    }
  }
  throw new Error("任务轮询超时");
}

// 处理 Chat 接口
async function handleChatCompletions(request, requestId) {
  try {
    const body = await request.json();
    const messages = body.messages || [];
    const lastMsg = messages.reverse().find(m => m.role === 'user');
    
    if (!lastMsg) throw new Error("未找到用户消息");
    
    const prompt = lastMsg.content;
    const model = body.model || CONFIG.DEFAULT_MODEL;
    
    const imageUrl = await generateImage(prompt, model);
    
    const responseContent = `![${prompt.substring(0, 20)}](${imageUrl})`;
    
    const response = {
      id: requestId,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [{
        index: 0,
        message: { role: "assistant", content: responseContent },
        finish_reason: "stop"
      }],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    };

    return new Response(JSON.stringify(response), {
      headers: corsHeaders({ 'Content-Type': 'application/json' })
    });

  } catch (e) {
    return createErrorResponse(e.message, 500, 'internal_error');
  }
}

// 处理 Image 接口
async function handleImageGenerations(request, requestId) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    const model = body.model || CONFIG.DEFAULT_MODEL;
    const size = body.size || "2:3";
    
    const imageUrl = await generateImage(prompt, model, size);
    
    return new Response(JSON.stringify({
      created: Math.floor(Date.now() / 1000),
      data: [{ url: imageUrl }]
    }), {
      headers: corsHeaders({ 'Content-Type': 'application/json' })
    });
  } catch (e) {
    return createErrorResponse(e.message, 500, 'internal_error');
  }
}

function createErrorResponse(message, status, code) {
  return new Response(JSON.stringify({
    error: { message, type: 'api_error', code }
  }), { status, headers: corsHeaders({ 'Content-Type': 'application/json' }) });
}

function handleCorsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function corsHeaders(headers = {}) {
  return {
    ...headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// --- [第五部分: 开发者驾驶舱 UI] ---
function handleUI(request) {
  const origin = new URL(request.url).origin;
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME} - 开发者驾驶舱</title>
    <style>
      :root {
        --bg-color: #121212; --sidebar-bg: #1E1E1E; --main-bg: #121212;
        --border-color: #333; --text-color: #E0E0E0; --text-secondary: #888;
        --primary-color: #FFBF00; --primary-hover: #FFD700; --input-bg: #2A2A2A;
        --error-color: #CF6679; --success-color: #66BB6A;
        --font-family: 'Segoe UI', sans-serif; --font-mono: 'Fira Code', monospace;
      }
      * { box-sizing: border-box; }
      body { font-family: var(--font-family); margin: 0; background: var(--bg-color); color: var(--text-color); height: 100vh; display: flex; overflow: hidden; }
      .skeleton { background: linear-gradient(90deg, #2a2a2a, #3a3a3a, #2a2a2a); background-size: 200% 100%; animation: sk-load 1.5s infinite; border-radius: 4px; }
      @keyframes sk-load { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    </style>
</head>
<body>
    <main-layout></main-layout>

    <template id="main-layout-template">
      <style>
        .layout { display: flex; width: 100%; height: 100%; }
        .sidebar { width: 380px; background: var(--sidebar-bg); border-right: 1px solid var(--border-color); padding: 20px; display: flex; flex-direction: column; }
        .main-content { flex: 1; padding: 20px; display: flex; flex-direction: column; }
        .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 1px solid var(--border-color); margin-bottom: 15px; }
        h1 { margin: 0; font-size: 20px; } .version { font-size: 12px; color: var(--text-secondary); margin-left: 8px; }
        details { margin-top: 20px; } summary { cursor: pointer; font-weight: bold; margin-bottom: 10px; }
      </style>
      <div class="layout">
        <aside class="sidebar">
          <header class="header">
            <h1>${CONFIG.PROJECT_NAME}<span class="version">v${CONFIG.PROJECT_VERSION}</span></h1>
            <status-indicator></status-indicator>
          </header>
          <info-panel></info-panel>
          <details open><summary>⚙️ 客户端集成指南</summary><client-guides></client-guides></details>
        </aside>
        <main class="main-content">
          <live-terminal></live-terminal>
        </main>
      </div>
    </template>

    <template id="status-indicator-template">
      <style>
        .indicator { display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot.grey { background: #555; } .dot.green { background: var(--success-color); } .dot.red { background: var(--error-color); }
        .dot.yellow { background: var(--primary-color); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,191,0,0.4); } 70% { box-shadow: 0 0 0 10px rgba(0,0,0,0); } }
      </style>
      <div class="indicator"><div id="dot" class="dot grey"></div><span id="text">初始化...</span></div>
    </template>

    <template id="info-panel-template">
      <style>
        .panel { display: flex; flex-direction: column; gap: 12px; }
        label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; display: block; }
        .val { background: var(--input-bg); padding: 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; color: var(--primary-color); display: flex; justify-content: space-between; align-items: center; }
        .val.pass { -webkit-text-security: disc; } .val.show { -webkit-text-security: none; }
        button { background: none; border: none; color: #888; cursor: pointer; } button:hover { color: #fff; }
      </style>
      <div class="panel">
        <div><label>API 端点</label><div id="url" class="val skeleton"></div></div>
        <div><label>API 密钥</label><div id="key" class="val pass skeleton"></div></div>
        <div><label>默认模型</label><div id="model" class="val skeleton"></div></div>
      </div>
    </template>

    <template id="client-guides-template">
       <style>
        .tabs { display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 10px; }
        .tab { padding: 8px 12px; cursor: pointer; border: none; background: none; color: #888; }
        .tab.active { color: var(--primary-color); border-bottom: 2px solid var(--primary-color); }
        pre { background: var(--input-bg); padding: 10px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; white-space: pre-wrap; position: relative; }
        .copy { position: absolute; top: 5px; right: 5px; background: #444; border: 1px solid #555; color: #ccc; border-radius: 3px; cursor: pointer; font-size: 10px; padding: 2px 6px; }
       </style>
       <div><div class="tabs"></div><div class="content"></div></div>
    </template>

    <template id="live-terminal-template">
      <style>
        .term { display: flex; flex-direction: column; height: 100%; background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
        .out { flex: 1; padding: 15px; overflow-y: auto; font-size: 14px; line-height: 1.6; }
        .in { border-top: 1px solid var(--border-color); padding: 15px; display: flex; gap: 10px; }
        textarea { flex: 1; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-color); padding: 10px; resize: none; border-radius: 4px; }
        button { background: var(--primary-color); border: none; border-radius: 4px; padding: 0 20px; font-weight: bold; cursor: pointer; }
        .msg { margin-bottom: 10px; } .msg.user { color: var(--primary-color); font-weight: bold; } .msg.img img { max-width: 100%; border-radius: 4px; margin-top: 5px; }
      </style>
      <div class="term">
        <div class="out"><p style="color:#888">输入提示词开始生成图像 (例如: "A cute cat")...</p></div>
        <div class="in"><textarea id="input" rows="1" placeholder="输入指令..."></textarea><button id="send">发送</button></div>
      </div>
    </template>

    <script>
      const CFG = { ORIGIN: '${origin}', KEY: '${CONFIG.API_MASTER_KEY}', MODEL: '${CONFIG.DEFAULT_MODEL}', MODELS: '${CONFIG.MODELS.join(',')}' };
      
      class Base extends HTMLElement {
        constructor(id) { super(); this.attachShadow({mode:'open'}).appendChild(document.getElementById(id).content.cloneNode(true)); }
      }

      customElements.define('main-layout', class extends Base { constructor(){super('main-layout-template')} });
      
      customElements.define('status-indicator', class extends Base {
        constructor(){super('status-indicator-template'); this.d=this.shadowRoot.getElementById('dot'); this.t=this.shadowRoot.getElementById('text');}
        set(s,m){ this.d.className='dot '+s; this.t.textContent=m; }
      });

      customElements.define('info-panel', class extends Base {
        constructor(){super('info-panel-template');}
        connectedCallback(){
          const set=(id,v,p)=>{
            const el=this.shadowRoot.getElementById(id); el.classList.remove('skeleton');
            el.innerHTML=\`<span>\${v}</span><div>\${p?'<button onclick="this.closest(\\\'.val\\\').classList.toggle(\\\'show\\\')">👁️</button>':''}<button onclick="navigator.clipboard.writeText('\${v}')">📋</button></div>\`;
          };
          set('url', CFG.ORIGIN+'/v1', false); set('key', CFG.KEY, true); set('model', CFG.MODEL, false);
        }
      });

      customElements.define('client-guides', class extends Base {
        constructor(){super('client-guides-template');}
        connectedCallback(){
          const tabs=this.shadowRoot.querySelector('.tabs'), cont=this.shadowRoot.querySelector('.content');
          const g={
            'cURL': \`<pre><code>curl \${CFG.ORIGIN}/v1/images/generations \\\\
  -H "Authorization: Bearer \${CFG.KEY}" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{
    "prompt": "A futuristic city",
    "model": "\${CFG.MODEL}",
    "size": "2:3"
  }'</code><button class="copy" onclick="navigator.clipboard.writeText(this.previousSibling.innerText)">复制</button></pre>\`,
            'Python': \`<pre><code>import openai
client = openai.OpenAI(api_key="\${CFG.KEY}", base_url="\${CFG.ORIGIN}/v1")

# 方式1: 聊天接口 (推荐)
resp = client.chat.completions.create(
  model="\${CFG.MODEL}",
  messages=[{"role": "user", "content": "A cute cat"}]
)
print(resp.choices[0].message.content) # 返回 Markdown 图片链接

# 方式2: 图像接口
img = client.images.generate(
  prompt="A cute cat",
  model="\${CFG.MODEL}"
)
print(img.data[0].url)</code><button class="copy" onclick="navigator.clipboard.writeText(this.previousSibling.innerText)">复制</button></pre>\`
          };
          Object.keys(g).forEach((k,i)=>{
            const b=document.createElement('button'); b.className='tab '+(i===0?'active':''); b.textContent=k;
            b.onclick=()=>{this.shadowRoot.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); b.classList.add('active'); cont.innerHTML=g[k];};
            tabs.appendChild(b);
          });
          cont.innerHTML=g['cURL'];
        }
      });

      customElements.define('live-terminal', class extends Base {
        constructor(){super('live-terminal-template'); this.out=this.shadowRoot.querySelector('.out'); this.inp=this.shadowRoot.getElementById('input'); this.btn=this.shadowRoot.getElementById('send');}
        connectedCallback(){
          this.btn.onclick=()=>this.send();
          this.inp.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();this.send();}};
        }
        add(cls, html){ const d=document.createElement('div'); d.className='msg '+cls; d.innerHTML=html; this.out.appendChild(d); this.out.scrollTop=this.out.scrollHeight; return d; }
        async send(){
          const p=this.inp.value.trim(); if(!p)return;
          this.inp.value=''; this.btn.disabled=true; this.btn.textContent='生成中...';
          this.add('user', p);
          const loading=this.add('sys', '正在提交任务并轮询结果 (约10-30秒)...');
          
          try {
            const res = await fetch(CFG.ORIGIN+'/v1/chat/completions', {
              method:'POST', headers:{'Authorization':'Bearer '+CFG.KEY, 'Content-Type':'application/json'},
              body: JSON.stringify({model:CFG.MODEL, messages:[{role:'user', content:p}]})
            });
            const data = await res.json();
            loading.remove();
            if(!res.ok) throw new Error(data.error?.message||'Error');
            const content = data.choices[0].message.content; // ![prompt](url)
            const url = content.match(/\\((.*?)\\)/)[1];
            this.add('img', \`<img src="\${url}" onclick="window.open(this.src)">\`);
          } catch(e) {
            loading.textContent = '错误: '+e.message; loading.style.color='var(--error-color)';
          } finally {
            this.btn.disabled=false; this.btn.textContent='发送';
          }
        }
      });

      // Init
      document.addEventListener('DOMContentLoaded', async ()=>{
        const ind = document.querySelector('main-layout').shadowRoot.querySelector('status-indicator');
        ind.set('yellow', '检查服务...');
        try {
          const res = await fetch(CFG.ORIGIN+'/v1/models', {headers:{'Authorization':'Bearer '+CFG.KEY}});
          if(res.ok) ind.set('green', '系统就绪'); else throw new Error();
        } catch(e) { ind.set('red', '服务异常'); }
      });
    </script>
</body>
</html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}


// =================================================================================
//  项目: botzy-2api (Cloudflare Worker 单文件版)
//  版本: 8.2.0 (代号: Chimera Synthesis - Botzy)
//  作者: 首席AI执行官 (Principal AI Executive Officer)
//  协议: 奇美拉协议 · 综合版 (Project Chimera: Synthesis Edition)
//  日期: 2025-11-10
//
//  描述:
//  本文件是一个完全自包含、可一键部署的 Cloudflare Worker。它将 botzy.hexabiz.com.pk
//  的后端聊天服务，无损地转换为一个高性能、兼容 OpenAI 标准的 API，并内置了一个
//  功能强大的"开发者驾驶舱"Web UI，用于实时监控、测试和集成。
//
//  v8.2.0 更新:
//  1. [新功能] 首次实现对 botzy.hexabiz.com.pk 服务的完整代理。
//  2. [架构] 采用 TransformStream 实现高效、实时的 SSE 流格式转换。
//  3. [兼容性] 同时支持流式和非流式两种响应模式。
//  4. [UI/UX] 严格遵循协议规范，构建了包含自定义元素和状态机的全功能开发者驾驶舱。
//
// =================================================================================

// --- [第一部分: 核心配置 (Configuration-as-Code)] ---
// 架构核心：所有关键参数在此定义，后续逻辑必须从此对象读取。
const CONFIG = {
  // 项目元数据
  PROJECT_NAME: "botzy-2api",
  PROJECT_VERSION: "8.2.0",
  // 安全配置
  API_MASTER_KEY: "1", // 密钥已按协议要求设置为 "1"
  // 上游服务配置
  UPSTREAM_URL: "https://botzy.hexabiz.com.pk/api/hexabizApi",
  // 模型映射
  MODELS: [
    "L1T3-Ωᴹ²",
  ],
  DEFAULT_MODEL: "L1T3-Ωᴹ²",
};

// --- [第二部分: Worker 入口与路由] ---
// Cloudflare Worker 的主处理函数
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // 根据路径分发请求到不同的处理器
    if (url.pathname === '/') {
      return handleUI(request); // 处理根路径，返回开发者驾驶舱 UI
    } else if (url.pathname.startsWith('/v1/')) {
      return handleApi(request); // 处理 API 请求
    } else {
      // 对于所有其他路径，返回 404 Not Found
      return new Response(
        JSON.stringify({
          error: {
            message: `路径未找到: ${url.pathname}`,
            type: 'invalid_request_error',
            code: 'not_found'
          }
        }), {
          status: 404,
          headers: corsHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
        }
      );
    }
  }
};

// --- [第三部分: API 代理逻辑] ---

/**
 * 处理所有 /v1/ 路径下的 API 请求
 * @param {Request} request - 传入的请求对象
 * @returns {Promise<Response>} - 返回给客户端的响应
 */
async function handleApi(request) {
  // 预检请求处理：对于 OPTIONS 方法，直接返回 CORS 头部，允许跨域访问
  if (request.method === 'OPTIONS') {
    return handleCorsPreflight();
  }

  // 认证检查：验证 Authorization 头部
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createErrorResponse('需要 Bearer Token 认证。', 401, 'unauthorized');
  }
  const token = authHeader.substring(7);
  if (token !== CONFIG.API_MASTER_KEY) {
    return createErrorResponse('无效的 API Key。', 403, 'invalid_api_key');
  }

  const url = new URL(request.url);
  const requestId = `chatcmpl-${crypto.randomUUID()}`;

  // 根据 API 路径执行不同操作
  if (url.pathname === '/v1/models') {
    return handleModelsRequest();
  } else if (url.pathname === '/v1/chat/completions') {
    return handleChatCompletions(request, requestId);
  } else {
    return createErrorResponse(`API 路径不支持: ${url.pathname}`, 404, 'not_found');
  }
}

/**
 * 处理 CORS 预检请求
 * @returns {Response}
 */
function handleCorsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * 创建标准化的 JSON 错误响应
 * @param {string} message - 错误信息
 * @param {number} status - HTTP 状态码
 * @param {string} code - 错误代码
 * @returns {Response}
 */
function createErrorResponse(message, status, code) {
  return new Response(JSON.stringify({
    error: {
      message,
      type: 'api_error',
      code
    }
  }), {
    status,
    headers: corsHeaders({
      'Content-Type': 'application/json; charset=utf-8'
    })
  });
}

/**
 * 处理 /v1/models 请求
 * @returns {Response}
 */
function handleModelsRequest() {
  const modelsData = {
    object: 'list',
    data: CONFIG.MODELS.map(modelId => ({
      id: modelId,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'botzy-2api',
    })),
  };
  return new Response(JSON.stringify(modelsData), {
    headers: corsHeaders({
      'Content-Type': 'application/json; charset=utf-8'
    })
  });
}

/**
 * 处理 /v1/chat/completions 请求
 * @param {Request} request - 传入的请求对象
 * @param {string} requestId - 本次请求的唯一 ID
 * @returns {Promise<Response>}
 */
async function handleChatCompletions(request, requestId) {
  try {
    const requestData = await request.json();
    const upstreamPayload = transformRequestToUpstream(requestData);

    const upstreamResponse = await fetch(CONFIG.UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Origin': 'https://botzy.hexabiz.com.pk',
        'Referer': 'https://botzy.hexabiz.com.pk/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'X-Request-ID': requestId, // 请求水印
      },
      body: JSON.stringify(upstreamPayload),
      // 暗示 Cloudflare 优先使用 HTTP/3
      cf: {
        http3: 'on'
      }
    });

    if (!upstreamResponse.ok) {
      const errorBody = await upstreamResponse.text();
      console.error(`上游服务错误: ${upstreamResponse.status}`, errorBody);
      return createErrorResponse(`上游服务返回错误 ${upstreamResponse.status}: ${errorBody}`, upstreamResponse.status, 'upstream_error');
    }

    // 检查是否为流式响应
    const contentType = upstreamResponse.headers.get('content-type');
    if (requestData.stream && contentType && contentType.includes('text/event-stream')) {
      // 创建转换流，将上游格式实时转换为 OpenAI 格式
      const transformStream = createUpstreamToOpenAIStream(requestId, requestData.model || CONFIG.DEFAULT_MODEL);
      
      // 优雅地处理背压
      const pipedStream = upstreamResponse.body.pipeThrough(transformStream);

      return new Response(pipedStream, {
        headers: corsHeaders({
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Worker-Trace-ID': requestId, // 响应水印
        }),
      });
    } else {
        // 处理非流式响应
        const fullBody = await upstreamResponse.text();
        const openAIResponse = transformNonStreamResponse(fullBody, requestId, requestData.model || CONFIG.DEFAULT_MODEL);
        return new Response(JSON.stringify(openAIResponse), {
            headers: corsHeaders({
                'Content-Type': 'application/json; charset=utf-8',
                'X-Worker-Trace-ID': requestId,
            }),
        });
    }

  } catch (e) {
    console.error('处理聊天请求时发生异常:', e);
    return createErrorResponse(`处理请求时发生内部错误: ${e.message}`, 500, 'internal_server_error');
  }
}

/**
 * 将 OpenAI 格式的请求体转换为上游服务所需的格式
 * @param {object} requestData - OpenAI 格式的请求数据
 * @returns {object} - 上游服务格式的载荷
 */
function transformRequestToUpstream(requestData) {
  // 上游服务直接兼容 OpenAI 的 messages 格式，无需转换
  return {
    task: "chat",
    model: requestData.model || CONFIG.DEFAULT_MODEL,
    messages: requestData.messages,
    imageUrl: null,
    settings: {
      avatar: null,
      name: "",
      nickname: "",
      age: 0,
      gender: "other"
    }
  };
}

/**
 * 创建一个 TransformStream 用于将上游 SSE 流转换为 OpenAI 兼容格式
 * @param {string} requestId - 本次请求的唯一 ID
 * @param {string} model - 使用的模型名称
 * @returns {TransformStream}
 */
function createUpstreamToOpenAIStream(requestId, model) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = '';

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 保留可能不完整的最后一行

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const dataStr = line.substring(5).trim();
          if (dataStr === '[DONE]') {
            // 上游的 [DONE] 信号，我们将在 flush 中发送我们自己的
            continue;
          }
          try {
            const data = JSON.parse(dataStr);
            // 检查是否是有效的聊天内容块
            const delta = data?.choices?.[0]?.delta;
            if (delta && typeof delta.content === 'string') {
              const openAIChunk = {
                id: requestId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: model,
                choices: [{
                  index: 0,
                  delta: { content: delta.content },
                  finish_reason: null,
                }],
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIChunk)}\n\n`));
            }
          } catch (e) {
            // 忽略无法解析的或非内容的数据块
            // console.warn('无法解析或跳过上游 SSE 数据块:', dataStr);
          }
        }
      }
    },
    flush(controller) {
      // 流结束时，发送最终的 [DONE] 块
      const finalChunk = {
        id: requestId,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
          index: 0,
          delta: {},
          finish_reason: 'stop',
        }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    },
  });
}

/**
 * 转换非流式响应
 * @param {string} fullBody - 从上游获取的完整响应体文本
 * @param {string} requestId - 本次请求的唯一 ID
 * @param {string} model - 使用的模型名称
 * @returns {object} - OpenAI 格式的完整响应
 */
function transformNonStreamResponse(fullBody, requestId, model) {
    let fullContent = '';
    const lines = fullBody.split('\n');
    for (const line of lines) {
        if (line.startsWith('data:')) {
            const dataStr = line.substring(5).trim();
            if (dataStr === '[DONE]') continue;
            try {
                const data = JSON.parse(dataStr);
                const deltaContent = data?.choices?.[0]?.delta?.content;
                if (deltaContent) {
                    fullContent += deltaContent;
                }
            } catch (e) {
                // 忽略
            }
        }
    }

    return {
        id: requestId,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
            index: 0,
            message: {
                role: "assistant",
                content: fullContent,
            },
            finish_reason: "stop",
        }],
        usage: {
            prompt_tokens: 0, // 无法精确计算，设为0
            completion_tokens: 0,
            total_tokens: 0,
        },
    };
}


/**
 * 辅助函数，为响应头添加 CORS 策略
 * @param {object} headers - 现有的响应头
 * @returns {object} - 包含 CORS 头的新对象
 */
function corsHeaders(headers = {}) {
  return {
    ...headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// --- [第四部分: 开发者驾驶舱 UI] ---
/**
 * 处理对根路径的请求，返回一个功能丰富的 HTML UI
 * @param {Request} request - 传入的请求对象
 * @returns {Response} - 包含完整 UI 的 HTML 响应
 */
function handleUI(request) {
  const origin = new URL(request.url).origin;
  // 使用模板字符串嵌入完整的 HTML, CSS, 和 JS
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME} - 开发者驾驶舱</title>
    <style>
      /* --- 全局样式与主题 --- */
      :root {
        --bg-color: #121212;
        --sidebar-bg: #1E1E1E;
        --main-bg: #121212;
        --border-color: #333333;
        --text-color: #E0E0E0;
        --text-secondary: #888888;
        --primary-color: #FFBF00; /* 琥珀色 */
        --primary-hover: #FFD700;
        --input-bg: #2A2A2A;
        --error-color: #CF6679;
        --success-color: #66BB6A;
        --font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
        --font-mono: 'Fira Code', 'Consolas', 'Monaco', monospace;
      }
      * { box-sizing: border-box; }
      body {
        font-family: var(--font-family);
        margin: 0;
        background-color: var(--bg-color);
        color: var(--text-color);
        font-size: 14px;
        display: flex;
        height: 100vh;
        overflow: hidden;
      }
      /* --- 骨架屏样式 --- */
      .skeleton {
        background-color: #2a2a2a;
        background-image: linear-gradient(90deg, #2a2a2a, #3a3a3a, #2a2a2a);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
      }
      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    </style>
</head>
<body>
    <!-- 主布局自定义元素 -->
    <main-layout></main-layout>

    <!-- 模板定义 -->
    <template id="main-layout-template">
      <style>
        .layout { display: flex; width: 100%; height: 100vh; }
        .sidebar { width: 380px; flex-shrink: 0; background-color: var(--sidebar-bg); border-right: 1px solid var(--border-color); padding: 20px; display: flex; flex-direction: column; overflow-y: auto; }
        .main-content { flex-grow: 1; display: flex; flex-direction: column; padding: 20px; overflow: hidden; }
        .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); }
        .header h1 { margin: 0; font-size: 20px; }
        .header .version { font-size: 12px; color: var(--text-secondary); margin-left: 8px; }
        .collapsible-section { margin-top: 20px; }
        .collapsible-section summary { cursor: pointer; font-weight: bold; margin-bottom: 10px; list-style-type: '⚙️'; padding-left: 8px; }
        .collapsible-section[open] summary { list-style-type: '⚙️'; }
        @media (max-width: 768px) {
          .layout { flex-direction: column; }
          .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--border-color); }
        }
      </style>
      <div class="layout">
        <aside class="sidebar">
          <header class="header">
            <h1>${CONFIG.PROJECT_NAME}<span class="version">v${CONFIG.PROJECT_VERSION}</span></h1>
            <status-indicator></status-indicator>
          </header>
          <info-panel></info-panel>
          <details class="collapsible-section" open>
            <summary> 主流客户端集成指南</summary>
            <client-guides></client-guides>
          </details>
        </aside>
        <main class="main-content">
          <live-terminal></live-terminal>
        </main>
      </div>
    </template>

    <template id="status-indicator-template">
      <style>
        .indicator { display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; transition: background-color: 0.3s; }
        .dot.grey { background-color: #555; }
        .dot.yellow { background-color: #FFBF00; animation: pulse 2s infinite; }
        .dot.green { background-color: var(--success-color); }
        .dot.red { background-color: var(--error-color); }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 191, 0, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(255, 191, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 191, 0, 0); } }
      </style>
      <div class="indicator">
        <div id="status-dot" class="dot grey"></div>
        <span id="status-text">正在初始化...</span>
      </div>
    </template>

    <template id="info-panel-template">
      <style>
        .panel { display: flex; flex-direction: column; gap: 12px; }
        .info-item { display: flex; flex-direction: column; }
        .info-item label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
        .info-value { background-color: var(--input-bg); padding: 8px 12px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; color: var(--primary-color); display: flex; align-items: center; justify-content: space-between; word-break: break-all; }
        .info-value.password { -webkit-text-security: disc; }
        .info-value.visible { -webkit-text-security: none; }
        .actions { display: flex; gap: 8px; }
        .icon-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px; display: flex; align-items: center; }
        .icon-btn:hover { color: var(--text-color); }
        .icon-btn svg { width: 16px; height: 16px; }
        .skeleton { height: 34px; }
      </style>
      <div class="panel">
        <div class="info-item">
          <label>API 端点 (Endpoint)</label>
          <div id="api-url" class="info-value skeleton"></div>
        </div>
        <div class="info-item">
          <label>API 密钥 (Master Key)</label>
          <div id="api-key" class="info-value password skeleton"></div>
        </div>
        <div class="info-item">
          <label>默认模型 (Default Model)</label>
          <div id="default-model" class="info-value skeleton"></div>
        </div>
      </div>
    </template>

    <template id="client-guides-template">
       <style>
        .tabs { display: flex; border-bottom: 1px solid var(--border-color); }
        .tab { padding: 8px 12px; cursor: pointer; border: none; background: none; color: var(--text-secondary); font-size: 13px; }
        .tab.active { color: var(--primary-color); border-bottom: 2px solid var(--primary-color); font-weight: bold; }
        .content { padding: 15px 0; }
        pre { background-color: var(--input-bg); padding: 12px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; white-space: pre-wrap; word-break: break-all; position: relative; }
        .copy-code-btn { position: absolute; top: 8px; right: 8px; background: #444; border: 1px solid #555; color: #ccc; border-radius: 4px; cursor: pointer; font-size: 10px; padding: 2px 6px; }
        .copy-code-btn:hover { background: #555; }
        p { font-size: 13px; line-height: 1.5; }
       </style>
       <div>
         <div class="tabs"></div>
         <div class="content"></div>
       </div>
    </template>

    <template id="live-terminal-template">
      <style>
        .terminal { display: flex; flex-direction: column; height: 100%; background-color: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
        .output-window { flex-grow: 1; padding: 15px; overflow-y: auto; font-size: 14px; line-height: 1.6; }
        .output-window p { margin: 0 0 1em 0; }
        .output-window pre { background-color: #0d0d0d; padding: 1em; border-radius: 4px; white-space: pre-wrap; font-family: var(--font-mono); }
        .output-window .message { margin-bottom: 1em; }
        .output-window .message.user { color: var(--primary-color); font-weight: bold; }
        .output-window .message.assistant { color: var(--text-color); white-space: pre-wrap; }
        .output-window .message.error { color: var(--error-color); }
        .input-area { border-top: 1px solid var(--border-color); padding: 15px; display: flex; gap: 10px; align-items: flex-end; }
        textarea { flex-grow: 1; background-color: var(--input-bg); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-color); padding: 10px; font-family: var(--font-family); font-size: 14px; resize: none; min-height: 40px; max-height: 200px; }
        .send-btn { background-color: var(--primary-color); color: #121212; border: none; border-radius: 4px; padding: 0 15px; height: 40px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s; }
        .send-btn:hover { background-color: var(--primary-hover); }
        .send-btn:disabled { background-color: #555; cursor: not-allowed; }
        .send-btn.cancel svg { width: 24px; height: 24px; }
        .send-btn svg { width: 20px; height: 20px; }
        .placeholder { color: var(--text-secondary); }
      </style>
      <div class="terminal">
        <div class="output-window">
          <p class="placeholder">实时交互终端已就绪。输入指令开始测试...</p>
        </div>
        <div class="input-area">
          <textarea id="prompt-input" rows="1" placeholder="输入您的指令..."></textarea>
          <button id="send-btn" class="send-btn" title="发送">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.544l3.239-1.281a.75.75 0 000-1.39L4.23 6.28a.75.75 0 00-.95-.545L1.865 3.45a.75.75 0 00.95-.826l.002-.007.002-.006zm.002 14.422a.75.75 0 00.95.826l1.415-2.28a.75.75 0 00-.545-.95l-3.239-1.28a.75.75 0 00-1.39 0l-1.28 3.239a.75.75 0 00.544.95l4.95 1.414zM12.75 8.5a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5z"/></svg>
          </button>
        </div>
      </div>
    </template>

    <script>
      // --- [第五部分: 客户端逻辑 (Developer Cockpit JS)] ---

      // --- 配置占位符 (由 Worker 动态注入) ---
      const CLIENT_CONFIG = {
          WORKER_ORIGIN: '${origin}',
          API_MASTER_KEY: '${CONFIG.API_MASTER_KEY}',
          DEFAULT_MODEL: '${CONFIG.DEFAULT_MODEL}',
          MODEL_LIST_STRING: '${CONFIG.MODELS.join(', ')}',
          CUSTOM_MODELS_STRING: '${CONFIG.MODELS.map(m => `+${m}`).join(',')}',
      };

      // --- 状态机 ---
      const AppState = {
        INITIALIZING: 'INITIALIZING',
        HEALTH_CHECKING: 'HEALTH_CHECKING',
        READY: 'READY',
        REQUESTING: 'REQUESTING',
        STREAMING: 'STREAMING',
        ERROR: 'ERROR',
      };
      let currentState = AppState.INITIALIZING;
      let abortController = null;

      // --- 基础组件 ---
      class BaseComponent extends HTMLElement {
        constructor(templateId) {
          super();
          this.attachShadow({ mode: 'open' });
          const template = document.getElementById(templateId);
          if (template) {
            this.shadowRoot.appendChild(template.content.cloneNode(true));
          }
        }
      }

      // --- 自定义元素定义 ---

      // 1. 主布局
      class MainLayout extends BaseComponent {
        constructor() { super('main-layout-template'); }
      }
      customElements.define('main-layout', MainLayout);

      // 2. 状态指示器
      class StatusIndicator extends BaseComponent {
        constructor() {
          super('status-indicator-template');
          this.dot = this.shadowRoot.getElementById('status-dot');
          this.text = this.shadowRoot.getElementById('status-text');
        }
        setState(state, message) {
          this.dot.className = 'dot'; // Reset
          switch (state) {
            case 'checking': this.dot.classList.add('yellow'); break;
            case 'ok': this.dot.classList.add('green'); break;
            case 'error': this.dot.classList.add('red'); break;
            default: this.dot.classList.add('grey');
          }
          this.text.textContent = message;
        }
      }
      customElements.define('status-indicator', StatusIndicator);

      // 3. 信息面板
      class InfoPanel extends BaseComponent {
        constructor() {
          super('info-panel-template');
          this.apiUrlEl = this.shadowRoot.getElementById('api-url');
          this.apiKeyEl = this.shadowRoot.getElementById('api-key');
          this.defaultModelEl = this.shadowRoot.getElementById('default-model');
        }
        connectedCallback() {
          this.render();
        }
        render() {
          const apiUrl = CLIENT_CONFIG.WORKER_ORIGIN + '/v1';
          const apiKey = CLIENT_CONFIG.API_MASTER_KEY;
          const defaultModel = CLIENT_CONFIG.DEFAULT_MODEL;

          this.populateField(this.apiUrlEl, apiUrl);
          this.populateField(this.apiKeyEl, apiKey, true);
          this.populateField(this.defaultModelEl, defaultModel);
        }
        populateField(element, value, isPassword = false) {
            element.classList.remove('skeleton');
            let content = '<span>' + value + '</span>' +
                '<div class="actions">' +
                    (isPassword ? '<button class="icon-btn" data-action="toggle-visibility" title="切换可见性">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l.88-1.473a1.65 1.65 0 012.899 0l.88 1.473a1.65 1.65 0 010 1.18l-.88 1.473a1.65 1.65 0 01-2.899 0l-.88-1.473zM18.45 10.59a1.651 1.651 0 010-1.18l.88-1.473a1.65 1.65 0 012.899 0l.88 1.473a1.65 1.65 0 010 1.18l-.88 1.473a1.65 1.65 0 01-2.899 0l-.88-1.473zM10 17a1.651 1.651 0 01-1.18 0l-1.473-.88a1.65 1.65 0 010-2.899l1.473-.88a1.651 1.651 0 011.18 0l1.473.88a1.65 1.65 0 010 2.899l-1.473.88a1.651 1.651 0 01-1.18 0z" clip-rule="evenodd" /></svg>' +
                    '</button>' : '') +
                    '<button class="icon-btn" data-action="copy" title="复制">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.121A1.5 1.5 0 0117 6.621V16.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 017 16.5v-13z" /><path d="M5 6.5A1.5 1.5 0 016.5 5h3.879a1.5 1.5 0 011.06.44l3.122 3.121A1.5 1.5 0 0115 9.621V14.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 14.5v-8z" /></svg>' +
                    '</button>' +
                '</div>';
            element.innerHTML = content;
            element.querySelector('[data-action="copy"]').addEventListener('click', () => navigator.clipboard.writeText(value));
            if (isPassword) {
                element.querySelector('[data-action="toggle-visibility"]').addEventListener('click', () => element.classList.toggle('visible'));
            }
        }
      }
      customElements.define('info-panel', InfoPanel);

      // 4. 客户端集成指南
      class ClientGuides extends BaseComponent {
        constructor() {
          super('client-guides-template');
          this.tabsContainer = this.shadowRoot.querySelector('.tabs');
          this.contentContainer = this.shadowRoot.querySelector('.content');
        }
        connectedCallback() {
          const guides = {
            'cURL': this.getCurlGuide(),
            'Python': this.getPythonGuide(),
            'LobeChat': this.getLobeChatGuide(),
            'Next-Web': this.getNextWebGuide(),
          };

          Object.keys(guides).forEach((name, index) => {
            const tab = document.createElement('button');
            tab.className = 'tab';
            tab.textContent = name;
            if (index === 0) tab.classList.add('active');
            tab.addEventListener('click', () => this.switchTab(name, guides));
            this.tabsContainer.appendChild(tab);
          });
          this.switchTab(Object.keys(guides)[0], guides);
        }
        switchTab(name, guides) {
          this.tabsContainer.querySelector('.active')?.classList.remove('active');
          this.tabsContainer.querySelector('button:nth-child(' + (Object.keys(guides).indexOf(name) + 1) + ')').classList.add('active');
          this.contentContainer.innerHTML = guides[name];
          this.contentContainer.querySelector('.copy-code-btn')?.addEventListener('click', (e) => {
              const code = e.target.closest('pre').querySelector('code').innerText;
              navigator.clipboard.writeText(code);
              const btn = e.target;
              btn.textContent = '已复制!';
              setTimeout(() => { btn.textContent = '复制'; }, 2000);
          });
        }

        getCurlGuide() {
            return \`<p>在您的终端中运行以下命令:</p><pre><button class="copy-code-btn">复制</button><code>curl --location '\${CLIENT_CONFIG.WORKER_ORIGIN}/v1/chat/completions' \\\\
--header 'Content-Type: application/json' \\\\
--header 'Authorization: Bearer \${CLIENT_CONFIG.API_MASTER_KEY}' \\\\
--data '{
    "model": "\${CLIENT_CONFIG.DEFAULT_MODEL}",
    "messages": [
        {
            "role": "user",
            "content": "你好，你是什么模型？"
        }
    ],
    "stream": true
}'</code></pre>\`;
        }
        getPythonGuide() {
            return \`<p>使用 OpenAI Python 库:</p><pre><button class="copy-code-btn">复制</button><code>import openai

client = openai.OpenAI(
    api_key="\${CLIENT_CONFIG.API_MASTER_KEY}",
    base_url="\${CLIENT_CONFIG.WORKER_ORIGIN}/v1"
)

stream = client.chat.completions.create(
    model="\${CLIENT_CONFIG.DEFAULT_MODEL}",
    messages=[{"role": "user", "content": "你好"}],
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")</code></pre>\`;
        }
        getLobeChatGuide() {
            return \`<p>在 LobeChat 设置中，找到 "语言模型" -> "OpenAI" 设置:</p><pre><button class="copy-code-btn">复制</button><code>API Key: \${CLIENT_CONFIG.API_MASTER_KEY}
API 地址: \${CLIENT_CONFIG.WORKER_ORIGIN}/v1
模型列表: \${CLIENT_CONFIG.MODEL_LIST_STRING}</code></pre>\`;
        }
        getNextWebGuide() {
            return \`<p>在 ChatGPT-Next-Web 部署时，设置以下环境变量:</p><pre><button class="copy-code-btn">复制</button><code>CODE=\${CLIENT_CONFIG.API_MASTER_KEY}
BASE_URL=\${CLIENT_CONFIG.WORKER_ORIGIN}
CUSTOM_MODELS=\${CLIENT_CONFIG.CUSTOM_MODELS_STRING}</code></pre>\`;
        }
      }
      customElements.define('client-guides', ClientGuides);

      // 5. 实时终端
      class LiveTerminal extends BaseComponent {
        constructor() {
          super('live-terminal-template');
          this.outputWindow = this.shadowRoot.querySelector('.output-window');
          this.promptInput = this.shadowRoot.getElementById('prompt-input');
          this.sendBtn = this.shadowRoot.getElementById('send-btn');
          this.sendIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.544l3.239-1.281a.75.75 0 000-1.39L4.23 6.28a.75.75 0 00-.95-.545L1.865 3.45a.75.75 0 00.95-.826l.002-.007.002-.006zm.002 14.422a.75.75 0 00.95.826l1.415-2.28a.75.75 0 00-.545-.95l-3.239-1.28a.75.75 0 00-1.39 0l-1.28 3.239a.75.75 0 00.544.95l4.95 1.414zM12.75 8.5a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5z"/></svg>';
          this.cancelIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" /></svg>';
        }
        connectedCallback() {
          this.sendBtn.addEventListener('click', () => this.handleSend());
          this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              this.handleSend();
            }
          });
          this.promptInput.addEventListener('input', this.autoResize);
        }
        autoResize(event) {
            const textarea = event.target;
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
        handleSend() {
          if (currentState === AppState.REQUESTING || currentState === AppState.STREAMING) {
            this.cancelStream();
          } else {
            this.startStream();
          }
        }
        addMessage(role, content) {
            const messageEl = document.createElement('div');
            messageEl.className = 'message ' + role;
            messageEl.textContent = content;
            
            const placeholder = this.outputWindow.querySelector('.placeholder');
            if (placeholder) placeholder.remove();

            this.outputWindow.appendChild(messageEl);
            this.outputWindow.scrollTop = this.outputWindow.scrollHeight;
            return messageEl;
        }
        async startStream() {
          const prompt = this.promptInput.value.trim();
          if (!prompt) return;

          setState(AppState.REQUESTING);
          this.addMessage('user', prompt);
          const assistantMessageEl = this.addMessage('assistant', '▍');

          abortController = new AbortController();
          try {
            const response = await fetch(CLIENT_CONFIG.WORKER_ORIGIN + '/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + CLIENT_CONFIG.API_MASTER_KEY,
              },
              body: JSON.stringify({
                model: CLIENT_CONFIG.DEFAULT_MODEL,
                messages: [{ role: 'user', content: prompt }],
                stream: true,
              }),
              signal: abortController.signal,
            });

            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.error.message);
            }

            setState(AppState.STREAMING);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\\n').filter(line => line.startsWith('data:'));

              for (const line of lines) {
                const dataStr = line.substring(5).trim();
                if (dataStr === '[DONE]') {
                    assistantMessageEl.textContent = fullContent; // 移除光标
                    break;
                }
                try {
                  const data = JSON.parse(dataStr);
                  const delta = data.choices[0].delta.content;
                  if (delta) {
                    fullContent += delta;
                    assistantMessageEl.textContent = fullContent + '▍';
                    this.outputWindow.scrollTop = this.outputWindow.scrollHeight;
                  }
                } catch (e) {}
              }
            }
          } catch (e) {
            if (e.name !== 'AbortError') {
              this.addMessage('error', '请求失败: ' + e.message);
              setState(AppState.ERROR);
            }
          } finally {
            if (currentState !== AppState.ERROR) {
              setState(AppState.READY);
            }
          }
        }
        cancelStream() {
          if (abortController) {
            abortController.abort();
            abortController = null;
          }
          setState(AppState.READY);
        }
        updateButtonState(state) {
            if (state === AppState.REQUESTING || state === AppState.STREAMING) {
                this.sendBtn.innerHTML = this.cancelIcon;
                this.sendBtn.title = "取消";
                this.sendBtn.classList.add('cancel');
                this.sendBtn.disabled = false;
            } else {
                this.sendBtn.innerHTML = this.sendIcon;
                this.sendBtn.title = "发送";
                this.sendBtn.classList.remove('cancel');
                this.sendBtn.disabled = state !== AppState.READY;
            }
        }
      }
      customElements.define('live-terminal', LiveTerminal);

      // --- 全局状态管理与初始化 ---
      function setState(newState) {
        currentState = newState;
        const terminal = document.querySelector('main-layout')?.shadowRoot.querySelector('live-terminal');
        if (terminal) {
            terminal.updateButtonState(newState);
        }
      }

      async function performHealthCheck() {
        const statusIndicator = document.querySelector('main-layout')?.shadowRoot.querySelector('status-indicator');
        if (!statusIndicator) return;
        
        statusIndicator.setState('checking', '检查上游服务...');
        try {
          const response = await fetch(CLIENT_CONFIG.WORKER_ORIGIN + '/v1/models', {
            headers: { 'Authorization': 'Bearer ' + CLIENT_CONFIG.API_MASTER_KEY }
          });
          if (response.ok) {
            statusIndicator.setState('ok', '服务运行正常');
            setState(AppState.READY);
          } else {
            const err = await response.json();
            throw new Error(err.error.message);
          }
        } catch (e) {
          statusIndicator.setState('error', '健康检查失败');
          setState(AppState.ERROR);
        }
      }

      // --- 应用启动 ---
      document.addEventListener('DOMContentLoaded', () => {
        setState(AppState.INITIALIZING);
        customElements.whenDefined('main-layout').then(() => {
            performHealthCheck();
        });
      });

    </script>
</body>
</html>`;

  // 返回最终的 HTML 响应
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // 启用 Brotli 压缩
      'Content-Encoding': 'br'
    },
  });
}


// =================================================================================
//  项目: puter-2api (Cloudflare Worker 单文件版)
//  版本: 1.0.3-cfw-pro (代号: Chimera Synthesis - Puter Pro)
//  作者: 首席AI执行官 (Principal AI Executive Officer)
//  协议: 奇美拉协议 · 综合版 (Project Chimera: Synthesis Edition)
//  日期: 2025-11-20
//
//  描述:
//  本文件是一个完全自包含、可一键部署的 Cloudflare Worker。它将 Puter.com 的
//  统一后端服务，无损地转换为一个高性能、兼容 OpenAI 标准的 API 套件，涵盖
//  文本、图像和视频生成。Worker 内置了一个功能强大的"开发者驾驶舱"Web UI，
//  用于实时监控、多模态测试和快速集成。
//
// =================================================================================

// --- [第一部分: 核心配置 (Configuration-as-Code)] ---
// 架构核心：所有关键参数在此定义，后续逻辑必须从此对象读取。
const CONFIG = {
  // 项目元数据
  PROJECT_NAME: "puter-2api",
  PROJECT_VERSION: "1.0.3-cfw-pro", // [升级] 版本号迭代

  // 安全配置
  API_MASTER_KEY: "1", // 您的主 API 密钥。留空或设为 "1" 以禁用认证。

  // 上游服务配置
  UPSTREAM_URL: "https://api.puter.com/drivers/call",

  // Puter.com 凭证池 (支持多账号轮询)
  PUTER_AUTH_TOKENS: [
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0IjoiYXUiLCJ2IjoiMC4wLjAiLCJ1dSI6Ino4U1N4Z3k2VEJtbDZMTGVOUFVaZVE9PSIsImF1IjoiaWRnL2ZEMDdVTkdhSk5sNXpXUGZhUT09IiwicyI6Inc0UTJ3djM1ZHhwdkkyTlg3L3lWMlE9PSIsImlhdCI6MTc2MzQ5NDg5NX0.rSOf1PJ9ZL6Aup2Tn4mkAnVUHJCNN37tCUSlQZtBBM0",
    // 在此添加更多 auth_token 实现轮询, 例如: "eyJhbGciOi..."
  ],

  // 模型列表
  CHAT_MODELS: [
    "gpt-4o-mini", "gpt-4o", "gemini-1.5-flash",
    "gpt-5.1","gpt-5.1-chat-latest", "gpt-5-2025-08-07", "gpt-5",
    "gpt-5-mini-2025-08-07", "gpt-5-mini", "gpt-5-nano-2025-08-07", "gpt-5-nano", "gpt-5-chat-latest",
    "o1", "o3", "o3-mini", "o4-mini", "gpt-4.1",
    "gpt-4.1-mini", "gpt-4.1-nano", "claude-haiku-4-5-20251001",
    "claude-sonnet-4-5-20250929", "claude-opus-4-1-20250805", "claude-opus-4-1",
    "claude-opus-4-20250514", "claude-sonnet-4-20250514",
    "claude-3-7-sonnet-20250219", "claude-3-7-sonnet-latest",
    "claude-3-haiku-20240307", "grok-beta", "grok-vision-beta", "grok-3", "grok-3-fast", "grok-3-mini",
    "grok-3-mini-fast", "grok-2-vision", "grok-2", "gemini-2.0-flash"
  ],
  IMAGE_MODELS: ["gpt-image-1"],
  VIDEO_MODELS: ["sora-2", "sora-2-pro"],

  DEFAULT_CHAT_MODEL: "gpt-4o-mini",
  DEFAULT_IMAGE_MODEL: "gpt-image-1",
  DEFAULT_VIDEO_MODEL: "sora-2",
};

// 凭证轮询状态
let tokenIndex = 0;

// --- [第二部分: Worker 入口与路由] ---
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      return handleUI(request);
    } else if (url.pathname.startsWith('/v1/')) {
      return handleApi(request);
    } else {
      return createErrorResponse(`路径未找到: ${url.pathname}`, 404, 'not_found');
    }
  }
};

// --- [第三部分: API 代理逻辑] ---

/**
 * 处理所有 /v1/ 路径下的 API 请求
 * @param {Request} request - 传入的请求对象
 * @returns {Promise<Response>}
 */
async function handleApi(request) {
  if (request.method === 'OPTIONS') {
    return handleCorsPreflight();
  }

  const authHeader = request.headers.get('Authorization');
  if (CONFIG.API_MASTER_KEY && CONFIG.API_MASTER_KEY !== "1") {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('需要 Bearer Token 认证。', 401, 'unauthorized');
    }
    const token = authHeader.substring(7);
    if (token !== CONFIG.API_MASTER_KEY) {
      return createErrorResponse('无效的 API Key。', 403, 'invalid_api_key');
    }
  }

  const url = new URL(request.url);
  const requestId = `puter-${crypto.randomUUID()}`;

  switch (url.pathname) {
    case '/v1/models':
      return handleModelsRequest();
    case '/v1/chat/completions':
      return handleChatCompletions(request, requestId);
    case '/v1/images/generations':
      return handleImageGenerations(request, requestId);
    case '/v1/videos/generations':
      return handleVideoGenerations(request, requestId);
    default:
      return createErrorResponse(`API 路径不支持: ${url.pathname}`, 404, 'not_found');
  }
}

/**
 * 处理 /v1/models 请求，并应用缓存
 * @returns {Promise<Response>}
 */
async function handleModelsRequest() {
    const cache = caches.default;
    const cacheKey = new Request(new URL('/v1/models', 'https://puter-2api.cache').toString());
    let response = await cache.match(cacheKey);

    if (!response) {
        const allModels = [...CONFIG.CHAT_MODELS, ...CONFIG.IMAGE_MODELS, ...CONFIG.VIDEO_MODELS];
        const modelsData = {
            object: 'list',
            data: allModels.map(modelId => ({
                id: modelId,
                object: 'model',
                created: Math.floor(Date.now() / 1000),
                owned_by: 'puter-2api',
            })),
        };
        response = new Response(JSON.stringify(modelsData), {
            headers: corsHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
        });
        response.headers.set("Cache-Control", "s-maxage=3600"); // 缓存1小时
        await cache.put(cacheKey, response.clone());
    }
    return response;
}

/**
 * 处理 /v1/chat/completions 请求
 * @param {Request} request
 * @param {string} requestId
 * @returns {Promise<Response>}
 */
async function handleChatCompletions(request, requestId) {
  try {
    const requestData = await request.json();
    const upstreamPayload = createUpstreamPayload('chat', requestData);

    const upstreamResponse = await fetch(CONFIG.UPSTREAM_URL, {
      method: 'POST',
      headers: createUpstreamHeaders(requestId),
      body: JSON.stringify(upstreamPayload),
    });

    if (!upstreamResponse.ok) {
      return await handleErrorResponse(upstreamResponse);
    }

    const transformStream = createUpstreamToOpenAIStream(requestId, requestData.model || CONFIG.DEFAULT_CHAT_MODEL);

    if (upstreamResponse.body) {
        const [pipedStream] = upstreamResponse.body.tee();
        return new Response(pipedStream.pipeThrough(transformStream), {
            headers: corsHeaders({
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Worker-Trace-ID': requestId,
            }),
        });
    } else {
        return createErrorResponse('上游未返回有效响应体。', 502, 'bad_gateway');
    }

  } catch (e) {
    console.error('处理聊天请求时发生异常:', e);
    return createErrorResponse(`处理请求时发生内部错误: ${e.message}`, 500, 'internal_server_error');
  }
}

/**
 * 处理 /v1/images/generations 请求
 * @param {Request} request
 * @param {string} requestId
 * @returns {Promise<Response>}
 */
async function handleImageGenerations(request, requestId) {
    try {
        const requestData = await request.json();
        const upstreamPayload = createUpstreamPayload('image', requestData);

        const upstreamResponse = await fetch(CONFIG.UPSTREAM_URL, {
            method: 'POST',
            headers: createUpstreamHeaders(requestId),
            body: JSON.stringify(upstreamPayload),
        });

        if (!upstreamResponse.ok) {
            return await handleErrorResponse(upstreamResponse);
        }

        const imageBytes = await upstreamResponse.arrayBuffer();

        // [修复] 使用循环代替扩展运算符来处理二进制数据，防止堆栈溢出
        const bytes = new Uint8Array(imageBytes);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const b64_json = btoa(binary);

        const responseData = {
            created: Math.floor(Date.now() / 1000),
            data: [{ b64_json: b64_json }]
        };

        return new Response(JSON.stringify(responseData), {
            headers: corsHeaders({
                'Content-Type': 'application/json; charset=utf-8',
                'X-Worker-Trace-ID': requestId,
            }),
        });

    } catch (e) {
        console.error('处理图像生成请求时发生异常:', e);
        return createErrorResponse(`处理请求时发生内部错误: ${e.message}`, 500, 'internal_server_error');
    }
}

/**
 * 处理 /v1/videos/generations 请求
 * @param {Request} request
 * @param {string} requestId
 * @returns {Promise<Response>}
 */
async function handleVideoGenerations(request, requestId) {
    // [修改] 根据用户要求，禁用视频生成功能，并返回明确的错误提示。
    return createErrorResponse(
        '此部署版本不支持视频生成功能。该功能可能需要 Puter.com 的高级账户才能使用。',
        403, // 403 Forbidden 表示服务器理解请求但拒绝授权
        'access_denied'
    );

    /*
    // 原始代码已被禁用
    try {
        const requestData = await request.json();
        const upstreamPayload = createUpstreamPayload('video', requestData);

        const upstreamResponse = await fetch(CONFIG.UPSTREAM_URL, {
            method: 'POST',
            headers: createUpstreamHeaders(requestId),
            body: JSON.stringify(upstreamPayload),
        });

        if (!upstreamResponse.ok) {
            return await handleErrorResponse(upstreamResponse);
        }

        const result = await upstreamResponse.json();
        const videoUrl = typeof result === 'string' ? result : (result.url || '');

        if (!videoUrl) {
            return createErrorResponse('上游未返回有效的视频 URL。', 502, 'bad_gateway');
        }

        const responseData = {
            created: Math.floor(Date.now() / 1000),
            data: [{ url: videoUrl }]
        };

        return new Response(JSON.stringify(responseData), {
            headers: corsHeaders({
                'Content-Type': 'application/json; charset=utf-8',
                'X-Worker-Trace-ID': requestId,
            }),
        });

    } catch (e) {
        console.error('处理视频生成请求时发生异常:', e);
        return createErrorResponse(`处理请求时发生内部错误: ${e.message}`, 500, 'internal_server_error');
    }
    */
}

// --- 辅助函数 ---

function _get_auth_token() {
    const token = CONFIG.PUTER_AUTH_TOKENS[tokenIndex];
    tokenIndex = (tokenIndex + 1) % CONFIG.PUTER_AUTH_TOKENS.length;
    return token;
}

function getDriverFromModel(model) {
    if (model.startsWith("gpt") || model.startsWith("o1") || model.startsWith("o3") || model.startsWith("o4")) return "openai-completion";
    if (model.startsWith("claude")) return "claude";
    if (model.startsWith("gemini")) return "gemini";
    if (model.startsWith("grok")) return "xai";
    return "openai-completion"; // 默认
}

function createUpstreamPayload(type, requestData) {
    const authToken = _get_auth_token();
    switch (type) {
        case 'chat':
            const model = requestData.model || CONFIG.DEFAULT_CHAT_MODEL;
            return {
                interface: "puter-chat-completion",
                driver: getDriverFromModel(model),
                test_mode: false,
                method: "complete",
                args: {
                    messages: requestData.messages,
                    model: model,
                    stream: true
                },
                auth_token: authToken
            };
        case 'image':
            return {
                interface: "puter-image-generation",
                driver: "openai-image-generation",
                test_mode: false,
                method: "generate",
                args: {
                    model: requestData.model || CONFIG.DEFAULT_IMAGE_MODEL,
                    quality: requestData.quality || "high",
                    prompt: requestData.prompt
                },
                auth_token: authToken
            };
        case 'video':
            return {
                interface: "puter-video-generation",
                driver: "openai-video-generation",
                test_mode: false,
                method: "generate",
                args: {
                    model: requestData.model || CONFIG.DEFAULT_VIDEO_MODEL,
                    seconds: requestData.seconds || 8,
                    size: requestData.size || "1280x720",
                    prompt: requestData.prompt
                },
                auth_token: authToken
            };
    }
}

function createUpstreamHeaders(requestId) {
    return {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Origin': 'https://docs.puter.com',
        'Referer': 'https://docs.puter.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'X-Request-ID': requestId,
    };
}

async function handleErrorResponse(response) {
    const errorBody = await response.text();
    console.error(`上游服务错误: ${response.status}`, errorBody);
    try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.error && errorJson.error.message) {
             return createErrorResponse(`上游服务错误: ${errorJson.error.message}`, response.status, errorJson.error.code || 'upstream_error');
        }
    } catch(e) {}
    return createErrorResponse(`上游服务返回错误 ${response.status}: ${errorBody}`, response.status, 'upstream_error');
}

function createUpstreamToOpenAIStream(requestId, model) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = '';

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.type === 'text' && typeof data.text === 'string') {
              const openAIChunk = {
                id: requestId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: model,
                choices: [{ index: 0, delta: { content: data.text }, finish_reason: null }],
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIChunk)}\n\n`));
            }
          } catch (e) {
            console.error('无法解析上游 NDJSON 数据块:', line, e);
          }
        }
      }
    },
    flush(controller) {
      const finalChunk = {
        id: requestId,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    },
  });
}

function handleCorsPreflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function createErrorResponse(message, status, code) {
  return new Response(JSON.stringify({ error: { message, type: 'api_error', code } }), {
    status,
    headers: corsHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  });
}

function corsHeaders(headers = {}) {
  return {
    ...headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// --- [第四部分: 开发者驾驶舱 UI] ---
function handleUI(request) {
  const origin = new URL(request.url).origin;
  const allModels = [...CONFIG.CHAT_MODELS, ...CONFIG.IMAGE_MODELS, ...CONFIG.VIDEO_MODELS];

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME} - 开发者驾驶舱</title>
    <style>
      :root { --bg-color: #121212; --sidebar-bg: #1E1E1E; --main-bg: #121212; --border-color: #333333; --text-color: #E0E0E0; --text-secondary: #888888; --primary-color: #FFBF00; --primary-hover: #FFD700; --input-bg: #2A2A2A; --error-color: #CF6679; --success-color: #66BB6A; --font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; --font-mono: 'Fira Code', 'Consolas', 'Monaco', monospace; }
      * { box-sizing: border-box; }
      body { font-family: var(--font-family); margin: 0; background-color: var(--bg-color); color: var(--text-color); font-size: 14px; display: flex; height: 100vh; overflow: hidden; }
      .skeleton { background-color: #2a2a2a; background-image: linear-gradient(90deg, #2a2a2a, #3a3a3a, #2a2a2a); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 4px; }
      @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      select, textarea, input { background-color: var(--input-bg); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-color); padding: 10px; font-family: var(--font-family); font-size: 14px; width: 100%; }
      select:focus, textarea:focus, input:focus { outline: none; border-color: var(--primary-color); }
    </style>
</head>
<body>
    <main-layout></main-layout>
    <template id="main-layout-template">
      <style>
        .layout { display: flex; width: 100%; height: 100vh; }
        .sidebar { width: 380px; flex-shrink: 0; background-color: var(--sidebar-bg); border-right: 1px solid var(--border-color); padding: 20px; display: flex; flex-direction: column; overflow-y: auto; }
        .main-content { flex-grow: 1; display: flex; flex-direction: column; padding: 20px; overflow: hidden; }
        .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); }
        .header h1 { margin: 0; font-size: 20px; }
        .header .version { font-size: 12px; color: var(--text-secondary); margin-left: 8px; }
        .collapsible-section { margin-top: 20px; }
        .collapsible-section summary { cursor: pointer; font-weight: bold; margin-bottom: 10px; list-style: none; }
        .collapsible-section summary::-webkit-details-marker { display: none; }
        .collapsible-section summary::before { content: '▶'; margin-right: 8px; display: inline-block; transition: transform 0.2s; }
        .collapsible-section[open] > summary::before { transform: rotate(90deg); }
        @media (max-width: 768px) { .layout { flex-direction: column; } .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--border-color); } }
      </style>
      <div class="layout">
        <aside class="sidebar">
          <header class="header">
            <h1>${CONFIG.PROJECT_NAME}<span class="version">v${CONFIG.PROJECT_VERSION}</span></h1>
            <status-indicator></status-indicator>
          </header>
          <info-panel></info-panel>
          <details class="collapsible-section" open><summary>⚙️ 主流客户端集成</summary><client-guides></client-guides></details>
          <details class="collapsible-section"><summary>📚 模型总览</summary><model-list-panel></model-list-panel></details>
        </aside>
        <main class="main-content"><live-terminal></live-terminal></main>
      </div>
    </template>
    <template id="status-indicator-template">
      <style>
        .indicator { display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; transition: background-color 0.3s; }
        .dot.grey { background-color: #555; } .dot.yellow { background-color: #FFBF00; animation: pulse 2s infinite; } .dot.green { background-color: var(--success-color); } .dot.red { background-color: var(--error-color); }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 191, 0, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(255, 191, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 191, 0, 0); } }
      </style>
      <div class="indicator"><div id="status-dot" class="dot grey"></div><span id="status-text">正在初始化...</span></div>
    </template>
    <template id="info-panel-template">
      <style>
        .panel { display: flex; flex-direction: column; gap: 12px; } .info-item { display: flex; flex-direction: column; } .info-item label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
        .info-value { background-color: var(--input-bg); padding: 8px 12px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; color: var(--primary-color); display: flex; align-items: center; justify-content: space-between; word-break: break-all; }
        .info-value.password { -webkit-text-security: disc; } .info-value.visible { -webkit-text-security: none; } .actions { display: flex; gap: 8px; }
        .icon-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px; display: flex; align-items: center; } .icon-btn:hover { color: var(--text-color); } .icon-btn svg { width: 16px; height: 16px; } .skeleton { height: 34px; }
      </style>
      <div class="panel">
        <div class="info-item"><label>API 端点 (Endpoint)</label><div id="api-url" class="info-value skeleton"></div></div>
        <div class="info-item"><label>API 密钥 (Master Key)</label><div id="api-key" class="info-value password skeleton"></div></div>
      </div>
    </template>
    <template id="client-guides-template">
       <style>
        .tabs { display: flex; border-bottom: 1px solid var(--border-color); } .tab { padding: 8px 12px; cursor: pointer; border: none; background: none; color: var(--text-secondary); } .tab.active { color: var(--primary-color); border-bottom: 2px solid var(--primary-color); }
        .content { padding: 15px 0; } pre { background-color: var(--input-bg); padding: 12px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; white-space: pre-wrap; word-break: break-all; position: relative; }
        .copy-code-btn { position: absolute; top: 8px; right: 8px; background: #444; border: 1px solid #555; color: #ccc; border-radius: 4px; cursor: pointer; padding: 2px 6px; font-size: 12px; } .copy-code-btn:hover { background: #555; } .copy-code-btn.copied { background-color: var(--success-color); color: #121212; }
       </style>
       <div><div class="tabs"></div><div class="content"></div></div>
    </template>
    <template id="model-list-panel-template">
      <style>
        .model-list-container { padding-top: 10px; }
        .model-category h3 { font-size: 14px; color: var(--primary-color); margin: 15px 0 8px 0; border-bottom: 1px solid var(--border-color); padding-bottom: 5px; }
        .model-list { list-style: none; padding: 0; margin: 0; }
        .model-list li { background-color: var(--input-bg); padding: 6px 10px; border-radius: 4px; margin-bottom: 5px; font-family: var(--font-mono); font-size: 12px; }
      </style>
      <div class="model-list-container"></div>
    </template>
    <template id="live-terminal-template">
      <style>
        .terminal { display: flex; flex-direction: column; height: 100%; background-color: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
        .mode-tabs { display: flex; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
        .mode-tab { padding: 10px 15px; cursor: pointer; background: none; border: none; color: var(--text-secondary); font-size: 14px; }
        .mode-tab.active { color: var(--primary-color); border-bottom: 2px solid var(--primary-color); }
        /* [修改] 为视频功能的提示标签添加样式 */
        .pro-tag { font-size: 10px; color: var(--primary-color); margin-left: 5px; vertical-align: super; opacity: 0.8; }
        .output-window { flex-grow: 1; padding: 15px; overflow-y: auto; line-height: 1.6; }
        .output-window p, .output-window div { margin: 0 0 1em 0; }
        .output-window .message.user { color: var(--primary-color); font-weight: bold; }
        .output-window .message.assistant { color: var(--text-color); white-space: pre-wrap; }
        .output-window .message.error { color: var(--error-color); }
        .output-window img, .output-window video { max-width: 100%; border-radius: 4px; }
        .input-area { border-top: 1px solid var(--border-color); padding: 15px; display: flex; flex-direction: column; gap: 10px; }
        .tab-content { display: none; } .tab-content.active { display: flex; flex-direction: column; gap: 10px; }
        .param-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        textarea { flex-grow: 1; resize: none; min-height: 80px; }
        .submit-btn { background-color: var(--primary-color); color: #121212; border: none; border-radius: 4px; padding: 10px 15px; height: 42px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .submit-btn:hover { background-color: var(--primary-hover); } .submit-btn:disabled { background-color: #555; cursor: not-allowed; }
        .submit-btn.cancel svg { width: 24px; height: 24px; } .submit-btn svg { width: 20px; height: 20px; }
        .placeholder { color: var(--text-secondary); }
      </style>
      <div class="terminal">
        <div class="mode-tabs">
          <button class="mode-tab active" data-mode="chat">文生文 (Chat)</button>
          <!-- [修改] 未修复目前不可用 -->
          <button class="mode-tab" data-mode="image">文生图 (Image)<span class="pro-tag">未修复目前不可用</span></button>
          <!-- [修改] 在UI上标注视频功能需要高级账户 -->
          <button class="mode-tab" data-mode="video">文生视频 (Video)<span class="pro-tag">需高级账户</span></button>
        </div>
        <div class="output-window"><p class="placeholder">多模态测试终端已就绪。请选择模式并输入指令...</p></div>
        <div class="input-area">
          <!-- Chat Panel -->
          <div id="chat-panel" class="tab-content active">
            <select id="chat-model-select"></select>
            <textarea id="chat-prompt-input" rows="3" placeholder="输入您的对话内容..."></textarea>
          </div>
          <!-- Image Panel -->
          <div id="image-panel" class="tab-content">
            <select id="image-model-select"></select>
            <textarea id="image-prompt-input" rows="3" placeholder="输入您的图片描述..."></textarea>
          </div>
          <!-- Video Panel -->
          <div id="video-panel" class="tab-content">
            <select id="video-model-select"></select>
            <textarea id="video-prompt-input" rows="3" placeholder="输入您的视频描述... (此功能当前不可用)"></textarea>
            <div class="param-grid">
              <input type="text" id="video-size-input" value="1280x720" placeholder="分辨率 (e.g., 1280x720)">
              <input type="number" id="video-seconds-input" value="8" placeholder="视频时长 (秒)">
            </div>
          </div>
          <button id="submit-btn" class="submit-btn" title="发送/生成">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.544l3.239-1.281a.75.75 0 000-1.39L4.23 6.28a.75.75 0 00-.95-.545L1.865 3.45a.75.75 0 00.95-.826l.002-.007.002-.006zm.002 14.422a.75.75 0 00.95.826l1.415-2.28a.75.75 0 00-.545-.95l-3.239-1.28a.75.75 0 00-1.39 0l-1.28 3.239a.75.75 0 00.544.95l4.95 1.414zM12.75 8.5a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5z"/></svg>
          </button>
        </div>
      </div>
    </template>
    <script>
      const CLIENT_CONFIG = { 
        WORKER_ORIGIN: '${origin}', 
        API_MASTER_KEY: '${CONFIG.API_MASTER_KEY}', 
        CHAT_MODELS: JSON.parse('${JSON.stringify(CONFIG.CHAT_MODELS)}'),
        IMAGE_MODELS: JSON.parse('${JSON.stringify(CONFIG.IMAGE_MODELS)}'),
        VIDEO_MODELS: JSON.parse('${JSON.stringify(CONFIG.VIDEO_MODELS)}'),
        DEFAULT_CHAT_MODEL: '${CONFIG.DEFAULT_CHAT_MODEL}',
        CUSTOM_MODELS_STRING: '${allModels.map(m => `+${m}`).join(',')}' 
      };

      const AppState = { INITIALIZING: 'INITIALIZING', HEALTH_CHECKING: 'HEALTH_CHECKING', READY: 'READY', REQUESTING: 'REQUESTING', STREAMING: 'STREAMING', ERROR: 'ERROR' };
      let currentState = AppState.INITIALIZING;
      let abortController = null;

      class BaseComponent extends HTMLElement {
        constructor(id) {
          super();
          this.attachShadow({ mode: 'open' });
          const template = document.getElementById(id);
          if (template) this.shadowRoot.appendChild(template.content.cloneNode(true));
        }
      }

      class MainLayout extends BaseComponent { constructor() { super('main-layout-template'); } }
      customElements.define('main-layout', MainLayout);

      class StatusIndicator extends BaseComponent {
        constructor() { super('status-indicator-template'); this.dot = this.shadowRoot.getElementById('status-dot'); this.text = this.shadowRoot.getElementById('status-text'); }
        setState(state, message) {
          this.dot.className = 'dot';
          switch (state) {
            case 'checking': this.dot.classList.add('yellow'); break;
            case 'ok': this.dot.classList.add('green'); break;
            case 'error': this.dot.classList.add('red'); break;
            default: this.dot.classList.add('grey'); break;
          }
          this.text.textContent = message;
        }
      }
      customElements.define('status-indicator', StatusIndicator);

      class InfoPanel extends BaseComponent {
        constructor() { super('info-panel-template'); this.apiUrlEl = this.shadowRoot.getElementById('api-url'); this.apiKeyEl = this.shadowRoot.getElementById('api-key'); }
        connectedCallback() { this.render(); }
        render() {
          this.populateField(this.apiUrlEl, CLIENT_CONFIG.WORKER_ORIGIN + '/v1');
          this.populateField(this.apiKeyEl, CLIENT_CONFIG.API_MASTER_KEY, true);
        }
        populateField(el, value, isPassword = false) {
          el.classList.remove('skeleton');
          el.innerHTML = \`<span>\${value}</span><div class="actions">\${isPassword ? '<button class="icon-btn" data-action="toggle-visibility" title="切换可见性"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/><path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l.88-1.473a1.65 1.65 0 012.899 0l.88 1.473a1.65 1.65 0 010 1.18l-.88 1.473a1.65 1.65 0 01-2.899 0l-.88-1.473zM18.45 10.59a1.651 1.651 0 010-1.18l.88-1.473a1.65 1.65 0 012.899 0l.88 1.473a1.65 1.65 0 010 1.18l-.88 1.473a1.65 1.65 0 01-2.899 0l-.88-1.473zM10 17a1.651 1.651 0 01-1.18 0l-1.473-.88a1.65 1.65 0 010-2.899l1.473-.88a1.651 1.651 0 011.18 0l1.473.88a1.65 1.65 0 010 2.899l-1.473.88a1.651 1.651 0 01-1.18 0z" clip-rule="evenodd"/></svg></button>' : ''}<button class="icon-btn" data-action="copy" title="复制"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.121A1.5 1.5 0 0117 6.621V16.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 017 16.5v-13z"/><path d="M5 6.5A1.5 1.5 0 016.5 5h3.879a1.5 1.5 0 011.06.44l3.122 3.121A1.5 1.5 0 0115 9.621V14.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 14.5v-8z"/></svg></button></div>\`;
          el.querySelector('[data-action="copy"]').addEventListener('click', () => navigator.clipboard.writeText(value));
          if (isPassword) el.querySelector('[data-action="toggle-visibility"]').addEventListener('click', () => el.classList.toggle('visible'));
        }
      }
      customElements.define('info-panel', InfoPanel);

      class ClientGuides extends BaseComponent {
        constructor() { super('client-guides-template'); this.tabs = this.shadowRoot.querySelector('.tabs'); this.content = this.shadowRoot.querySelector('.content'); this.guides = { 'cURL': this.getCurlGuide(), 'Python': this.getPythonGuide(), 'LobeChat': this.getLobeChatGuide(), 'Next-Web': this.getNextWebGuide() }; }
        connectedCallback() {
          Object.keys(this.guides).forEach((name, index) => { const tab = document.createElement('button'); tab.className = 'tab'; tab.textContent = name; if (index === 0) tab.classList.add('active'); tab.addEventListener('click', () => this.switchTab(name)); this.tabs.appendChild(tab); });
          this.switchTab(Object.keys(this.guides)[0]);
          this.content.addEventListener('click', (e) => { const button = e.target.closest('.copy-code-btn'); if (button) { const code = button.closest('pre').querySelector('code').innerText; navigator.clipboard.writeText(code).then(() => { button.textContent = '已复制!'; button.classList.add('copied'); setTimeout(() => { button.textContent = '复制'; button.classList.remove('copied'); }, 2000); }); } });
        }
        switchTab(name) { this.tabs.querySelector('.active')?.classList.remove('active'); const newActiveTab = Array.from(this.tabs.children).find(tab => tab.textContent === name); newActiveTab?.classList.add('active'); this.content.innerHTML = this.guides[name]; }
        getCurlGuide() { return \`<pre><button class="copy-code-btn">复制</button><code>curl --location '\\\${CLIENT_CONFIG.WORKER_ORIGIN}/v1/chat/completions' \\\\<br>--header 'Content-Type: application/json' \\\\<br>--header 'Authorization: Bearer \\\${CLIENT_CONFIG.API_MASTER_KEY}' \\\\<br>--data '{<br>    "model": "\\\${CLIENT_CONFIG.DEFAULT_CHAT_MODEL}",<br>    "messages": [{"role": "user", "content": "你好"}],<br>    "stream": true<br>}'</code></pre>\`; }
        getPythonGuide() { return \`<pre><button class="copy-code-btn">复制</button><code>import openai<br><br>client = openai.OpenAI(<br>    api_key="\\\${CLIENT_CONFIG.API_MASTER_KEY}",<br>    base_url="\\\${CLIENT_CONFIG.WORKER_ORIGIN}/v1"<br>)<br><br>stream = client.chat.completions.create(<br>    model="\\\${CLIENT_CONFIG.DEFAULT_CHAT_MODEL}",<br>    messages=[{"role": "user", "content": "你好"}],<br>    stream=True,<br>)<br><br>for chunk in stream:<br>    print(chunk.choices[0].delta.content or "", end="")</code></pre>\`; }
        getLobeChatGuide() { return \`<p>在 LobeChat 设置中:</p><pre><button class="copy-code-btn">复制</button><code>API Key: \\\${CLIENT_CONFIG.API_MASTER_KEY}<br>API 地址: \\\${CLIENT_CONFIG.WORKER_ORIGIN}<br>模型列表: (请留空或手动填入)</code></pre>\`; }
        getNextWebGuide() { return \`<p>在 ChatGPT-Next-Web 部署时:</p><pre><button class="copy-code-btn">复制</button><code>CODE=\\\${CLIENT_CONFIG.API_MASTER_KEY}<br>BASE_URL=\\\${CLIENT_CONFIG.WORKER_ORIGIN}<br>CUSTOM_MODELS=\\\${CLIENT_CONFIG.CUSTOM_MODELS_STRING}</code></pre>\`; }
      }
      customElements.define('client-guides', ClientGuides);

      class ModelListPanel extends BaseComponent {
        constructor() { super('model-list-panel-template'); this.container = this.shadowRoot.querySelector('.model-list-container'); }
        connectedCallback() { this.render(); }
        render() {
          const categories = { '文生文 (Chat)': CLIENT_CONFIG.CHAT_MODELS, '文生图 (Image)': CLIENT_CONFIG.IMAGE_MODELS, '文生视频 (Video)': CLIENT_CONFIG.VIDEO_MODELS };
          for (const [title, models] of Object.entries(categories)) {
            if (models.length > 0) {
              const categoryDiv = document.createElement('div');
              categoryDiv.className = 'model-category';
              categoryDiv.innerHTML = \`<h3>\${title}</h3><ul class="model-list">\${models.map(m => \`<li>\${m}</li>\`).join('')}</ul>\`;
              this.container.appendChild(categoryDiv);
            }
          }
        }
      }
      customElements.define('model-list-panel', ModelListPanel);

      class LiveTerminal extends BaseComponent {
        constructor() {
          super('live-terminal-template');
          this.activeMode = 'chat';
          this.output = this.shadowRoot.querySelector('.output-window');
          this.btn = this.shadowRoot.getElementById('submit-btn');
          this.tabs = this.shadowRoot.querySelectorAll('.mode-tab');
          this.panels = this.shadowRoot.querySelectorAll('.tab-content');
          
          this.inputs = {
            chat: { model: this.shadowRoot.getElementById('chat-model-select'), prompt: this.shadowRoot.getElementById('chat-prompt-input') },
            image: { model: this.shadowRoot.getElementById('image-model-select'), prompt: this.shadowRoot.getElementById('image-prompt-input') },
            video: { model: this.shadowRoot.getElementById('video-model-select'), prompt: this.shadowRoot.getElementById('video-prompt-input'), size: this.shadowRoot.getElementById('video-size-input'), seconds: this.shadowRoot.getElementById('video-seconds-input') }
          };

          this.sendIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.544l3.239-1.281a.75.75 0 000-1.39L4.23 6.28a.75.75 0 00-.95-.545L1.865 3.45a.75.75 0 00.95-.826l.002-.007.002-.006zm.002 14.422a.75.75 0 00.95.826l1.415-2.28a.75.75 0 00-.545-.95l-3.239-1.28a.75.75 0 00-1.39 0l-1.28 3.239a.75.75 0 00.544.95l4.95 1.414zM12.75 8.5a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5z"/></svg>';
          this.cancelIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"/></svg>';
        }
        connectedCallback() {
          this.btn.addEventListener('click', () => this.handleSubmit());
          this.tabs.forEach(tab => tab.addEventListener('click', () => this.switchMode(tab.dataset.mode)));
          this.populateModels();
        }
        populateModels() {
          this.populateSelect(this.inputs.chat.model, CLIENT_CONFIG.CHAT_MODELS);
          this.populateSelect(this.inputs.image.model, CLIENT_CONFIG.IMAGE_MODELS);
          this.populateSelect(this.inputs.video.model, CLIENT_CONFIG.VIDEO_MODELS);
        }
        populateSelect(selectEl, models) {
          if (!selectEl || !models || models.length === 0) return;
          selectEl.innerHTML = models.map(m => \`<option value="\${m}">\${m}</option>\`).join('');
        }
        switchMode(mode) {
          this.activeMode = mode;
          this.tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
          this.panels.forEach(p => p.classList.toggle('active', p.id === \`\${mode}-panel\`));
        }
        handleSubmit() {
          if (currentState === AppState.REQUESTING || currentState === AppState.STREAMING) {
            this.cancelRequest();
          } else {
            this.startRequest();
          }
        }
        addMessage(role, content, isHtml = false) {
          const el = document.createElement('div');
          el.className = 'message ' + role;
          if (isHtml) {
            el.innerHTML = content;
          } else {
            el.textContent = content;
          }
          this.output.appendChild(el);
          this.output.scrollTop = this.output.scrollHeight;
          return el;
        }
        async startRequest() {
          const currentInputs = this.inputs[this.activeMode];
          const prompt = currentInputs.prompt.value.trim();
          if (!prompt) return;

          setState(AppState.REQUESTING);
          this.output.innerHTML = '';
          this.addMessage('user', prompt);
          abortController = new AbortController();

          try {
            switch (this.activeMode) {
              case 'chat': await this.handleChatRequest(prompt); break;
              case 'image': await this.handleImageRequest(prompt); break;
              case 'video': await this.handleVideoRequest(prompt); break;
            }
          } catch (e) {
            if (e.name !== 'AbortError') {
              this.addMessage('error', '请求失败: ' + e.message);
              setState(AppState.ERROR);
            }
          } finally {
            if (currentState !== AppState.ERROR && currentState !== AppState.INITIALIZING) {
              setState(AppState.READY);
            }
          }
        }
        async handleChatRequest(prompt) {
          const model = this.inputs.chat.model.value;
          const assistantEl = this.addMessage('assistant', '▍');
          
          const response = await fetch(CLIENT_CONFIG.WORKER_ORIGIN + '/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CLIENT_CONFIG.API_MASTER_KEY },
            body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], stream: true }),
            signal: abortController.signal,
          });
          if (!response.ok) throw new Error((await response.json()).error.message);

          setState(AppState.STREAMING);
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullResponse = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\\n').filter(line => line.startsWith('data:'));
            for (const line of lines) {
              const data = line.substring(5).trim();
              if (data === '[DONE]') { assistantEl.textContent = fullResponse; return; }
              try {
                const json = JSON.parse(data);
                const delta = json.choices[0].delta.content;
                if (delta) { fullResponse += delta; assistantEl.textContent = fullResponse + '▍'; this.output.scrollTop = this.output.scrollHeight; }
              } catch (e) {}
            }
          }
          assistantEl.textContent = fullResponse;
        }
        async handleImageRequest(prompt) {
          const model = this.inputs.image.model.value;
          this.addMessage('assistant', '正在生成图片...');
          const response = await fetch(CLIENT_CONFIG.WORKER_ORIGIN + '/v1/images/generations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CLIENT_CONFIG.API_MASTER_KEY },
            body: JSON.stringify({ model, prompt }),
            signal: abortController.signal,
          });
          if (!response.ok) throw new Error((await response.json()).error.message);
          const result = await response.json();
          const b64 = result.data[0].b64_json;
          this.output.innerHTML = '';
          this.addMessage('user', prompt);
          this.addMessage('assistant', \`<img src="data:image/png;base64,\${b64}" alt="Generated Image"> \`, true);
        }
        async handleVideoRequest(prompt) {
          const model = this.inputs.video.model.value;
          const size = this.inputs.video.size.value;
          const seconds = parseInt(this.inputs.video.seconds.value, 10);
          this.addMessage('assistant', '正在请求视频生成...');
          const response = await fetch(CLIENT_CONFIG.WORKER_ORIGIN + '/v1/videos/generations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CLIENT_CONFIG.API_MASTER_KEY },
            body: JSON.stringify({ model, prompt, size, seconds }),
            signal: abortController.signal,
          });
          // [修改] 前端将直接处理后端返回的错误信息
          if (!response.ok) throw new Error((await response.json()).error.message);
          const result = await response.json();
          const url = result.data[0].url;
          this.output.innerHTML = '';
          this.addMessage('user', prompt);
          this.addMessage('assistant', \`<video src="\${url}" controls autoplay muted loop playsinline></video>\`, true);
        }
        cancelRequest() {
          if (abortController) {
            abortController.abort();
            abortController = null;
          }
          setState(AppState.READY);
        }
        updateButton(state) {
          if (state === AppState.REQUESTING || state === AppState.STREAMING) {
            this.btn.innerHTML = this.cancelIcon;
            this.btn.title = "取消";
            this.btn.classList.add('cancel');
            this.btn.disabled = false;
          } else {
            this.btn.innerHTML = this.sendIcon;
            this.btn.title = "发送/生成";
            this.btn.classList.remove('cancel');
            this.btn.disabled = state !== AppState.READY;
          }
        }
      }
      customElements.define('live-terminal', LiveTerminal);

      function setState(newState) {
        currentState = newState;
        const terminal = document.querySelector('live-terminal');
        if (terminal) terminal.updateButton(newState);
      }

      async function healthCheck() {
        const statusIndicator = document.querySelector('main-layout')?.shadowRoot.querySelector('status-indicator');
        if (!statusIndicator) return;
        statusIndicator.setState('checking', '检查服务...');
        try {
          const response = await fetch(CLIENT_CONFIG.WORKER_ORIGIN + '/v1/models', { headers: { 'Authorization': 'Bearer ' + CLIENT_CONFIG.API_MASTER_KEY } });
          if (response.ok) {
            statusIndicator.setState('ok', '服务正常');
            setState(AppState.READY);
          } else {
            throw new Error((await response.json()).error.message);
          }
        } catch (e) {
          statusIndicator.setState('error', '检查失败');
          setState(AppState.ERROR);
        }
      }

      document.addEventListener('DOMContentLoaded', () => {
        setState(AppState.INITIALIZING);
        customElements.whenDefined('main-layout').then(() => {
          healthCheck();
        });
      });
    <\/script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}



```

## 使用效果：
<img width="2544" height="1280" alt="QQ_1762251384015" src="https://github.com/user-attachments/assets/ff9c1e78-a34b-4d24-92cd-c889bbc37b39" />








# 2025年11月4日 17:54:47（提示词1.0）：

```
角色扮演： 你是一位世界级的 Serverless 架构师与全栈开发专家，对用户体验和开发者效率有着极致的追求。你能够将任何后端 API 服务，一键转化为一个部署在 Cloudflare Workers 上的、自带交互式测试面板的“艺术品级”应用。

核心任务： 我将提供一个完整的 Python API 项目源代码。请你将其完整地、无损地迁移到一个单一的 Cloudflare Worker JavaScript 文件中。

最终交付物要求：

单一、可直接部署的 JS 文件：所有逻辑和配置都在这一个文件里。
一个“旗舰级”的交互式说明页面：当用户访问 Worker 的根路径 (/) 时，必须返回一个功能强大、信息全面的 HTML 页面。
对生成的“说明页面”的硬性要求：
动态 URL 填充：
页面中所有 API 路径都必须自动包含当前 Worker 的完整访问 URL。
“即用信息”板块：
创建一个 📋 即用信息 (Ready-to-Use Info) 板块。
清晰列出在第三方客户端中需要填写的三个核心信息：API 地址、API 密钥、默认模型名称。
所有信息都必须是直接打印的、可直接复制的值。
“完整接口路径”板块：
创建一个 🔌 完整接口路径 (Full API Endpoints) 板块。
列出所有可用的 API 接口及其请求方法（如 POST, GET）。
“开发者信息”板块 (强制要求)：
创建一个 🛠️ 开发者信息 (Developer Info) 板块，此板块必须存在。
清晰展示以下技术细节：
上游接口 (Upstream API): 打印出代码中实际请求的上游 URL。
项目模式 (Project Mode): 自动分析并标注，例如“伪流式代理 (Pseudo-Stream Proxy)”。
“在线 API 测试”板块 (核心功能)：
创建一个 🚀 在线 API 测试 (Live API Tester) 板块。
此板块必须包含一个完整的、可交互的 Web UI，允许用户直接在页面上测试 v1/chat/completions 接口。
UI 组件要求：
一个文本输入框，用于用户输入问题（Prompt）。
一个“发送”按钮。
一个结果显示区域（使用 <pre> 或类似标签），用于实时显示流式返回的 AI 回答。
功能要求：
页面内嵌的 JavaScript 必须能自动获取当前页面的 URL 和硬编码的 API Key。
点击“发送”按钮后，使用 fetch API 调用当前 Worker 自己的 /v1/chat/completions 接口。
能够正确处理并实时渲染 SSE (Server-Sent Events) 流式响应。
在发送请求时，显示“正在思考...”等加载状态。
美学与体验：
大量使用 Emoji 增强页面的可读性和趣味性。
使用清晰的板块划分和标题。
整个页面设计简洁、专业，响应式布局优先。
对生成的“Worker 代码”的硬性要求：
硬编码配置：所有配置项（API_KEY, MODEL 等）必须作为常量硬编码在代码顶部。
智能路由：fetch 函数必须能处理两种请求：
API 请求 (路径以 /v1/ 开头)：执行 API 代理逻辑。
页面请求 (路径为 /)：返回包含上述所有功能的完整 HTML 和内联 JavaScript。
单一文件交付：所有 HTML, CSS, 和客户端 JavaScript 都必须内联在返回的 HTML 响应中，确保整个应用就是一个独立的、自包含的 JS 文件。
现在，这是我的项目文件，请严格按照以上所有要求开始转换：
```

## 使用效果如下：
<img width="2529" height="1344" alt="QQ_1762250179009" src="https://github.com/user-attachments/assets/c1899311-f27f-4349-8e48-bbe4c4705de6" />
<img width="2146" height="1148" alt="QQ_1762250183764" src="https://github.com/user-attachments/assets/cac4d897-cd8c-498f-903a-9730b0d05bb4" />


