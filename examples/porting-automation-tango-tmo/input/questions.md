---
project: porting-automation-tango-tmo
created: 2026-06-24
---

<!--
Open questions and answered questions tracked here.
Owner: PM | Designer | Eng | Legal | Research. Blocking: yes|no. Priority: high|medium|low. Status: open|answered|deferred.
Answered questions move to the answered table (not deleted).
-->

# Open Questions

| ID | Question | Owner | Blocking | Priority | Created |
|---|---|---|---|---|---|
| Q1 | US/TMO 的采集字段与机制（是否有 PAC-类授权码、文档要求）？ | PM | yes | high | 2026-06-23 |
| Q3 | v1 状态跟踪到哪一步为止？Tango 成功回调是 future state，cutover 完成实时态暂拿不到。 | PM/Eng | no | medium | 2026-06-23 |
| Q4 | 取消进行中的 port 是否需要/可行（S12）？ | PM | no | low | 2026-06-23 |

# Answered Questions

| ID | Question | Answer | Answered by | Date |
|---|---|---|---|---|
| Q2 | Number Swap + port-in 提交是否被 Tango/carrier API 支持自动化？ | 确定支持 → A1 validated；D3"提交后自动化"可落地。 | Designer (代 Eng) | 2026-06-24 |
| Q5 | PAC 录入是否支持 bulk + per-number？ | 两种都支持：① per-number PAC ② shared/bulk PAC 应用到多号。 | Designer | 2026-06-24 |
| Q6 | step「per carrier」分组的 donor carrier 信息来源？ | Zoom 在导入号码时自动判定号码是否来自不同 carrier（自动检测 + 分组），不需 admin 指定。 | Designer | 2026-06-24 |
| Q7 | 缺对应 subscriber 的号如何在 flow 内提示（不设计创建）？ | ① 给 inline 出口"去 eSIM Management 建"；② 可把当前进度存为 draft，later re-visit。 | Designer | 2026-06-24 |
| Q8 | PAC expiry date 是 admin 录入还是系统派生？ | 系统校验/显示，admin 只填 PAC code；expiry 用于过期预警，不让 admin 逐个手填。 | Designer | 2026-06-24 |
| Q9 | business-mobile-only 资格是否在预检显式拦截 personal？ | Zoom 自动对导入号码做校验（含资格类），系统侧检测。 | Designer | 2026-06-24 |
