<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

// Redirect root to dashboard or login
Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});

// Guest Auth Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/auth/check-niu', [AuthController::class, 'checkNiu'])->name('auth.check-niu');
    Route::post('/auth/activate', [AuthController::class, 'activatePin'])->name('auth.activate');
    Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.login');
});

// Authenticated Routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Jadwal
    Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');
    Route::post('/schedules', [ScheduleController::class, 'store'])->name('schedules.store');
    Route::put('/schedules/{schedule}', [ScheduleController::class, 'update'])->name('schedules.update');
    Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy'])->name('schedules.destroy');
    Route::post('/schedules/override', [ScheduleController::class, 'storeOverride'])->name('schedules.override');

    // Tugas
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::post('/tasks/{task}/toggle', [TaskController::class, 'toggleComplete'])->name('tasks.toggle');

    // Admin Panel Actions
    Route::get('/admin', [AdminController::class, 'index'])->name('admin.index');
    Route::get('/admin/waha/groups', [AdminController::class, 'fetchWahaGroups'])->name('admin.waha.groups');
    Route::post('/admin/users/reset-pin', [AdminController::class, 'resetPin'])->name('admin.users.reset-pin');
    Route::post('/admin/users', [AdminController::class, 'storeUser'])->name('admin.users.store');
    Route::put('/admin/users/{user}', [AdminController::class, 'updateUser'])->name('admin.users.update');
    Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser'])->name('admin.users.destroy');
    Route::post('/admin/waha/settings', [AdminController::class, 'updateWahaSettings'])->name('admin.waha.settings');
    Route::post('/admin/waha/test-blast', [AdminController::class, 'testBlast'])->name('admin.waha.test-blast');
});
