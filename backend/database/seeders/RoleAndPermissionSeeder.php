<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Roles
        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        $customerRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer']);

        // Create Permissions
        $permissions = [
            'manage-users',
            'manage-products',
            'manage-orders',
            'manage-categories'
        ];

        foreach ($permissions as $permission) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $permission]);
        }

        // Give permissions to admin role
        $adminRole->givePermissionTo($permissions);

        // Assign roles to existing users based on the 'role' column
        $users = \App\Models\User::all();
        foreach ($users as $user) {
            if ($user->role === 'admin') {
                if (!$user->hasRole('admin')) {
                    $user->assignRole('admin');
                }
            } else {
                if (!$user->hasRole('customer')) {
                    $user->assignRole('customer');
                }
            }
        }
    }
}
