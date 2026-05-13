import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage = 'https://static.readdy.ai/image/c3c070ed3a92273f043678549554b0d6/e3451f52961636b2aea237770c224254.png', // Logo as default OG image
  ogType = 'website',
  canonicalUrl = window.location.href,
}: SEOProps) {
  const { t, i18n } = useTranslation();

  const siteName = 'Chiu Gor French';
  const defaultTitle = t('seo_title');
  const defaultDescription = t('seo_description');
  const defaultKeywords = t('seo_keywords');

  const seoTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;

  // Update html lang attribute
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Chiu Gor",
    "url": "https://chiugorfrench.com", // Replace with real domain if available
    "jobTitle": "French Teacher",
    "worksFor": {
      "@type": "Organization",
      "name": "Chiu Gor French"
    },
    "description": seoDescription,
    "image": ogImage,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "French Language Courses",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Conversational French"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "DELF/DALF Preparation"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Business French"
          }
        }
      ]
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="theme-color" content={i18n.language === 'zh-HK' ? '#FF6B6B' : '#4ECDC4'} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={i18n.language === 'zh-HK' ? 'zh_HK' : 'en_US'} />
      {i18n.language !== 'zh-HK' && <meta property="og:locale:alternate" content="zh_HK" />}
      {i18n.language !== 'en' && <meta property="og:locale:alternate" content="en_US" />}
      {i18n.language !== 'fr' && <meta property="og:locale:alternate" content="fr_FR" />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={ogImage} />


      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
