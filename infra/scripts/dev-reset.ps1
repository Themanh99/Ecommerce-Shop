$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Push-Location $root

try {
  $projectRoot = (Resolve-Path '.').Path
  if (-not $projectRoot.StartsWith($root.Path, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to reset volumes outside the MoonKid workspace."
  }

  docker compose down --volumes --remove-orphans
  docker compose up --build -d
  docker compose ps
} finally {
  Pop-Location
}
