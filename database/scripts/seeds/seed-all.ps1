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

    # teams
    "database/scripts/seeds/static/world-cup-2022/01-teams.sql",
    "database/scripts/seeds/static/euro-2024/01-teams.sql",
    "database/scripts/seeds/static/copa-america-2024/01-teams.sql",
    "database/scripts/seeds/static/africa-cup-of-nations-2025/01-teams.sql",
    "database/scripts/seeds/static/club-world-cup-2025/01-teams.sql",
    "database/scripts/seeds/static/world-cup-2026/01-teams.sql",

    # tournament teams
    "database/scripts/seeds/static/world-cup-2022/02-tournament-teams.sql",
    "database/scripts/seeds/static/euro-2024/02-tournament-teams.sql",
    "database/scripts/seeds/static/copa-america-2024/02-tournament-teams.sql",
    "database/scripts/seeds/static/africa-cup-of-nations-2025/02-tournament-teams.sql",
    "database/scripts/seeds/static/club-world-cup-2025/02-tournament-teams.sql",
    "database/scripts/seeds/static/world-cup-2026/02-tournament-teams.sql",

    # standings
    "database/scripts/seeds/static/world-cup-2022/03-standings.sql",
    "database/scripts/seeds/static/euro-2024/03-standings.sql",
    "database/scripts/seeds/static/copa-america-2024/03-standings.sql",
    "database/scripts/seeds/static/africa-cup-of-nations-2025/03-standings.sql",
    "database/scripts/seeds/static/club-world-cup-2025/03-standings.sql",

    # matches
    "database/scripts/seeds/static/world-cup-2022/04-matches.sql",
    "database/scripts/seeds/static/euro-2024/04-matches.sql",
    "database/scripts/seeds/static/copa-america-2024/04-matches.sql",
    "database/scripts/seeds/static/africa-cup-of-nations-2025/04-matches.sql",
    "database/scripts/seeds/static/club-world-cup-2025/04-matches.sql",

    # players
    "database/scripts/seeds/static/world-cup-2022/05-players.sql",
    "database/scripts/seeds/static/euro-2024/05-players.sql",
    "database/scripts/seeds/static/copa-america-2024/05-players.sql",
    "database/scripts/seeds/static/africa-cup-of-nations-2025/05-players.sql",
    "database/scripts/seeds/static/club-world-cup-2025/05-players.sql",

    # team players
    "database/scripts/seeds/static/world-cup-2022/06-team-players.sql",
    "database/scripts/seeds/static/euro-2024/06-team-players.sql",
    "database/scripts/seeds/static/copa-america-2024/06-team-players.sql",
    "database/scripts/seeds/static/africa-cup-of-nations-2025/06-team-players.sql",
    "database/scripts/seeds/static/club-world-cup-2025/06-team-players.sql",

    # match events
    "database/scripts/seeds/static/world-cup-2022/07-match-events.sql",
    "database/scripts/seeds/static/euro-2024/07-match-events.sql",
    "database/scripts/seeds/static/copa-america-2024/07-match-events.sql",
    "database/scripts/seeds/static/africa-cup-of-nations-2025/07-match-events.sql",
    "database/scripts/seeds/static/club-world-cup-2025/07-match-events.sql",

    
    # tournament teams rankings
    "database/scripts/seeds/static/world-cup-2022/08-tournament-team-ranks.sql",
    "database/scripts/seeds/static/euro-2024/08-tournament-team-ranks.sql",
    "database/scripts/seeds/static/copa-america-2024/08-tournament-team-ranks.sql",
    "database/scripts/seeds/static/africa-cup-of-nations-2025/08-tournament-team-ranks.sql",
    "database/scripts/seeds/static/club-world-cup-2025/08-tournament-team-ranks.sql",

    # player leaderboards
    "database/scripts/seeds/static/world-cup-2022/09-player-leaderboards.sql",
    "database/scripts/seeds/static/euro-2024/09-player-leaderboards.sql",
    "database/scripts/seeds/static/copa-america-2024/09-player-leaderboards.sql",
    "database/scripts/seeds/static/africa-cup-of-nations-2025/09-player-leaderboards.sql",
    "database/scripts/seeds/static/club-world-cup-2025/09-player-leaderboards.sql"

    # intentionally excluding:
    # world-cup-2026/03-standings.sql
    # world-cup-2026/04-matches.sql
    # world-cup-2026/05-players.sql
    # world-cup-2026/06-team-players.sql
    # world-cup-2026/07-matches-events.sql
    # world-cup-2026/08-tournament-teams-ranking.sql
    # world-cup-2026/09-player-leaderboards.sql
)

foreach ($file in $seedFiles) {
    if (-not (Test-Path $file)) {
        throw "Missing seed file: $file"
    }

    Write-Host "Seeding $file..."

    if ($DatabaseUrl -and $DatabaseUrl -notlike "*@db:*") {
        psql $DatabaseUrl -f $file

        if ($LASTEXITCODE -ne 0) {
            throw "Failed seeding file: $file"
        }
    }
    else {
        $fileName = Split-Path $file -Leaf
        $safeName = $file.Replace("\", "_").Replace("/", "_").Replace(":", "")
        $containerPath = "/tmp/$safeName"

        docker cp $file "${container}:$containerPath"

        if ($LASTEXITCODE -ne 0) {
            throw "Failed copying file to container: $file"
        }

        docker exec -i $container psql -U $user -d $db -f $containerPath

        if ($LASTEXITCODE -ne 0) {
            throw "Failed seeding file: $file"
        }
    }
}

Write-Host "All seed files applied successfully."