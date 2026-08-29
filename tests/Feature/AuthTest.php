<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_can_be_rendered(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_check_niu_returns_needs_activation_for_new_user(): void
    {
        $user = User::create([
            'niu' => '11111',
            'name' => 'Fajar Pratama',
            'pin_hash' => null,
            'role' => 'STUDENT',
            'practicum_group' => 'B2',
            'is_active' => false,
        ]);

        $response = $this->postJson('/auth/check-niu', ['niu' => '11111']);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'needs_activation',
                'user' => [
                    'niu' => '11111',
                    'name' => 'Fajar Pratama',
                ],
            ]);
    }

    public function test_check_niu_returns_ready_to_login_for_active_user(): void
    {
        $user = User::create([
            'niu' => '22222',
            'name' => 'Adib Muzakki',
            'pin_hash' => Hash::make('123456'),
            'role' => 'STUDENT',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        $response = $this->postJson('/auth/check-niu', ['niu' => '22222']);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ready_to_login',
                'user' => [
                    'niu' => '22222',
                ],
            ]);
    }

    public function test_user_can_activate_pin_and_login(): void
    {
        $user = User::create([
            'niu' => '33333',
            'name' => 'New Student',
            'pin_hash' => null,
            'role' => 'STUDENT',
            'practicum_group' => 'B1',
            'is_active' => false,
        ]);

        $response = $this->post('/auth/activate', [
            'niu' => '33333',
            'pin' => '654321',
            'pin_confirmation' => '654321',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user->fresh());
        $this->assertTrue($user->fresh()->is_active);
        $this->assertTrue(Hash::check('654321', $user->fresh()->pin_hash));
    }

    public function test_user_can_login_with_valid_pin(): void
    {
        $user = User::create([
            'niu' => '44444',
            'name' => 'Active Student',
            'pin_hash' => Hash::make('123456'),
            'role' => 'STUDENT',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        $response = $this->post('/auth/login', [
            'niu' => '44444',
            'pin' => '123456',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    public function test_user_cannot_login_with_invalid_pin(): void
    {
        $user = User::create([
            'niu' => '44444',
            'name' => 'Active Student',
            'pin_hash' => Hash::make('123456'),
            'role' => 'STUDENT',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        $response = $this->post('/auth/login', [
            'niu' => '44444',
            'pin' => '999999',
        ]);

        $response->assertSessionHasErrors('pin');
        $this->assertGuest();
    }
}
