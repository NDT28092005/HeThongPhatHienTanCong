<?php
require __DIR__.'/../backend/vendor/autoload.php';
$app = require_once __DIR__.'/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('role','admin')->first();
if ($user) {
    $user->password = Hash::make('admin123');
    $user->save();
    echo "Password reset for: " . $user->email . " to: admin123\n";
} else {
    echo "No admin user found\n";
}
