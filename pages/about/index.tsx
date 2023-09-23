import BaseLayout from '@/components/layout/baseLayout';
import Head from 'next/head';

const About = () => {
  return (
    <>
      <Head>
        <title>About - Fate Character Sheet Manager</title>
      </Head>
      <BaseLayout className="mx-auto p-6">
        <h1 className="mb-4 text-4xl">About Fate Character Sheet Manager</h1>
        <p className="mb-4">
          Fate Character Sheet Manager is designed to streamline your gaming
          sessions by providing an easy-to-use platform for character
          management.
        </p>
        <h2 className="mb-2 mt-4 text-3xl">Features</h2>
        <ul className="mb-4 ml-8 list-disc">
          <li>Create Character Sheets</li>
          <li>Create Campaigns</li>
          <li>Organize characters by group</li>
          <li>And many more...</li>
        </ul>
        <h2 className="mb-2 mt-4 text-3xl">Contact</h2>
        <p>
          For any inquiries, please email us at{' '}
          <a href="mailto:fatecore@opensauce.fi" className="text-blue-600">
            fatecore@opensauce.fi
          </a>
          .
        </p>
      </BaseLayout>
    </>
  );
};

export default About;
