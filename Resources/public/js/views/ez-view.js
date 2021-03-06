/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-view', function (Y) {
    "use strict";
    /**
     * Provides the base eZ View
     *
     * @module ez-view
     */
    Y.namespace('eZ');

    /**
     * An abstract class that adds the `active` attribute so that any view can
     * detect its state and react when it is changed
     *
     * @namespace eZ
     * @class View
     * @extends View
     */
    Y.eZ.View = Y.Base.create('eZView', Y.View, [], {
        initializer: function () {
            this.after('activeChange', this._setSubviewsActive);
            this._initPlugins();
        },

        destructor: function () {
            this.set('active', false);
        },

        /**
         * Plugs the registered plugins for this view instance
         *
         * @private
         * @method _initPlugins
         */
        _initPlugins: function () {
            var name = this.constructor.NAME;

            Y.Array.each(Y.eZ.PluginRegistry.getPlugins(name), function (Plugin) {
                this.plug(Plugin);
            }, this);
        },

        /**
         * Adds DOM event handlers on the current view. It makes sure
         * event subscriptions are really taken into account which might
         * not be the case if the view container has already been initialized.
         * see https://jira.ez.no/browse/EZP-26236
         *
         * @method _addDOMEventHandlers
         * @protected
         * @param {Object} events
         */
        _addDOMEventHandlers: function (events) {
            this.events = Y.merge(this.events, events);

            if ( this._container ) {
                this.attachEvents();
            }
        },


        /**
         * Sets the active attribute of the sub views stored in attributes to
         * the same value as the current view
         *
         * @method _setSubviewsActive
         * @protected
         */
        _setSubviewsActive: function () {
            Y.Object.each(this._getAttrCfgs(), function (attrCfg, name) {
                var attr = this.get(name);

                if ( attr instanceof Y.eZ.View ) {
                    attr.set('active', this.get('active'));
                }
            }, this);
        }
    }, {
        ATTRS: {
            /**
             * Stores the active status of the view. It is set to true by the
             * application after the view container has been added to DOM.
             *
             * @attribute active
             * @type Boolean
             * @default false
             */
            active: {
                value: false
            },

            /**
             * An arbitrary config object
             *
             * @attribute config
             * @type {Object}
             * @default {}
             */
            config: {
                value: {},
            },
        }
    });
});
