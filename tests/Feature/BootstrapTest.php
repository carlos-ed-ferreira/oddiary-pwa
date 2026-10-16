<?php

use Inertia\Inertia;
use Inertia\Testing\AssertableInertia;

it('boots without a database or external services', function () {
    $this->get('/up')->assertOk();
    $this->get('/')->assertOk()->assertInertia(fn (AssertableInertia $page) => $page->component('boot'));
});

it('keeps dynamic HTML and Inertia responses out of HTTP caches', function () {
    $response = $this->get('/')->assertOk();
    expect($response->headers->get('Cache-Control'))->toContain('no-store');

    $response = $this->get('/', [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => Inertia::getVersion(),
        'X-Requested-With' => 'XMLHttpRequest',
    ])->assertOk();
    expect($response->headers->get('Cache-Control'))->toContain('no-store');
});

it('keeps asset version mismatch responses out of HTTP caches', function () {
    $response = $this->get('/', [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => 'stale-build',
    ])->assertStatus(409);
    expect($response->headers->get('Cache-Control'))->toContain('no-store');
});

it('does not expose file download and upload endpoints', function () {
    $this->get('/storage/technical-probe')->assertNotFound();
    $this->put('/storage/technical-probe')->assertNotFound();
});
