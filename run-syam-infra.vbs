Set WshShell = CreateObject("WScript.Shell")

' Get current directory of VBS script
strPath = Wscript.ScriptFullName
Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objFile = objFSO.GetFile(strPath)
strFolder = objFSO.GetParentFolderName(objFile)

' Change working directory to the project folder
WshShell.CurrentDirectory = strFolder

' Run Node Backend silently
WshShell.Run "cmd.exe /c node server.js", 0, False

' Run Vite Frontend silently
WshShell.Run "cmd.exe /c npm run dev", 0, False
