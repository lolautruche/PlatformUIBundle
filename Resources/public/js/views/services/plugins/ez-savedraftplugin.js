/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-savedraftplugin', function (Y) {
    "use strict";
    /**
     * Provides the save draft plugin.
     *
     * @module ez-savedraftplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Save draft plugin. It saves the draft when the `saveAction` event is
     * triggered.
     *
     * @namespace eZ.Plugin
     * @class SaveDraft
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.SaveDraft = Y.Base.create('saveDraftPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:saveAction', Y.bind(this._saveDraft, this));
        },

        /**
         * Event handler for the saveAction event. It stores the version if the
         * form is valid
         *
         * @method _saveDraft
         * @protected
         * @param {Object} e saveAction event facade
         */
        _saveDraft: function (e) {
            var service = this.get('host'),
                content = service.get('content'),
                isNew = content.isNew();

            if ( !e.formIsValid ) {
                return;
            }

            service.fire('notify', {
                notification: {
                    identifier: this._buildNotificationIdentifier(isNew, content),
                    text: 'Saving the draft',
                    state: 'started',
                    timeout: 0,
                },
            });
            if ( isNew ) {
                this._createContent(e.fields);
            } else {
                this._saveVersion(e.fields);
            }
        },

        /**
         * Fire a notification corresponding to the state of the save draft
         * request.
         *
         * @method _saveDraftCallback
         * @param {Error} error
         * @param {Response} response
         * @param {Boolean} newContent
         * @protected
         */
        _saveDraftCallback: function (error, response, newContent) {
            var service = this.get('host'),
                content = service.get('content'),
                notification = {
                    identifier: this._buildNotificationIdentifier(newContent, content),
                };

            if ( error ) {
                notification.text = 'An error occured while saving the draft';
                notification.state = 'error';
                notification.timeout = 0;
            } else {
                notification.text = 'The draft was stored successfully';
                notification.state = 'done';
                notification.timeout = 5;
            }

            service.fire('notify', {
                notification: notification,
            });
        },

        /**
         * Builds the notification identifier for the save draft notification
         *
         * @method _buildNotificationIdentifier
         * @param {Boolean} isNew
         * @param {eZ.Content} content
         * @protected
         */
        _buildNotificationIdentifier: function (isNew, content) {
            return 'save-draft-' + (isNew ? "0" : content.get('id')) + '-' + this.get('host').get('languageCode');
        },

        /**
         * Creates a draft of a new content with the given fields
         *
         * @method _createContent
         * @param Array fields the fields structures coming from the saveAction
         * event
         * @protected
         */
        _createContent: function (fields) {
            var service = this.get('host'),
                capi = service.get('capi'),
                version = service.get('version'),
                content = service.get('content');

            content.save({
                api: capi,
                languageCode: service.get('languageCode'),
                contentType: service.get('contentType'),
                parentLocation: service.get('parentLocation'),
                fields: fields,
            }, Y.bind(function (error, response) {
                if ( !error ) {
                    version.setAttrs(version.parse({document: response.document.Content.CurrentVersion}));
                }
                this._saveDraftCallback(error, response, true);
            }, this));
        },

        /**
         * Sets the given fields on the version and stores it with the REST API.
         *
         * @method _saveVersion
         * @param Array fields the fields structures coming from the saveAction
         * event
         * @protected
         */
        _saveVersion: function (fields) {
            var service = this.get('host'),
                capi = service.get('capi'),
                version = service.get('version'),
                content = service.get('content');

            version.save({
                api: capi,
                fields: fields,
                contentId: content.get('id'),
                languageCode: service.get('languageCode'),
            }, Y.bind(this._saveDraftCallback, this));
        },
    }, {
        NS: 'saveDraft',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.SaveDraft, ['contentEditViewService', 'contentCreateViewService']
    );
});
