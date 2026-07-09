/**
 * Isi jawaban LKS demo untuk dashboard guru (idempoten — upsert).
 * Jalankan: npx tsx src/db/seed-lks-demo.ts
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { db, user, modul, lksTemplate, jawabanLks } from "./index";

/** Jawaban contoh per modul (urutan soal dimulai dari 1). */
const CONTOH: Record<string, Record<number, string>> = {
  "Hukum Newton: Gaya & Gerak": {
    1: "Balok bergerak ke depan sepanjang lintasan setelah ditekan tombol Dorong. Semakin besar gaya, gerakannya semakin cepat.",
    2: "Percepatan sebanding dengan gaya dan berbanding terbalik dengan massa (a = F/m). Saat gaya 20 N dan massa 5 kg, percepatan 4 m/s².",
  },
  "Rangkaian Listrik Sederhana": {
    1: "Lampu menyala karena rangkaian tertutup dan arus mengalir dari baterai ke lampu.",
    2: "Saklar terbuka memutus aliran arus sehingga lampu padam.",
    3: "Arus diukur 0,5 A saat tegangan 6 V dan hambatan 12 Ω (I = V/R).",
    4: "Hambatan total menurun saat komponen disambung paralel, arus bertambah.",
  },
  "Tata Surya (Kepler)": {
    1: "Planet terdekat ke Matahari bergerak lebih cepat; orbit tampak elips di simulasi.",
    2: "Jarak orbit Bumi sekitar 1 AU; periode revolusi sekitar 1 tahun.",
    3: "Saat jarak orbit diperbesar, periode revolusi (T) bertambah sesuai T ∝ √r³.",
    4: "Mars memiliki periode lebih panjang dari Bumi karena jarak orbitnya lebih jauh.",
  },
  "Gerak Jatuh Bebas": {
    1: "Benda jatuh lurus ke bawah dengan percepatan gravitasi hampir 9,8 m/s².",
    2: "Waktu jatuh dari 10 m sekitar 1,43 detik (mode udara).",
    3: "Di ruang hampa, benda ringan dan berat jatuh bersamaan.",
    4: "Kecepatan akhir meningkat seiring ketinggian awal yang lebih besar.",
    5: "Gaya hambat udara memperlambat jatuh dibanding mode hampa.",
  },
  "Reaksi Kimia": {
    1: "Larutan berubah warna menjadi hijau kebiruan setelah dicampur.",
    2: "Suhu naik 3–4°C — reaksi eksotermis.",
    3: "Gelembung gas terlihat pada reaksi asam-basa.",
    4: "pH turun dari 7 menjadi sekitar 3 setelah pencampuran.",
    5: "Volume total larutan sedikit naik setelah reaksi selesai.",
  },
  "Hukum Archimedes": {
    1: "Massa jenis benda naik sehingga benda cenderung tenggelam atau tercelup lebih dalam.",
    2: "Saat terapung, massa jenis benda lebih kecil dari massa jenis cairan.",
    3: "Gaya berat sama dengan gaya apung sehingga benda melayang di tengah cairan.",
    4: "Cairan dengan massa jenis lebih besar memberikan gaya apung lebih besar.",
    5: "Benda terapung jika ρ benda < ρ cairan, melayang jika hampir sama, tenggelam jika lebih besar.",
  },
  "Pemantulan dan Pembiasan Cahaya": {
    1: "Sudut datang sama dengan sudut pantul terhadap garis normal pada cermin datar.",
    2: "Cahaya mendekati garis normal saat berpindah dari udara ke kaca karena indeks bias kaca lebih besar.",
    3: "Dari medium berindeks kecil ke besar, sudut bias lebih kecil dari sudut datang (mendekati normal).",
    4: "Pemantulan internal total terjadi jika n₁ > n₂ dan sudut datang lebih besar dari sudut kritis.",
    5: "Sudut datang, indeks bias, dan arah pembiasan berhubungan melalui Hukum Snellius: n₁ sin θ₁ = n₂ sin θ₂.",
  },
  "Getaran Bandul Sederhana": {
    1: "Periode bandul bertambah ketika panjang tali diperbesar — waktu satu getaran penuh menjadi lebih lama.",
    2: "Massa bandul tidak memengaruhi periode pada bandul ideal; saat massa diubah, periode teori tetap sama.",
    3: "Pada Bulan (g lebih kecil), periode lebih besar daripada di Bumi untuk panjang tali yang sama.",
    4: "Frekuensi berbanding terbalik dengan periode: f = 1/T.",
    5: "Periode dipengaruhi panjang tali dan gravitasi, tetapi tidak oleh massa bandul ideal.",
  },
  "Hukum Hooke dan Elastisitas Pegas": {
    1: "Pertambahan panjang pegas bertambah ketika massa beban diperbesar (x = mg/k).",
    2: "Konstanta pegas lebih besar menghasilkan pertambahan panjang lebih kecil pada massa yang sama.",
    3: "Gravitasi mengubah posisi setimbang (x = mg/k), tetapi tidak mengubah periode ideal massa–pegas.",
    4: "Massa lebih besar menghasilkan periode lebih besar; konstanta pegas lebih besar menghasilkan periode lebih kecil (T = 2π√(m/k)).",
    5: "Gaya pegas sebanding dengan pertambahan panjang (F = kx); periode bergantung pada massa dan konstanta pegas.",
  },
  "Kalor dan Perubahan Suhu": {
    1: "Kenaikan suhu menjadi lebih kecil ketika massa diperbesar karena energi yang sama harus memanaskan lebih banyak zat.",
    2: "Daya pemanas lebih besar menghasilkan energi kalor lebih cepat sehingga suhu naik lebih cepat.",
    3: "Minyak naik suhunya lebih cepat daripada air karena kalor jenisnya lebih kecil.",
    4: "Q = mcΔT — energi kalor sebanding dengan massa dan perubahan suhu, berbanding terbalik dengan kalor jenis.",
    5: "Perubahan suhu dipengaruhi massa, kalor jenis, daya pemanas, dan waktu pemanasan.",
  },
};

