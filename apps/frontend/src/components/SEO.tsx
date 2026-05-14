/**
 * SEO Component for Dynamic Meta Tags
 *
 * Usage:
 * import { SEO } from './components/SEO';
 *
 * <SEO
 *   title="Tentang Kami"
 *   description="Pelajari lebih lanjut tentang SawitHub..."
 *   canonical="https://www.sawithub.com/tentang-kami"
 *   ogImage="https://www.sawithub.com/og-about.png"
 * />
 */

import { useEffect } from 'react';
import { getCanonicalUrl, PUBLIC_ASSETS } from '../config/env';
import { SUBSCRIPTION_TRIAL_DAYS } from '../copy/productConstants';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  keywords?: string;
  noindex?: boolean;
}

export function SEO({
  title,
  description,
  canonical,
  ogImage = PUBLIC_ASSETS.branding.logoMark,
  ogType = 'website',
  keywords,
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    // Update document title
    const fullTitle = title.includes('SawitHub')
      ? title
      : `${title} | SawitHub - Aplikasi Manajemen Kebun Sawit`;

    document.title = fullTitle;

    // Update or create meta tags
    updateMetaTag('name', 'description', description);

    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

    // Robots
    const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';
    updateMetaTag('name', 'robots', robotsContent);

    // Open Graph
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:image', ogImage);

    if (canonical) {
      updateMetaTag('property', 'og:url', canonical);
    }

    // Twitter Card
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage);

    // Canonical URL
    if (canonical) {
      updateCanonicalLink(canonical);
    }
  }, [title, description, canonical, ogImage, ogType, keywords, noindex]);

  return null;
}

// Helper function to update meta tags
function updateMetaTag(
  attribute: 'name' | 'property',
  attributeValue: string,
  content: string
) {
  let element = document.querySelector(
    `meta[${attribute}="${attributeValue}"]`
  ) as HTMLMetaElement;

  if (element) {
    element.content = content;
  } else {
    element = document.createElement('meta');
    element.setAttribute(attribute, attributeValue);
    element.content = content;
    document.head.appendChild(element);
  }
}

// Helper function to update canonical link
function updateCanonicalLink(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (link) {
    link.href = href;
  } else {
    link = document.createElement('link');
    link.rel = 'canonical';
    link.href = href;
    document.head.appendChild(link);
  }
}

// Structured Data Component
interface StructuredDataProps {
  data: Record<string, unknown>;
  id?: string;
}

