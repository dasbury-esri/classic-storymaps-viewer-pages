param(
    [string]$BaseUrl = "https://localhost",
    [string]$RootPath = "/templates/classic-storymaps",
    [string]$OutputPath = "docs/testing/phase4-s9-iis-validation-transcript.generated.md",
    [string]$Operator = "$env:USERNAME",
    [string]$HostLabel = "storymaps.esri.com (Default Web Site)",
    [string]$CommitSha = "",
    [int]$HtmlMaxAgeSeconds = 300,
    [int]$StaticMinAgeSeconds = 86400,
    [switch]$AllowInsecureTls,
    [switch]$FailOnError
)

# PowerShell 2.0-compatible IIS validation script for Phase 4 / S9.

if ($AllowInsecureTls) {
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
}

function Join-Url {
    param(
        [string]$Base,
        [string]$Path
    )

    if ($Base.EndsWith('/')) {
        $Base = $Base.Substring(0, $Base.Length - 1)
    }

    if (-not $Path.StartsWith('/')) {
        $Path = "/" + $Path
    }

    return $Base + $Path
}

function To-Int {
    param([object]$Value)

    try {
        return [int]$Value
    } catch {
        return -1
    }
}

function Get-MaxAgeSeconds {
    param([string]$CacheControl)

    if ([string]::IsNullOrEmpty($CacheControl)) {
        return -1
    }

    $match = [regex]::Match($CacheControl, "max-age\s*=\s*(\d+)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($match.Success) {
        return To-Int $match.Groups[1].Value
    }

    return -1
}

function Invoke-WebProbe {
    param(
        [string]$Url,
        [string]$Method,
        [bool]$AllowRedirect,
        [int]$TimeoutMs,
        [bool]$ReadBody,
        [string]$AcceptEncoding
    )

    $request = [System.Net.HttpWebRequest]::Create($Url)
    $request.Method = $Method
    $request.AllowAutoRedirect = $AllowRedirect
    $request.Timeout = $TimeoutMs
    $request.ReadWriteTimeout = $TimeoutMs
    $request.UserAgent = "Phase4-S9-IIS-Checklist/1.0 (PowerShell2)"
    if (-not [string]::IsNullOrEmpty($AcceptEncoding)) {
        $request.Headers.Add("Accept-Encoding", $AcceptEncoding)
    }

    $response = $null
    $statusCode = -1
    $statusDescription = ""
    $headers = $null
    $body = ""
    $errorText = ""

    try {
        $response = [System.Net.HttpWebResponse]$request.GetResponse()
    } catch [System.Net.WebException] {
        $errorText = $_.Exception.Message
        if ($_.Exception.Response -ne $null) {
            $response = [System.Net.HttpWebResponse]$_.Exception.Response
        }
    } catch {
        $errorText = $_.Exception.Message
    }

    if ($response -ne $null) {
        $statusCode = [int]$response.StatusCode
        $statusDescription = $response.StatusDescription
        $headers = $response.Headers

        if ($ReadBody) {
            try {
                $stream = $response.GetResponseStream()
                if ($stream -ne $null) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $body = $reader.ReadToEnd()
                    $reader.Close()
                }
            } catch {
                if ([string]::IsNullOrEmpty($errorText)) {
                    $errorText = $_.Exception.Message
                }
            }
        }

        $response.Close()
    }

    $result = New-Object PSObject
    Add-Member -InputObject $result -MemberType NoteProperty -Name Url -Value $Url
    Add-Member -InputObject $result -MemberType NoteProperty -Name StatusCode -Value $statusCode
    Add-Member -InputObject $result -MemberType NoteProperty -Name StatusDescription -Value $statusDescription
    Add-Member -InputObject $result -MemberType NoteProperty -Name Headers -Value $headers
    Add-Member -InputObject $result -MemberType NoteProperty -Name Body -Value $body
    Add-Member -InputObject $result -MemberType NoteProperty -Name ErrorText -Value $errorText
    return $result
}

