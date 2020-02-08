<?php

/**
 * Copyright (C) 2014-2019 OpenMediaVault Plugin Developers.
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

namespace OMV\Engined\Rpc;

use OMV\Config\ConfigObject;
use OMV\Config\Database;
use OMV\Config\DatabaseException;
use OMV\Rpc\ServiceAbstract;
use OMV\System\Process;
use PharData;

class SyncWatch extends ServiceAbstract
{
    /** @var string */
    private $clientDataModelPath = 'conf.service.syncwatch.job';

    /** @var Database */
    private $database;

    /** @var string */
    private $dataModelPath = 'conf.service.syncwatch';

    public function __construct(Database $database = null)
    {
        $this->database = $database ?: Database::getInstance();
    }

    /**
     * Get the RPC service name.
     *
     * @return void
     */
    public function getName()
    {
        return 'SyncWatch';
    }

    /**
     * Initialize the RPC service.
     *
     * @return void
     */
    public function initialize()
    {
        $this->registerMethod('getSettings');
        $this->registerMethod('setSettings');
        $this->registerMethod('getList');
        $this->registerMethod('get');
        $this->registerMethod('set');
        $this->registerMethod('delete');
        $this->registerMethod('getStats');
    }

    /**
     * Get the general settings.
     *
     * @param array $params
     * @param array $context
     *
     * @return array
     */
    public function getSettings($params, $context)
    {
        $this->validateMethodContext($context, ['role' => OMV_ROLE_ADMINISTRATOR]);

        $object = $this->database->get($this->dataModelPath);
        $object->remove('jobs');

        return $object->getAssoc();
    }

    /**
     * Set the general settings.
     *
     * @param array $params
     * @param array $context
     *
     * @return array
     */
    public function setSettings($params, $context)
    {
        $this->validateMethodContext($context, ['role' => OMV_ROLE_ADMINISTRATOR]);
        $this->validateMethodParams($params, 'rpc.syncwatch.setsettings');

        $object = $this->database->get($this->dataModelPath);
        $object->setAssoc($params);

        $this->database->set($object);
        
        $this->updateEnable();

        return $object->getAssoc();
    }

    /**
     * Get a list of job configurations.
     *
     * @param array $params
     * @param array $context
     *
     * @return array
     */
    public function getList($params, $context)
    {
        $this->validateMethodContext($context, ['role' => OMV_ROLE_ADMINISTRATOR]);
        $this->validateMethodParams($params, 'rpc.common.getlist');

        $objects = [];

        $objects = $this->database->get($this->clientDataModelPath);
        
        // Make sure $objects always is an array.
        if (!is_array($objects)) {
            $objects = [$objects];
        }
        
        $db = \OMV\Config\Database::getInstance();
        $clients = [];

        foreach ($objects as $objectk => &$objectv) {
            //Add names of source and destination shares
            $objectv->add("sourcename", "string", gettext("n/a"));
			$objectv->add("destname", "string", gettext("n/a"));
            $sfObject = $db->get("conf.system.sharedfolder", $objectv->get("sourceref"));
			$objectv->set("sourcename", $sfObject->get("name"));
            $sfObject = $db->get("conf.system.sharedfolder", $objectv->get("destref"));
			$objectv->set("destname", $sfObject->get("name"));
            $clients[] = $objectv->getAssoc();
        }

        return $this->applyFilter(
            $clients,
            $params['start'],
            $params['limit'],
            $params['sortfield'],
            $params['sortdir']
        );
    }

    /**
     * Get single a job configuration.
     *
     * @param array $params
     * @param array $context
     *
     * @return array
     */
    public function get($params, $context)
    {
        $this->validateMethodContext($context, ['role' => OMV_ROLE_ADMINISTRATOR]);
        $this->validateMethodParams($params, 'rpc.common.objectuuid');

        $object = $this->database->get($this->clientDataModelPath, $params['uuid']);

        return $object->getAssoc();
    }

    /**
     * Set a job configuration.
     *
     * @param array $params
     * @param array $context
     *
     * @return array
     */
    public function set($params, $context)
    {
        $this->validateMethodContext($context, ['role' => OMV_ROLE_ADMINISTRATOR]);
        $this->validateMethodParams($params, 'rpc.syncwatch.set');

        $object = new ConfigObject($this->clientDataModelPath);
        $object->setAssoc($params);

        if ($object->isNew()) {
            $this->database->assertIsUnique($object, 'uuid'); // Is this correct or is the uuid set in the db ????
        }

        $this->database->set($object);
        
        $this->updateEnable();

        return $object->getAssoc();
    }

    /**
     * Delete job configuration.
     *
     * @param array $params
     * @param array $context
     *
     * @return void
     */
    public function delete($params, $context)
    {
        $this->validateMethodContext($context, ['role' => OMV_ROLE_ADMINISTRATOR]);
        $this->validateMethodParams($params, 'rpc.common.objectuuid');

        $object = $this->database->get($this->clientDataModelPath, $params['uuid']);

        $this->database->delete($object);
        
        $this->updateEnable();
    }

    /**
     * Get general SyncWatch stats.
     *
     * @param array $params
     * @param array $context
     *
     * @return string
     */
    public function getStats($params, $context)
    {
        $this->validateMethodContext($context, ['role' => OMV_ROLE_ADMINISTRATOR]);

        $object = $this->database->get($this->dataModelPath);

        if (!$object->get('enable')) {
            return gettext('SyncWatch is disabled.');
        }

        return gettext('SyncWatch is enabled, see logfile for actual status');
    }
    
    /**
     * This function updates the global enable based on if there are any enabled jobs
     *
     * @param none
     *
     * @return none
     */   
    private function updateEnable()
    {
        $enable = FALSE;
        
        $objects = [];
        $objects = $this->database->get($this->clientDataModelPath);
        // Make sure $objects always is an array.
        if (!is_array($objects)) {
            $objects = [$objects];
        }
        
        foreach ($objects as $objectk => &$objectv) {
            //Add names of source and destination shares
            if ($objectv->get('enable')) {
                $enable = TRUE;
            }
        }
        
        $object = $this->database->get($this->dataModelPath);
        $object->set('enable', $enable);
        $this->database->set($object);
    }
}
