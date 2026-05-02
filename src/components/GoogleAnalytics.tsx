"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { GA_TRACKING_ID, trackEvent } from "@/utils/analytics";

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      trackEvent("page_view", {
        page_path: pathname,
        url: window.location.origin + pathname + window.location.search,
      });
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // 1. Explicit Data Attribute Tracking (Highest Priority)
      const trackableElement = target.closest('[data-track-event]');
      if (trackableElement) {
        const eventName = trackableElement.getAttribute('data-track-event')!;
        
        // Extract all data-track-* attributes into params
        const params: Record<string, string> = {};
        for (let i = 0; i < trackableElement.attributes.length; i++) {
          const attr = trackableElement.attributes[i];
          if (attr.name.startsWith('data-track-') && attr.name !== 'data-track-event') {
            const key = attr.name.replace('data-track-', '');
            params[key] = attr.value;
          }
        }
        
        if (trackableElement instanceof HTMLAnchorElement) {
          params.url = trackableElement.href;
        }
        params.label = trackableElement.innerText?.trim() || trackableElement.getAttribute('aria-label') || '';
        
        trackEvent(eventName, params);
        return; // Prevent fallback duplicate events
      }

      // 2. Fallback Implicit Tracking (Mutually Exclusive)
      const link = target.closest('a');
      const button = target.closest('button');

      if (link) {
        const text = link.innerText?.trim() || link.getAttribute('aria-label') || '';
        const href = link.getAttribute('href') || '';
        const lowerText = text.toLowerCase();
        const isExternal = href.startsWith('http') && !href.includes(window.location.host);

        if (target.closest('nav')) {
          trackEvent('menu_click', { label: text, url: href, page_path: pathname });
        } else if (lowerText.includes('training')) {
          trackEvent('training_click', { label: text, url: href });
        } else if (lowerText.includes('consulting')) {
          trackEvent('consulting_click', { label: text, url: href });
        } else if (lowerText.includes('visit website')) {
          trackEvent('visit_website_click', { label: text, url: href });
        } else if (lowerText.includes('internship')) {
          trackEvent('internship_click', { label: text, url: href });
        } else if (lowerText.includes('career') && !href.includes('ev-career')) {
          trackEvent('career_click', { label: text, url: href });
        } else if (isExternal) {
          trackEvent('external_link_click', { label: text, url: href });
        }
      } else if (button) {
        const text = button.innerText?.trim() || button.getAttribute('aria-label') || '';
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('submit')) {
          trackEvent('form_submit_click', { label: text });
        } else if (target.closest('nav') && text === '☰') {
          // mobile menu toggle, ignore
        } else {
          trackEvent('cta_click', { label: text });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </>
  );
}
