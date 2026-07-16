param(
    [string]$ApiBase = "http://localhost:8090",
    [string]$ApiKey = "dev-local-only"
)

$ErrorActionPreference = "Stop"
$headers = @{ "X-QTKHCN-Dev-Key" = $ApiKey; "X-QTKHCN-Actor" = "smoke-dmn-camunda" }
$runId = [DateTimeOffset]::UtcNow.ToString("yyyyMMddHHmmss")
$code = "BR-SMOKE-DMN-$runId"
$decisionId = "smoke_decision_$runId"
$dmnXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="definitions_$runId" name="DMN smoke" namespace="urn:qtkhcn:smoke:$runId">
  <decision id="$decisionId" name="Approval smoke">
    <decisionTable id="table_$runId" hitPolicy="FIRST">
      <input id="input_amount"><inputExpression id="expr_amount" typeRef="number"><text>amount</text></inputExpression></input>
      <output id="output_result" name="result" typeRef="string"/>
      <rule id="R_HIGH"><inputEntry id="in_high"><text>&gt;= 100</text></inputEntry><outputEntry id="out_high"><text>"APPROVE"</text></outputEntry></rule>
      <rule id="R_LOW"><inputEntry id="in_low"><text>-</text></inputEntry><outputEntry id="out_low"><text>"REVIEW"</text></outputEntry></rule>
    </decisionTable>
  </decision>
</definitions>
"@

$created = Invoke-RestMethod -Method Post -Uri "$ApiBase/api/dmn-rules" -Headers $headers -ContentType "application/json" -Body (@{
    code = $code; name = "DMN smoke $runId"; description = "Real Camunda E2E smoke"
    category = "OTHER"; appliedProcesses = @("SMOKE")
} | ConvertTo-Json)
$ruleId = $created.rule.id

$saved = Invoke-RestMethod -Method Post -Uri "$ApiBase/api/dmn-rules/$ruleId/versions" -Headers $headers -ContentType "application/json" -Body (@{
    expectedVersion = 0; dmnXml = $dmnXml; changeNote = "Initial real-stack smoke"
} | ConvertTo-Json)
if ($saved.version -ne 1 -or $saved.deployStatus -ne "NOT_DEPLOYED") { throw "Version was not saved as NOT_DEPLOYED." }

$active = Invoke-RestMethod -Method Post -Uri "$ApiBase/api/dmn-rules/$ruleId/versions/1/activate" -Headers $headers -ContentType "application/json" -Body '{"expectedVersion":1}'
$deployed = $active.versions | Where-Object version -eq 1
if ($active.rule.status -ne "ACTIVE" -or $deployed.deployStatus -ne "DEPLOYED") { throw "DMN was not activated/deployed." }
if (-not $deployed.camundaDeploymentKey -or -not $deployed.camundaDecisionKey) { throw "Camunda keys were not persisted." }

$evaluated = Invoke-RestMethod -Method Post -Uri "$ApiBase/api/dmn-rules/$ruleId/evaluate" -Headers $headers -ContentType "application/json" -Body '{"variables":{"amount":150}}'
if ($evaluated.outputs.result -ne "APPROVE") { throw "Unexpected decision output: $($evaluated.outputs.result)" }
if ($evaluated.matchedRules[0].ruleId -ne "R_HIGH") { throw "Unexpected matched rule: $($evaluated.matchedRules[0].ruleId)" }

[pscustomobject]@{
    ruleId = $ruleId; code = $code; deploymentKey = $deployed.camundaDeploymentKey
    decisionKey = $deployed.camundaDecisionKey; decisionId = $deployed.camundaDecisionId
    evaluationKey = $evaluated.evaluationKey; matchedRule = $evaluated.matchedRules[0].ruleId
    result = $evaluated.outputs.result
}