/** Profil pengisian per email siswa. */
const PROFIL: Record<
  string,
  {
    /** Modul → urutan soal terakhir yang diisi (inklusif), atau 0 = lewati modul */
    modul: Record<string, number>;
    /** Modul → urutan soal terakhir yang sudah dinilai guru */
    dinilaiSampai?: Record<string, number>;
    skorDefault?: number;
  }
> = {
  "siswa.demo@pintar.test": {
    modul: {
      "Hukum Newton: Gaya & Gerak": 2,
      "Rangkaian Listrik Sederhana": 4,
      "Tata Surya (Kepler)": 4,
      "Gerak Jatuh Bebas": 5,
      "Reaksi Kimia": 5,
      "Hukum Archimedes": 5,
      "Pemantulan dan Pembiasan Cahaya": 5,
      "Getaran Bandul Sederhana": 5,
      "Hukum Hooke dan Elastisitas Pegas": 5,
      "Kalor dan Perubahan Suhu": 5,
    },
    dinilaiSampai: {
      "Hukum Newton: Gaya & Gerak": 2,
      "Rangkaian Listrik Sederhana": 4,
      "Tata Surya (Kepler)": 4,
      "Gerak Jatuh Bebas": 5,
      "Reaksi Kimia": 5,
      "Hukum Archimedes": 5,
      "Pemantulan dan Pembiasan Cahaya": 5,
      "Getaran Bandul Sederhana": 5,
      "Hukum Hooke dan Elastisitas Pegas": 5,
      "Kalor dan Perubahan Suhu": 5,
    },
    skorDefault: 88,
  },
  "yafif614@gmail.com": {
    modul: {
      "Hukum Newton: Gaya & Gerak": 2,
      "Rangkaian Listrik Sederhana": 4,
      "Tata Surya (Kepler)": 3,
      "Gerak Jatuh Bebas": 0,
      "Reaksi Kimia": 0,
      "Hukum Archimedes": 3,
      "Pemantulan dan Pembiasan Cahaya": 2,
      "Getaran Bandul Sederhana": 3,
      "Hukum Hooke dan Elastisitas Pegas": 2,
      "Kalor dan Perubahan Suhu": 2,
    },
    dinilaiSampai: {
      "Hukum Newton: Gaya & Gerak": 2,
      "Rangkaian Listrik Sederhana": 4,
      "Hukum Archimedes": 2,
      "Pemantulan dan Pembiasan Cahaya": 1,
      "Getaran Bandul Sederhana": 2,
      "Hukum Hooke dan Elastisitas Pegas": 1,
      "Kalor dan Perubahan Suhu": 1,
    },
    skorDefault: 82,
  },
  "yogaa3486@gmail.com": {
    modul: {
      "Hukum Newton: Gaya & Gerak": 0,
      "Rangkaian Listrik Sederhana": 0,
      "Tata Surya (Kepler)": 2,
      "Gerak Jatuh Bebas": 5,
      "Reaksi Kimia": 2,
      "Hukum Archimedes": 5,
      "Pemantulan dan Pembiasan Cahaya": 4,
      "Getaran Bandul Sederhana": 5,
      "Hukum Hooke dan Elastisitas Pegas": 4,
      "Kalor dan Perubahan Suhu": 3,
    },
    dinilaiSampai: {
      "Gerak Jatuh Bebas": 2,
      "Hukum Archimedes": 5,
      "Pemantulan dan Pembiasan Cahaya": 3,
      "Getaran Bandul Sederhana": 4,
      "Hukum Hooke dan Elastisitas Pegas": 3,
      "Kalor dan Perubahan Suhu": 2,
    },
    skorDefault: 75,
  },
  "siswa123@gmail.com": {
    modul: {
      "Hukum Newton: Gaya & Gerak": 1,
      "Rangkaian Listrik Sederhana": 0,
      "Tata Surya (Kepler)": 0,
      "Gerak Jatuh Bebas": 0,
      "Reaksi Kimia": 0,
      "Hukum Archimedes": 0,
      "Pemantulan dan Pembiasan Cahaya": 0,
      "Getaran Bandul Sederhana": 0,
      "Hukum Hooke dan Elastisitas Pegas": 0,
      "Kalor dan Perubahan Suhu": 0,
    },
    skorDefault: 0,
  },
};