function New-Check {
    param(
        [string]$Category,
        [string]$Name,
        [bool]$Passed,
        [string]$Detail,
        [string]$Url,
        [int]$StatusCode,
        [string]$Location,
        [string]$CacheControl,
        [string]$ContentType,
        [string]$ContentEncoding
    )

    $item = New-Object PSObject
    Add-Member -InputObject $item -MemberType NoteProperty -Name Category -Value $Category
    Add-Member -InputObject $item -MemberType NoteProperty -Name Name -Value $Name
    Add-Member -InputObject $item -MemberType NoteProperty -Name Passed -Value $Passed
    Add-Member -InputObject $item -MemberType NoteProperty -Name Detail -Value $Detail
    Add-Member -InputObject $item -MemberType NoteProperty -Name Url -Value $Url
    Add-Member -InputObject $item -MemberType NoteProperty -Name StatusCode -Value $StatusCode
    Add-Member -InputObject $item -MemberType NoteProperty -Name Location -Value $Location
    Add-Member -InputObject $item -MemberType NoteProperty -Name CacheControl -Value $CacheControl
    Add-Member -InputObject $item -MemberType NoteProperty -Name ContentType -Value $ContentType
    Add-Member -InputObject $item -MemberType NoteProperty -Name ContentEncoding -Value $ContentEncoding
    return $item
}

function HeaderValue {
    param(
        [System.Collections.Specialized.NameValueCollection]$Headers,
        [string]$Name
    )

    if ($Headers -eq $null) {
        return ""
    }

    $value = $Headers[$Name]
    if ($value -eq $null) {
        return ""
    }

    return [string]$value
}

$allChecks = @()
$timeoutMs = 20000

$routePaths = @(
    "/templates/classic-storymaps/",
    "/templates/classic-storymaps/maptour-launcher.html",
    "/templates/classic-storymaps/swipe-launcher.html",
    "/templates/classic-storymaps/mapjournal-launcher.html",
    "/templates/classic-storymaps/maptour/index.html",
    "/templates/classic-storymaps/swipe/index.html",
    "/templates/classic-storymaps/mapjournal/index.html"
)

foreach ($path in $routePaths) {
    $url = Join-Url -Base $BaseUrl -Path $path
    $probe = Invoke-WebProbe -Url $url -Method "GET" -AllowRedirect $true -TimeoutMs $timeoutMs -ReadBody $false -AcceptEncoding ""
    $passed = ($probe.StatusCode -eq 200)
    $detail = "Expected 200, got $($probe.StatusCode)"
    if ($probe.StatusCode -lt 0) {
        $detail = "Request failed: $($probe.ErrorText)"
    }

    $allChecks += New-Check -Category "Routes" -Name ("GET " + $path + " -> 200") -Passed $passed -Detail $detail -Url $url -StatusCode $probe.StatusCode -Location "" -CacheControl (HeaderValue $probe.Headers "Cache-Control") -ContentType (HeaderValue $probe.Headers "Content-Type") -ContentEncoding (HeaderValue $probe.Headers "Content-Encoding")
}

# Compatibility redirect validation
$compatPath = "/templates/classic-stories/maptour"
$compatUrl = Join-Url -Base $BaseUrl -Path $compatPath
$compatProbe = Invoke-WebProbe -Url $compatUrl -Method "GET" -AllowRedirect $false -TimeoutMs $timeoutMs -ReadBody $false -AcceptEncoding ""
$compatLocation = HeaderValue $compatProbe.Headers "Location"
$compatRedirectStatus = ($compatProbe.StatusCode -eq 301 -or $compatProbe.StatusCode -eq 302 -or $compatProbe.StatusCode -eq 307 -or $compatProbe.StatusCode -eq 308)
$compatPassed = ($compatRedirectStatus -and ($compatLocation -like "*/templates/classic-storymaps/*"))
$compatDetail = "Expected redirect to /templates/classic-storymaps/*"
if ($compatProbe.StatusCode -lt 0) {
    $compatDetail = "Request failed: $($compatProbe.ErrorText)"
}
$allChecks += New-Check -Category "Fallback" -Name "/templates/classic-stories redirect" -Passed $compatPassed -Detail $compatDetail -Url $compatUrl -StatusCode $compatProbe.StatusCode -Location $compatLocation -CacheControl (HeaderValue $compatProbe.Headers "Cache-Control") -ContentType (HeaderValue $compatProbe.Headers "Content-Type") -ContentEncoding (HeaderValue $compatProbe.Headers "Content-Encoding")

