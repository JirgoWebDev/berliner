# Moda Berliner - QR Menü ve Yönetim Sistemi

Moda Berliner için geliştirilmiş dinamik QR Menü, çok dilli destek (Türkçe & İngilizce) ve tam yönetim paneli (Admin Dashboard).

---

## 🚀 Özellikler

- **Müşteri QR Menüsü (`/menu`):** Hızlı, responsive ve kategori bazlı dinamik menü.
- **Yönetim Paneli (`/admin`):**
  - **Ürün Yönetimi:** Ekleme, çıkarma (stok/menüden geçici çıkarma), silme, güncelleme ve kategori içi sıralama.
  - **Kategori Yönetimi:** Ekleme, düzenleme, silme ve menü gösterim sırasını yukarı/aşağı değiştirme.
  - **Görsel Yönetimi:** Cihazdan görsel yükleme (Cloudinary / Vercel Blob / Yerel) veya Pexels API ile anında görsel arama.
  - **QR Kod Üretici (`/admin/qrcode`):** Masalar için indirilebilir ve özelleştirilebilir QR kod.
  - **Geri Bildirimler (`/admin/feedback`):** Müşteri yorum ve puanlamaları.

---

## 💻 Yerel Geliştirme (Localhost)

1. **Bağımlılıkları Kurun:**
   ```bash
   npm install
   ```

2. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   # veya doğrudan baslat.bat dosyasını çalıştırın
   ```

3. **Giriş Bilgileri:**
   - **URL:** [http://localhost:3000/admin](http://localhost:3000/admin)
   - **Kullanıcı Adı:** `admin`
   - **Şifre:** `berliner2026`

---

## 🌐 Vercel Deploy ve Kalıcı Veritabanı Rehberi

Vercel gibi sunucusuz (serverless) ortamlarda yerel `dev.db` dosyası salt-okunur (read-only) çalıştığı için, ekleme/silme/güncelleme işlemlerinin kalıcı olması amacıyla bulut veritabanı (Turso LibSQL) kullanılır.

### 1. Turso Veritabanı Oluşturma (1 Dakika, Ücretsiz)
1. [turso.tech](https://turso.tech) adresine gidin ve ücretsiz hesap açın.
2. Yeni bir veritabanı oluşturun (Örn: `berliner-db`).
3. Veritabanı URL'nizi (`libsql://...`) ve Auth Token'ınızı alın.

### 2. Mevcut 22 Kategori ve 189 Ürünü Turso'ya Aktarma
Terminalinizde `.env` dosyanıza Turso bilgilerinizi ekledikten sonra şu komutu çalıştırın:
```bash
npm run db:sync-turso
```
Bu komut yerel `dev.db` içerisindeki tüm ürünleri ve kategorileri doğrudan Turso veritabanınıza kopyalar.

### 3. Vercel Ortam Değişkenleri (Environment Variables)
Vercel projenizde **Settings > Environment Variables** bölümüne şunları ekleyin:

| Değişken Adı | Açıklama | Örnek Değer |
|---|---|---|
| `TURSO_DATABASE_URL` | Turso veritabanı adresi | `libsql://berliner-db-username.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso güvenlik anahtarı | `eyJhbGciOi...` |
| `AUTH_SECRET` | NextAuth oturum anahtarı | `moda-berliner-super-secret-key-123` |
| `NEXTAUTH_SECRET` | NextAuth oturum anahtarı | `moda-berliner-super-secret-key-123` |
| `ADMIN_USERNAME` | Yönetici Kullanıcı Adı | `admin` |
| `ADMIN_PASSWORD` | Yönetici Şifresi | `berliner2026` |
| `BLOB_READ_WRITE_TOKEN` *(Opsiyonel)* | Vercel Blob görsel yükleme anahtarı | *(Vercel Storage menüsünden 1 tıkla eklenir)* |
| `CLOUDINARY_CLOUD_NAME` *(Opsiyonel)* | Cloudinary bulut adı | `...` |
| `CLOUDINARY_API_KEY` *(Opsiyonel)* | Cloudinary API anahtarı | `...` |
| `CLOUDINARY_API_SECRET` *(Opsiyonel)* | Cloudinary API şifresi | `...` |

---

## 🛠️ Komutlar

- `npm run dev` - Geliştirme sunucusunu başlatır.
- `npm run build` - Üretim derlemesi (Next.js build) oluşturur.
- `npm run start` - Derlenmiş üretim sunucusunu çalıştırır.
- `npm run db:sync-turso` - Yerel veritabanındaki verileri Turso bulut veritabanına aktarır.
