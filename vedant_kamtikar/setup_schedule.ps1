$action = New-ScheduledTaskAction -Execute "C:\Users\LOQ\AppData\Local\Programs\Python\Python313\python.exe" -Argument "main.py" -WorkingDirectory "C:\Users\LOQ\Desktop\Assistant"
$triggerMorning = New-ScheduledTaskTrigger -Daily -At "8:00AM"
$triggerNight = New-ScheduledTaskTrigger -Daily -At "8:00PM"

Register-ScheduledTask -TaskName "AcademicAssistant_DailyBriefing" -Action $action -Trigger @($triggerMorning, $triggerNight) -Description "Daily Morning (8:00 AM) and Night (8:00 PM) Academic Briefing" -Force
