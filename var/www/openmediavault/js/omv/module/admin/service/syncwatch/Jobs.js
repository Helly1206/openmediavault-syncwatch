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
// require("js/omv/workspace/grid/Panel.js")
// require("js/omv/data/Store.js")
// require("js/omv/data/Model.js")
// require("js/omv/data/proxy/Rpc.js")
// require("js/omv/data/Download.js")
// require("js/omv/module/admin/service/syncwatch/Job.js")

Ext.define('OMV.module.admin.service.syncwatch.jobs', {
    extend: 'OMV.workspace.grid.Panel',
    requires: [
        'OMV.data.Store',
        'OMV.data.Model',
        'OMV.data.proxy.Rpc',
        'OMV.module.admin.service.syncwatch.job'
    ],

    hidePagingToolbar: false,
    reloadOnActivate: true,

    //enabled, source, destination, reversesync
    columns: [{
        xtype: "textcolumn",
        header: _('UUID'),
        hidden: true,
        dataIndex: 'uuid'
    },{
        xtype: "enabledcolumn",
        header: _('Enabled'),
        flex: 1,
        sortable: true,
        dataIndex: 'enable'
    },{
        xtype: "textcolumn",
        header: _('Source'),
        flex: 1,
        sortable: true,
        dataIndex: 'sourcename'
    },{
        xtype: "textcolumn",
        header: _('Destination'),
        flex: 1,
        sortable: true,
        dataIndex: 'destname',
    },{
        xtype: "enabledcolumn",
        header: _('Reverse'),
        flex: 1,
        sortable: true,
        dataIndex: 'reversesync'
    }],

    store: Ext.create('OMV.data.Store', {
        autoLoad: true,
        remoteSort: false,
        model: OMV.data.Model.createImplicit({
            idProperty: 'uuid',
            fields: [{
                name: 'uuid'
            }, {
                name: 'enable'
            }, {
                name: 'sourcename'
            }, {
                name: 'destname'
            }, {
                name: 'reversesync'
            }]
        }),
        proxy: {
            type: 'rpc',
            rpcData: {
                'service': 'SyncWatch',
                'method': 'getList'
            }
        },
        remoteSort: true,
        sorters: [{
            direction: 'ASC',
            property: 'name'
        }]
    }),

    onAddButton: function() {
        Ext.create('OMV.module.admin.service.syncwatch.job', {
            title: _('Add job'),
            uuid: OMV.UUID_UNDEFINED,
            listeners: {
                scope: this,
                submit: function() {
                    this.doReload();
                }
            }
        }).show();
    },
    
    onEditButton: function() {
        var record = this.getSelected();
        
        Ext.create('OMV.module.admin.service.syncwatch.job', {
            title: _('Edit job'),
            uuid: record.get('uuid'),
            listeners: {
                scope: this,
                submit: function() {
                    this.doReload();
                }
            }
        }).show();
    },

    doDeletion: function(record) {
        OMV.Rpc.request({
            scope: this,
            callback: this.onDeletion,
            rpcData: {
                service: 'SyncWatch',
                method: 'delete',
                params: {
                    uuid: record.get('uuid')
                }
            }
        });
    }

});

OMV.WorkspaceManager.registerPanel({
    id: 'jobs',
    path: '/service/syncwatch',
    text: _('Jobs'),
    position: 10,
    className: 'OMV.module.admin.service.syncwatch.jobs'
});
