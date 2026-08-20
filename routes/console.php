<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('sailink:sync-positions')->everyMinute()->withoutOverlapping();

Artisan::command('fleet:set-ip {id} {ip}', function ($id, $ip) {
    $fleet = \App\Models\Fleet::find($id);
    if ($fleet) {
        $fleet->update(['ip_address' => $ip]);
        $this->info("Updated vessel [{$fleet->ship_name}] IP address to {$ip}");
    } else {
        $this->error("Fleet ID {$id} not found.");
    }
});

Artisan::command('fleet:list', function () {
    $fleets = \App\Models\Fleet::all(['id', 'ship_name', 'ip_address']);
    foreach ($fleets as $f) {
        $this->info("ID: {$f->id} | Name: {$f->ship_name} | IP: " . ($f->ip_address ?: 'None'));
    }
});


