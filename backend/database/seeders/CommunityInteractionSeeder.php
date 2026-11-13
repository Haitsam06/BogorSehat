<?php

namespace Database\Seeders;

use DateTimeImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CommunityInteractionSeeder extends Seeder
{
    private const SEED_DATE = '2026-10-01 09:00:00';

    public function run(): void
    {
        $users = $this->userRows();
        $komentar = [...$this->komentarRows(), ...$this->komentarBalasanRows()];
        $diskusi = $this->diskusiRows();
        $tanggapan = $this->tanggapanRows();
        $laporanKomentar = $this->laporanKomentarRows();
        $laporanDiskusi = $this->laporanDiskusiRows();
        $laporanTanggapan = $this->laporanTanggapanRows();
        $feedback = $this->feedbackRows();
        $sukaDiskusi = $this->diskusiSukaRows();
        $sukaTanggapan = $this->tanggapanSukaRows();
        $dilihat = $this->diskusiDilihatRows();

        DB::table('users')->upsert($users, ['id_user'], [
            'nama_user', 'email_user', 'password_user', 'role_user', 'updated_at',
        ]);
        DB::table('komentar')->upsert($komentar, ['id_komentar'], [
            'id_user', 'id_faskes', 'id_parent', 'body', 'rating', 'image_path', 'updated_at',
        ]);
        DB::table('diskusi')->upsert($diskusi, ['id_diskusi'], [
            'id_user', 'id_faskes', 'judul_diskusi', 'kategori_diskusi', 'body', 'image_path', 'updated_at',
        ]);
        DB::table('tanggapan_diskusi')->upsert($tanggapan, ['id_tanggapan_diskusi'], [
            'id_user', 'id_diskusi', 'id_parent', 'body', 'image_path', 'updated_at',
        ]);
        DB::table('laporan_komentar')->upsert($laporanKomentar, ['id_laporan_komentar'], [
            'id_komentar', 'id_faskes', 'id_reported_user', 'alasan', 'catatan', 'status', 'updated_at',
        ]);
        DB::table('laporan_diskusi')->upsert($laporanDiskusi, ['id_laporan_diskusi'], [
            'id_diskusi', 'id_reported_user', 'alasan', 'catatan', 'status', 'updated_at',
        ]);
        DB::table('laporan_tanggapan')->upsert($laporanTanggapan, ['id_laporan_tanggapan'], [
            'id_tanggapan', 'id_reported_user', 'alasan', 'catatan', 'status', 'updated_at',
        ]);
        DB::table('feedback_faskes')->upsert($feedback, ['id_feedback_faskes'], [
            'id_faskes', 'id_user', 'alasan', 'saran_perbaikan', 'status', 'catatan_admin', 'updated_at',
        ]);
        DB::table('diskusi_suka')->upsert($sukaDiskusi, ['id_diskusi_suka'], ['updated_at']);
        DB::table('tanggapan_diskusi_suka')->upsert($sukaTanggapan, ['id_tanggapan_diskusi_suka'], ['updated_at']);
        DB::table('diskusi_dilihat')->upsert($dilihat, ['id_diskusi_dilihat'], ['updated_at']);

        $this->command?->info(sprintf(
            'Seeded %d users, %d komentar, %d diskusi, %d tanggapan, %d laporan komentar, %d laporan diskusi, %d laporan tanggapan, %d feedback faskes, %d suka diskusi, %d suka tanggapan, %d dilihat.',
            count($users), count($komentar), count($diskusi), count($tanggapan),
            count($laporanKomentar), count($laporanDiskusi), count($laporanTanggapan), count($feedback),
            count($sukaDiskusi), count($sukaTanggapan), count($dilihat),
        ));
    }

    /** @return list<array<string, mixed>> */
    private function userRows(): array
    {
        $names = [
            'Budi Santoso',
            'Siti Nur Aisyah',
            'Agus Prasetyo',
            'Dewi Lestari',
            'Rizky Ramadhan',
            'Maya Anggraini',
            'Dedi Kurniawan',
            'Rina Marlina',
            'Fajar Nugroho',
            'Intan Permata Sari',
        ];
        $emails = [
            'budi.santoso@bogorsehat.test',
            'siti.nuraisyah@bogorsehat.test',
            'agus.prasetyo@bogorsehat.test',
            'dewi.lestari@bogorsehat.test',
            'rizky.ramadhan@bogorsehat.test',
            'maya.anggraini@bogorsehat.test',
            'dedi.kurniawan@bogorsehat.test',
            'rina.marlina@bogorsehat.test',
            'fajar.nugroho@bogorsehat.test',
            'intan.permata@bogorsehat.test',
        ];
        $password = Hash::make('password');
        $rows = [];

        foreach ($names as $index => $name) {
            $rows[] = [
                'id_user' => $index + 2,
                'nama_user' => $name,
                'email_user' => $emails[$index],
                'email_verified_at' => self::SEED_DATE,
                'password_user' => $password,
                'role_user' => 'user',
                'foto_profil' => null,
                'created_at' => self::SEED_DATE,
                'updated_at' => self::SEED_DATE,
            ];
        }

        return $rows;
    }

    /** @return list<string> */
    private function faskesIds(): array
    {
        return array_map(static fn (int $offset): int => 5 + ($offset * 16), range(0, 29));
    }

    /** @return list<array<string, mixed>> */
    private function komentarRows(): array
    {
        $bodies = [
            'Pelayanan di faskes ini sangat cepat dan seluruh petugasnya ramah kepada pasien.',
            'Dokter menjelaskan diagnosis dengan detail dan memberi kesempatan bertanya yang cukup.',
            'Ruang tunggu bersih, nyaman, dan tersedia air minum untuk keluarga pasien.',
            'Proses pendaftaran hanya butuh beberapa menit dan antrean berjalan tertib.',
            'Perawat sigap membantu pasien lansia sejak masuk sampai selesai pemeriksaan.',
            'Fasilitas laboratorium lengkap sehingga hasil pemeriksaan keluar di hari yang sama.',
            'Saya berobat pagi dan langsung dilayani sesuai nomor antrean tanpa menunggu lama.',
            'Informasi biaya dan prosedur BPJS dijelaskan jelas sebelum tindakan dilakukan.',
            'Tempat parkir luas dan akses masuk untuk pengguna kursi roda sudah memadai.',
            'Kebersihan toilet dan ruang periksa sangat terjaga setiap kali saya berkunjung.',
            'Apotek di dalam gedung memudahkan saya menebus resep tanpa harus keluar area.',
            'Petugas customer service sabar menjawab semua pertanyaan saya lewat telepon.',
            'Pelayanan sudah baik, hanya saja waktu tunggu di poli anak sedikit lebih panjang.',
            'Dokternya komunikatif, tetapi ruang tunggu terasa penuh pada jam sibuk.',
            'Prosedur administrasi jelas, meski loket pembayaran hanya dibuka satu pada pagi hari.',
            'Fasilitas cukup lengkap, sayang pendingin ruangan di lantai dua kurang dingin.',
            'Perawat ramah dan cepat tanggap, namun informasi jadwal dokter belum diperbarui di papan.',
            'Pemeriksaan berjalan lancar, hanya hasil laboratorium perlu diambil kembali besok.',
            'Tempatnya bersih dan teratur, tetapi kursi tunggu di poli dalam masih terbatas.',
            'Saya puas dengan penjelasan dokter, hanya saja antrean farmasi cukup padat sore ini.',
            'Pendaftaran online memudahkan, walaupun verifikasi di loket tetap harus mengantre.',
            'Akses jalan menuju faskes mudah, tetapi petunjuk arah di dalam gedung kurang jelas.',
            'Petugas keamanan membantu mengarahkan parkir, sayang area parkir cepat penuh.',
            'Pelayanan pemeriksaan gigi memuaskan, hanya jadwal kontrol berikutnya cukup jauh.',
            'Pelayanannya standar, antrean panjang terutama setelah jam makan siang.',
            'Dokter cukup singkat menjelaskan, saya harus bertanya ulang agar lebih paham.',
            'Ruang tunggu cukup bersih, tetapi beberapa kursi sudah rusak dan belum diperbaiki.',
            'Prosedur pendaftaran agak berbelit karena harus mengisi formulir yang sama dua kali.',
            'Perawat membantu dengan baik, tetapi jumlah petugas di loket masih kurang.',
            'Fasilitas dasar tersedia, namun tidak ada papan informasi jadwal poli yang jelas.',
            'Hasil pemeriksaan keluar sesuai janji, meski proses pengambilannya harus dua kali datang.',
            'Biaya sesuai ketentuan, hanya saja rincian tagihan tidak dijelaskan di awal.',
            'Lokasi mudah dijangkau, tetapi lahan parkir sempit untuk kendaraan roda empat.',
            'Pelayanan farmasi lambat karena hanya satu petugas yang melayani resep.',
            'Toilet bersih, tetapi air di wastafel ruang tunggu tidak mengalir saat saya datang.',
            'Pemeriksaan berjalan cukup baik, hanya suhu ruangan terasa panas pada siang hari.',
            'Waktu tunggu hampir dua jam padahal sudah mengambil nomor antrean pagi.',
            'Dokter terburu-buru dan tidak menjelaskan dosis obat yang diberikan kepada saya.',
            'Ruang tunggu kotor dan tempat sampah di sudut ruangan sudah penuh.',
            'Petugas loket kurang ramah ketika saya menanyakan berkas yang belum lengkap.',
            'Informasi jadwal dokter berbeda antara papan pengumuman dan petugas pendaftaran.',
            'Saya harus bolak-balik ke laboratorium karena sampel darah diambil dua kali.',
            'Fasilitas kursi roda tidak tersedia saat keluarga saya membutuhkannya.',
            'Antrean farmasi tidak tertib dan tidak ada nomor urut yang jelas.',
            'Toilet tidak tersedia air bersih dan tidak ada petugas kebersihan di sekitar.',
            'Tagihan yang saya terima berbeda dengan perkiraan biaya yang disampaikan sebelumnya.',
            'Ruang periksa sempit sehingga privasi pasien kurang terjaga.',
            'Panggilan antrean tidak terdengar jelas karena pengeras suara di poli bermasalah.',
            'Saya menunggu lebih dari tiga jam tanpa penjelasan dari petugas pendaftaran.',
            'Dokter tidak memeriksa keluhan saya dengan teliti dan langsung memberikan resep.',
            'Ruangan kotor, bau, dan tidak ada tempat duduk yang layak untuk pasien.',
            'Petugas loket membentak saya saat menanyakan prosedur rujukan BPJS.',
            'Jadwal yang dijanjikan tidak pernah dikonfirmasi sehingga saya datang sia-sia.',
            'Obat yang diresepkan tidak tersedia dan tidak ada informasi penggantinya.',
            'Tidak ada petunjuk arah sehingga saya berputar-putar di dalam gedung.',
            'Saya diminta membayar biaya tambahan yang tidak pernah dijelaskan sebelumnya.',
            'Fasilitas darurat tidak siap saat keluarga saya datang dengan keluhan sesak napas.',
            'Rekam medis saya tertukar dengan pasien lain saat proses pendaftaran.',
            'Tidak ada petugas yang membantu ketika saya mengantri di loket rujukan.',
            'Pelayanan sangat lambat dan tidak ada permintaan maaf atas keterlambatan tersebut.',
        ];
        $faskesIds = $this->faskesIds();
        $rows = [];

        foreach ($bodies as $index => $body) {
            $id = $index + 1;
            $rows[] = [
                'id_komentar' => $id,
                'id_user' => 2 + ($index % 10),
                'id_faskes' => $faskesIds[$index % 30],
                'id_parent' => null,
                'body' => $body,
                'rating' => 5 - intdiv($index, 12),
                'image_path' => $index % 4 === 0
                    ? json_encode(['komentar/ulasan-'.$id.'.jpg'], JSON_THROW_ON_ERROR)
                    : null,
                'created_at' => $this->timestamp($index),
                'updated_at' => $this->timestamp($index),
            ];
        }

        return $rows;
    }

    /** @return list<array<string, mixed>> */
    private function komentarBalasanRows(): array
    {
        $bodies = [
            'Terima kasih infonya, kebetulan saya juga berencana berobat ke sana minggu depan.',
            'Saya mengalami hal serupa, sebaiknya datang lebih pagi agar tidak terlalu lama menunggu.',
            'Apakah antrean online juga tersedia untuk poli gigi di faskes ini?',
            'Pengalaman saya berbeda, pelayanan di sana cukup cepat pada hari kerja.',
            'Terima kasih sudah berbagi, info dokter jaga malamnya sangat membantu.',
            'Saya setuju, petugas di loket pendaftaran memang cukup membantu.',
            'Apakah hasil laboratorium bisa diambil pada hari yang sama?',
            'Sebelumnya saya berobat di sini dan ruang tunggunya memang nyaman.',
            'Mohon info apakah faskes ini menerima rujukan dari puskesmas kecamatan.',
            'Semoga pihak faskes segera memperbaiki fasilitas yang disebutkan.',
            'Saya juga menunggu cukup lama, tapi dokternya menjelaskan dengan sabar.',
            'Apakah parkir tersedia untuk pengunjung yang membawa mobil?',
            'Terima kasih koreksinya, mungkin jam kunjungannya perlu dicek ulang.',
            'Saya pernah ke sana dan pelayanan farmasinya memang agak lambat.',
            'Informasi biaya yang diberikan petugas cukup jelas saat saya tanya langsung.',
            'Setuju, sebaiknya bawa berkas lengkap agar prosesnya tidak bolak-balik.',
            'Apakah ada jalur khusus untuk pasien lansia di faskes ini?',
            'Pengalaman saya justru sebaliknya, antreannya tertib dan cepat.',
            'Terima kasih, saya jadi tahu harus datang jam berapa supaya tidak menunggu.',
            'Semoga keluhan ini ditindaklanjuti oleh pengelola faskes.',
            'Saya juga melihat ruang tunggu poli dalam sedang diperbaiki minggu lalu.',
            'Apakah nomor antrean bisa diambil lewat aplikasi atau harus datang langsung?',
            'Terima kasih, dokter yang Anda sebut memang praktik setiap hari Senin.',
            'Saya sarankan menghubungi call center sebelum berangkat untuk memastikan jadwal.',
            'Keluhan serupa pernah saya sampaikan ke petugas dan langsung ditindaklanjuti.',
            'Apakah fasilitas ini menyediakan layanan fisioterapi setiap hari?',
            'Terima kasih atas ulasannya, sangat membantu saya memilih faskes rujukan.',
            'Setahu saya jam pendaftaran dibuka mulai pukul tujuh pagi.',
            'Saya dengar poli anak sedang menambah dokter jaga bulan ini.',
            'Mohon dicek kembali, karena jadwal dokter bisa berubah pada hari libur.',
            'Saya juga merasakan perbaikan pelayanan setelah gedung baru dibuka.',
            'Apakah tersedia tempat tunggu khusus ibu menyusui di lantai satu?',
            'Terima kasih, saya akan mencoba mendaftar online supaya lebih cepat.',
            'Pengalaman saya juga baik, perawatnya membantu mengurus berkas rujukan.',
            'Semoga kualitas kebersihan ruang tunggu terus dijaga setiap hari.',
            'Saya pernah menunggu lama di farmasi, sebaiknya ambil obat pagi hari.',
            'Apakah ada papan informasi digital yang menampilkan sisa antrean?',
            'Terima kasih, informasi parkir tambahan di belakang gedung sangat berguna.',
            'Saya harap petugas loket mendapat pelatihan komunikasi yang lebih baik.',
            'Apakah faskes ini melayani pemeriksaan kesehatan untuk anak sekolah?',
        ];
        $faskesIds = $this->faskesIds();
        $rows = [];

        foreach ($bodies as $index => $body) {
            $id = 61 + $index;
            $parentId = 1 + (($index * 7) % 60);
            $rows[] = [
                'id_komentar' => $id,
                'id_user' => 2 + (($index + 3) % 10),
                'id_faskes' => $faskesIds[($parentId - 1) % 30],
                'id_parent' => $parentId,
                'body' => $body,
                'rating' => null,
                'image_path' => $index % 5 === 0
                    ? json_encode(['komentar/balasan-'.$id.'.jpg'], JSON_THROW_ON_ERROR)
                    : null,
                'created_at' => $this->timestamp(70 + $index),
                'updated_at' => $this->timestamp(70 + $index),
            ];
        }

        return $rows;
    }

    /** @return list<array<string, mixed>> */
    private function diskusiRows(): array
    {
        $discussions = [
            ['Pengalaman pemeriksaan kesehatan rutin di puskesmas Bogor', 'kesehatan', 'Saya rutin memeriksakan tekanan darah setiap bulan di puskesmas dekat rumah dan ingin berbagi pengalaman mengenai alur pelayanannya.'],
            ['Cara efektif menjaga imunitas keluarga di musim hujan', 'kesehatan', 'Musim hujan membuat anak mudah terserang flu, saya mencari cara menjaga imunitas yang bisa diterapkan di rumah.'],
            ['Rekomendasi tempat kontrol tekanan darah yang terjangkau', 'kesehatan', 'Orang tua saya perlu kontrol hipertensi setiap bulan dan saya ingin mencari faskes dengan biaya yang ramah.'],
            ['Pentingnya vaksinasi anak sebelum masuk sekolah', 'kesehatan', 'Saya ingin memahami jadwal vaksinasi yang diperlukan sebelum anak masuk sekolah dasar tahun ini.'],
            ['Tips mengurangi risiko demam berdarah di perumahan', 'kesehatan', 'Lingkungan kami mulai muncul kasus demam berdarah, saya mencari tips pencegahan yang efektif.'],
            ['Fasilitas apa yang paling perlu ditambah di faskes Kota Bogor?', 'fasilitas', 'Menurut teman-teman, fasilitas apa yang paling mendesak untuk ditambahkan di faskes sekitar Kota Bogor?'],
            ['Pengalaman parkir dan akses masuk faskes saat jam sibuk', 'fasilitas', 'Saat jam sibuk area parkir beberapa faskes cepat penuh, saya ingin mendengar pengalaman pengguna lain.'],
            ['Ruang tunggu yang nyaman untuk pasien lansia', 'fasilitas', 'Pasien lansia membutuhkan kursi dengan sandaran dan akses yang mudah, fasilitas mana yang sudah menyediakannya?'],
            ['Apakah faskes di Bogor sudah ramah disabilitas?', 'fasilitas', 'Saya ingin tahu faskes mana yang sudah memiliki jalur landai dan toilet khusus pengguna kursi roda.'],
            ['Ketersediaan ruang laktasi di puskesmas dan klinik', 'fasilitas', 'Sebagai ibu menyusui, saya mencari faskes yang menyediakan ruang laktasi yang layak dan bersih.'],
            ['Bagaimana prosedur rujukan BPJS yang benar?', 'layanan', 'Saya masih bingung dengan alur rujukan BPJS dari puskesmas ke rumah sakit, mohon penjelasan pengguna lain.'],
            ['Pengalaman mengurus surat keterangan sehat untuk kerja', 'layanan', 'Saya perlu surat keterangan sehat untuk melamar kerja dan ingin tahu proses serta biayanya di faskes Bogor.'],
            ['Waktu tunggu farmasi di klinik swasta dan puskesmas', 'layanan', 'Saya membandingkan waktu tunggu obat di klinik swasta dan puskesmas supaya bisa memilih yang lebih efisien.'],
            ['Pendaftaran online masih perlu antre di loket', 'layanan', 'Pendaftaran online sudah tersedia, tetapi verifikasi berkas di loket masih memakan waktu cukup lama.'],
            ['Layanan ambulans gratis untuk warga Bogor', 'layanan', 'Saya ingin mengetahui faskes mana yang menyediakan ambulans gratis dan bagaimana cara menghubunginya saat darurat.'],
            ['Diskusi biaya pemeriksaan laboratorium mandiri', 'lainnya', 'Saya ingin memeriksakan darah secara mandiri tanpa rujukan dokter, berapa kisaran biaya di faskes Bogor?'],
            ['Rekomendasi asuransi tambahan selain BPJS', 'lainnya', 'Saya sudah memakai BPJS dan sedang mempertimbangkan asuransi tambahan untuk layanan yang tidak ditanggung.'],
            ['Tempat olahraga murah di sekitar Bogor', 'lainnya', 'Saya mencari tempat olahraga pagi yang terjangkau dan dekat dengan pemukiman di Kota Bogor.'],
            ['Pengalaman konsultasi gizi untuk anak', 'lainnya', 'Anak saya sulit makan sayur, saya ingin tahu apakah konsultasi gizi di puskesmas membantu mengatasi masalah ini.'],
            ['Cara memilih faskes terdekat dari rumah', 'lainnya', 'Saya baru pindah ke Bogor dan ingin memilih faskes terdekat yang sesuai dengan kebutuhan keluarga.'],
        ];
        $rows = [];

        foreach ($discussions as $index => $discussion) {
            $id = $index + 1;
            $rows[] = [
                'id_diskusi' => $id,
                'id_user' => 2 + ($index % 10),
                'id_faskes' => $this->faskesIds()[($index * 3) % count($this->faskesIds())],
                'judul_diskusi' => $discussion[0],
                'kategori_diskusi' => $discussion[1],
                'body' => $discussion[2],
                'image_path' => $index % 3 === 0
                    ? json_encode(['diskusi/diskusi-'.$id.'.jpg'], JSON_THROW_ON_ERROR)
                    : null,
                'created_at' => $this->timestamp($index),
                'updated_at' => $this->timestamp($index),
            ];
        }

        return $rows;
    }

    /** @return list<array<string, mixed>> */
    private function tanggapanRows(): array
    {
        $topLevel = [
            'Saya juga rutin kontrol di sana, biasanya pagi lebih sepi dibanding siang.',
            'Terima kasih sudah berbagi, pengalaman ini sangat membantu warga baru seperti saya.',
            'Sebenarnya dengan BPJS layanan tersebut tetap bisa diakses, asalkan membawa rujukan.',
            'Jadwal vaksinasi biasanya diumumkan di papan pengumuman puskesmas setiap awal bulan.',
            'Kami di lingkungan RT juga sedang melakukan kerja bakti untuk membersihkan saluran air.',
            'Menurut saya ruang tunggu tambahan dan area parkir yang paling dibutuhkan.',
            'Parkir di belakang gedung biasanya masih tersedia pada pagi hari.',
            'Kursi di dekat pintu masuk memang disediakan khusus untuk pasien lansia.',
            'Beberapa faskes besar sudah punya jalur landai, tapi perlu dicek langsung.',
            'Ruang laktasi biasanya ada di lantai satu dekat poli anak.',
            'Rujukan bisa diurus di puskesmas sesuai domisili, lalu diverifikasi di rumah sakit tujuan.',
            'Surat keterangan sehat biasanya selesai di hari yang sama setelah pemeriksaan dasar.',
            'Waktu tunggu farmasi di puskesmas lebih lama jika resep diambil menjelang siang.',
            'Sebaiknya tetap datang ke loket untuk verifikasi berkas pendaftaran online.',
            'Ambulans gratis biasanya dikoordinasikan melalui puskesmas kecamatan.',
            'Biaya laboratorium mandiri bervariasi tergantung jenis pemeriksaan yang diminta.',
            'Saya memakai asuransi tambahan dari kantor dan proses klaimnya cukup mudah.',
            'Taman di sekitar lapangan kota ramai dipakai untuk olahraga pagi setiap akhir pekan.',
            'Konsultasi gizi sangat membantu, dokter memberi contoh menu yang mudah diterapkan.',
            'Pilih faskes yang sesuai domisili agar proses rujukan BPJS lebih mudah.',
        ];
        $nested = [
            'Betul, saya juga biasanya datang sebelum jam delapan supaya antreannya pendek.',
            'Apakah rujukan dari puskesmas lain juga diterima di sana?',
            'Terima kasih infonya, minggu depan saya coba datang lebih pagi.',
            'Saya sudah coba dan benar, prosesnya tidak sampai satu jam.',
            'Untuk poli gigi sebaiknya membuat janji terlebih dahulu lewat telepon.',
            'Saya rasa pengelola sudah merespons keluhan serupa dengan cepat.',
            'Kemarin saya tanya petugas, parkir tambahan dibuka mulai jam enam pagi.',
            'Kursi lansia tersebut baru ditambahkan bulan lalu setelah ada masukan warga.',
            'Jalur landainya cukup lebar, tapi tidak semua pintu masuk tersedia.',
            'Ruang laktasi bersih dan dilengkapi pendingin ruangan.',
            'Surat rujukan harus diperpanjang setiap tiga bulan sesuai ketentuan BPJS.',
            'Biaya pemeriksaan dasar memang terjangkau dan bisa dibayar tunai.',
            'Sebaiknya ambil obat langsung setelah pemeriksaan agar tidak pulang dua kali.',
            'Pendaftaran online tetap memerlukan KTP asli saat verifikasi.',
            'Nomor ambulans puskesmas bisa disimpan untuk keadaan darurat.',
            'Hasil laboratorium saya keluar sekitar dua jam setelah sampel diambil.',
            'Klaim asuransi tambahan perlu melampirkan kuitansi asli dari faskes.',
            'Olahraga pagi di sana gratis dan udaranya masih segar.',
            'Menu yang disarankan dokter gizi cocok untuk anak usia sekolah.',
            'Faskes terdekat biasanya tertera pada aplikasi layanan kesehatan resmi.',
            'Saya juga menunggu sekitar satu jam pada hari Senin, cukup wajar.',
            'Apakah jam besuknya dibatasi untuk pasien rawat inap?',
            'Saya akan tanya langsung ke loket mengenai syarat tersebut.',
            'Pengalaman saya sama, petugasnya cukup sabar menjelaskan alurnya.',
            'Semoga fasilitas baru segera beroperasi supaya antrean lebih ringan.',
        ];
        $rows = [];

        foreach ($topLevel as $index => $body) {
            $id = $index + 1;
            $rows[] = [
                'id_tanggapan_diskusi' => $id,
                'id_user' => 2 + (($index + 2) % 10),
                'id_diskusi' => $id,
                'id_parent' => null,
                'body' => $body,
                'image_path' => $index % 6 === 0
                    ? json_encode(['tanggapan/tanggapan-'.$id.'.jpg'], JSON_THROW_ON_ERROR)
                    : null,
                'created_at' => $this->timestamp(50 + $index),
                'updated_at' => $this->timestamp(50 + $index),
            ];
        }

        foreach ($nested as $index => $body) {
            $id = 21 + $index;
            $diskusiId = ($index % 20) + 1;
            $parentId = $index < 20 ? $diskusiId : 20 + $diskusiId;
            $rows[] = [
                'id_tanggapan_diskusi' => $id,
                'id_user' => 2 + (($index + 5) % 10),
                'id_diskusi' => $diskusiId,
                'id_parent' => $parentId,
                'body' => $body,
                'image_path' => $index % 7 === 0
                    ? json_encode(['tanggapan/balasan-'.$id.'.jpg'], JSON_THROW_ON_ERROR)
                    : null,
                'created_at' => $this->timestamp(80 + $index),
                'updated_at' => $this->timestamp(80 + $index),
            ];
        }

        return $rows;
    }

    /** @return list<array<string, mixed>> */
    private function laporanKomentarRows(): array
    {
        $komentarIds = [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59];
        $alasan = [
            'Komentar mengandung kata kasar',
            'Informasi yang disampaikan menyesatkan',
            'Komentar berisi promosi layanan lain',
            'Komentar tidak relevan dengan faskes',
            'Komentar mengandung ujaran kebencian',
        ];
        $catatan = [
            'Mohon ditinjau karena sudah muncul beberapa keluhan serupa.',
            'Komentar ini merugikan nama faskes dan perlu diverifikasi.',
            'Pengguna lain melaporkan isi komentar yang sama.',
            null,
        ];
        $statuses = ['pending', 'resolved', 'rejected'];
        $faskesIds = $this->faskesIds();
        $rows = [];

        foreach ($komentarIds as $index => $komentarId) {
            $rows[] = [
                'id_laporan_komentar' => $index + 1,
                'id_komentar' => $komentarId,
                'id_faskes' => $faskesIds[($komentarId - 1) % 30],
                'id_reported_user' => 2 + (($komentarId - 1) % 10),
                'alasan' => $alasan[$index % 5],
                'catatan' => $catatan[$index % 4],
                'status' => $statuses[$index % 3],
                'created_at' => $this->timestamp(110 + $index),
                'updated_at' => $this->timestamp(110 + $index),
            ];
        }

        return $rows;
    }

    /** @return list<array<string, mixed>> */
    private function laporanDiskusiRows(): array
    {
        $alasan = [
            'Judul diskusi provokatif',
            'Isi diskusi memuat informasi palsu',
            'Diskusi mengandung unsur iklan',
            'Diskusi keluar dari topik kesehatan',
        ];
        $statuses = ['pending', 'resolved', 'rejected'];
        $rows = [];

        foreach (range(1, 10) as $index => $diskusiId) {
            $rows[] = [
                'id_laporan_diskusi' => $diskusiId,
                'id_diskusi' => $diskusiId,
                'id_reported_user' => 2 + (($diskusiId - 1) % 10),
                'alasan' => $alasan[$index % 4],
                'catatan' => $index % 3 === 0
                    ? 'Mohon ditinjau ulang oleh moderator komunitas.'
                    : null,
                'status' => $statuses[$index % 3],
                'created_at' => $this->timestamp(130 + $index),
                'updated_at' => $this->timestamp(130 + $index),
            ];
        }

        return $rows;
    }

    /** @return list<array<string, mixed>> */
    private function laporanTanggapanRows(): array
    {
        $alasan = [
            'Tanggapan mengandung kata tidak sopan',
            'Tanggapan berisi informasi yang belum terverifikasi',
            'Tanggapan menyerang pengguna lain',
            'Tanggapan tidak berkaitan dengan diskusi',
        ];
        $statuses = ['pending', 'resolved', 'rejected'];
        $rows = [];

        foreach (range(1, 8) as $index => $tanggapanId) {
            $rows[] = [
                'id_laporan_tanggapan' => $tanggapanId,
                'id_tanggapan' => $tanggapanId,
                'id_reported_user' => 2 + (($tanggapanId + 1) % 10),
                'alasan' => $alasan[$index % 4],
                'catatan' => $index % 2 === 0
                    ? 'Sudah dilaporkan oleh dua pengguna lain.'
                    : null,
                'status' => $statuses[$index % 3],
                'created_at' => $this->timestamp(145 + $index),
                'updated_at' => $this->timestamp(145 + $index),
            ];
        }

        return $rows;
    }

    /** @return list<array<string, mixed>> */
    private function feedbackRows(): array
    {
        $feedback = [
            ['Pelayanan kurang cepat', 'Perlu penambahan petugas loket pada jam sibuk agar antrean pendaftaran lebih singkat.'],
            ['Ruang tunggu tidak nyaman', 'Sebaiknya ditambah kursi dan pendingin ruangan di poli dalam agar pasien menunggu lebih nyaman.'],
            ['Kebersihan toilet kurang terjaga', 'Petugas kebersihan perlu berkeliling memeriksa toilet setiap dua jam pada hari kerja.'],
            ['Sistem antrean belum tertib', 'Perlu papan informasi digital yang menampilkan nomor antrean berjalan di setiap poli.'],
            ['Ketersediaan obat terbatas', 'Stok obat dasar sebaiknya dipantau rutin agar resep bisa ditebus di tempat.'],
            ['Informasi jadwal dokter tidak jelas', 'Jadwal praktik dokter perlu diperbarui di papan pengumuman dan situs resmi faskes.'],
            ['Akses kursi roda belum memadai', 'Perlu disediakan kursi roda tambahan di pintu masuk utama dan jalur landai yang aman.'],
            ['Area parkir terlalu sempit', 'Pengelolaan parkir perlu diperbaiki dengan menambah petugas dan menata ulang lahan.'],
            ['Waktu tunggu farmasi panjang', 'Proses penyiapan obat sebaiknya memakai sistem nomor urut dan menambah tenaga farmasi.'],
            ['Penerangan ruang periksa kurang', 'Lampu di ruang pemeriksaan sebaiknya diganti agar dokter dapat memeriksa dengan lebih teliti.'],
            ['Informasi biaya belum transparan', 'Rincian biaya tindakan sebaiknya dijelaskan sebelum pasien menyetujui layanan.'],
            ['Petugas kurang komunikatif', 'Perlu pelatihan komunikasi dan pelayanan prima bagi petugas pendaftaran dan loket informasi.'],
        ];
        $statuses = ['pending', 'resolved', 'rejected'];
        $faskesIds = $this->faskesIds();
        $rows = [];

        foreach ($feedback as $index => $item) {
            $status = $statuses[$index % 3];
            $rows[] = [
                'id_feedback_faskes' => $index + 1,
                'id_faskes' => $faskesIds[$index],
                'id_user' => 2 + ($index % 10),
                'alasan' => $item[0],
                'saran_perbaikan' => $item[1],
                'status' => $status,
                'catatan_admin' => $status === 'pending'
                    ? null
                    : ($status === 'resolved'
                        ? 'Terima kasih, saran sudah diteruskan ke pengelola faskes.'
                        : 'Saran sudah ditinjau, perbaikan dijadwalkan pada anggaran berikutnya.'),
                'created_at' => $this->timestamp(160 + $index),
                'updated_at' => $this->timestamp(160 + $index),
            ];
        }

        return $rows;
    }

    /** @return list<array<string, mixed>> */
    private function diskusiSukaRows(): array
    {
        $rows = [];
        foreach (range(1, 20) as $index) {
            $likers = 2 + ($index % 7);
            foreach (range(1, $likers) as $offset) {
                $rows[] = [
                    'id_diskusi_suka' => count($rows) + 1,
                    'id_diskusi' => $index,
                    'id_user' => 2 + (($index + $offset) % 10),
                    'created_at' => $this->timestamp(200 + $index),
                    'updated_at' => $this->timestamp(200 + $index),
                ];
            }
        }

        return $rows;
    }

    /** @return list<array<string, mixed>> */
    private function tanggapanSukaRows(): array
    {
        $rows = [];
        foreach (range(1, 45) as $index) {
            $likers = $index % 5;
            foreach (range(1, $likers) as $offset) {
                $rows[] = [
                    'id_tanggapan_diskusi_suka' => count($rows) + 1,
                    'id_tanggapan' => $index,
                    'id_user' => 2 + (($index + $offset) % 10),
                    'created_at' => $this->timestamp(240 + $index),
                    'updated_at' => $this->timestamp(240 + $index),
                ];
            }
        }

        return $rows;
    }

    /** @return list<array<string, mixed>> */
    private function diskusiDilihatRows(): array
    {
        $rows = [];
        foreach (range(1, 20) as $index) {
            $viewers = 4 + ($index % 6);
            foreach (range(1, $viewers) as $offset) {
                $rows[] = [
                    'id_diskusi_dilihat' => count($rows) + 1,
                    'id_diskusi' => $index,
                    'id_user' => 2 + (($index + $offset) % 10),
                    'created_at' => $this->timestamp(280 + $index),
                    'updated_at' => $this->timestamp(280 + $index),
                ];
            }
        }

        return $rows;
    }

    private function timestamp(int $offsetMinutes): string
    {
        return (new DateTimeImmutable(self::SEED_DATE))
            ->modify(sprintf('+%d minutes', $offsetMinutes))
            ->format('Y-m-d H:i:s');
    }
}
