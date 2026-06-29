---
project: porting-automation-tango-tmo
created: 2026-06-23
---

<!--
Tracks assumptions the team is making but hasn't validated.
Status enum: active | validated | rejected. Type enum: user | business | technical | compliance. Confidence: high | medium | low.
When validated/rejected, update status + append date; do NOT delete.
-->

# Assumptions

| ID | Assumption | Type | Confidence | Source | Status | Validated/Rejected on |
|---|---|---|---|---|---|---|
| A1 | Tango/carrier porting API 支持自动化的 Number Swap + port-in 提交（现状由 porting team 在 OP/Tango 门户人工做）。D3 的"提交后系统自动化"成立与否取决于此。注：subscriber + temp number 创建不在自动化范围（admin 在 eSIM Management 显式建，见 D3）。 | technical | high | conv-2026-06-24 (Q2 确认支持); m-bsl-001/005 | validated | validated 2026-06-24 |
| A2 | US/TMO 的 porting 采集范式与 UK 足够相似，可套用 UK 的"选 business address → 采集 carrier 专属信息 → 提交"骨架（具体字段/是否用 PAC-类机制 TBD，待 PM）。 | business | low | conv-2026-06-23 (round-1 Q1, S9) | active | — |
