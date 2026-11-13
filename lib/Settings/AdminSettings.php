<?php
declare(strict_types=1);

namespace OCA\CcConvert\Settings;

use OCP\AppFramework\Http\TemplateResponse;
use OCP\Settings\ISettings;
use OCP\Util;

class AdminSettings implements ISettings {

    public function getForm(): TemplateResponse {
        Util::addScript('cloudconvert_nc_app', 'admin');
        return new TemplateResponse('cloudconvert_nc_app', 'admin');
    }

    public function getSection(): string {
        return 'cloudconvert_nc_app';
    }

    public function getPriority(): int {
        return 50;
    }
}
