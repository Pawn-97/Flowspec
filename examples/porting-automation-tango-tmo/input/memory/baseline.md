---
project: porting-automation-tango-tmo
type: baseline
last_updated: 2026-06-24
---

<!--
Project-level context-memory: online behavior baseline.
Captures what currently exists in production today, BEFORE the new PRD ships.
Each entry: id, content, source, confidence, prd_version_at_write, status, date.
Status values: active | archived | superseded-by:<id>. ID prefix: m-bsl-<n>.
-->

# Active

- id: m-bsl-001
  content: UK Tango porting 现状是手动门户流程——porting team 在 Zoom OP 用 Number Swap 把 temp number 换成 port-in 号、从号池删 temp number，再到 Tango Control Panel 手动提交 port-in；无 API，状态靠人工轮询门户。本项目要自动化的就是这段。
  source: "background.md:2026-06-22 18:02 (Tango UK Porting Workflow docx, §3.6/3.6.1/Monitoring)"
  confidence: high
  prd_version_at_write: v1
  status: active
  date: 2026-06-22

- id: m-bsl-002
  content: Business Address + KYC 验证（Number Type & Capability: Mobile-eSIM, Country: UK）是 porting 前置；KYC 通过后 temp number 才可用；porting 提交阶段无需再传文档（business address 设置时已验证）—— 直接支撑 PRD "复用 business address" 诉求。
  source: "background.md:2026-06-22 18:02 (Tango UK Porting Workflow docx, Business Address/Subscriber Confirmation + §3.6)"
  confidence: high
  prd_version_at_write: v1
  status: active
  date: 2026-06-22

- id: m-bsl-003
  content: 现有 port-in 流程（自助，Admin 门户，仅支持 Local + Toll-free，eSIM/mobile 今天不支持）：Phone numbers > Port history > "Port number" → 选号码类型 → 输入号码（自动清洗 +1/横线/空格）→ Check portability（按 carrier 分组，多 carrier=多个独立请求）→ [Local 专属：可选 number replacement + 可选启用 SMS] → 每 carrier 填 LOA + 传 Invoice（须与 carrier 账单一致）→ 提交（Order ID + 确认邮件）。
  source: "background.md:2026-06-23 16:18 (Port local numbers + Port toll-free numbers 流程 docx)"
  confidence: high
  prd_version_at_write: v1
  status: active
  date: 2026-06-23

- id: m-bsl-004
  content: 现有 porting 已有状态跟踪模型——Port history 页显示 Submitted / Port scheduled (FOC, Firm Order Commitment) / Completed / Exception / Canceled；选择的 port 日期是请求日期，实际迁移以 carrier 确认的 FOC 为准；toll-free 通常 5-10 工作日。这是 eSIM "admin 跟踪到结果" 体验应对齐的现有模型。
  source: "background.md:2026-06-23 16:18 (Port toll-free numbers 流程 docx, §步骤8 追踪 Port 状态)"
  confidence: high
  prd_version_at_write: v1
  status: active
  date: 2026-06-23

- id: m-bsl-005
  content: UK eSIM porting 完整前置链（as-is，Alice 例）：① Business Address + KYC（Pending→Verified）② Phone Numbers → Add Number → Get Number 取临时号（独立步骤）③ eSIM Management → Create 建 Subscriber（选 User + Package + 临时号）→ 自动同步 Tango + 发 eSIM 激活邮件(QR) ④ 提交 Porting Request（PAC + 目标号）。之后 Porting Team 在 Zoom OP 确认 Subscriber → Number Swap（临时号换待移植号）→ 删临时号 → Tango Control Panel 提交 port-in；Tango 校验 → Port Cutover（须前一工作日 4:30PM 前提交）。精化 m-bsl-002。
  source: "background.md:2026-06-24 15:58 (Q&A 总结 + Tango workflow §Admin Creates Subscribers / Pre-Provisioning / §3.5 / §3.6)"
  confidence: high
  prd_version_at_write: v1
  status: active
  date: 2026-06-24

# Archived / Superseded