export function StructuredData({ data, id }: StructuredDataProps) {
  useEffect(() => {
    const type = typeof data['@type'] === 'string' ? data['@type'] : 'schema';
    const name = typeof data.name === 'string' ? data.name : typeof data.url === 'string' ? data.url : 'entry';
    const scriptId = id || `structured-data-${type}-${name}`.replace(/[^a-zA-Z0-9_-]/g, '-');
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    script.id = scriptId;

    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [data, id]);

  return null;
}

// Predefined SEO configurations for common pages
export const SEOConfig = {
  home: {
    title: 'SawitHub - Aplikasi Kebun Sawit | Catat Panen TBS, Biaya & Laporan',
    description: 'Aplikasi kebun sawit untuk petani mandiri. Catat panen TBS, biaya perawatan, jadwal kerja, kalkulator pupuk sawit, dan laporan keuangan kebun sawit dari HP.',
    canonical: getCanonicalUrl('/'),
    keywords: 'aplikasi kebun sawit, aplikasi manajemen kebun sawit, cara catat panen TBS, laporan keuangan kebun sawit, kalkulator pupuk sawit, aplikasi petani sawit',
  },

  about: {
    title: 'Tentang SawitHub - Solusi Digital untuk Petani Sawit Indonesia',
    description: 'Pelajari kenapa SawitHub dibuat sebagai catatan kebun digital sederhana untuk petani sawit mandiri Indonesia.',
    canonical: getCanonicalUrl('/tentang-kami'),
    keywords: 'tentang sawithub, platform pertanian sawit, solusi digital petani, agritech indonesia',
  },

  help: {
    title: 'Bantuan & Panduan - SawitHub',
    description: 'Temukan panduan SawitHub untuk mencatat panen, biaya perawatan, jadwal kerja, laporan, keamanan data, dan penggunaan saat sinyal lemah.',
    canonical: getCanonicalUrl('/bantuan'),
    keywords: 'panduan sawithub, cara pakai sawithub, tutorial aplikasi sawit, bantuan aplikasi pertanian',
  },

  privacy: {
    title: 'Kebijakan Privasi - SawitHub',
    description: 'Kebijakan privasi SawitHub menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda. Keamanan data petani adalah prioritas kami.',
    canonical: getCanonicalUrl('/privasi'),
    noindex: false, // Index privacy for transparency
  },

  terms: {
    title: 'Syarat & Ketentuan - SawitHub',
    description: 'Syarat dan ketentuan penggunaan platform SawitHub. Baca aturan dan kebijakan penggunaan aplikasi manajemen kebun sawit digital.',
    canonical: getCanonicalUrl('/syarat'),
    noindex: false,
  },


  cookieSettings: {
    title: 'Pengaturan Cookie - SawitHub',
    description: 'Kelola pilihan cookie SawitHub dan buka ulang persetujuan cookie analitik kapan saja.',
    canonical: getCanonicalUrl('/pengaturan-cookie'),
    noindex: false,
  },

  login: {
    title: 'Masuk ke Akun SawitHub',
    description: 'Masuk ke akun SawitHub Anda untuk mengelola kebun sawit, melihat laporan panen, dan mengakses semua fitur manajemen pertanian digital.',
    canonical: getCanonicalUrl('/login'),
    noindex: true, // Don't index login page
  },

  signup: {
    title: `Daftar Trial Gratis ${SUBSCRIPTION_TRIAL_DAYS} Hari - SawitHub`,
    description: `Daftar trial gratis ${SUBSCRIPTION_TRIAL_DAYS} hari untuk mulai mencatat panen, biaya, jadwal kerja, dan laporan hasil bersih dari satu kebun dulu.`,
    canonical: getCanonicalUrl('/signup'),
    noindex: true, // Don't index signup page
  },

  forgotPassword: {
    title: 'Lupa Password - SawitHub',
    description: 'Minta kode reset password untuk memulihkan akses akun SawitHub Anda.',
    canonical: getCanonicalUrl('/forgot-password'),
    noindex: true,
  },

  resetPassword: {
    title: 'Reset Password - SawitHub',
    description: 'Buat password baru untuk akun SawitHub Anda setelah verifikasi kode reset.',
    canonical: getCanonicalUrl('/reset-password'),
    noindex: true,
  },

  dashboard: {
    title: 'Dashboard SawitHub',
    description: 'Ringkasan aktivitas kebun sawit, panen, perawatan, dan laporan keuangan Anda di SawitHub.',
    canonical: getCanonicalUrl('/dashboard'),
    noindex: true,
  },

  profile: {
    title: 'Profil Akun - SawitHub',
    description: 'Kelola profil dan pengaturan akun SawitHub Anda.',
    canonical: getCanonicalUrl('/profile'),
    noindex: true,
  },

  subscriptionPayments: {
    title: 'Riwayat Pembayaran - SawitHub',
    description: 'Riwayat transaksi langganan SawitHub Anda.',
    canonical: getCanonicalUrl('/subscription/payments'),
    noindex: true,
  },

  lahan: {
    title: 'Data Lahan - SawitHub',
    description: 'Lihat dan kelola data kebun sawit Anda di SawitHub.',
    canonical: getCanonicalUrl('/lahan'),
    noindex: true,
  },

  panen: {
    title: 'Data Panen - SawitHub',
    description: 'Pantau data panen TBS dan riwayat hasil panen kebun Anda.',
    canonical: getCanonicalUrl('/panen'),
    noindex: true,
  },

  perawatan: {
    title: 'Data Perawatan - SawitHub',
    description: 'Catat biaya dan aktivitas perawatan kebun sawit Anda.',
    canonical: getCanonicalUrl('/perawatan'),
    noindex: true,
  },

  jadwalPerawatan: {
    title: 'Jadwal Perawatan - SawitHub',
    description: 'Atur jadwal kerja kebun sawit seperti pemupukan, semprot, dan pruning.',
    canonical: getCanonicalUrl('/jadwal-perawatan'),
    noindex: true,
  },

  pendapatan: {
    title: 'Data Pendapatan - SawitHub',
    description: 'Lihat dan kelola pendapatan kebun sawit Anda.',
    canonical: getCanonicalUrl('/pendapatan'),
    noindex: true,
  },

  hargaTbs: {
    title: 'Harga TBS - SawitHub',
    description: 'Pantau informasi harga TBS untuk membantu keputusan penjualan panen.',
    canonical: getCanonicalUrl('/harga-tbs'),
    noindex: true,
  },

  kalkulatorPupuk: {
    title: 'Kalkulator Pupuk - SawitHub',
    description: 'Hitung kebutuhan pupuk kelapa sawit berdasarkan data kebun dan umur tanaman.',
    canonical: getCanonicalUrl('/kalkulator-pupuk'),
    noindex: true,
  },

  laporanKeuangan: {
    title: 'Laporan Keuangan - SawitHub',
    description: 'Buat laporan keuangan kebun sawit, unduh Excel/PDF, dan kirim salinan ke email.',
    canonical: getCanonicalUrl('/laporan-keuangan'),
    noindex: true,
  },

  addLahan: {
    title: 'Tambah Lahan - SawitHub',
    description: 'Tambahkan data kebun sawit baru ke akun SawitHub Anda.',
    canonical: getCanonicalUrl('/lahan/add'),
    noindex: true,
  },

  addPanen: {
    title: 'Tambah Panen - SawitHub',
    description: 'Catat hasil panen TBS baru di SawitHub.',
    canonical: getCanonicalUrl('/panen/add'),
    noindex: true,
  },

  addPerawatan: {
    title: 'Tambah Perawatan - SawitHub',
    description: 'Catat aktivitas perawatan kebun sawit baru di SawitHub.',
    canonical: getCanonicalUrl('/perawatan/add'),
    noindex: true,
  },

  addPendapatan: {
    title: 'Tambah Pendapatan - SawitHub',
    description: 'Catat data pendapatan baru ke dalam laporan kebun sawit Anda.',
    canonical: getCanonicalUrl('/pendapatan/add'),
    noindex: true,
  },

};

export function getSEOConfigForPath(pathname: string): SEOProps | null {
  if (pathname === '/') return SEOConfig.home;
  if (pathname === '/about' || pathname === '/tentang-kami') return SEOConfig.about;
  if (pathname === '/help' || pathname === '/bantuan') return SEOConfig.help;
  if (pathname === '/privacy' || pathname === '/privasi') return SEOConfig.privacy;
  if (pathname === '/terms' || pathname === '/syarat') return SEOConfig.terms;
  if (pathname === '/pengaturan-cookie') return SEOConfig.cookieSettings;
  if (pathname === '/login') return SEOConfig.login;
  if (pathname === '/signup') return SEOConfig.signup;
  if (pathname === '/forgot-password') return SEOConfig.forgotPassword;
  if (pathname === '/reset-password') return SEOConfig.resetPassword;
  if (pathname === '/dashboard') return SEOConfig.dashboard;
  if (pathname === '/profile') return SEOConfig.profile;
  if (pathname === '/subscription/payments') return SEOConfig.subscriptionPayments;
  if (pathname === '/lahan') return SEOConfig.lahan;
  if (pathname === '/panen') return SEOConfig.panen;
  if (pathname === '/perawatan') return SEOConfig.perawatan;
  if (pathname === '/jadwal-perawatan') return SEOConfig.jadwalPerawatan;
  if (pathname === '/pendapatan') return SEOConfig.pendapatan;
  if (pathname === '/harga-tbs') return SEOConfig.hargaTbs;
  if (pathname === '/kalkulator-pupuk') return SEOConfig.kalkulatorPupuk;
  if (pathname === '/laporan-keuangan') return SEOConfig.laporanKeuangan;
  if (pathname === '/lahan/add') return SEOConfig.addLahan;
  if (pathname === '/panen/add') return SEOConfig.addPanen;
  if (pathname === '/perawatan/add') return SEOConfig.addPerawatan;
  if (pathname === '/pendapatan/add') return SEOConfig.addPendapatan;
  if (pathname.startsWith('/lahan/')) return SEOConfig.addLahan;
  if (pathname.startsWith('/panen/')) return SEOConfig.addPanen;
  if (pathname.startsWith('/perawatan/')) return SEOConfig.addPerawatan;
  if (pathname.startsWith('/pendapatan/')) return SEOConfig.addPendapatan;

  return null;
}

// Example usage in pages:
/*

import { SEO, SEOConfig } from '../components/SEO';

function AboutPage() {
  return (
    <>
      <SEO {...SEOConfig.about} />
      <div>
        About page content...
      </div>
    </>
  );
}

*/
