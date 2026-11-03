<?php

use App\Http\Controllers\Api\AdminFaskesController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FaskesController;
use App\Http\Controllers\Api\ForumController;
use App\Http\Controllers\Api\KomentarController;
use App\Http\Controllers\Api\MasterDataController;
use App\Http\Controllers\Api\ModerationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Middleware\AdminOnly;
use App\Http\Middleware\ApiTokenAuth;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware(ApiTokenAuth::class);
});

Route::get('home', [DashboardController::class, 'home']);
Route::get('faskes', [FaskesController::class, 'index']);
Route::get('faskes/nearby', [FaskesController::class, 'nearby']);
Route::get('faskes/map', [FaskesController::class, 'map']);
Route::get('faskes/{faskes}/komentar', [KomentarController::class, 'index']);
Route::get('faskes/{faskes}', [FaskesController::class, 'show']);
Route::get('spesialisasi', [MasterDataController::class, 'spesialisasi']);
Route::get('fasilitas', [MasterDataController::class, 'fasilitas']);
Route::get('diskusi', [ForumController::class, 'index']);
Route::get('diskusi/{diskusi}', [ForumController::class, 'show']);
Route::middleware(ApiTokenAuth::class)->group(function (): void {
    Route::get('user', [ProfileController::class, 'current']);
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);

    Route::post('faskes/{faskes}/komentar', [KomentarController::class, 'store']);
    Route::post('komentar/{komentar}/replies', [KomentarController::class, 'reply']);
    Route::delete('komentar/{komentar}', [KomentarController::class, 'destroy']);
    Route::post('komentar/{komentar}/report', [ModerationController::class, 'reportKomentar']);
    Route::post('diskusi', [ForumController::class, 'store']);
    Route::delete('diskusi/{diskusi}', [ForumController::class, 'destroy']);
    Route::post('diskusi/{diskusi}/tanggapan', [ForumController::class, 'storeReply']);
    Route::post('diskusi/{diskusi}/report', [ModerationController::class, 'reportDiskusi']);
    Route::post('tanggapan-diskusi/{tanggapan}/replies', [ForumController::class, 'replyToReply']);
    Route::post('tanggapan-diskusi/{tanggapan}/report', [ModerationController::class, 'reportTanggapan']);
    Route::put('tanggapan-diskusi/{tanggapan}', [ForumController::class, 'updateReply']);
    Route::delete('tanggapan-diskusi/{tanggapan}', [ForumController::class, 'destroyReply']);
    Route::post('faskes/{faskes}/feedback', [ModerationController::class, 'feedback']);
    Route::get('me/komentar', [KomentarController::class, 'mine']);
    Route::get('me/diskusi', [ForumController::class, 'mine']);

    Route::prefix('admin')->middleware(AdminOnly::class)->group(function (): void {
        Route::get('dashboard', [DashboardController::class, 'admin']);
        Route::get('faskes', [FaskesController::class, 'index']);
        Route::post('faskes', [AdminFaskesController::class, 'store']);
        Route::put('faskes/{faskes}', [AdminFaskesController::class, 'update']);
        Route::delete('faskes/{faskes}', [AdminFaskesController::class, 'destroy']);
        Route::get('users', [AdminUserController::class, 'index']);
        Route::get('users/{user}', [AdminUserController::class, 'show']);
        Route::put('users/{user}', [AdminUserController::class, 'update']);
        Route::delete('users/{user}', [AdminUserController::class, 'destroy']);
        Route::get('laporan', [ModerationController::class, 'reports']);
        Route::patch('laporan/{type}/{id}/status', [ModerationController::class, 'updateReport']);
        Route::delete('laporan/{type}/{id}', [ModerationController::class, 'deleteReport']);
        Route::get('feedback-faskes', [ModerationController::class, 'feedbacks']);
        Route::patch('feedback-faskes/{feedback}', [ModerationController::class, 'updateFeedback']);
        Route::delete('feedback-faskes/{feedback}', [ModerationController::class, 'deleteFeedback']);
    });
});
