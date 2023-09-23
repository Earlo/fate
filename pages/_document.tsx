import { Html, Head, Main, NextScript } from 'next/document';
import '@/schemas';

/*
The Fate Core font is © Evil Hat Productions, LLC and is used with permission.
The Four Actions icons were designed by Jeremy Keller.
*/
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="credit"
          content="The Fate Core font is © Evil Hat Productions, LLC and is used with permission. The Four Actions icons were designed by Jeremy Keller."
        />
        <meta
          name="description"
          content="A tool for creating and managning Fate Core style character sheets."
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
      <body className="min-h-[100dvh]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
