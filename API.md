


## [执行 workflow] POST/workflows/run

执行 workflow，没有已发布的 workflow，不可执行。

### Request Body

-   `inputs` (object) Required 允许传入 App 定义的各变量值。 inputs 参数包含了多组键值对（Key/Value pairs），每组的键对应一个特定变量，每组的值则是该变量的具体值。变量可以是文件列表类型。 文件列表类型变量适用于传入文件结合文本理解并回答问题，仅当模型支持该类型文件解析能力时可用。如果该变量是文件列表类型，该变量对应的值应是列表格式，其中每个元素应包含以下内容：
    -   `type` (string) 支持类型：
        -   `document` 具体类型包含：'TXT', 'MD', 'MARKDOWN', 'PDF', 'HTML', 'XLSX', 'XLS', 'DOCX', 'CSV', 'EML', 'MSG', 'PPTX', 'PPT', 'XML', 'EPUB'
        -   `image` 具体类型包含：'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'
        -   `audio` 具体类型包含：'MP3', 'M4A', 'WAV', 'WEBM', 'AMR'
        -   `video` 具体类型包含：'MP4', 'MOV', 'MPEG', 'MPGA'
        -   `custom` 具体类型包含：其他文件类型
    -   `transfer_method` (string) 传递方式，`remote_url` 图片地址 / `local_file` 上传文件
    -   `url` (string) 图片地址（仅当传递方式为 `remote_url` 时）
    -   `upload_file_id` (string) 上传文件 ID（仅当传递方式为 `local_file` 时）
-   `response_mode` (string) Required 返回响应模式，支持：
    -   `streaming` 流式模式（推荐）。基于 SSE（**[Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)**）实现类似打字机输出方式的流式返回。
    -   `blocking` 阻塞模式，等待执行完毕后返回结果。（请求若流程较长可能会被中断）。 *由于 Cloudflare 限制，请求会在 100 秒超时无返回后中断。*
-   `user` (string) Required 用户标识，用于定义终端用户的身份，方便检索、统计。 由开发者定义规则，需保证用户标识在应用内唯一。API 无法访问 WebApp 创建的会话。
-   `files` (array\[object\]) 可选
-   `trace_id` (string) Optional 链路追踪ID。适用于与业务系统已有的trace组件打通，实现端到端分布式追踪等场景。如果未指定，系统将自动生成 `trace_id`。支持以下三种方式传递，具体优先级依次为：
    1.  Header：推荐通过 HTTP Header `X-Trace-Id` 传递，优先级最高。
    2.  Query 参数：通过 URL 查询参数 `trace_id` 传递。
    3.  Request Body：通过请求体字段 `trace_id` 传递（即本字段）。

### Response

当 `response_mode` 为 `blocking` 时，返回 CompletionResponse object。 当 `response_mode` 为 `streaming`时，返回 ChunkCompletionResponse object 流式序列。

### CompletionResponse

返回完整的 App 结果，`Content-Type` 为 `application/json` 。

-   `workflow_run_id` (string) workflow 执行 ID
-   `task_id` (string) 任务 ID，用于请求跟踪和下方的停止响应接口
-   `data` (object) 详细内容
    -   `id` (string) workflow 执行 ID
    -   `workflow_id` (string) 关联 Workflow ID
    -   `status` (string) 执行状态, `running` / `succeeded` / `failed` / `stopped`
    -   `outputs` (json) Optional 输出内容
    -   `error` (string) Optional 错误原因
    -   `elapsed_time` (float) Optional 耗时(s)
    -   `total_tokens` (int) Optional 总使用 tokens
    -   `total_steps` (int) 总步数（冗余），默认 0
    -   `created_at` (timestamp) 开始时间
    -   `finished_at` (timestamp) 结束时间

### ChunkCompletionResponse

返回 App 输出的流式块，`Content-Type` 为 `text/event-stream`。 每个流式块均为 data: 开头，块之间以 `\n\n` 即两个换行符分隔，如下所示：

```streaming
data: {"event": "text_chunk", "workflow_run_id": "b85e5fc5-751b-454d-b14e-dc5f240b0a31", "task_id": "bd029338-b068-4d34-a331-fc85478922c2", "data": {"text": "\u4e3a\u4e86", "from_variable_selector": ["1745912968134", "text"]}}\n\n
```

CopyCopied!

流式块中根据 `event` 不同，结构也不同，包含以下类型：

-   `event: workflow_started` workflow 开始执行
    -   `task_id` (string) 任务 ID，用于请求跟踪和下方的停止响应接口
    -   `workflow_run_id` (string) workflow 执行 ID
    -   `event` (string) 固定为 `workflow_started`
    -   `data` (object) 详细内容
        -   `id` (string) workflow 执行 ID
        -   `workflow_id` (string) 关联 Workflow ID
        -   `created_at` (timestamp) 开始时间
