"format cjs";

var wrap = require('word-wrap'),
    map = require('lodash.map'),
    _ = require('underscore'),
    longest = require('longest'),
    rightPad = require('right-pad'),
    assemblaOptions = require('./assemblaOptions');

function getOptions(options) {
    var types = options.types;

    var length = longest(Object.keys(types)).length + 1;
    return map(types, function (type, key) {
        return {
            name: rightPad(key + ':', length) + ' ' + type.description,
            value: key
        };
    });
}

module.exports = function (options) {

    var choices = getOptions(options),
        assemblaChoices = getOptions(assemblaOptions);

    return {
        prompter: function (cz, commit) {
            cz.prompt([{
                type: 'list',
                name: 'type',
                message: 'Select the type of change that you\'re committing:',
                choices: choices
            }, {
                type: 'input',
                name: 'subject',
                message: 'Write a short, imperative terse description of the change:\n'
            }, {
                type: 'input',
                name: 'assemblaTicketReference',
                message: 'add an Assembla ticket reference if known, (without the hash symbol)'
            }, {
                type: 'list',
                name: 'action',
                message: 'Add status update type\n',
                choices: assemblaChoices,
                when: function (answers) {
                    return !(_.isUndefined(answers.assemblaTicketReference));
                }
            }]).then(function (answers) {
                var maxLineWidth = 100;
                var assemblaUpdate='';
                if(answers.assemblaTicketReference && answers.action) {
                    assemblaUpdate = `${answers.action} #${answers.assemblaTicketReference}`;
                }
                var msg = (answers.type + ': ' + assemblaUpdate +' ' + answers.subject.trim()).slice(0, 100);
                commit(msg);
            });
        }
    };
};