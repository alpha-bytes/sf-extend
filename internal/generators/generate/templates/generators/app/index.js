const Sfdxtension = require('sfdxtend');

/**
 * sfdxtend extension class. The Sfdxtension class which is this class's prototype
 * itself extends the Yeoman Generator class. It's runtime context methods (https://yeoman.io/authoring/running-context.html) 
 * are included in runtime order in comment blocks below for convenience. At least one method must be implemented
 * or an exception will be thrown when the class executes.
 */
class <%= extName %>Sfdxtension extends Sfdxtension{
    /** initializing(){
        Your initialization methods (checking current project state, getting configs, etc)
    } **/

    /** prompting(){   
        Where you prompt users for options (where you’d call this.prompt())
    } **/

    /** configuring(){ 
        Saving configurations and configure the project (creating .editorconfig files and other metadata files)
    } **/

    /** default(){ 
        If the method name doesn’t match a priority, it will be pushed to this group.
    } **/

    /** writing(){ 
        Where you write the generator specific files (routes, controllers, etc)
    } **/

    /** conflicts(){   
        Where conflicts are handled (used internally)
    } **/

    /** install(){ 
        Where installations are run (npm, bower)
    } **/

    /** end(){ 
        Called last, cleanup, say good bye, etc
    } **/

}

module.exports = <%= extName %>Sfdxtension;