export function collectLayoutPatternIds(flowGrammar) {
  return new Set((flowGrammar?.layout_patterns || []).map((pattern) => pattern.id));
}

export function collectComponentFamilies(flowGrammar) {
  return new Set(flowGrammar?.component_families || []);
}

export function issue(severity, category, message, extra = {}) {
  return { severity, category, message, ...extra };
}

export function validationStatus(issues) {
  return issues.some((item) => item.severity === "critical") ? "fail" : "pass";
}

export function sourceTracePresent(value) {
  return Array.isArray(value?.source_trace) && value.source_trace.length > 0;
}
