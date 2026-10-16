<?php

$contents = file_get_contents(__DIR__.'/../.env');
if ($contents === false) {
    exit(1);
}
if (! preg_match('/^APP_KEY=.+$/m', $contents)) {
    passthru('php artisan key:generate --ansi', $status);
    exit($status);
}
