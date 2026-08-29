<?php

namespace Database\Seeders;

use App\Models\CoursePj;
use App\Models\Schedule;
use App\Models\ScheduleOverride;
use App\Models\Subject;
use App\Models\Task;
use App\Models\User;
use App\Models\UserTaskCompletion;
use App\Models\WahaGroupConfig;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. WAHA GROUPS
        WahaGroupConfig::create([
            'target_group' => 'ALL_THEORY',
            'group_jid' => '120363234567890123@g.us',
            'group_name' => 'Kelas BB - Teori TRI 2024',
        ]);
        WahaGroupConfig::create([
            'target_group' => 'B1_PRACTICUM',
            'group_jid' => '120363234567890124@g.us',
            'group_name' => 'Praktikum Kloter B1 TRI 2024',
        ]);
        WahaGroupConfig::create([
            'target_group' => 'B2_PRACTICUM',
            'group_jid' => '120363234567890125@g.us',
            'group_name' => 'Praktikum Kloter B2 TRI 2024',
        ]);

        // 2. USERS
        // Admin / Komti
        $admin = User::create([
            'niu' => '00001',
            'name' => 'Komti Triyono (Super Admin)',
            'pin_hash' => Hash::make('123456'),
            'role' => 'ADMIN',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        // PJ Mata Kuliah (Web Lanjut)
        $pjWeb = User::create([
            'niu' => '11111',
            'name' => 'Ahmad Fauzi (PJ Web)',
            'pin_hash' => Hash::make('123456'),
            'role' => 'PJ',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        // PJ Mata Kuliah (Jaringan Komputer)
        $pjJarkom = User::create([
            'niu' => '22222',
            'name' => 'Siti Nurhaliza (PJ Jarkom)',
            'pin_hash' => Hash::make('123456'),
            'role' => 'PJ',
            'practicum_group' => 'B2',
            'is_active' => true,
        ]);

        // Mahasiswa Aktif Kloter B1
        $studentB1 = User::create([
            'niu' => '53411',
            'name' => 'Muhammad Adib Muzakki',
            'pin_hash' => Hash::make('123456'),
            'role' => 'STUDENT',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        // Mahasiswa Belum Aktivasi Kloter B2 (Testing Aktivasi PIN Baru)
        $studentB2New = User::create([
            'niu' => '53412',
            'name' => 'Fajar Pratama (Belum Aktivasi)',
            'pin_hash' => null,
            'role' => 'STUDENT',
            'practicum_group' => 'B2',
            'is_active' => false,
        ]);

        // Mahasiswa Aktif Kloter B2
        $studentB2 = User::create([
            'niu' => '53413',
            'name' => 'Rizky Ramadhan',
            'pin_hash' => Hash::make('123456'),
            'role' => 'STUDENT',
            'practicum_group' => 'B2',
            'is_active' => true,
        ]);

        // 3. SUBJECTS
        $web = Subject::create([
            'code' => 'TRI201',
            'name' => 'Pemrograman Web Lanjut',
            'type' => 'THEORY',
        ]);
        $jarkom = Subject::create([
            'code' => 'TRI202',
            'name' => 'Praktikum Jaringan Komputer',
            'type' => 'PRACTICUM',
        ]);
        $basisData = Subject::create([
            'code' => 'TRI203',
            'name' => 'Sistem Basis Data Terdistribusi',
            'type' => 'THEORY',
        ]);
        $os = Subject::create([
            'code' => 'TRI204',
            'name' => 'Praktikum Sistem Operasi',
            'type' => 'PRACTICUM',
        ]);
        $rpl = Subject::create([
            'code' => 'TRI205',
            'name' => 'Rekayasa Perangkat Lunak',
            'type' => 'THEORY',
        ]);

        // 4. COURSE PJS
        CoursePj::create(['user_id' => $pjWeb->id, 'subject_id' => $web->id]);
        CoursePj::create(['user_id' => $pjJarkom->id, 'subject_id' => $jarkom->id]);

        // 5. MASTER SCHEDULES
        // Senin: Basis Data (Teori BB)
        Schedule::create([
            'subject_id' => $basisData->id,
            'target_group' => 'ALL_THEORY',
            'day_of_week' => 1,
            'start_time' => '08:00:00',
            'end_time' => '09:40:00',
            'room' => 'Ruang Kuliah 201 (Gedung Vokasi Lt. 2)',
            'lecturer_name' => 'Dr. Ir. Hendra Setiawan, M.T.',
        ]);

        // Senin: Praktikum Sistem Operasi (B1)
        Schedule::create([
            'subject_id' => $os->id,
            'target_group' => 'B1_PRACTICUM',
            'day_of_week' => 1,
            'start_time' => '13:15:00',
            'end_time' => '15:45:00',
            'room' => 'Lab Komputer 1 (Gedung Vokasi Lt. 3)',
            'lecturer_name' => 'Mas Dimas & Tim Aslab OS',
        ]);

        // Selasa: Praktikum Sistem Operasi (B2)
        Schedule::create([
            'subject_id' => $os->id,
            'target_group' => 'B2_PRACTICUM',
            'day_of_week' => 2,
            'start_time' => '08:00:00',
            'end_time' => '10:30:00',
            'room' => 'Lab Komputer 1 (Gedung Vokasi Lt. 3)',
            'lecturer_name' => 'Mas Dimas & Tim Aslab OS',
        ]);

        // Rabu: Rekayasa Perangkat Lunak (Teori BB)
        Schedule::create([
            'subject_id' => $rpl->id,
            'target_group' => 'ALL_THEORY',
            'day_of_week' => 3,
            'start_time' => '10:00:00',
            'end_time' => '11:40:00',
            'room' => 'Ruang Kuliah 202 (Gedung Vokasi Lt. 2)',
            'lecturer_name' => 'Ibu Ratna Dewi, S.Kom., M.Cs.',
        ]);

        // Kamis: Pemrograman Web Lanjut (Teori BB)
        $schWeb = Schedule::create([
            'subject_id' => $web->id,
            'target_group' => 'ALL_THEORY',
            'day_of_week' => 4,
            'start_time' => '08:00:00',
            'end_time' => '09:40:00',
            'room' => 'Ruang Kuliah 203 (Gedung Vokasi Lt. 2)',
            'lecturer_name' => 'Pak Budi Santoso, S.T., M.Kom.',
        ]);

        // Kamis: Praktikum Jaringan Komputer (B2)
        $schJarkomB2 = Schedule::create([
            'subject_id' => $jarkom->id,
            'target_group' => 'B2_PRACTICUM',
            'day_of_week' => 4,
            'start_time' => '13:15:00',
            'end_time' => '15:45:00',
            'room' => 'Lab Jaringan 2 (Gedung Vokasi Lt. 2)',
            'lecturer_name' => 'Mas Rangga & Tim Aslab Jarkom',
        ]);

        // Jumat: Praktikum Jaringan Komputer (B1)
        Schedule::create([
            'subject_id' => $jarkom->id,
            'target_group' => 'B1_PRACTICUM',
            'day_of_week' => 5,
            'start_time' => '08:00:00',
            'end_time' => '10:30:00',
            'room' => 'Lab Jaringan 2 (Gedung Vokasi Lt. 2)',
            'lecturer_name' => 'Mas Rangga & Tim Aslab Jarkom',
        ]);

        // 6. SCHEDULE OVERRIDE CONTOH (Kelas Web Lanjut dialihkan Zoom untuk hari ini / Kamis)
        $today = Carbon::today();
        ScheduleOverride::create([
            'schedule_id' => $schWeb->id,
            'original_date' => $today->format('Y-m-d'),
            'status' => 'ONLINE',
            'meeting_url' => 'https://ugm-id.zoom.us/j/9876543210',
            'meeting_passcode' => '123456',
            'reason' => 'Dosen bertugas ke luar kota, kuliah dialihkan secara daring via Zoom Meeting. Wajib on-cam.',
            'is_notified' => true,
            'created_by' => $pjWeb->id,
        ]);

        // 7. TASKS
        $task1 = Task::create([
            'subject_id' => $jarkom->id,
            'target_group' => 'B2_PRACTICUM',
            'title' => 'Laporan Akhir Modul 3 (Routing OSPF)',
            'description' => 'Kerjakan konfigurasi multi-area OSPF pada Cisco Packet Tracer dan upload file PKT beserta laporan PDF.',
            'deadline' => Carbon::now()->addHours(8),
            'submission_url' => 'https://classroom.google.com/c/jarkom-b2',
            'submission_format' => 'NIU_Nama_Modul3.pdf',
            'created_by' => $pjJarkom->id,
        ]);

        $task2 = Task::create([
            'subject_id' => $web->id,
            'target_group' => 'ALL_THEORY',
            'title' => 'Mini Project: API Auth Sanctum & Inertia React',
            'description' => 'Implementasikan REST API dengan Laravel Sanctum dan buat frontend SPA menggunakan Inertia React.',
            'deadline' => Carbon::now()->addDays(2),
            'submission_url' => 'https://classroom.google.com/c/web-lanjut-bb',
            'submission_format' => 'Link GitHub Repository',
            'created_by' => $pjWeb->id,
        ]);

        $task3 = Task::create([
            'subject_id' => $rpl->id,
            'target_group' => 'ALL_THEORY',
            'title' => 'Dokumen SRS (Software Requirements Specification)',
            'description' => 'Susun dokumen SRS lengkap dengan Use Case Diagram, Activity Diagram, dan Wireframe UI.',
            'deadline' => Carbon::now()->addDays(5),
            'submission_url' => 'https://classroom.google.com/c/rpl-bb',
            'submission_format' => 'Kelompok_SRS_NamaApp.pdf',
            'created_by' => $admin->id,
        ]);

        // Personal completion contoh: Mahasiswa Adib sudah menyelesaikan Task 3
        UserTaskCompletion::create([
            'user_id' => $studentB1->id,
            'task_id' => $task3->id,
            'is_completed' => true,
            'completed_at' => Carbon::now()->subDay(),
        ]);
    }
}
