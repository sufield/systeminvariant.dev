# Reading Chain Findings

Chain findings are Stave's distinctive output — compound risks that emerge from a *combination* of conditions, invisible to single-resource scanners that check one setting at a time.

## What a chain finding is[​](#what-a-chain-finding-is "Direct link to What a chain finding is")

A chain is a set of **co-failing controls** (its *legs*) that together cross a compound-risk threshold. Each leg, alone, might be a routine "medium" finding. Stacked, they compose into an exploitable path.

From the `demo-ai-security` run, one chain reads:

```
chain:            bedrock_agent_overpermissioned   [CRITICAL]
compound_score:   100
controls_failing (legs):
    CTL.BEDROCK.AGENT.OVERPERM.LAMBDA.001   broad lambda:InvokeFunction reach
    CTL.BEDROCK.AGENT.GUARDRAIL.001         no content guardrail
    CTL.BEDROCK.AGENT.LOGGING.001           no per-agent invocation logging
attack_stages:    execution → privilege_escalation → detection_evasion
```

Reads like a sentence: *broad reach + no filter + no audit trail = a usable exfiltration / lateral-movement primitive.* Drop any one leg and the attacker has either limited reach, blocked content, or visible activity.

## The ★ STAVE ONLY marker[​](#the--stave-only-marker "Direct link to The ★ STAVE ONLY marker")

Findings marked ★ are graph-level — they require reasoning across multiple resources or settings. A single-resource scanner cannot produce them because no single setting is the vulnerability. The risk emerges from how settings *combine*.

## Priority order[​](#priority-order "Direct link to Priority order")

Triage compound risk before isolated settings:

```
1. Chain findings        ← compound, exploitable paths. Fix first.
2. CRITICAL single findings
3. HIGH single findings
4. The rest
```

A setting-level scan might list the three legs above as three separate medium findings buried in a list of 47. The chain says: these three, *together*, on this asset, are a critical path.

## Breaking a chain[​](#breaking-a-chain "Direct link to Breaking a chain")

Every leg must hold for the compound to fire. **Break any one leg and the compound drops below threshold.** So:

> Pick the **easiest** leg to fix. That single change is your highest-leverage action — it neutralizes the whole chain.

Fixing one leg often also clears several of the single-resource findings that participated in it.

***

**Next:** [Find Issues in Your Own Account](/docs/getting-started/first-finding.md) — now that you know what the output means, point Stave at your AWS environment.
