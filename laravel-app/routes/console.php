<?php
use Illuminate\Support\Facades\Artisan;
Artisan::command('buyhive:health', function (): void { $this->info('BuyHive Laravel application is bootstrapped.'); })->purpose('Check that the BuyHive application can boot.');
