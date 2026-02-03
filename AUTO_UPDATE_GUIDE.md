# Auto-Update Implementation Guide for Reox POS

## Overview
This implementation adds automatic update checking and notification for your Electron app using `electron-updater`. When developers push updates to the GitHub repository, installed apps will detect and notify users about available updates.

## Architecture

### Update Flow
1. App checks for updates on startup and periodically
2. When update is found, notification appears
3. User can choose to download and install
4. Update downloads in background
5. User prompted to restart and install
6. App auto-updates and restarts

## Installation Steps

### Step 1: Install Dependencies

```bash
npm install electron-updater --save
```

### Step 2: Update electron-builder.json

The configuration has been updated to include:
- Auto-update publish settings
- GitHub repository details
- Update channel configuration

### Step 3: Update Main Process (electron/main.cjs)

Added auto-updater functionality:
- Check for updates on app start
- Periodic update checks (every 4 hours)
- IPC handlers for update actions
- Progress tracking

### Step 4: Create Update Notification Component

React component (`UpdateNotification.tsx`) that shows:
- Update available notification
- Download progress
- Install prompt

### Step 5: Release Process

To release updates:

1. **Update version in package.json**:
   ```json
   "version": "1.0.1"
   ```

2. **Build the app**:
   ```bash
   npm run electron:build
   ```

3. **Create GitHub Release**:
   - Go to: https://github.com/1000D-Technology/reox_pos_frontend/releases
   - Click "Create a new release"
   - Tag version: `v1.0.1`
   - Release title: `Reox POS v1.0.1`
   - Upload the files from `release/` folder:
     - `Reox-POS-Setup-1.0.1.exe`
     - `latest.yml` (auto-generated)

4. **Publish the release**

## How It Works

### For Users:
1. App automatically checks for updates
2. Notification appears when update is available
3. Click "Download Update"
4. Progress shown during download
5. Click "Install & Restart" when ready
6. App updates and relaunches

### For Developers:
1. Make your code changes
2. Commit and push to master
3. Update version number
4. Build the app
5. Create GitHub release with files
6. All installed apps will detect the update

## Update Channels

- **Production**: Uses `master` branch releases
- **Beta**: Can be configured for testing

## Testing

### Development Testing:
```bash
npm run electron:dev
```

### Production Build Testing:
```bash
npm run electron:build
cd release
# Install the app
# Make a version bump and new release
# Run the installed app to test updates
```

## Security

- Updates use code signing (configure in electron-builder.json)
- HTTPS for downloads from GitHub
- SHA512 checksums verified automatically

## Troubleshooting

### Updates Not Detecting:
- Check GitHub releases are public
- Verify `latest.yml` is uploaded
- Check version in package.json is higher than installed

### Download Fails:
- Check internet connection
- Verify GitHub releases accessibility
- Check console for errors

## Configuration Options

### Auto-Update Frequency:
Edit in `main.cjs`:
```javascript
const UPDATE_CHECK_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
```

### Disable Auto-Check:
```javascript
// Remove or comment out:
checkForUpdatesScheduled();
```

## IPC Communication

### From Renderer to Main:
- `check-for-updates`: Manual update check
- `download-update`: Start download
- `install-update`: Install and restart

### From Main to Renderer:
- `update-available`: Update found
- `update-not-available`: No updates
- `update-error`: Error occurred
- `download-progress`: Download progress
- `update-downloaded`: Ready to install

## Files Modified/Created

1. ✅ `electron-builder.json` - Updated with publish config
2. ✅ `electron/main.cjs` - Added auto-updater logic
3. ✅ `electron/preload.cjs` - Added update IPC bridges
4. ✅ `src/components/UpdateNotification.tsx` - Update UI
5. ✅ `src/App.tsx` - Integration point
6. ✅ `AUTO_UPDATE_GUIDE.md` - This documentation

## Best Practices

1. **Version Numbering**: Use semantic versioning (MAJOR.MINOR.PATCH)
2. **Release Notes**: Always include what's new
3. **Testing**: Test updates thoroughly before release
4. **Staged Rollout**: Consider beta testing with small group first
5. **Rollback Plan**: Keep previous versions accessible

## Support

For issues or questions:
- Check GitHub issues
- Review electron-updater docs
- Check app logs in: `%APPDATA%/Reox POS/logs`

## Next Steps

1. Install electron-updater package
2. Configure code signing certificate (optional but recommended)
3. Test update flow with dummy releases
4. Document release process for team
5. Set up CI/CD for automated builds (optional)
