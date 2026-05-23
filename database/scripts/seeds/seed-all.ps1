param(
    [string]$DatabaseUrl = ""
)

$ErrorActionPreference = "Stop"

$envFile = "database/.env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
        }
    }
}

if (-not $DatabaseUrl) {
    $DatabaseUrl = $env:DATABASE_URL
}

$container = "postgres_db"
$user = "app_user"
$db = "app_db"

$seedFiles = @(
    "database/scripts/seeds/static/global/tournaments.sql",

    "database/scripts/seeds/static/world-cup-2022/01-teams.sql",
    "database/scripts/seeds/static/euro-2024/01-teams.sql",
    "database/scripts/seeds/static/copa-america-2024/01-teams.sql",

    "database/scripts/seeds/static/world-cup-2022/02-tournament-teams.sql",
    "database/scripts/seeds/static/euro-2024/02-tournament-teams.sql",
    "database/scripts/seeds/static/copa-america-2024/02-tournament-teams.sql",

    "database/scripts/seeds/static/world-cup-2022/03-standings.sql",
    "database/scripts/seeds/static/euro-2024/03-standings.sql",
    "database/scripts/seeds/static/copa-america-2024/03-standings.sql"
)

foreach ($file in $seedFiles) {
    if (-not (Test-Path $file)) {
        throw "Missing seed file: $file"
    }

    Write-Host "Seeding $file..."

    if ($DatabaseUrl -and $DatabaseUrl -notlike "*@db:*") {
        psql $DatabaseUrl -f $file
    }
    else {
        $fileName = Split-Path $file -Leaf
        $safeName = $file.Replace("\", "_").Replace("/", "_").Replace(":", "")
        $containerPath = "/tmp/$safeName"

        docker cp $file "${container}:$containerPath"
        docker exec -i $container psql -U $user -d $db -f $containerPath
    }
}

Write-Host "All seed files applied successfully."