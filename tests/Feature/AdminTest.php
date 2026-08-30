<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WahaGroupConfig;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_admin_panel(): void
    {
        $admin = User::create([
            'niu' => '00001',
            'name' => 'Komti Admin',
            'pin_hash' => Hash::make('123456'),
            'role' => 'ADMIN',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        WahaGroupConfig::create([
            'target_group' => 'BB_THEORY',
            'group_name' => 'Kelas BB (Teori)',
            'group_jid' => '120363001@g.us',
        ]);

        $response = $this->actingAs($admin)->get('/admin');
        $response->assertStatus(200);
    }

    public function test_admin_can_update_waha_settings(): void
    {
        $admin = User::create([
            'niu' => '00001',
            'name' => 'Komti Admin',
            'pin_hash' => Hash::make('123456'),
            'role' => 'ADMIN',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        $cfg = WahaGroupConfig::create([
            'target_group' => 'BB_THEORY',
            'group_name' => 'Kelas BB (Teori)',
            'group_jid' => '120363001@g.us',
        ]);

        $response = $this->actingAs($admin)->post('/admin/waha/settings', [
            'waha_base_url' => 'http://localhost:3000',
            'waha_session' => 'kelas_tri',
            'waha_api_key' => 'secret123',
            'groups' => [
                [
                    'id' => $cfg->id,
                    'group_jid' => '120363999@g.us',
                ],
            ],
        ]);

        if (session('errors')) {
            dump(session('errors')->all());
        }
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('waha_group_configs', [
            'id' => $cfg->id,
            'group_jid' => '120363999@g.us',
        ]);
        $this->assertDatabaseHas('app_settings', [
            'setting_key' => 'waha_session',
            'setting_value' => 'kelas_tri',
        ]);
    }

    public function test_student_cannot_access_admin_panel(): void
    {
        $student = User::create([
            'niu' => '11111',
            'name' => 'Student',
            'pin_hash' => Hash::make('123456'),
            'role' => 'STUDENT',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        $response = $this->actingAs($student)->get('/admin');
        $response->assertStatus(403);
    }
}
