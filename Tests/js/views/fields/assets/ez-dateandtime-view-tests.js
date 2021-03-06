/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dateandtime-view-tests', function (Y) {
    var viewTest, registerTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Date and time View test",

            _should: {
                ignore: {
                    // Date.toLocaleTimeString() does not support the options
                    // in phantomjs so this test is failing there
                    "Should format the date without the seconds": Y.UA.phantomjs
                },
            },

            setUp: function () {
                this.timestamp = 374388330;
                this.fieldValue = {
                    timestamp: this.timestamp,
                };
                this.dateObject = new Date(this.timestamp * 1000);
                this.expectedDateTime = this.dateObject.toLocaleTimeString(
                    undefined,
                    {year: "numeric", month: "short", day: "numeric", hour: '2-digit', minute: '2-digit', second: '2-digit'}
                );
                this.expectedDateTimeNoSeconds = this.dateObject.toLocaleTimeString(
                    undefined,
                    {year: "numeric", month: "short", day: "numeric", hour: '2-digit', minute: '2-digit'}
                );
                this.templateVariablesCount = 4;
                this.fieldDefinition = {
                    fieldType: 'ezdatetime',
                    fieldSettings: {
                        useSeconds: true,
                    },
                    identifier: 'some_identifier'
                };
                this.field = {
                    fieldValue: this.fieldValue,
                };
                this.isEmpty = false;
                this.view = new Y.eZ.DateAndTimeView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            "Should format the date with the seconds": function () {
                this._testValue(
                    this.fieldValue, this.expectedDateTime,
                    "The value in the template should be a formatted date with the seconds"
                );
            },

            "Should format the date without the seconds": function () {
                this.view.get('fieldDefinition').fieldSettings.useSeconds = false;
                this._testValue(
                    this.fieldValue, this.expectedDateTimeNoSeconds,
                    "The value in the template should be a formatted date without the seconds"
                );
            },

            "Test isEmpty with an undefined field": function () {
                this._testIsEmpty(
                    undefined, true,
                    "The field should be seen as empty"
                );
            },

            "Test isEmpty with an empty field": function () {
                this._testIsEmpty(
                    {}, true,
                    "The field should be seen as empty"
                );
            },

            "Test isEmpty with a null fieldValue": function () {
                this._testIsEmpty(
                    {fieldValue: {timestamp: null}}, true,
                    "The field should be seen as empty"
                );
            },

            "Test isEmpty with 0": function () {
                this._testIsEmpty(
                    {fieldValue: {timestamp: 0}}, false,
                    "The should not be seen as empty"
                );
            },

            "Test isEmpty with a filled fieldValue": function () {
                this._testIsEmpty(
                    {fieldValue: {timestamp: 1}}, false,
                    "The should not be seen as empty"
                );
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ Date and time View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Date and time View registration test";
    registerTest.viewType = Y.eZ.DateAndTimeView;
    registerTest.viewKey = "ezdatetime";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-dateandtime-view', 'ez-genericfieldview-tests']});
