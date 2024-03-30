### Version 2.1.2
- Updated dependencies, finding files a bit faster

### Version 2.1.1
- Optimized handling of .gitignore-like files, finding files to diff against faster

### Version 2.1.0
- New settings: "diff.showUntitledFiles", "diff.showOpenFiles" and "diff.showFoundFiles"
- New setting: "diff.showFoundRelativeFiles"

### Version 2.0.0
- Rewitten: more modern code, almost no third-party dependencies, 99% smaller bundle
- Removed donation popup, thank you for your support!
- New setting: "diff.exclude", for overriding the default exclude globs
- New setting: "diff.include", for overriding the default include globs
- New setting: "diff.ignore", for overriding the default list of files to treat as .gitignore-like files
- Added support for diffing against untitled files
- Added support for listing currently open files first, for convenience
- Added support for diffing between binary files, to the extent that vscode itself supports this

### Version 1.4.2
- Added a dialog announcing the fundraising

### Version 1.4.1
- Update .github/FUNDING.yml
- Deleted repo-level github funding.yml
- Ensuring files with the same name can be distinguished in the diff editor

### Version 1.4.0
- Removed binary files from the quickpick

### Version 1.3.6
- Readme: using hi-res logo

### Version 1.3.5
- Outputting modern code (es2017, faster)
- Using "Debug Launcher" for debugging

### Version 1.3.4
- Bundling with webpack

### Version 1.3.3
- Displaying an error when there’s no file opened

### Version 1.3.2
- Updated readme

### Version 1.3.1
- Added an hint about Git File History

### Version 1.3.0
- Using the native `vscode.diff` command

### Version 1.2.0
- Using a sorting algorithm that produces more predictable results
- Reusing the window
- Added support for files located outside the root path

### Version 1.1.1
- Added a placeholder to the quickpick

### Version 1.1.0
- Prompting for the second file instead
- Commands: exporting `diff`

### Version 1.0.0
- Initial release
