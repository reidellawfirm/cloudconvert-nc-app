<?php
declare(strict_types=1);

namespace OCA\CcConvert\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IConfig;
use OCP\IRequest;

class AdminSettingsController extends Controller {

    public function __construct(
        string $appName,
        IRequest $request,
        private IConfig $config,
    ) {
        parent::__construct($appName, $request);
    }

    /** @AuthorizedAdminSetting(settings=OCA\CcConvert\Settings\AdminSettings) */
    public function getSettings(): JSONResponse {
        return new JSONResponse([
            'api_key' => $this->config->getAppValue('cloudconvert_nc_app', 'api_key', ''),
        ]);
    }

    /** @AuthorizedAdminSetting(settings=OCA\CcConvert\Settings\AdminSettings) */
    public function saveSettings(string $api_key = ''): JSONResponse {
        $this->config->setAppValue('cloudconvert_nc_app', 'api_key', trim($api_key));
        return new JSONResponse(['status' => 'ok']);
    }
}
