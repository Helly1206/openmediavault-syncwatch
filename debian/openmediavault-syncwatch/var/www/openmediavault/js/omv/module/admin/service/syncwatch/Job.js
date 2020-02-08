/**
 * Copyright (C) 2014-2019 OpenMediaVault Plugin Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// require("js/omv/WorkspaceManager.js")
// require("js/omv/workspace/window/Form.js")
// require("js/omv/workspace/window/plugin/ConfigObject.js")
// require("js/omv/form/field/plugin/FieldInfo.js")
// require("js/omv/form/field/SharedFolderComboBox.js")

Ext.define('OMV.module.admin.service.syncwatch.job', {
    extend: 'OMV.workspace.window.Form',
    requires: [
        'OMV.form.field.plugin.FieldInfo',
        'OMV.workspace.window.plugin.ConfigObject',
		"OMV.form.field.SharedFolderComboBox"
    ],

    plugins: [{
        ptype: 'configobject'
    }],
    width: 700,
	height: 400,
    
    hideResetButton: true,

    rpcService: 'syncwatch',
    rpcGetMethod: 'get',
    rpcSetMethod: 'set',

    getFormItems: function() {
        return [{
            xtype: 'checkbox',
            name: 'enable',
            fieldLabel: _('Enable'),
            checked: true,
            boxLabel: _('Enable')
        },{
            xtype: 'checkbox',
            name: 'safemount',
            fieldLabel: _('Safe reference'),
            checked: true,
            boxLabel: _('Use safe reference'),
            plugins: [{
                ptype: 'fieldinfo',
                text: _('With safe reference the mount point is used')
                 + '<br />' +
                _('instead of the shared folder (for non reliable mounts).')
            }]
        },{
			xtype: "sharedfoldercombo",
			name: "sourceref",
			fieldLabel: _("Source folder"),
			plugins: [{
				ptype: "fieldinfo",
				text: _("The location of the source folder.")
			}]
		},{
			xtype: "sharedfoldercombo",
			name: "destref",
			fieldLabel: _("Destination folder"),
			plugins: [{
				ptype: "fieldinfo",
				text: _("The location of the destination folder.")
			}]
		},{
            xtype: 'textfield',
            name: 'delay',
            fieldLabel: _('Delay'),
            allowBlank: false,
            value: '10'
        },{
            xtype: 'checkbox',
            name: 'reversesync',
            fieldLabel: _('Reverse'),
            checked: false,
            boxLabel: _('Reverse')
        },{
            xtype: 'checkbox',
            name: 'resettimer',
            fieldLabel: _('Reset timer'),
            checked: true,
            boxLabel: _('Reset timer')
        },{
            xtype: 'checkbox',
            name: 'initsync',
            fieldLabel: _('Initial sync'),
            checked: false,
            boxLabel: _('Initial sync')
        },{
            xtype: 'checkbox',
            name: 'retry',
            fieldLabel: _('Retry'),
            checked: true,
            boxLabel: _('Retry')
        },{
            xtype: 'checkbox',
            name: 'delete',
            fieldLabel: _('Delete'),
            checked: true,
            boxLabel: _('Delete')
        },{
            xtype: 'textfield',
            name: 'exclude',
            fieldLabel: _('Exclude'),
            allowBlank: true,
            value: ''
        },{
            xtype: 'textfield',
            name: 'include',
            fieldLabel: _('Include'),
            allowBlank: true,
            value: ''
        },{
            xtype: 'checkbox',
            name: 'compress',
            fieldLabel: _('Compress'),
            checked: true,
            boxLabel: _('Compress')
        },{
            xtype: 'checkbox',
            name: 'update',
            fieldLabel: _('Update'),
            checked: true,
            boxLabel: _('Update')
        },{
            xtype: 'textfield',
            name: 'options',
            fieldLabel: _('Rsync options'),
            allowBlank: true,
            value: ''
        }];
    }
});
