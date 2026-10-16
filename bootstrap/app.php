<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PreventResponseCaching;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(web: __DIR__.'/../routes/web.php', health: '/up')
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [PreventResponseCaching::class, HandleInertiaRequests::class]);
    })
    ->withExceptions()
    ->create();
