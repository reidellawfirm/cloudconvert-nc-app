<?php
declare(strict_types=1);

namespace OCA\CcConvert\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Files\IRootFolder;
use OCP\IConfig;
use OCP\IRequest;

class ConvertController extends Controller {

    public function __construct(
        string $appName,
        IRequest $request,
        private IConfig $config,
        private IRootFolder $rootFolder,
        private string $userId,
    ) {
        parent::__construct($appName, $request);
    }

    /** @NoAdminRequired */
    public function convertFile(string $filePath = '', string $outputFormat = ''): JSONResponse {
        $apiKey = $this->config->getAppValue('cloudconvert_nc_app', 'api_key', '');
        if (empty($apiKey)) {
            return new JSONResponse(['error' => 'CloudConvert API key not configured. Please set it in Administration → CloudConvert.'], 400);
        }
        if (empty($filePath) || empty($outputFormat)) {
            return new JSONResponse(['error' => 'Missing filePath or outputFormat.'], 400);
        }

        try {
            $userFolder = $this->rootFolder->getUserFolder($this->userId);
            $file = $userFolder->get($filePath);
            $fileContent = $file->getContent();
            $fileName = $file->getName();

            // Step 1: Create job
            $ch = curl_init('https://api.cloudconvert.com/v2/jobs');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode([
                    'tasks' => [
                        'upload-file'  => ['operation' => 'import/upload'],
                        'convert-file' => [
                            'operation'     => 'convert',
                            'input'         => 'upload-file',
                            'output_format' => $outputFormat,
                        ],
                        'export-file'  => [
                            'operation' => 'export/url',
                            'input'     => 'convert-file',
                        ],
                    ],
                ]),
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $apiKey,
                    'Content-Type: application/json',
                ],
            ]);
            $jobResponse = json_decode(curl_exec($ch), true);
            curl_close($ch);

            if (empty($jobResponse['data']['id'])) {
                return new JSONResponse(['error' => 'Failed to create CloudConvert job.'], 500);
            }

            // Step 2: Upload file
            $uploadTask = null;
            foreach ($jobResponse['data']['tasks'] as $task) {
                if ($task['name'] === 'upload-file') {
                    $uploadTask = $task;
                    break;
                }
            }

            if ($uploadTask === null) {
                return new JSONResponse(['error' => 'Upload task not found in job response.'], 500);
            }

            $tmpFile = tempnam(sys_get_temp_dir(), 'cc_');
            file_put_contents($tmpFile, $fileContent);

            $uploadParams = $uploadTask['result']['form']['parameters'];
            $uploadParams['file'] = new \CURLFile($tmpFile, 'application/octet-stream', $fileName);

            $ch = curl_init($uploadTask['result']['form']['url']);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $uploadParams,
            ]);
            curl_exec($ch);
            curl_close($ch);
            unlink($tmpFile);

            // Step 3: Poll until finished (max 90 s)
            $jobId     = $jobResponse['data']['id'];
            $waited    = 0;
            $jobStatus = [];
            while ($waited < 90) {
                sleep(3);
                $waited += 3;
                $ch = curl_init('https://api.cloudconvert.com/v2/jobs/' . $jobId);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $apiKey],
                ]);
                $jobStatus = json_decode(curl_exec($ch), true);
                curl_close($ch);

                $jobStatusValue = $jobStatus['data']['status'] ?? '';
                if ($jobStatusValue === 'finished') {
                    break;
                }
                if ($jobStatusValue === 'error') {
                    return new JSONResponse(['error' => 'CloudConvert conversion failed.'], 500);
                }
            }

            // Step 4: Download and save converted file
            $exportTask = null;
            foreach ($jobStatus['data']['tasks'] as $task) {
                if ($task['name'] === 'export-file') {
                    $exportTask = $task;
                    break;
                }
            }

            if (empty($exportTask['result']['files'][0]['url'])) {
                return new JSONResponse(['error' => 'No output file from CloudConvert.'], 500);
            }

            $downloadUrl      = $exportTask['result']['files'][0]['url'];
            $convertedContent = file_get_contents($downloadUrl);
            $newFileName      = pathinfo($fileName, PATHINFO_FILENAME) . '.' . $outputFormat;

            // Save next to the original file
            $dir = dirname($filePath);
            $savePath = ($dir === '.' || $dir === '/') ? $newFileName : ltrim($dir, '/') . '/' . $newFileName;

            if ($userFolder->nodeExists($savePath)) {
                $userFolder->get($savePath)->delete();
            }
            $userFolder->newFile($savePath, $convertedContent);

            return new JSONResponse(['success' => true, 'newFile' => $newFileName]);

        } catch (\Exception $e) {
            return new JSONResponse(['error' => $e->getMessage()], 500);
        }
    }
}
