# Obsidian - Extract and Synchronize Tor Onion Hidden Service Targets
Write-Host "=== Obsidian Tor Hidden Service Discovery ===" -ForegroundColor Cyan

$services = @("testbed", "market-a", "market-b", "market-c", "forum-a", "forum-b", "escrow")
$targets = @{}
$foundCount = 0

foreach ($svc in $services) {
    try {
        $onion = (docker exec obsidian-tor cat /var/lib/tor/$svc/hostname 2>$null).Trim()
        if ($onion -like "*.onion") {
            $targets[$svc] = $onion
            $foundCount++
            Write-Host " [+] $svc : $onion" -ForegroundColor Green
        } else {
            Write-Host " [!] $svc : Not generated yet (Tor may still be bootstrapping)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " [-] $svc : Error contacting container obsidian-tor" -ForegroundColor Red
    }
}

if ($foundCount -gt 0) {
    # Save to backend/onion_targets.json
    $jsonContent = $targets | ConvertTo-Json -Depth 2
    Set-Content -Path "backend/onion_targets.json" -Value $jsonContent -Encoding UTF8
    Write-Host "`nSaved $foundCount targets to backend/onion_targets.json" -ForegroundColor Cyan
    
    # Run onion_manager.py to update cross-onion HTML links in testbed
    if (Get-Command python -ErrorAction SilentlyContinue) {
        python backend/onion_manager.py
    }
} else {
    Write-Host "`nNo onion addresses found. Ensure container 'obsidian-tor' is running (docker ps)." -ForegroundColor Yellow
}
