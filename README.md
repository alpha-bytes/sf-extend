# Extend core salesforce cli commands

`sf-extend` provides a lightweight means of extending the capabilities of core salesforce cli commands. Configure extensions to run before or after any command. Installable to both the `sf` and `sfdx` cli applications.

## Installation
Add `sf-extend` to your cli as you would any `sfdx` or `sf` plugin:

```sh
# sfdx
sfdx plugins:install sf-extend
# sf
sf plugins install sf-extend
```

## Usage
Extending an `sfdx` or `sf` (hereafter, "`sf`", collectively) command is a simple process. You can define which commands to extend (_explicit_ extension) or you can rely on the extension itself to define the commands (_implicit_ extension, see [Configuration](#configuration) below). In the latter case you will be prompted to allow/disallow each command the extension is requesting to extend.

```sh
# syntax - explicit extension
sfdx <command> --extend <localPathOrNpmPackage> [-g, --global]
# example
sfdx force:source:deploy --extend sf-extend-my-awesome-extension

# syntax - implicit extension
sf extend add <localPathOrNpmPackage> [-g, --global]
# example 
sf extend add sf-extend-my-awesome-extension
```

where...
- `command` is any sf command
- `localPathOrNpmPackage` is a relative path to your extension module or the name of a package published to the default npm registry
- `-g, --global` declares that the extension will be executed every time the command is run; when this flag is omitted the scope will default to `project`-level extension

### Scope
As shown above, the `-g, --global` flag adds a global configuration so that the extension will run every time the command(s) are executed. The config file resides in your machine's default XDG config directory (e.g. `~/.config/`) as provided by the oclif framework. 

When the `global` option is not provided `sf-extend` will attempt to locate a `package.json` file in the current working directory and append the config to it. If the directory is not a valid `sfdx` project structure, either becuase it has no `sfdx-project.json` or no `package.json` file, an error will be thrown.

## Building Extensions
An extension is any local module or npm package whose default export is a class extending the `SfExtension` base class, as such: 

```js
// <projectRoot>/generators/app/index.js
const SfExtension = require('sf-extension');
class MyExtension extends SfExtension{
    // your code...
}
module.exports = SfExtension;
```

`Package.json`:

```
"main": "generators/app/index.js"
```

To get you started quickly, `sf-extend` includes a generator command that which will scaffold a new extension for you. Run the following from the directory where you want to begin building:

```sh
sfdx extend:generate
# or
sf extend generate
```

The command will ask you a few questions (similar to running `force:project:create`) to get you started, including which commands and lifecycles (if any) you'd like to configured your extension to attach to.

### Extension Architecture
Under the hood `sf-extend` utilizes the popular **Yeomanjs** scaffolding library. Salesforce utilizes this as well when you run commands such as `sfdx force:project:create` and `sfdx plugins:generate`.

The extension classes you'll create extend the `SfExtension` class which itself extends the Yeoman `Generator` class, so all of the outstanding functionality available to you therein is accessible in your class by default.

Make sure to peruse the Yeoman <a href="https://yeoman.io/authoring/index.html" target="_blank">authoring documentation</a> as you begin building your first extension.

## Configuration
Extensions can define the commands they wish to extend and whether they should run before or after. Users installing these extensions will be prompted to approve each command requested and the extension will only be configured within the scope provided by the user, i.e. "global" or "project" (default).

The configuration will be append to the user's global config file or project `package.json` file as such: 

```jsonc
{
    //...
    "sf-extend": {
        "before": [ "command:id:0", "...", "command:id:n" ],
        "after": [ "command:id:0", "...", "command:id:n" ]
    }//...
}

```

## Sharing and Finding Extensions
If you'd like to share your awesome creations with the rest of the world simply publish your package to npm using the format `sf-extend-<yourExtensionName>`.

<!-- ### Community Extensions -->

## FAQ

**How is an extension different than a plugin?**\
_An `sfdx` plugin adds additional commands to the base cli that a user must call manually. An `sf-extend` extension, on the other hand, allows you to automatically execute logic before/after core commands without the need for manual user invocation._

**Can I extend custom plugin commands?**
_Absolutely, though the prompts offered by `extend:generate` command will only list the core and plugin commands of the cli instance on the machine where it is run._