# 🛠️ Outlook Add-in Installation Troubleshooting

## Common "Installation Failed" Fixes

### 1. **Clear Outlook Cache**
```bash
# Windows
%LOCALAPPDATA%\Microsoft\Outlook\16.0\Wef\
# Delete all files in this folder

# Mac
~/Library/Group Containers/UBF8T346G9.Office/User Content.localized/Add-Ins/
# Delete all files in this folder
```

### 2. **Reset Office Add-ins**
```bash
# Windows Registry
reg delete "HKCU\Software\Microsoft\Office\16.0\WEF" /f
reg delete "HKCU\Software\Microsoft\Office\16.0\Outlook\WebExt" /f

# Then restart Outlook
```

### 3. **Enable Developer Mode**
1. **Outlook Desktop** → **File** → **Options**
2. **Trust Center** → **Trust Center Settings**
3. **Add-in Security** → Check all developer options
4. **Macro Settings** → Enable all macros

### 4. **Use Network Share Method**
```bash
# Create network-accessible manifest
mkdir /tmp/outlook-manifests
cp outlook-addin/manifest-local.xml /tmp/outlook-manifests/
```

Then in Outlook:
- **File** → **Manage Add-ins** → **My Add-ins**
- **Add a custom add-in** → **Add from URL**
- Enter: `file:///tmp/outlook-manifests/manifest-local.xml`

### 5. **Alternative: Use Production URL**
If localhost doesn't work, use the production manifest:
```xml
<!-- Use outlook-addin/manifest.xml instead -->
<!-- Points to your deployed Vercel app -->
```

## Platform-Specific Solutions

### **Windows:**
1. Run as Administrator
2. Disable Windows Defender temporarily
3. Check Windows Firewall settings

### **Mac:**
1. Check System Preferences → Security & Privacy
2. Allow apps from "App Store and identified developers"
3. Use Keychain Access to trust certificates

### **Web Version (Recommended):**
- Always works regardless of desktop issues
- No security restrictions
- Immediate installation
- Cross-platform compatibility

## Verification Steps

### Check if Installation Worked:
1. **Outlook Desktop:** Look for "Emineon ATS" in ribbon
2. **Outlook Web:** Check add-ins panel
3. **Test URL:** Visit http://localhost:3000/outlook-addin/taskpane.html

### Debug Network Issues:
```bash
# Test if your app is accessible
curl http://localhost:3000/api/health
curl http://localhost:3000/outlook-addin/taskpane.html
```

## Quick Fix Commands

```bash
# Restart everything
pkill -f "Microsoft Outlook"
pkill -f "next dev"
PORT=3000 npm run dev

# Test manifest validity
curl -I http://localhost:3000/outlook-addin/manifest-local.xml
```

## Still Not Working?

**Use the production version instead:**
1. Use `outlook-addin/manifest.xml` (production URLs)
2. The add-in will work with your deployed Vercel app
3. No localhost issues to deal with

**Or try the web version:**
- Go to outlook.office.com
- Much more reliable for development
- Same functionality as desktop