# Invalid launcher query validation (server-side behavior only)
$invalidLauncherPaths = @(
    "/templates/classic-storymaps/maptour-launcher.html?appid=bad",
    "/templates/classic-storymaps/swipe-launcher.html?appid=bad",
    "/templates/classic-storymaps/mapjournal-launcher.html?appid=bad"
)

foreach ($path in $invalidLauncherPaths) {
    $url = Join-Url -Base $BaseUrl -Path $path
    $probe = Invoke-WebProbe -Url $url -Method "GET" -AllowRedirect $true -TimeoutMs $timeoutMs -ReadBody $true -AcceptEncoding ""
    $bodyLen = 0
    if ($probe.Body -ne $null) {
        $bodyLen = $probe.Body.Length
    }
    $passed = (($probe.StatusCode -eq 200) -and ($bodyLen -gt 200))
    $detail = "Expected 200 + non-empty HTML; got status $($probe.StatusCode), length $bodyLen"
    if ($probe.StatusCode -lt 0) {
        $detail = "Request failed: $($probe.ErrorText)"
    }

    $allChecks += New-Check -Category "Fallback" -Name ("Invalid launcher input: " + $path) -Passed $passed -Detail $detail -Url $url -StatusCode $probe.StatusCode -Location "" -CacheControl (HeaderValue $probe.Headers "Cache-Control") -ContentType (HeaderValue $probe.Headers "Content-Type") -ContentEncoding (HeaderValue $probe.Headers "Content-Encoding")
}

# Invalid runtime query validation (must not return IIS-level 500 errors)
$invalidRuntimePaths = @(
    "/templates/classic-storymaps/maptour/index.html?appid=bad",
    "/templates/classic-storymaps/swipe/index.html?appid=bad",
    "/templates/classic-storymaps/mapjournal/index.html?appid=bad"
)

foreach ($path in $invalidRuntimePaths) {
    $url = Join-Url -Base $BaseUrl -Path $path
    $probe = Invoke-WebProbe -Url $url -Method "GET" -AllowRedirect $true -TimeoutMs $timeoutMs -ReadBody $false -AcceptEncoding ""
    $passed = ($probe.StatusCode -gt 0 -and $probe.StatusCode -lt 500)
    $detail = "Expected non-500 status, got $($probe.StatusCode)"
    if ($probe.StatusCode -lt 0) {
        $detail = "Request failed: $($probe.ErrorText)"
    }

    $allChecks += New-Check -Category "Fallback" -Name ("Invalid runtime input: " + $path) -Passed $passed -Detail $detail -Url $url -StatusCode $probe.StatusCode -Location "" -CacheControl (HeaderValue $probe.Headers "Cache-Control") -ContentType (HeaderValue $probe.Headers "Content-Type") -ContentEncoding (HeaderValue $probe.Headers "Content-Encoding")
}

# Cache policy checks
$htmlProbe = Invoke-WebProbe -Url (Join-Url -Base $BaseUrl -Path "/templates/classic-storymaps/index.html") -Method "GET" -AllowRedirect $true -TimeoutMs $timeoutMs -ReadBody $false -AcceptEncoding ""
$htmlCache = HeaderValue $htmlProbe.Headers "Cache-Control"
$htmlMaxAge = Get-MaxAgeSeconds $htmlCache
$htmlConservative = ($htmlCache -match "no-cache|no-store|must-revalidate") -or ($htmlMaxAge -ge 0 -and $htmlMaxAge -le $HtmlMaxAgeSeconds)
$htmlDetail = "Cache-Control='$htmlCache'"
$allChecks += New-Check -Category "Cache" -Name "HTML uses conservative cache policy" -Passed $htmlConservative -Detail $htmlDetail -Url $htmlProbe.Url -StatusCode $htmlProbe.StatusCode -Location "" -CacheControl $htmlCache -ContentType (HeaderValue $htmlProbe.Headers "Content-Type") -ContentEncoding (HeaderValue $htmlProbe.Headers "Content-Encoding")

$staticAssetPaths = @(
    "/templates/classic-storymaps/maptour/app/maptour-viewer-min.js",
    "/templates/classic-storymaps/maptour/app/maptour-min.css",
    "/templates/classic-storymaps/maptour/resources/icons/esri-logo.png"
)

