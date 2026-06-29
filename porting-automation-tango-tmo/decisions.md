---
project: porting-automation-tango-tmo
created: 2026-06-23
---

<!--
Append-only log of confirmed design decisions. Never overwrite past entries — if a decision is reversed, append a new entry that supersedes it.
Each decision: ID (D<n>), date, content, owner, source/reason, impact.
-->

# Decisions

| ID | Date | Decision | Owner | Reason | Impact | Supersedes |
|---|---|---|---|---|---|---|
| D1 | 2026-06-23 | eSIM porting 的 business address 前置采用"选已有"而非"内联新建"：该国有已验证地址 → porting 内直接选择并应用；无 → 引导跳出至 Business Address & Documents 创建，KYC 验证后再回来 port。 | Designer | KYC 异步审核耗时（Pending→Verified），temp number 又 gated 在 KYC verified 之上（m-bsl-002 / m-cst-002），内联新建无法无缝继续、价值低；跳出比假装无缝更诚实 | 收口 S1/S2；porting 入口需检测"该国是否有已验证 business address"并分流；PRD req2/req5 的 "attach/utilize business address" 落为"选已有" | — |
| D2 | 2026-06-23 | 〔已被 D3 取代〕subscriber + temp number 由系统在 porting 流程内自动创建并同步 Tango（用户无感），替代现状 admin 在 eSIM Management 手动建 + porting team 手动 number swap。 | Designer | 〔过时：深读后发现建 subscriber 含选 user/package 业务决策，非纯占位/无感〕 | 〔过时〕 | superseded-by:D3 |
| D3 | 2026-06-24 | subscriber + temp number 作为 porting **前置门槛**处理（与 D1 同范式）：porting 流程内号码关联到已存在的 subscriber（带临时号）；对应 subscriber 未建则引导去 eSIM Management 建（选 user + package + 取号）。subscriber 创建不折叠进 porting、不自动化（admin 显式业务动作，且会触发 welcome email/QR）。系统自动化仅限提交后的 Number Swap + Tango API port-in 提交（替代 porting team 手动）。 | Designer | 深读 Q&A/Tango 文档纠正 D2：建 subscriber 含选 user+package（业务决策）非纯占位（m-bsl-005 / m-cst-003）；复用现有 eSIM Management 不重造 UI；与 D1 范式统一；subscriber 可能已存在（员工已用临时号）也可能需新建 | 决定 IA/流程：porting 单元=带临时号的 subscriber + 待 port 真号；新建走 eSIM Management 引导 | D2 |
| D4 | 2026-06-24 | 本次 UX 范围收窄到 **port flow 本身**（发起→提交）。创建 subscriber / 创建 business address / KYC / 取临时号 = **记录在案的前置**，不在本 UX 设计范围；porting flow 假设它们已就绪，缺失处只给"提示出口"（如标出缺 subscriber 的号），不设计创建流程。 | Designer | 聚焦核心、收敛范围；前置创建流程是 eSIM Management/KYC 既有能力，不在本次 porting 自动化的设计重点 | 收窄 Phase 3：流程图里 KYC 跳出(X)/subscriber 跳出(Y) 从"设计的分支"降为"记录的前置出口"；§15 not-doing 增列前置创建流程 | — |
| D5 | 2026-06-24 | porting 采集途中支持「保存草稿」：admin 可在任意步骤（尤其被前置阻塞——缺 subscriber/地址时）把进度存为 draft，later 从 Port history 草稿列表恢复继续。 | Designer | 前置（KYC/subscriber 创建）异步耗时，不该逼 admin 一口气填完；缺前置时存草稿比丢弃已填内容友好（Q7 答复引出）| 新增 S14 / JTBD-10；流程加 draft 节点 + Port history 草稿列表 | — |
