$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Push-Location $root

try {
  docker compose config --quiet
  docker compose up --build -d --remove-orphans
  docker compose ps
  Write-Host ''
  Write-Host 'MoonKid is available at http://localhost:8088'
  Write-Host 'Frontend direct: http://localhost:3000'
  Write-Host 'Backend health: http://localhost:8080/api/health/ready'
  Write-Host 'Mailpit: http://localhost:8025'
  Write-Host 'MinIO console: http://localhost:9001'
} finally {
  Pop-Location
}