function jawabanUntuk(
  judulModul: string,
  urutan: number,
): string {
  return (
    CONTOH[judulModul]?.[urutan] ??
    `Hasil pengamatan pada langkah ${urutan} untuk modul ${judulModul}.`
  );
}

async function main() {
  console.log("📝 Mengisi jawaban LKS demo…");

  const siswaList = await db
    .select({ id: user.id, email: user.email, name: user.name })
    .from(user)
    .where(eq(user.role, "siswa"));

  const modulList = await db.select().from(modul).orderBy(asc(modul.judul));
  const templates = await db
    .select()
    .from(lksTemplate)
    .orderBy(asc(lksTemplate.modulId), asc(lksTemplate.urutan));

  const byModul = new Map<string, typeof templates>();
  for (const m of modulList) {
    byModul.set(
      m.id,
      templates.filter((t) => t.modulId === m.id),
    );
  }

  const now = new Date();
  let upserted = 0;

  for (const s of siswaList) {
    const profil = PROFIL[s.email];
    if (!profil) continue;

    for (const m of modulList) {
      const sampai = profil.modul[m.judul] ?? 0;
      if (sampai <= 0) continue;

      const dinilaiSampai = profil.dinilaiSampai?.[m.judul] ?? 0;
      const soal = byModul.get(m.id) ?? [];

      for (const t of soal) {
        if (t.urutan > sampai) continue;

        const dinilai = t.urutan <= dinilaiSampai;
        const skor = dinilai
          ? (profil.skorDefault ?? 80) + (t.urutan % 3) * 2
          : 0;

        await db
          .insert(jawabanLks)
          .values({
            id: randomUUID(),
            userId: s.id,
            lksTemplateId: t.id,
            jawabanSiswa: jawabanUntuk(m.judul, t.urutan),
            skor,
            dinilai,
            autosaveAt: now,
          })
          .onConflictDoUpdate({
            target: [jawabanLks.userId, jawabanLks.lksTemplateId],
            set: {
              jawabanSiswa: jawabanUntuk(m.judul, t.urutan),
              skor,
              dinilai,
              autosaveAt: now,
            },
          });
        upserted++;
      }
    }
    console.log(`  ✓ ${s.name} (${s.email})`);
  }

  console.log(`✅ ${upserted} jawaban LKS diisi/diperbarui.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Gagal:", err);
    process.exit(1);
  });
