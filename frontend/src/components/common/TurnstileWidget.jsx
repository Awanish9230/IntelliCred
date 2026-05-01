import React, { useEffect, useRef } from 'react';

export default function TurnstileWidget({ onVerify }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    
    if (!siteKey) {
      console.error('VITE_TURNSTILE_SITE_KEY is missing! Turnstile CAPTCHA will not load in production.');
      return;
    }

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
        });
      }
    };

    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else {
      renderWidget();
    }

    return () => {
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onVerify]);

  return (
    <div className="flex justify-center my-4 w-full overflow-hidden">
      <div ref={containerRef}></div>
    </div>
  );
}
