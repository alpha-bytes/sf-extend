# Extend `sfdx` Core Commands

`sfdxtend` provides a lightweight means of extending the capabilities of core `sfdx` commands. Configure your extension to run before or after any core command.

## Installation
Add `sfdxtend` to your cli as you would any `sfdx` plugin:

```sh
sfdx plugins:install sfdxtend
```

## Usage
Extending an `sfdx` command is a simple process. You can choose to extend commands _explicitly_ or you can  rely on the extension itself to define the commands it will extend (see _[Configuration](#configuration)_ below). In either case you will be prompted to confirm which commands the extension is allowed to extend.

```sh
# syntax - explicit extension
sfdx <command> --extend <localPathOrNpmPackage> [-g, --global]
# example
sfdx force:source:deploy --extend @alpha-bytes/sfdxtend-prettier-on-deploy

# syntax - implicit extension
sfdx x:add <localPathOrNpmPackage> [-g, --global]
# example 
sfdx x:add @alpha-bytes/sfdxtend-prettier-on-deploy
```

where...
- `command` is any sfdx command
- `localPathOrNpmPackage` is a relative path to your extension module or the name of a package published to npmjs.com
- `-g, --global` declares that the extension will be executed every time the command is run; when this flag is omitted the scope will default to `project`-level extension

### Scope
As shown above, the `-g, --global` flag adds a global configuration so that the extension will run every time the command(s) are executed, regardless of project. The config file resides in your machine's default XSD config directory (e.g. `~/.config/`) as provided by the oclif framework (which `sfdx` runs within).

When the `global` option is not provided, `sfdxtend` will append the configurations to the `package.json` file of the directory from which the command was run. If the directory is not a valid `sfdx` project structure (it has either no `sfdx-project.json` or `package.json` file) an error will be thrown.

## Building Extensions
An extension is any local module or npm package whose default export is class that extends the `Sfdxtension` class: 

```js
const Sfdxtension = require('sfdxtend');
module.exports.default = class MyExtension extends Sfdxtension{
    // your code...
}
```

To get you started quickly, `sfdxtend` includes a generator command that which will scaffold a new extension for you. Run the following from the directory where you want to begin building:

```sh
sfdx x:generate [PATH]
```

The command will ask you a few questions (similar to running `force:project:create`) in your to scaffold a simple extension directory for you. 

### Extension Architecture
Under the hood `sfdxtend` utilizes the popular **Yeomanjs** scaffolding library. Salesforce utilizes this as well when you run commands such as `sfdx force:project:create` and `sfdx plugins:generate`.

The extension classes you'll create extend the `Sfdxtension` class which itself extends the Yeoman `Generator` class, so all of the really smart functionality available to you therein is accessible in your class.

Before beginning make sure to peruse the Yeoman <a href="https://yeoman.io/authoring/index.html" target="_blank">authoring documentation</a> which is generally concise and approachable.

## Configuration
Extensions can define the commands they wish to extend and whether they should run before or after. Users installing these extensions will be prompted to approve each command requested before it will be attached to the given command, and extension will only be configured within the scope provided by the user, i.e. "global" or "project" (default).

```jsonc
{
    //...
    "sfdxtend": {
        "before|after": [ "command:id:0", "..." ]
    }//...
}

```

## Sharing and Finding Extensions
If you'd like to share your awesome creations with the rest of the world simply publish your package to npm using the format `sfdxtend-<yourExtensionName>`.

<!-- ### Community Extensions -->

## FAQ

**How is an extension different than a plugin?**\
_An `sfdx` plugin adds additional commands to the base cli that a user must call manually. An `sfdxtend` extension, on the other hand, allows you to automatically execute logic before/after core commands without the need for manual user invocation._

**Can I extend custom plugin commands?**
_Technically, yes, though the Inquirer prompts that walk the user through installation only list out core commands, so you need to configure the package.json (or global config file) manually._