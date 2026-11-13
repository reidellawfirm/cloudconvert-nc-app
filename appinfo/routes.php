<?php
return [
    'routes' => [
        ['name' => 'convert#convertFile',           'url' => '/convert',          'verb' => 'POST'],
        ['name' => 'admin_settings#getSettings',    'url' => '/admin/settings',   'verb' => 'GET'],
        ['name' => 'admin_settings#saveSettings',   'url' => '/admin/settings',   'verb' => 'POST'],
    ]
];
