/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-relationlist-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the relation list fields
     *
     * @module ez-relationlist-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezobjectrelationlist';

    /**
     * Relation list edit view
     *
     * @namespace eZ
     * @class RelationListEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.RelationListEditView = Y.Base.create('relationListEditView', Y.eZ.FieldEditView, [Y.eZ.AsynchronousView], {
        events: {
            '.ez-relation-discover': {
                'tap': '_runUniversalDiscovery',
            },
            '.ez-relation-remove-content': {
                'tap': '_removeRelation'
            }
        },

        initializer: function () {
            var fieldValue = this.get('field').fieldValue;

            this._fireMethod = this._fireLoadFieldRelatedContents;
            if( fieldValue.destinationContentIds ){
                this._set('destinationContentsIds', fieldValue.destinationContentIds);
            }
            this.after('destinationContentsChange', function (e) {
                this._syncDestinationContentsIds(e);
                if (e.src === "remove") {
                    if (this.get('destinationContentsIds').length !== 0) {
                        this._vanish('tr[data-content-id="' + e.contentId + '"]', false);
                    } else {
                        this._vanish('.ez-relationlist-contents', true);
                    }
                } else {
                    this.render();
                }
            });
        },

        /**
         * Make a DOM element vanish.
         *
         * @method _vanish
         * @param {String} domIdentifier
         * @param {Boolean} reRender
         * @protected
         */
        _vanish: function (domIdentifier, reRender) {
            var that = this,
                container = this.get('container');

            container.one(domIdentifier).transition({
                duration: 0.3,
                opacity: 0,
            }, function() {
                container.one(domIdentifier).remove();
                if (reRender) {
                    that.render();
                }
            });
        },

        /**
         * Synchronize the destinationContentId attribute when destinationContent change.
         *
         * @method _syncDestinationContentsIds
         * @param {EventFacade} e
         * @protected
         */
        _syncDestinationContentsIds: function (e) {
            var destinationContentsIds = [];

            Y.Array.each(e.newVal, function (value) {
                destinationContentsIds.push(value.get('contentId'));
            });
            this._set('destinationContentsIds', destinationContentsIds);
        },

        /**
         * Fire the `loadFieldRelatedContents` event
         *
         * @method _fireLoadFieldRelatedContents
         * @protected
         */
        _fireLoadFieldRelatedContents: function () {
            if ( !this._isFieldEmpty() ) {
                this.fire('loadFieldRelatedContents', {
                    fieldDefinitionIdentifier: this.get('fieldDefinition').identifier
                });
            }
        },

        /**
         * Checks whether the field is empty
         *
         * @method _isFieldEmpty
         * @protected
         * @return {Boolean}
         */
        _isFieldEmpty: function () {
            if ( this.get('destinationContentsIds') ) {
                return ( this.get('destinationContentsIds').length === 0 );
            }
            return true;
        },

        /**
         * Returns an object containing the additional variables
         *
         * @method _variables
         * @protected
         * @return Object
         */
        _variables: function () {
            var dest = this.get('destinationContents'),
                destinationContentsJSON = [];

            Y.Array.each(dest, function (value) {
                destinationContentsJSON.push(value.toJSON());
            });

            return {
                destinationContents:  destinationContentsJSON,
                loadingError: this.get('loadingError'),
                isEmpty: this._isFieldEmpty(),
                isRequired: this.get('fieldDefinition').isRequired,
            };
        },

        /**
         * Tap event handler for the remove relation buttons.
         * It remove the content related to the button from the relation list.
         *
         * @method _removeRelation
         * @protected
         * @param {EventFacade} e
         */
        _removeRelation: function (e) {
            var remainingContents,
                removedContentId;

            e.preventDefault();
            remainingContents =  Y.Array.reject(this.get('destinationContents'), function (val) {
                return ((removedContentId = e.target.getAttribute('data-content-id')) ==  val.get('id'));
            });
            this.set('destinationContents', remainingContents, {src: "remove", contentId: removedContentId});
            this.validate();
        },

        validate: function () {
            if ( this.get('fieldDefinition').isRequired && this._isFieldEmpty() ){
                this.set('errorStatus', 'This field is required');
            } else {
                this.set('errorStatus', false);
            }
        },

        /**
         * Fire the contentDiscover event to launch the universal discovery widget.
         *
         * @method _runUniversalDiscovery
         * @protected
         * @param {EventFacade} e
         */
        _runUniversalDiscovery: function (e) {
            e.preventDefault();
            this.fire('contentDiscover', {
                config: {
                    title: "Select the contents you want to add in the relation",
                    multiple: true,
                    contentDiscoveredHandler: Y.bind(this._selectRelation, this),
                    cancelDiscoverHandler: Y.bind(this.validate, this),
                },
            });
        },

        /**
         * Universal discovery contentDiscovered event handler to fill the relation list
         * after the user chose one or several contents.
         *
         * @method _selectRelation
         * @protected
         * @param {EventFacade} e
         */
        _selectRelation: function (e) {
            var destinationContents = this.get('destinationContents').concat();

            Y.Array.each(e.selection, function (struct) {
                if ( !this._isRelated(struct.content) ) {
                    destinationContents.push(struct.content);
                }
            }, this);

            this.set('errorStatus', false);

            this.set('destinationContents', destinationContents);
        },

        /**
         * Checks if the content is already in the relation.
         *
         * @method _isRelated
         * @protected
         * @param {eZ.Content} content
         * @return Boolean
         */
        _isRelated: function (content) {
            return ( this.get('destinationContentsIds').indexOf(content.get('contentId')) !== -1 );
        },

        /**
         * Returns the field value.
         *
         * @protected
         * @method _getFieldValue
         * @return Object
         */
        _getFieldValue: function () {
            this.validate();
            return {destinationContentIds: this.get('destinationContentsIds')};
        },
    },{
        ATTRS: {
            /**
             * The destination contents of the relation list
             *
             * @attribute destinationContents
             * @type Array (Y.eZ.Content)
             */
            destinationContents: {
                value: [],
            },

            /**
             * Array of contents Ids in the relation (e.g. 42, not /api/ezp/v2/content/objects/42)
             *
             * @attribute destinationContentsIds
             * @type Array
             * @readOnly
             */
            destinationContentsIds: {
                value: null,
                readOnly: true,
            },
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.RelationListEditView
    );
});
