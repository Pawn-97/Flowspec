---
project: porting-automation-tango-tmo
created: 2026-06-22
---

<!--
Append-only raw context supplements. NEVER edit past entries.
Raw originals live here; structured/confirmed entries live in memory/<file>.md.
-->

# 2026-06-22 18:02 — 来自 /ux-project:add-context

来源文件：`/Users/GuanchengDing/Desktop/Zoom Mobile UK -_ Tango Porting Workflow .docx`（PRD 中提到的 "Zoom Mobile UK - Tango Porting Workflow"）
转换产物：742 行 GFM，5 张图（pm-source-assets/media/）；已 index 为 ctx 源 `Tango UK Porting Workflow (PM supporting doc)`，全文可 ctx_search 检索。
性质：UK Tango porting 的 **as-is（现状/手动）流程** 文档 —— 即本项目要自动化的对象。

原始内容（关键片段，verbatim 摘录）：
> **Process Overview**：When a customer purchases the Zoom Phone Mobile UK SKU and requests number porting, the port-in request cannot occur immediately. The UK PAC process requires each subscriber to be provisioned in Tango with a temporary number before submitting the port request. The customer first creates a verified Business Address and subscribers in the Zoom Web Portal via eSIM Management using temporary numbers from the Zoom number pool.
>
> **Business Address/Subscriber Confirmation**：Prerequisite — Admin sets up business address + subscriber in eSIM Management: Number Management → Phone Numbers → Business Address & Documents → Add Address → Product: Phone → Country: United Kingdom → Number Type & Capability: Mobile-eSIM → Upload documents → Save. Verification status Pending（auto-generates KYC ticket）→ Verified. Once KYC verified, temporary numbers become available to add.
>
> **3.6 Admin Submits Porting Request**：Document upload is not required at this stage, as the business address has already been verified during the initial setup. Porting team reviews, confirms subscribers created with temp numbers, uses Number Swap tool in OP to replace temp number with requested port-in number, deletes temp number from Zoom pool via OP, then submits port-in request to Tango through the portal (Tango Control Panel).
>
> **3.6.1 Porting Team Steps**：1) Review & Verify (confirm temp-number subscribers exist; map customer account number → PBX account ID in Zoom OP). 2) Execute Number Swap in OP. 3) Remove temp number from Zoom Number Pool. 4) Submit port-in to Tango via Control Panel. (Group = customer account; PBX account ID = Zoom internal identifier for Tango searches.)
>
> **Port In Requirements**：PAC Code (from customer's current carrier); PAC Expiry Date (valid 30 days, ideally 2–3 weeks remaining); Number to be Ported (must match PAC); Temporary Number (assigned to subscriber, synced to Tango Control Panel from Zoom Admin Portal); Requested Port Date.
>
> **3.7 Port Cutover & Number Reuse (Current State)**：At scheduled cutover, ported-in number becomes active; temp number removed from Tango Control Panel and NOT reusable in Zoom again (so remove temp number from Zoom pool before raising port request). eSIM assigned to subscriber remains unchanged — porting replaces only the phone number. *Future State (Not Yet Available): Tango Callback Integration — callback on successful port completion.*
>
> **Bulk PAC Codes**：MNOs typically issue a single bulk PAC code when porting 20+ numbers; same PAC accepted for the batch; ports can be phased (e.g. 25/week); PAC valid 30 days.
>
> **Handling Rejections**：Validation failure shown in Status column (e.g. incorrect PAC, expired PAC, number mismatch); correct & resubmit immediately (no waiting period); Tango does NOT send notifications — Zoom must self-serve by checking the portal; no limit on port-in orders per day.
>
> **Monitoring / Hours**：Numbers → Porting → Porting Status; Status column shows "Validation Failed" / "In Progress"; Export CSV for tracking. Porting process 8AM–8PM UK (GMT/BST); escalate to Tango if unresolved after 8PM. "Once we integrate with Tango's API, porting status updates will be available in real-time."

提取的 memory 条目（已 confirm）：
- m-bsl-001 → memory/baseline.md (UK Tango porting 现状=手动门户流程，本项目自动化对象)
- m-bsl-002 → memory/baseline.md (business address + KYC 是 porting 前置，porting 阶段无需再传文档)
- m-cst-001 → memory/constraints.md (PAC + 运营商规则：30 天有效/须匹配/bulk 20+/被拒重提/自查门户/8AM-8PM)
- m-cst-002 → memory/constraints.md (temp-number/eSIM 机制：建档同步→cutover 替换且不可再用，eSIM 不变)

---

# 2026-06-23 16:18 — 来自 /ux-project:add-context

来源文件：`/Users/GuanchengDing/Desktop/Port local numbers流程 .docx` + `/Users/GuanchengDing/Desktop/Port toll-free numbers流程.docx`（设计师补充："目前 port numbers 流程只支持导入 Local numbers 和 toll-free numbers"）
转换产物：本地 69 行 / toll-free 118 行 GFM，截图存 pm-source-assets/port-local/、pm-source-assets/port-tollfree/。
性质：**现有自助 port-in 流程的 as-is**（US Local + Toll-free），即本项目 eSIM porting 要扩展的那个入口。

原始内容（关键步骤，verbatim 摘录）：
> **入口**：Phone numbers > Port history 页面 → 右上角 "Port number" 按钮发起新请求。
>
> **共同步骤**：1) 选号码类型（Local Numbers / Toll-Free Numbers，TF 以 800/888/877/866/855/844/833 开头，预计 5-10 工作日）。2) 输入要 port 的号码（文本框，每行一个或逗号分隔；系统自动移除特殊字符、短横线、空格、+1 前缀）→ 点 Check portability。3) 查看 Portability Check 结果：系统验证可 port 性，按 carrier 分组显示；标出不可 port 的号码（类型不正确/已断开）；号码来自多个 carrier 时生成多个独立 port 请求。
>
> **Local 专属步骤**：4) Number replacement（可选，跳过）——用导入号码替换现有目标号码。5) 为导入号码启用 SMS 能力（可选，跳过）。
>
> **文档/LOA**：每个 carrier 分别填 LOA（Letter of Agency：公司名、授权人、当前 carrier 信息、联系方式）+ 可选上传已签 LOA + 上传 Invoice 作为所有权证明；所有信息必须与当前 carrier 账单完全一致。
>
> **提交成功**：确认页展示每个 port 请求的 Order ID + 提交时间；发确认邮件；可 "View port history" 或 "Port more numbers"。
>
> **状态跟踪**（toll-free 文档明确列出）：Port history 页查看状态——Submitted / Port scheduled (FOC, Firm Order Commitment, 确定迁移日期) / Completed / Exception / Canceled。注意：选择的 port 日期是请求日期，实际迁移以 carrier 确认的 FOC 为准；toll-free 通常 5-10 工作日。

