# Extend `sfdx`

`sfdxtend` provides a lightweight means of extending the capabilities of core `sfdx` commands. Enable your custom extensions to run before or after any cli command.

## Installation
Add `sfdxtend` to your cli as you would any `sfdx` plugin:

```sh
sfdx plugins:install @alpha-bytes/sfdxtend
```

## Usage
After installing the plugin you'll be able to extend any existing `sfdx` command as such: 

```sh
# syntax
sfdx <command> --extend <localPathOrNpmPackage> [before|after] [first|last|position]
# example - @alpha-bytes/sfdxtend-prettier-apex will run *before* 'force:source:deploy' and will run *first* among all such extensions attached to this command
sfdx force:source:deploy --extend @alpha-bytes/sfdxtend-prettier-apex before first
```

where...
- `command` is any sfdx command
- `localPathOrNpmPackage` is a relative path to your extension module or any supported <a href="https://docs.npmjs.com/about-packages-and-modules" target="_blank">package format</a> that npm can install
- `before` means your extension will run _before_ the sfdx command executes
- `after` (default) means your extension will run _after_ the sfdx command successfully executes
- `first` will place your extension at the top of the queue for all extensions attached to the given command
- `last` will place your extension at the bottom of the queue for all extensions attached to the given command
- `position` is any non-negative integer that will place your extension at the provided location in the queue for all extensions attached to the given command (i.e. `0` has the same effect as `first`)

## Building Extensions
An extension is any local module or npm-installable whose default export is class that extends the `Sfdxtension` class: 

```js
const Sfdxtension = require('@alpha-bytes/sfdxtend');
module.exports.default = class MyExtension extends Sfdxtension{
    // your code...
}
```

To get you started quickly `sfdxtend` appends a generator command to `sfdx` which will scaffold a new extension for you. Run the following from the directory where you want to begin building:

```sh
sfdx xtensions:generate [PATH]
```

### Extension Architecture
Under the hood `sfdxtend` utilizes the popular **Yeomanjs** scaffolding library. Salesforce utilizes this as well when you run commands such as `sfdx force:project:create` and `sfdx plugins:generate`.

The extension classes you'll create extend the `Sfdxtension` class which itself extends the Yeoman `Generator` class, so all of the smart functionality available to you therein is accessible in your class as well.

Before beginning make sure to peruse the Yeoman <a href="https://yeoman.io/authoring/index.html" target="_blank">authoring documentation</a> which is generally concise and approachable.

## Sharing and Finding Extensions
If you'd like to share your awesome creations with the rest of the world simply publish your package to npm using the format `sfdxtend-<yourName>`.

To search existing public extensions simply run the following command: 

```sh
sfdx xtensions:find
```

<!-- ### Community Extensions -->

## Examples

Coming soon.

## FAQ

**How is an extension different than a plugin?**\
_An `sfdx` plugin adds additional topics and commands to the sfdx cli. An `sfdxtend` extension, on the other hand, allows you to automatically execute logic before/after core commands without the need for manual user invocation._