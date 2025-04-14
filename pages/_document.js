// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta tags to allow Netlify frame access */}
        <meta httpEquiv="Content-Security-Policy" content="
          default-src 'self'; 
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.netlify.com; 
          style-src 'self' 'unsafe-inline' https://*.openstreetmap.org https://*.openfreemap.org; 
          img-src 'self' data: blob: https://*.openstreetmap.org https://*.openfreemap.org; 
          font-src 'self'; 
          connect-src 'self' https://app.netlify.com https://*.openstreetmap.org https://*.openfreemap.org; 
          frame-src 'self' https://app.netlify.com; 
          worker-src 'self' blob:; 
          manifest-src 'self';
        " />
        <meta httpEquiv="Access-Control-Allow-Origin" content="*" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
