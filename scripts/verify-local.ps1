$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Command,

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $CommandArgs
  )

  & $Command @CommandArgs
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code ${LASTEXITCODE}: $Command $($CommandArgs -join ' ')"
  }
}

Write-Host "Verifying backend..."
Push-Location (Join-Path $root "backend")
$env:PYTEST_DISABLE_PLUGIN_AUTOLOAD = "1"
Invoke-Checked python -m compileall app migrations
Invoke-Checked python -m pytest
Pop-Location

Write-Host "Verifying frontend..."
Push-Location (Join-Path $root "frontend")
Invoke-Checked npm run lint
Invoke-Checked npm run build
Pop-Location

Write-Host "Local verification complete."
