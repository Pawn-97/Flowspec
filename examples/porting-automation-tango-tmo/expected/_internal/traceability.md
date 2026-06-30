# Traceability: Submit UK Mobile-eSIM port request

| FlowSpec item | Source | Source type | Confidence | Claim |
|---|---|---|---|---|
| screen:select-business-address | ux-onepage.md > 16. 信息架构 | confirmed | high | Select verified business address is a new step; no address uses prompt exit. |
| component:business-address-selector | decisions.md > D1 | decision | high | Address prerequisite uses select-existing model. |
| interaction:continue-with-address | ux-onepage.md > 17. 交互流程 | confirmed | high | Address selection continues to port-in number entry. |
| state:no-verified-address | decisions.md > D1/D4 | decision | high | Missing address is an external prompt exit, not an in-flow creation screen. |
| screen:enter-port-in-numbers | ux-onepage.md > 16. 信息架构 | confirmed | high | Port-in numbers are entered before pre-check. |
| screen:number-precheck-result | ux-onepage.md > 16. 信息架构 | confirmed | high | Zoom automatically detects donor carrier and validates eligibility before PAC collection. |
| component:precheck-results-table | questions.md > Answered Questions Q6/Q9 | confirmed | high | Zoom automatically detects donor carrier and validates business-mobile eligibility. |
| interaction:continue-after-precheck | ux-onepage.md > 17. 交互流程 | confirmed | high | Failed numbers return to correction; passing numbers continue through collection and review. |
| state:partial-precheck-failure | ux-onepage.md > 17. 交互流程 | confirmed | high | Pre-check failures return to number entry/correction. |
| screen:review-port-request | ux-onepage.md > 16. 信息架构 | confirmed | high | Review summarizes request and submission validations. |
| screen:submit-success | ux-onepage.md > 17. 交互流程 | confirmed | high | Submitted requests continue to Port history tracking. |
