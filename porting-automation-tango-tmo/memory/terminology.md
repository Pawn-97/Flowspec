---
project: porting-automation-tango-tmo
type: terminology
last_updated: 2026-06-24
---

<!--
Project-level context-memory: terms specific to this project (or used differently from glossary.md).
Each entry: id, content (term :: definition + scope note), source, confidence, prd_version_at_write, status, date.
Status values: active | archived | superseded-by:<id>. ID prefix: m-trm-<n>.
-->

# Active

- id: m-trm-001
  content: 'PAC (Porting Authorisation Code) :: UK 专属携号转网授权码，机主向原运营商索取（短信 PAC 到 65075），证明授权转出。30 天有效，转入方拿 PAC+号码提交、原运营商核对放行。一号一 PAC，但 20+ 号企业批量时运营商可发一个 bulk PAC 覆盖整批。US 无 PAC（用 LOA+Invoice）—— PAC 是 UK↔US 采集差异关键点。'
  source: "background.md:2026-06-22 18:02 (Tango doc); conv-2026-06-23"
  confidence: high
  prd_version_at_write: v1
  status: active
  date: 2026-06-23

- id: m-trm-002
  content: 'donor carrier (转出方 / losing carrier) :: 待转号码当前所在的原运营商。一批号若来自多个 donor，需各自的 PAC 且不能混在一个 port 请求里 → 系统按 donor 拆成多笔独立 port 请求。'
  source: "background.md:2026-06-23 16:18 (existing port flow, multi-carrier); conv-2026-06-23"
  confidence: high
  prd_version_at_write: v1
  status: active
  date: 2026-06-23

- id: m-trm-003
  content: 'subscriber (订阅者) :: Zoom Phone Mobile 里一条开通 eSIM 移动服务的用户记录/线路（将来持号的人）。'
  source: "background.md:2026-06-22 18:02 (Tango doc); conv-2026-06-23"
  confidence: high
  prd_version_at_write: v1
  status: superseded-by:m-trm-005
  date: 2026-06-23

- id: m-trm-004
  content: 'temp number (临时号码) :: 从 Zoom 号池借的占位号码，真号 port 进来前先挂在 subscriber 上。UK Tango 要求 port 提交前 subscriber 须已带号存在于 Tango；cutover 时 ported 号替换 temp number（temp 不可再用），eSIM 不变只换号码。'
  source: "constraints.md#m-cst-002; conv-2026-06-23"
  confidence: high
  prd_version_at_write: v1
  status: active
  date: 2026-06-23

- id: m-trm-005
  content: 'subscriber (订阅者) :: Tango 中代表 eSIM 终端用户的记录，绑定 SIM↔电话号码 + Service Bundle + Roaming Policy + SIM 状态。是 port-in 硬前提（须先带临时号存在于 Tango）。只能由 Admin 在 Zoom Portal（eSIM Management → Create，选 User + Package + 临时号）创建并自动同步 Tango，不能在 Tango 侧直接建（Zoom 是号码池/Number Swap/删号的源头）。supersedes m-trm-003。'
  source: "background.md:2026-06-24 15:58 (Q&A 总结 §一/§三/§五 + Tango §Admin Creates Subscribers / Pre-Provisioning)"
  confidence: high
  prd_version_at_write: v1
  status: active
  date: 2026-06-24

# Archived / Superseded
