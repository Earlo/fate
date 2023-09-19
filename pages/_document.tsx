import { Html, Head, Main, NextScript } from 'next/document';
import '@/schemas';

//shoul have meta information that
/*

    The Fate Core font is © Evil Hat Productions, LLC and is used with permission. The Four Actions icons were designed by Jeremy Keller.
    */
export default function Document() {
  return (
    <Html>
      <Head>
        <meta
          name="credit"
          content="The Fate Core font is © Evil Hat Productions, LLC and is used with permission. The Four Actions icons were designed by Jeremy Keller."
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Archivo:regular,700&amp;text=Archivo&display=optional"
          id="font-preview-archivo"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