提取的 memory 条目（已 confirm）：
- m-bsl-003 → memory/baseline.md (现有 port-in 流程：仅 Local+Toll-free，完整向导 + LOA/Invoice，eSIM 今天不支持)
- m-bsl-004 → memory/baseline.md (现有状态跟踪模型 Submitted/FOC/Completed/Exception/Canceled，eSIM 跟踪要对齐)

---

# 2026-06-24 15:58 — 来自 /ux-project:add-context

来源文件：`pm-source-assets/Zoom Mobile UK Port-In 流程解析与 Q&A 总结.docx`（新，156 行）+ 重读 `Zoom Mobile UK -_ Tango Porting Workflow .docx`（已索引）
设计师诉求：之前对 subscriber 作用 + 导入准备步骤研究不充分，重新解析后据结论重梳 ux-onepage。
性质：**精化 + 纠正** 现状理解（subscriber 定义 / 完整前置链 / 各步在门户的位置）。

原始内容（关键结论，verbatim 摘录）：
> **Subscriber 定义**：Tango 系统中的用户记录，代表 eSIM 服务的终端用户。含：SIM↔电话号码绑定、Service Bundle（服务套餐）、Roaming Policy（漫游策略）、SIM 激活状态（即使 eSIM 未安装，port 仍可进行）。
> **Subscriber 是 port-in 的前提**：UK PAC 流程要求——必须先在 Tango 为该用户建一个带临时号码的 Subscriber，才能提交 port 请求。
> **谁建**：Admin 在 Zoom Admin Portal 操作：Phone System Management → eSIM Management → Create，选 User + Package + 临时号码 → 自动同步到 Tango Control Panel。建 Subscriber 前必须先完成 Business Address KYC 验证（Verified 后才能从号池取临时号码）。
> **为什么不能在 Tango Portal 直接建**：Zoom Admin Portal 是唯一管理入口，Tango 侧 Subscriber 由 Zoom 自动同步。绕过会导致：数据不一致 / 号码池无法管理 / Number Swap 无法执行 / 临时号删除断裂。本质：Tango 管电信侧（SIM/号码/port），Zoom 管业务侧（用户/账号/号码池/SKU），同步源头是 Zoom。
> **临时号 vs 待移植号**：临时号来自 Zoom 号池（占位，满足 Tango 前提），port 完成后被替换、从 Tango 移除、不可复用；待移植号来自客户原运营商，替换临时号成为正式号。
> **Alice 完整流程（as-is）**：A 买 SKU + 向 EE 要 PAC（30 天）；Admin: ①Business Address+KYC（Pending→Verified）②Phone Numbers→Add Number→Get Number 取临时号 ③eSIM Management→Create 建 Subscriber（选 User/Package/临时号）→ 同步 Tango + 发 eSIM 激活邮件(QR) ④提交 Porting Request（PAC+目标号）；Porting Team(OP): 确认 Subscriber→Number Swap→删临时号→Tango Control Panel 提交 port-in（Number to Port In / PAC / Requested Port Date / Number to Replace）；Tango: 校验→Port Cutover（8AM–8PM，须前一工作日 4:30PM 前提交）→ 目标号替换临时号，SIM 不变；用户 port 完成后扫 QR 激活 eSIM。
> **eSIM 激活与 port 解耦**：welcome email 的 QR 在扫描安装前一直有效；eSIM 是否已装不影响 port 完成（port 只要 Subscriber 存在 + port 细节正确就进行）。
> **关键速查**：Subscriber=Tango 用户实体(Zoom 建后同步)；Temporary Number=Zoom 号池占位号(完成后不可复用)；PAC=原运营商授权码(30 天)；Number Swap=Porting Team 在 OP 提交前把临时号换成待移植号；Port Cutover=8AM–8PM、前一工作日 4:30PM 前提交；KYC=Business Address 审核 Pending→Verified。

