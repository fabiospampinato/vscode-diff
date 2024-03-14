# Diff

<p align="center">
  <img src="https://raw.githubusercontent.com/fabiospampinato/vscode-diff/master/resources/logo.png" width="128" alt="Logo">
</p>

Diff 2 opened files with ease. Because running `code --diff path1 path2` is too slow.

## Install

Follow the instructions in the [Marketplace](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-diff), or run the following in the command palette:

```shell
ext install fabiospampinato.vscode-diff
```

## Usage

It adds 1 command to the command palette:

```js
'Diff: File' // Diff the current file against another one
```

## Settings

```js
{
  "diff.exclude": null, // An array of globs to exclude, unless specificed it uses the "files.exclude" setting
  "diff.ignore": [".gitignore"], // An array of names for .gitignore-like files to use
  "diff.include": ["**/*"], // An array of globs to include
}
```

## Hints

- **Diff against previous versions**: sometimes diffing against open files is not what you want, try [Git File History](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-git-history) for diffing against previous versions of the current file.

## License

MIT © Fabio Spampinato
