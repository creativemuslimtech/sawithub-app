/**
 * SEO Component for Dynamic Meta Tags
 *
 * Usage:
 * import { SEO } from './components/SEO';
 *
 * <SEO
 *   title="Tentang Kami"
 *   description="Pelajari lebih lanjut tentang SawitHub..."
 *   canonical="https://sawithub.com/about"
 *   ogImage="https://sawithub.com/og-about.png"
 * />
 */

import { useEffect } from 'react';

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
  ogImage = 'https://sawithub.com/logo.png',
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
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    script.id = 'structured-data';

    // Remove existing structured data script if any
    const existing = document.getElementById('structured-data');
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [data]);

  return null;
}

// Predefined SEO configurations for common pages
export const SEOConfig = {
  home: {
    title: 'SawitHub - Aplikasi Manajemen Kebun Sawit Digital | Catat Panen & Laporan Keuangan Otomatis',
    description: 'Platform digital gratis untuk petani sawit. Kelola lahan, catat panen TBS, hitung pupuk, dan buat laporan keuangan otomatis. Ekspor Excel & PDF langsung ke email. Daftar sekarang!',
    canonical: 'https://sawithub.com/',
    keywords: 'aplikasi manajemen kebun sawit, aplikasi petani sawit, software pertanian sawit, catat panen sawit, laporan keuangan sawit, kalkulator pupuk kelapa sawit',
  },

  about: {
    title: 'Tentang SawitHub - Solusi Digital untuk Petani Sawit Indonesia',
    description: 'Pelajari lebih lanjut tentang SawitHub, platform manajemen kebun sawit yang membantu ribuan petani Indonesia mengelola pertanian mereka dengan lebih efisien dan modern.',
    canonical: 'https://sawithub.com/about',
    keywords: 'tentang sawithub, platform pertanian sawit, solusi digital petani, agritech indonesia',
  },

  help: {
    title: 'Bantuan & Panduan - SawitHub',
    description: 'Temukan panduan lengkap penggunaan SawitHub. Pelajari cara mencatat panen, menghitung pupuk, membuat laporan keuangan, dan fitur lainnya dengan mudah.',
    canonical: 'https://sawithub.com/help',
    keywords: 'panduan sawithub, cara pakai sawithub, tutorial aplikasi sawit, bantuan aplikasi pertanian',
  },

  privacy: {
    title: 'Kebijakan Privasi - SawitHub',
    description: 'Kebijakan privasi SawitHub menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda. Keamanan data petani adalah prioritas kami.',
    canonical: 'https://sawithub.com/privacy',
    noindex: false, // Index privacy for transparency
  },

  terms: {
    title: 'Syarat & Ketentuan - SawitHub',
    description: 'Syarat dan ketentuan penggunaan platform SawitHub. Baca aturan dan kebijakan penggunaan aplikasi manajemen kebun sawit digital.',
    canonical: 'https://sawithub.com/terms',
    noindex: false,
  },

  login: {
    title: 'Masuk ke Akun SawitHub',
    description: 'Masuk ke akun SawitHub Anda untuk mengelola kebun sawit, melihat laporan panen, dan mengakses semua fitur manajemen pertanian digital.',
    canonical: 'https://sawithub.com/login',
    noindex: true, // Don't index login page
  },

  signup: {
    title: 'Daftar Gratis - SawitHub',
    description: 'Daftar gratis sekarang dan mulai kelola kebun sawit Anda dengan lebih efisien. Dapatkan akses ke semua fitur manajemen pertanian digital tanpa biaya.',
    canonical: 'https://sawithub.com/signup',
    noindex: true, // Don't index signup page
  },

  forgotPassword: {
    title: 'Lupa Password - SawitHub',
    description: 'Minta kode reset password untuk memulihkan akses akun SawitHub Anda.',
    canonical: 'https://sawithub.com/forgot-password',
    noindex: true,
  },

  resetPassword: {
    title: 'Reset Password - SawitHub',
    description: 'Buat password baru untuk akun SawitHub Anda setelah verifikasi kode reset.',
    canonical: 'https://sawithub.com/reset-password',
    noindex: true,
  },

  dashboard: {
    title: 'Dashboard SawitHub',
    description: 'Ringkasan aktivitas kebun sawit, panen, perawatan, dan laporan keuangan Anda di SawitHub.',
    canonical: 'https://sawithub.com/dashboard',
    noindex: true,
  },

  profile: {
    title: 'Profil Akun - SawitHub',
    description: 'Kelola profil dan pengaturan akun SawitHub Anda.',
    canonical: 'https://sawithub.com/profile',
    noindex: true,
  },

  lahan: {
    title: 'Data Lahan - SawitHub',
    description: 'Lihat dan kelola data kebun sawit Anda di SawitHub.',
    canonical: 'https://sawithub.com/lahan',
    noindex: true,
  },

  panen: {
    title: 'Data Panen - SawitHub',
    description: 'Pantau data panen TBS dan riwayat hasil panen kebun Anda.',
    canonical: 'https://sawithub.com/panen',
    noindex: true,
  },

  perawatan: {
    title: 'Data Perawatan - SawitHub',
    description: 'Catat biaya dan aktivitas perawatan kebun sawit Anda.',
    canonical: 'https://sawithub.com/perawatan',
    noindex: true,
  },

  jadwalPerawatan: {
    title: 'Jadwal Perawatan - SawitHub',
    description: 'Atur jadwal kerja kebun sawit seperti pemupukan, semprot, dan pruning.',
    canonical: 'https://sawithub.com/jadwal-perawatan',
    noindex: true,
  },

  pendapatan: {
    title: 'Data Pendapatan - SawitHub',
    description: 'Lihat dan kelola pendapatan kebun sawit Anda.',
    canonical: 'https://sawithub.com/pendapatan',
    noindex: true,
  },

  hargaTbs: {
    title: 'Harga TBS - SawitHub',
    description: 'Pantau informasi harga TBS untuk membantu keputusan penjualan panen.',
    canonical: 'https://sawithub.com/harga-tbs',
    noindex: true,
  },

  kalkulatorPupuk: {
    title: 'Kalkulator Pupuk - SawitHub',
    description: 'Hitung kebutuhan pupuk kelapa sawit berdasarkan data kebun dan umur tanaman.',
    canonical: 'https://sawithub.com/kalkulator-pupuk',
    noindex: true,
  },

  laporanKeuangan: {
    title: 'Laporan Keuangan - SawitHub',
    description: 'Buat laporan keuangan kebun sawit, ekspor ke Excel atau PDF, dan kirim salinan ke email.',
    canonical: 'https://sawithub.com/laporan-keuangan',
    noindex: true,
  },

  addLahan: {
    title: 'Tambah Lahan - SawitHub',
    description: 'Tambahkan data kebun sawit baru ke akun SawitHub Anda.',
    canonical: 'https://sawithub.com/lahan/add',
    noindex: true,
  },

  addPanen: {
    title: 'Tambah Panen - SawitHub',
    description: 'Catat hasil panen TBS baru di SawitHub.',
    canonical: 'https://sawithub.com/panen/add',
    noindex: true,
  },

  addPerawatan: {
    title: 'Tambah Perawatan - SawitHub',
    description: 'Catat aktivitas perawatan kebun sawit baru di SawitHub.',
    canonical: 'https://sawithub.com/perawatan/add',
    noindex: true,
  },

  addPendapatan: {
    title: 'Tambah Pendapatan - SawitHub',
    description: 'Catat data pendapatan baru ke dalam laporan kebun sawit Anda.',
    canonical: 'https://sawithub.com/pendapatan/add',
    noindex: true,
  },

  adminDashboard: {
    title: 'Admin Dashboard - SawitHub',
    description: 'Panel admin untuk memantau status sistem dan data platform SawitHub.',
    canonical: 'https://sawithub.com/admin',
    noindex: true,
  },

  adminUsers: {
    title: 'Admin Users - SawitHub',
    description: 'Kelola pengguna pada panel admin SawitHub.',
    canonical: 'https://sawithub.com/admin/users',
    noindex: true,
  },

  adminData: {
    title: 'Admin Data - SawitHub',
    description: 'Kelola data platform pada panel admin SawitHub.',
    canonical: 'https://sawithub.com/admin/data',
    noindex: true,
  },

  adminAnalytics: {
    title: 'Admin Analytics - SawitHub',
    description: 'Pantau analitik dan tren penggunaan platform SawitHub.',
    canonical: 'https://sawithub.com/admin/analytics',
    noindex: true,
  },

  adminMonitoring: {
    title: 'Admin Monitoring - SawitHub',
    description: 'Pantau status sistem, layanan, dan API pada panel admin SawitHub.',
    canonical: 'https://sawithub.com/admin/monitoring',
    noindex: true,
  },

  adminSettings: {
    title: 'Admin Settings - SawitHub',
    description: 'Atur konfigurasi aplikasi SawitHub melalui panel admin.',
    canonical: 'https://sawithub.com/admin/settings',
    noindex: true,
  },

  adminAudit: {
    title: 'Admin Audit - SawitHub',
    description: 'Lihat log audit dan aktivitas penting pada panel admin SawitHub.',
    canonical: 'https://sawithub.com/admin/audit',
    noindex: true,
  },
};

