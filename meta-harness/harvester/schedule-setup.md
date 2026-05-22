# Windows Task Scheduler 설정

## 사전 조건

Python 경로 확인:
```powershell
(Get-Command python).Source
```
예: `C:\Python312\python.exe`

## 작업 등록 (PowerShell)

경로를 실제 환경에 맞게 수정 후 실행:

```powershell
$pythonExe  = (Get-Command python).Source
$scriptPath = "C:\Users\acrof\DEV\meta-harness\harvester\harvest.py"
$workDir    = "C:\Users\acrof\DEV\meta-harness"

$action  = New-ScheduledTaskAction -Execute $pythonExe -Argument $scriptPath -WorkingDirectory $workDir
$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 15) -Once -At (Get-Date)

Register-ScheduledTask `
  -TaskName "meta-harness-harvester" `
  -Action $action `
  -Trigger $trigger `
  -Description "Claude Code log harvester — runs every 15 minutes"
```

## 확인

```powershell
Get-ScheduledTask -TaskName "meta-harness-harvester" | Select-Object TaskName, State
```

## 수동 실행 테스트

```powershell
Start-ScheduledTask -TaskName "meta-harness-harvester"
Start-Sleep -Seconds 3
Get-ChildItem C:\Users\acrof\DEV\meta-harness\harvested\
```

오늘 날짜 `.jsonl` 파일이 보이면 정상.

## 제거

```powershell
Unregister-ScheduledTask -TaskName "meta-harness-harvester" -Confirm:$false
```