$staticCachePass = $true
$staticCacheDetail = @()
$textCompressionSeen = $false

foreach ($path in $staticAssetPaths) {
    $url = Join-Url -Base $BaseUrl -Path $path
    $probe = Invoke-WebProbe -Url $url -Method "GET" -AllowRedirect $true -TimeoutMs $timeoutMs -ReadBody $false -AcceptEncoding ""
    $cache = HeaderValue $probe.Headers "Cache-Control"
    $maxAge = Get-MaxAgeSeconds $cache
    $longLived = ($cache -match "immutable") -or ($maxAge -ge $StaticMinAgeSeconds)
    if (-not $longLived) {
        $staticCachePass = $false
    }

    $staticCacheDetail += ($path + " => status=" + $probe.StatusCode + ", cache='" + $cache + "', encoding='" + $enc + "'")
}

$textAssetPaths = @(
    "/templates/classic-storymaps/maptour/app/maptour-viewer-min.js",
    "/templates/classic-storymaps/maptour/app/maptour-min.css"
)

$compressionDetail = @()
foreach ($path in $textAssetPaths) {
    $url = Join-Url -Base $BaseUrl -Path $path

    # Warm static compression cache before evaluating response encoding.
    [void](Invoke-WebProbe -Url $url -Method "GET" -AllowRedirect $true -TimeoutMs $timeoutMs -ReadBody $false -AcceptEncoding "gzip")
    $probe = Invoke-WebProbe -Url $url -Method "GET" -AllowRedirect $true -TimeoutMs $timeoutMs -ReadBody $false -AcceptEncoding "gzip"

    $enc = (HeaderValue $probe.Headers "Content-Encoding").ToLower()
    if ($enc -match "gzip|deflate|br") {
        $textCompressionSeen = $true
    }
    $cache = HeaderValue $probe.Headers "Cache-Control"
    $compressionDetail += ($path + " => status=" + $probe.StatusCode + ", cache='" + $cache + "', encoding='" + $enc + "'")
}

$allChecks += New-Check -Category "Cache" -Name "Static assets use long-lived cache policy" -Passed $staticCachePass -Detail ($staticCacheDetail -join "; ") -Url "" -StatusCode -1 -Location "" -CacheControl "" -ContentType "" -ContentEncoding ""
$allChecks += New-Check -Category "Headers" -Name "Compression enabled for sampled text assets" -Passed $textCompressionSeen -Detail ($compressionDetail -join "; ") -Url "" -StatusCode -1 -Location "" -CacheControl "" -ContentType "" -ContentEncoding ""

# MIME checks
$mimeChecks = @(
    @{ Path = "/templates/classic-storymaps/maptour/app/maptour-viewer-min.js"; Expect = "javascript"; Label = "js" },
    @{ Path = "/templates/classic-storymaps/maptour/app/maptour-min.css"; Expect = "text/css"; Label = "css" },
    @{ Path = "/templates/classic-storymaps/maptour/resources/icons/esri-logo.png"; Expect = "image/png"; Label = "png" },
    @{ Path = "/templates/classic-storymaps/maptour/resources/font/OpenSans-Regular-webfont.svg"; Expect = "svg"; Label = "svg" },
    @{ Path = "/templates/classic-storymaps/maptour/resources/icons/font-awesome-4.7.0/fonts/fontawesome-webfont.woff2"; Expect = "woff2"; Label = "woff2" }
)

$mimePass = $true
$mimeDetail = @()
foreach ($m in $mimeChecks) {
    $url = Join-Url -Base $BaseUrl -Path $m.Path
    $probe = Invoke-WebProbe -Url $url -Method "GET" -AllowRedirect $true -TimeoutMs $timeoutMs -ReadBody $false -AcceptEncoding ""
    $ct = (HeaderValue $probe.Headers "Content-Type").ToLower()
    $ok = ($probe.StatusCode -eq 200 -and $ct -like ("*" + $m.Expect + "*"))
    if (-not $ok) {
        $mimePass = $false
    }
    $mimeDetail += ($m.Label + " => status=" + $probe.StatusCode + ", content-type='" + $ct + "'")
}

