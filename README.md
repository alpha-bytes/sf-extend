# Extend `sfdx`

`sfdxtend` provides a lightweight means of extending the capabilities of core `sfdx` commands. Enable your extension logic to run before / after any sfdx command.

## Installation
Add `sfdxtend` to your cli as you would any `sfdx` plugin:

```sh
sfdx plugins:install @alpha-bytes/sfdxtend
```

## Usage
After installing the plugin you'll be able to extend existing `sfdx` commands. You can extend them _explicitly_ or _implicitly_ as shown in the examples below. With explicit extension you define the command to be extended. When implicitly extending, the extension itself defines its command extensions and you will be prompted to accept or reject them (see _[Configuration](#configuration)_ below).

```sh
# explicit syntax
sfdx <command> --x <localPathOrNpmPackage> [-g, --global]
# example - @alpha-bytes/sfdxtend-prettier-apex will run only when the command is executed in the current *project* (unless added globally separately)
sfdx force:source:deploy --x @alpha-bytes/sfdxtend-prettier-apex

# implicit syntax
sfdx x <localPathOrNpmPackage> [-g, --global]
# example
sfdx x @alpha-bytes/sfdxtend-polyfill
```

where...
- `command` is any sfdx command
- `localPathOrNpmPackage` is a relative path to your extension module or any supported <a href="https://docs.npmjs.com/about-packages-and-modules" target="_blank">package format</a> that npm can install
- `-g, --global` declares that the extension will be executed every time the command is run regardless of project

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

## Configuration
Extension can define the commands they extend and whether they run before or after. They can also request a given priority versus other extensions and, in the event of a conflict, the user will e able to decide which takes precedence upon installation. 

Extensions add these configs to their `package.json` file at the root of their project as such: 

```jsonc
{
    //...
    "sfdxtend": {
        "before|after": {
            "command:id": "first|last|position"
        }
    }//...
}

```

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