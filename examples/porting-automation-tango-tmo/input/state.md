---
project: porting-automation-tango-tmo
prd_source: ./pm-source.md
created: 2026-06-22
last_updated: 2026-06-25
phase: ready_for_onepage
phase_1_confirmed_at: 2026-06-24
phase_2_confirmed_at: 2026-06-24
phase_3_confirmed_at: 2026-06-25
stale_phase_1: false
stale_phase_2: false
stale_phase_3: false
auto_propose: true
auto_propose_mode: batched
change_type: iteration
---

# Current Understanding

跨国号码 porting 现状靠手动门户/工单、量大压垮支持团队，且 eSIM 过去不支持 porting；本项目为 admin 新增 eSIM porting、接 Tango(UK)/TMO(US) API、复用 business address 收集以替代工单。

# Confirmed Decisions (top 3-5)

- D1: business address 前置=选已有；无则跳出创建。
- D3: subscriber/temp number 前置门槛（选已有/缺则去 eSIM Management 建）；自动化只 swap+提交。〔取代 D2〕
- D4: UX 范围=port flow 本身；创建 subscriber/address/KYC/取号=记录在案的前置、不设计。
- D5: porting 采集途中可「保存草稿」，later 从 Port history 恢复。→ see decisions.md

# Active Assumptions (top 3)

- A1: ✅ validated — swap+port-in 由 API 自动化（Q2 确认）；subscriber 创建不在自动化范围。
- A2: US/TMO 可套 UK 骨架。(low) → assumptions.md

# Open Questions (blocking only)

- Q1 US/TMO 采集字段?(PM) — 唯一 blocking。Q2/Q5/Q6/Q7/Q8/Q9 已答（见 questions.md）；Q3/Q4 deferred。

# Memory Index (top 3 ids per file)

- Baseline: m-bsl-003/004/005 · Constraints: m-cst-001/002/003 · Terminology: m-trm-004/005 (003 superseded)
- Decisions: D1/D3/D4/D5 (D2 superseded) · Assumptions: A1(validated)/A2 · Questions: Q1 open / 6 answered → questions.md

# Recommended Next Step

questions.md 已闭环（Q2/Q5/Q6/Q7/Q8/Q9 全答，A1 validated，新增 draft=D5/S14/JTBD-10），更新后的流程已确认。下一步：/ux-project:export-html porting-automation-tango-tmo 刷新 HTML（当前 HTML 滞后）；再 /ux-project:handoff；US(Q1) 待 PM。
