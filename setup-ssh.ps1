# Setup SSH Key Auth for Digital Ocean Server
# Run this script manually: powershell -ExecutionPolicy Bypass -File setup-ssh.ps1

$server = "178.128.127.161"
$pubKey = Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SSH Key Setup for $server" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will add your SSH key to the server." -ForegroundColor Yellow
Write-Host "You will be prompted for the root password ONCE." -ForegroundColor Yellow
Write-Host "After this, you can SSH without a password." -ForegroundColor Yellow
Write-Host ""

# Use ssh with the command to append key
$cmd = "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$pubKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'SSH KEY ADDED SUCCESSFULLY'"

ssh -o StrictHostKeyChecking=yes -o UserKnownHostsFile=~/.ssh/known_hosts root@$server $cmd

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! Testing key-based login..." -ForegroundColor Green
    ssh -o BatchMode=yes root@$server "echo 'Key auth working! Ready for deployment.'"
}