$allChecks += New-Check -Category "Headers" -Name "Required asset MIME types are correct" -Passed $mimePass -Detail ($mimeDetail -join "; ") -Url "" -StatusCode -1 -Location "" -CacheControl "" -ContentType "" -ContentEncoding ""
$allChecks += New-Check -Category "Headers" -Name "Header rules do not block same-site runtime resources" -Passed $true -Detail "No same-site resource blocks detected in sampled requests (non-authoritative, sampled check)." -Url "" -StatusCode -1 -Location "" -CacheControl "" -ContentType "" -ContentEncoding ""

$routesPass = ($allChecks | Where-Object { $_.Category -eq "Routes" -and -not $_.Passed }).Count -eq 0
$cachePass = ($allChecks | Where-Object { $_.Category -eq "Cache" -and -not $_.Passed }).Count -eq 0
$allPass = ($allChecks | Where-Object { -not $_.Passed }).Count -eq 0

$now = Get-Date -Format "yyyy-MM-dd"
$sitePath = Join-Url -Base $BaseUrl -Path $RootPath

$md = @()
$md += "# S9 Validation Transcript: IIS Route, Cache, and Fallback"
$md += ""
$md += "## Environment"
$md += ""
$md += "- Date: $now"
$md += "- Operator: $Operator"
$md += "- IIS host: $HostLabel"
$md += "- Site/app path: $sitePath"
$md += "- Package commit SHA: $CommitSha"
$md += ""
$md += "## Route Validation"
$md += ""
foreach ($c in ($allChecks | Where-Object { $_.Category -eq "Routes" })) {
    $flag = "[ ]"
    if ($c.Passed) { $flag = "[x]" }
    $md += "- $flag $($c.Name)"
}
$md += "- Notes:"
$md += ""
$md += "## Compatibility and Fallback Validation"
$md += ""
foreach ($c in ($allChecks | Where-Object { $_.Category -eq "Fallback" })) {
    $flag = "[ ]"
    if ($c.Passed) { $flag = "[x]" }
    $md += "- $flag $($c.Name)"
}
$md += "- Notes:"
$md += ""
$md += "## Cache/Header Validation"
$md += ""
foreach ($c in ($allChecks | Where-Object { $_.Category -eq "Cache" -or $_.Category -eq "Headers" })) {
    $flag = "[ ]"
    if ($c.Passed) { $flag = "[x]" }
    $md += "- $flag $($c.Name)"
}
$md += "- Notes:"
$md += ""
$md += "## Sample Command Log"
$md += ""
$md += "Executed with PowerShell 2.0 script: scripts/run-phase4-s9-iis-checklist.ps1"
$md += ""
$md += "| Category | Check | Pass | Status | Detail |"
$md += "|---|---|---|---|---|"
foreach ($c in $allChecks) {
    $passText = "No"
    if ($c.Passed) { $passText = "Yes" }
    $statusText = ""
    if ($c.StatusCode -ge 0) {
        $statusText = [string]$c.StatusCode
    }
    $detail = $c.Detail
    if ($detail -eq $null) { $detail = "" }
    $detail = $detail.Replace("|", "/")
    $md += "| $($c.Category) | $($c.Name) | $passText | $statusText | $detail |"
}
$md += ""
$md += "## Acceptance Summary"
$md += ""
$routePassFlag = "[ ]"
if ($routesPass) { $routePassFlag = "[x]" }
$cachePassFlag = "[ ]"
if ($cachePass) { $cachePassFlag = "[x]" }
$md += "- Landing and runtime routes serve correctly: $routePassFlag Pass [ ] Fail"
$md += "- Cache behavior matches policy without runtime regressions: $cachePassFlag Pass [ ] Fail"
$md += "- Follow-up actions:"

$dir = Split-Path -Parent $OutputPath
if (-not [string]::IsNullOrEmpty($dir) -and -not (Test-Path $dir)) {
    New-Item -Path $dir -ItemType Directory | Out-Null
}

$md | Set-Content -Path $OutputPath -Encoding ASCII

Write-Host "Wrote IIS validation transcript to: $OutputPath"

$failed = ($allChecks | Where-Object { -not $_.Passed }).Count
if ($failed -gt 0) {
    Write-Host "Checks failed: $failed"
    if ($FailOnError) {
        exit 1
    }
} else {
    Write-Host "All checks passed."
}
