---
project: porting-automation-tango-tmo
type: constraints
last_updated: 2026-06-24
---

<!--
Project-level context-memory: hard constraints binding this project.
Each entry: id, content, source, confidence, prd_version_at_write, status, date.
Status values: active | archived | superseded-by:<id>. ID prefix: m-cst-<n>.
-->

# Active

- id: m-cst-001
  content: Tango UK port-in 硬性要求 PAC code（运营商发，30 天有效、最好剩 2–3 周）+ 待转号码须与 PAC 匹配 + 期望 port 日期；20+ 号码用单个 bulk PAC 且可分批（如 25/周）；被拒（incorrect/expired PAC、number mismatch）即时重提无等待，Tango 不主动通知需自查门户；porting 时段 8AM–8PM UK，每日提交无上限。
  source: "background.md:2026-06-22 18:02 (Tango UK Porting Workflow docx, Port In Requirements / Bulk PAC / Handling Rejections / Monitoring)"
  confidence: high
  prd_version_at_write: v1
  status: active
  date: 2026-06-22

- id: m-cst-002
  content: Temp-number/eSIM 机制——每个 subscriber 须先用 Zoom 号池 temp number 在 Tango 建档并同步；cutover 时 port-in 号替换 temp number，temp number 移除且不可再用（提交前须先从 Zoom 号池删）；eSIM 不变，porting 只换号码。Tango callback（成功回调）为 future state，尚不可用。
  source: "background.md:2026-06-22 18:02 (Tango UK Porting Workflow docx, §3.7 Port Cutover + Port In Requirements note)"
  confidence: high
  prd_version_at_write: v1
  status: active
  date: 2026-06-22

- id: m-cst-003
  content: 建 Subscriber 须选 User + Package + 临时号（非纯技术占位，含业务决策）；Zoom Admin Portal 是唯一入口，不能在 Tango 侧直接建（数据/号码池/Number Swap/删号都依赖 Zoom 侧记录）；eSIM QR 激活是 port 完成后的用户侧动作，与 port 完成解耦（eSIM 未装 port 仍进行）；port 请求须前一工作日 4:30PM 前提交才赶当天 cutover。
  source: "background.md:2026-06-24 15:58 (Q&A 总结 §一/§三 + Tango §3.5 / Pre-Provisioning / Troubleshooting)"
  confidence: high
  prd_version_at_write: v1
  status: active
  date: 2026-06-24

# Archived / Superseded