-   `event: node_started` node 开始执行
    -   `task_id` (string) 任务 ID，用于请求跟踪和下方的停止响应接口
    -   `workflow_run_id` (string) workflow 执行 ID
    -   `event` (string) 固定为 `node_started`
    -   `data` (object) 详细内容
        -   `id` (string) workflow 执行 ID
        -   `node_id` (string) 节点 ID
        -   `node_type` (string) 节点类型
        -   `title` (string) 节点名称
        -   `index` (int) 执行序号，用于展示 Tracing Node 顺序
        -   `predecessor_node_id` (string) 前置节点 ID，用于画布展示执行路径
        -   `inputs` (object) 节点中所有使用到的前置节点变量内容
        -   `created_at` (timestamp) 开始时间
-   `event: text_chunk` 文本片段
    -   `task_id` (string) 任务 ID，用于请求跟踪和下方的停止响应接口
    -   `workflow_run_id` (string) workflow 执行 ID
    -   `event` (string) 固定为 `text_chunk`
    -   `data` (object) 详细内容
        -   `text` (string) 文本内容
        -   `from_variable_selector` (array) 文本来源路径，帮助开发者了解文本是由哪个节点的哪个变量生成的
-   `event: node_finished` node 执行结束，成功失败同一事件中不同状态
    -   `task_id` (string) 任务 ID，用于请求跟踪和下方的停止响应接口
    -   `workflow_run_id` (string) workflow 执行 ID
    -   `event` (string) 固定为 `node_finished`
    -   `data` (object) 详细内容
        -   `id` (string) node 执行 ID
        -   `node_id` (string) 节点 ID
        -   `index` (int) 执行序号，用于展示 Tracing Node 顺序
        -   `predecessor_node_id` (string) optional 前置节点 ID，用于画布展示执行路径
        -   `inputs` (object) 节点中所有使用到的前置节点变量内容
        -   `process_data` (json) Optional 节点过程数据
        -   `outputs` (json) Optional 输出内容
        -   `status` (string) 执行状态 `running` / `succeeded` / `failed` / `stopped`
        -   `error` (string) Optional 错误原因
        -   `elapsed_time` (float) Optional 耗时(s)
        -   `execution_metadata` (json) 元数据
            -   `total_tokens` (int) optional 总使用 tokens
            -   `total_price` (decimal) optional 总费用
            -   `currency` (string) optional 货币，如 `USD` / `RMB`
        -   `created_at` (timestamp) 开始时间
-   `event: workflow_finished` workflow 执行结束，成功失败同一事件中不同状态
    -   `task_id` (string) 任务 ID，用于请求跟踪和下方的停止响应接口
    -   `workflow_run_id` (string) workflow 执行 ID
    -   `event` (string) 固定为 `workflow_finished`
    -   `data` (object) 详细内容
        -   `id` (string) workflow 执行 ID
        -   `workflow_id` (string) 关联 Workflow ID
        -   `status` (string) 执行状态 `running` / `succeeded` / `failed` / `stopped`
        -   `outputs` (json) Optional 输出内容
        -   `error` (string) Optional 错误原因
        -   `elapsed_time` (float) Optional 耗时(s)
        -   `total_tokens` (int) Optional 总使用 tokens
        -   `total_steps` (int) 总步数（冗余），默认 0
        -   `created_at` (timestamp) 开始时间
        -   `finished_at` (timestamp) 结束时间
-   `event: tts_message` TTS 音频流事件，即：语音合成输出。内容是Mp3格式的音频块，使用 base64 编码后的字符串，播放的时候直接解码即可。(开启自动播放才有此消息)
    -   `task_id` (string) 任务 ID，用于请求跟踪和下方的停止响应接口
    -   `message_id` (string) 消息唯一 ID
    -   `audio` (string) 语音合成之后的音频块使用 Base64 编码之后的文本内容，播放的时候直接 base64 解码送入播放器即可
    -   `created_at` (int) 创建时间戳，如：1705395332
-   `event: tts_message_end` TTS 音频流结束事件，收到这个事件表示音频流返回结束。
    -   `task_id` (string) 任务 ID，用于请求跟踪和下方的停止响应接口
    -   `message_id` (string) 消息唯一 ID
    -   `audio` (string) 结束事件是没有音频的，所以这里是空字符串
    -   `created_at` (int) 创建时间戳，如：1705395332
-   `event: ping` 每 10s 一次的 ping 事件，保持连接存活。

### Errors

-   400，`invalid_param`，传入参数异常
-   400，`app_unavailable`，App 配置不可用
-   400，`provider_not_initialize`，无可用模型凭据配置
-   400，`provider_quota_exceeded`，模型调用额度不足
-   400，`model_currently_not_support`，当前模型不可用
-   400，`workflow_request_error`，workflow 执行失败
-   500，服务内部异常