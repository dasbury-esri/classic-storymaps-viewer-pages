param(
    [string]$Repo = "dasbury-esri/classic-storymaps-viewer-pages",
    [string]$CsvPath = ".github/prompts/plan-storymapsSiteDeploy.issue-import.csv",
    [string]$GhPath = "",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$script:GhExe = $null

function Resolve-GhExe {
    param([string]$OverridePath)

    if (-not [string]::IsNullOrWhiteSpace($OverridePath)) {
        if (Test-Path $OverridePath) { return $OverridePath }
        throw "Provided -GhPath does not exist: $OverridePath"
    }

    $candidates = @(
        "C:\Program Files\GitHub CLI\gh.exe",
        "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe"
    )

    foreach ($c in $candidates) {
        if (Test-Path $c) { return $c }
    }

    $cmd = Get-Command gh -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source) { return $cmd.Source }

    throw "GitHub CLI executable not found. Install GitHub CLI or pass -GhPath 'C:\Program Files\GitHub CLI\gh.exe'."
}

function Invoke-Gh {
    param([Parameter(ValueFromRemainingArguments = $true)] [string[]]$Args)
    $output = & $script:GhExe @Args 2>&1
    if ($LASTEXITCODE -ne 0) {
        $joined = ($Args -join ' ')
        throw "gh command failed ($LASTEXITCODE): gh $joined`n$output"
    }
    return $output
}

function Test-GhReady {
    $script:GhExe = Resolve-GhExe -OverridePath $GhPath
    try {
        Invoke-Gh --version | Out-Null
        Invoke-Gh auth status | Out-Null
    }
    catch {
        throw "GitHub CLI is not ready. Using '$script:GhExe'. Run 'gh auth login' and retry."
    }
}

function Ensure-Label {
    param(
        [string]$Repo,
        [string]$Name
    )
    if ([string]::IsNullOrWhiteSpace($Name)) { return }

    $exists = $false
    try {
        $null = Invoke-Gh api "repos/$Repo/labels/$([uri]::EscapeDataString($Name))" 2>$null
        $exists = $true
    } catch {
        $exists = $false
    }

    if (-not $exists) {
        Write-Host "Creating label: $Name"
        Invoke-Gh label create $Name --repo $Repo --color "BFD4F2" --description "Created by CSV issue import script" | Out-Null
    }
}

function Ensure-Milestone {
    param(
        [string]$Repo,
        [string]$Title
    )
    if ([string]::IsNullOrWhiteSpace($Title)) { return }

    $milestones = Invoke-Gh api "repos/$Repo/milestones?state=all&per_page=100" | ConvertFrom-Json
    $found = $milestones | Where-Object { $_.title -eq $Title } | Select-Object -First 1

    if (-not $found) {
        Write-Host "Creating milestone: $Title"
        Invoke-Gh api "repos/$Repo/milestones" --method POST --field title="$Title" | Out-Null
    }
}

function Resolve-Assignee {
    param(
        [string]$Assignee
    )
    if ([string]::IsNullOrWhiteSpace($Assignee)) { return $null }

    # Skip placeholders commonly used in planning CSVs
    $placeholders = @("product-owner","repo-maintainer","iis-admin","qa-owner","build-owner","infra-owner")
    if ($placeholders -contains $Assignee) {
        Write-Warning "Skipping placeholder assignee: $Assignee"
        return $null
    }

    try {
        $null = Invoke-Gh api "users/$Assignee" 2>$null
        return $Assignee
    } catch {
        Write-Warning "Assignee not found on GitHub, skipping: $Assignee"
        return $null
    }
}

Test-GhReady

if (-not (Test-Path $CsvPath)) {
    throw "CSV not found at path: $CsvPath"
}

$rows = Import-Csv -Path $CsvPath
if (-not $rows -or $rows.Count -eq 0) {
    throw "CSV has no rows: $CsvPath"
}

Write-Host "Loaded $($rows.Count) rows from $CsvPath"
Write-Host "Target repo: $Repo"
Write-Host "GitHub CLI: $script:GhExe"
if ($DryRun) { Write-Host "DRY RUN enabled: no issues will be created." }

$created = 0
$skipped = 0

foreach ($row in $rows) {
    $title = $row.title
    $body = $row.body
    $milestone = $row.milestone
    $assigneeRaw = $row.assignee
    $labelsRaw = $row.labels

    if ([string]::IsNullOrWhiteSpace($title) -or [string]::IsNullOrWhiteSpace($body)) {
        Write-Warning "Skipping row with missing title/body."
        $skipped++
        continue
    }

    # Avoid duplicates by exact title match
    $search = Invoke-Gh issue list --repo $Repo --state all --search """$title"" in:title" --json "title,number" | ConvertFrom-Json
    $already = $search | Where-Object { $_.title -eq $title } | Select-Object -First 1
    if ($already) {
        Write-Warning "Issue already exists (#$($already.number)): $title"
        $skipped++
        continue
    }

    $labels = @()
    if (-not [string]::IsNullOrWhiteSpace($labelsRaw)) {
        $labels = $labelsRaw.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
    }

    if ($DryRun) {
        $assignee = Resolve-Assignee -Assignee $assigneeRaw
        Write-Host "Would create: $title"
        Write-Host "  Milestone: $milestone"
        Write-Host "  Assignee: $assignee"
        Write-Host "  Labels: $($labels -join ', ')"
        $created++
        continue
    }

    foreach ($lbl in $labels) {
        Ensure-Label -Repo $Repo -Name $lbl
    }

    Ensure-Milestone -Repo $Repo -Title $milestone
    $assignee = Resolve-Assignee -Assignee $assigneeRaw

    $tmp = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tmp -Value $body -Encoding UTF8

    try {
        $args = @(
            "issue", "create",
            "--repo", $Repo,
            "--title", $title,
            "--body-file", $tmp
        )

        if (-not [string]::IsNullOrWhiteSpace($milestone)) {
            $args += @("--milestone", $milestone)
        }

        if ($assignee) {
            $args += @("--assignee", $assignee)
        }

        foreach ($lbl in $labels) {
            $args += @("--label", $lbl)
        }

        $url = Invoke-Gh @args
        if ([string]::IsNullOrWhiteSpace(($url | Out-String).Trim())) {
            throw "Issue creation returned no URL for title: $title"
        }
        Write-Host "Created: $url"
        $created++
    }
    finally {
        Remove-Item $tmp -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "Done."
Write-Host "Created/processed: $created"
Write-Host "Skipped: $skipped"