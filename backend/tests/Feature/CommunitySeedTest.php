<?php

namespace Tests\Feature;

use Database\Seeders\CommunityInteractionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CommunitySeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_seed_fills_every_interaction_table_with_consistent_references(): void
    {
        $this->seed();

        $this->assertGreaterThanOrEqual(10, DB::table('users')->where('role_user', 'user')->count());
        $this->assertGreaterThanOrEqual(60, DB::table('komentar')->whereNull('id_parent')->count());
        $this->assertGreaterThanOrEqual(40, DB::table('komentar')->whereNotNull('id_parent')->count());
        $this->assertGreaterThanOrEqual(20, DB::table('diskusi')->count());
        $this->assertGreaterThanOrEqual(45, DB::table('tanggapan_diskusi')->count());
        $this->assertGreaterThanOrEqual(15, DB::table('laporan_komentar')->count());
        $this->assertGreaterThanOrEqual(10, DB::table('laporan_diskusi')->count());
        $this->assertGreaterThanOrEqual(8, DB::table('laporan_tanggapan')->count());
        $this->assertGreaterThanOrEqual(12, DB::table('feedback_faskes')->count());
    }

    public function test_seed_respects_reply_rating_and_report_integrity_rules(): void
    {
        $this->seed();

        $this->assertSame(0, DB::table('komentar')->whereNotNull('id_parent')->whereNotNull('rating')->count());

        $repliesWithForeignParent = DB::table('komentar as reply')
            ->join('komentar as parent', 'reply.id_parent', '=', 'parent.id_komentar')
            ->whereColumn('reply.id_faskes', '!=', 'parent.id_faskes')
            ->count();
        $this->assertSame(0, $repliesWithForeignParent);

        $repliesToNestedComment = DB::table('komentar as reply')
            ->join('komentar as parent', 'reply.id_parent', '=', 'parent.id_komentar')
            ->whereNotNull('parent.id_parent')
            ->count();
        $this->assertSame(0, $repliesToNestedComment);

        $mismatchedCommentReports = DB::table('laporan_komentar')
            ->join('komentar', 'laporan_komentar.id_komentar', '=', 'komentar.id_komentar')
            ->whereColumn('laporan_komentar.id_faskes', '!=', 'komentar.id_faskes')
            ->count();
        $this->assertSame(0, $mismatchedCommentReports);

        $mismatchedReporters = DB::table('laporan_komentar')
            ->join('komentar', 'laporan_komentar.id_komentar', '=', 'komentar.id_komentar')
            ->whereColumn('laporan_komentar.id_reported_user', '!=', 'komentar.id_user')
            ->count();
        $this->assertSame(0, $mismatchedReporters);

        $mismatchedDiscussionReporters = DB::table('laporan_diskusi')
            ->join('diskusi', 'laporan_diskusi.id_diskusi', '=', 'diskusi.id_diskusi')
            ->whereColumn('laporan_diskusi.id_reported_user', '!=', 'diskusi.id_user')
            ->count();
        $this->assertSame(0, $mismatchedDiscussionReporters);

        $mismatchedReplyReporters = DB::table('laporan_tanggapan')
            ->join('tanggapan_diskusi', 'laporan_tanggapan.id_tanggapan', '=', 'tanggapan_diskusi.id_tanggapan_diskusi')
            ->whereColumn('laporan_tanggapan.id_reported_user', '!=', 'tanggapan_diskusi.id_user')
            ->count();
        $this->assertSame(0, $mismatchedReplyReporters);

        $crossDiscussionReplies = DB::table('tanggapan_diskusi as reply')
            ->join('tanggapan_diskusi as parent', 'reply.id_parent', '=', 'parent.id_tanggapan_diskusi')
            ->whereColumn('reply.id_diskusi', '!=', 'parent.id_diskusi')
            ->count();
        $this->assertSame(0, $crossDiscussionReplies);

        $invalidStatuses = DB::table('laporan_komentar')->whereNotIn('status', ['pending', 'resolved', 'rejected'])->count()
            + DB::table('laporan_diskusi')->whereNotIn('status', ['pending', 'resolved', 'rejected'])->count()
            + DB::table('laporan_tanggapan')->whereNotIn('status', ['pending', 'resolved', 'rejected'])->count()
            + DB::table('feedback_faskes')->whereNotIn('status', ['pending', 'resolved', 'rejected'])->count();
        $this->assertSame(0, $invalidStatuses);

        $this->assertSame(0, DB::table('feedback_faskes')->where('saran_perbaikan', '')->count());
    }

    public function test_seed_spreads_authors_and_is_idempotent(): void
    {
        $this->seed();
        $firstCounts = [
            'komentar' => DB::table('komentar')->count(),
            'diskusi' => DB::table('diskusi')->count(),
            'tanggapan_diskusi' => DB::table('tanggapan_diskusi')->count(),
            'laporan_komentar' => DB::table('laporan_komentar')->count(),
            'feedback_faskes' => DB::table('feedback_faskes')->count(),
        ];
        $this->assertGreaterThanOrEqual(10, DB::table('komentar')->distinct()->count('id_user'));
        $this->assertGreaterThanOrEqual(15, DB::table('komentar')->distinct()->count('id_faskes'));

        $this->seed(CommunityInteractionSeeder::class);

        foreach ($firstCounts as $table => $count) {
            $this->assertSame($count, DB::table($table)->count(), $table.' grew after a second run');
        }
    }
}