提取的 memory 条目（已 confirm）：
- m-bsl-005 → memory/baseline.md (UK eSIM porting 完整前置链：KYC→取临时号→建 Subscriber→提交；精化 m-bsl-002)
- m-trm-005 → memory/terminology.md (subscriber 精确定义；supersede m-trm-003)
- m-cst-003 → memory/constraints.md (建 Subscriber 需 User+Package+临时号、Zoom 唯一入口、eSIM 激活解耦、4:30PM cutoff)

---

# 2026-06-24 17:48 — 来自 /ux-project:add-context

来源文件：`/Users/GuanchengDing/Desktop/Port flow 预设.md`（设计师整理的预设 port flow，10 步）
设计师指示：**UX 只聚焦 port flow 本身；其他相关步骤（创建 subscriber / 创建 business address / KYC / 取号）只做记录、先不设计**。要求 review 预设有无问题。

原始内容（verbatim）：
> 1. Select country/region: UK
> 2. Select verified Business Address for `Mobile eSIM`
> 3. Enter port-in numbers
> 4. Pre-check numbers: UK mobile format / duplicates / already in Zoom / country+type supported
> 5. Check passed
> 6. Enter porting details for each port-in number: PAC code, PAC expiry date
> 7. Enter porting details for each carrier: requested port date
> 8. Map port-in numbers to eSIM subscribers: Alison +447700900123 -> Alison subscriber / temp T1; Alice +447700900456 -> Alice subscriber / temp T2; Bob +447700900789 -> Bob subscriber / temp T3
> 9. Review page
> 10. Submit port request

AI review 发现的问题（待设计师处理）：
> Issue1: 逐号填 PAC（step6）不支持 bulk PAC（20+ 号一码），与 m-cst-001 冲突 → PAC 应支持 per-carrier-group(bulk) + per-number。
> Issue2: step7 "per carrier" 分组的 donor carrier 信息来源缺失（无 portability check 探测 / 未让 admin 指定）。
> Issue3: subscriber 映射(step8)靠后且未处理"缺 subscriber"——按 scope 不设计创建流程，但需提示"哪些号缺 subscriber"出口。
> Issue4: PAC expiry(step6.2) 是否需 admin 手填存疑（易错；或系统派生/仅用于过期预警）。
> Issue5: 缺显式 business-mobile-only 资格预检（personal 不支持，KB0085008）。
> 边界：预设只覆盖"发起→提交"，提交后状态跟踪/被拒重提是另一段；scope 收窄与 D1/D3"选已有"一致。

提取的 memory 条目（已 confirm）：
- D4 → decisions.md (UX 范围收窄到 port flow 本身；subscriber/address/KYC/取号=记录在案的前置、不设计)
- Q5–Q9 → questions.md (review 发现的 5 个 flow 问题：bulk PAC / carrier 分组来源 / 缺 subscriber 提示 / PAC expiry / business-mobile 资格)

---
