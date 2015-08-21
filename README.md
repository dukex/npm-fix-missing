# NPM Update

## Install

```
$ npm install dukex/npm-update
```

## Usage

By default npm update respect your package.json, the command `npm-update` will only update new acceptable packages. This is the secure way to use it, will update only patch or minor version as your package.json

```
$ cd my-project
$ npm-update
```

To force update to new packages in registry use `-f` flag

```
$ npm-update -f
```
