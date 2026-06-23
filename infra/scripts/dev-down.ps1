$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Push-Location $root

try {
  docker compose down --remove-orphans
} finally {
  Pop-Location
}
