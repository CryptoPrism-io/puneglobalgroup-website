$plugin = Join-Path $PSScriptRoot '..\..\.company-private\tools\session-manager-plugin\bin'
$env:PATH = "$plugin;$env:PATH"

aws ssm start-session `
  --region ap-south-1 `
  --target i-00874f0cc21796de6 `
  --document-name AWS-StartPortForwardingSession `
  --parameters 'portNumber=3001,localPortNumber=13001'