export function getSEOConfigForPath(pathname: string): SEOProps | null {
  if (pathname === '/') return SEOConfig.home;
  if (pathname === '/about') return SEOConfig.about;
  if (pathname === '/help') return SEOConfig.help;
  if (pathname === '/privacy') return SEOConfig.privacy;
  if (pathname === '/terms') return SEOConfig.terms;
  if (pathname === '/login') return SEOConfig.login;
  if (pathname === '/signup') return SEOConfig.signup;
  if (pathname === '/forgot-password') return SEOConfig.forgotPassword;
  if (pathname === '/reset-password') return SEOConfig.resetPassword;
  if (pathname === '/dashboard') return SEOConfig.dashboard;
  if (pathname === '/profile') return SEOConfig.profile;
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
  if (pathname === '/admin') return SEOConfig.adminDashboard;
  if (pathname === '/admin/users') return SEOConfig.adminUsers;
  if (pathname === '/admin/data') return SEOConfig.adminData;
  if (pathname === '/admin/analytics') return SEOConfig.adminAnalytics;
  if (pathname === '/admin/monitoring') return SEOConfig.adminMonitoring;
  if (pathname === '/admin/settings') return SEOConfig.adminSettings;
  if (pathname === '/admin/audit') return SEOConfig.adminAudit;

  if (pathname.startsWith('/admin/')) return SEOConfig.adminDashboard;
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
