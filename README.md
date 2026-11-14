# CloudConvert for Nextcloud

**Version:** 1.0.0
**Author:** Schuyler "Rocky" Reidel, Reidel Law Firm <schuyler@reidellawfirm.com>
**License:** GPL-3.0-or-later
**Requires:** Nextcloud 28+ · PHP 8.1+ (curl extension)

Convert files between formats using the [CloudConvert](https://cloudconvert.com) API, directly from the Nextcloud Files app.

## Features

- **Right-click conversion** — a context menu action on any file in Nextcloud Files
- **Format-aware** — available output formats are determined by the source file's extension
- **In-browser modal** — select the target format and track conversion progress
- **Admin settings panel** — store the CloudConvert API key securely
- **Automatic save** — the converted file lands in the same folder as the original

Supported conversions include documents (PDF, DOCX, ODT), images (PNG, JPG, WEBP), and video/audio (MP4, MP3, MOV).

## Requirements

- A CloudConvert API key — create one at https://cloudconvert.com/dashboard/api/v2/keys
- PHP `curl` extension enabled on the Nextcloud server

## Installation

```bash
cd /path/to/nextcloud/custom_apps
tar -xzf cloudconvert_nc_app-1.0.0.tar.gz
sudo -u www-data php occ app:enable cloudconvert_nc_app
```

Then go to **Administration settings → CloudConvert**, paste your API key, and save.

## Usage

1. Open **Files**
2. Right-click any supported file
3. Choose **Convert with CloudConvert**
4. Pick the target format and confirm
5. The converted file appears next to the original

## Development

```bash
npm install
npm run build     # compiles src/ into js/
```

`js/` contains the compiled bundles that Nextcloud actually serves; `src/` is the source you edit.

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
