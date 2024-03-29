import BaseLayout from '@/components/layout/baseLayout';

const About = () => {
  return (
    <BaseLayout className="mx-auto p-6">
      <h1 className="mb-4 font-archivo-black text-4xl">
        About Fate Character Sheet Manager
      </h1>
      <p className="mb-4 font-archivo">
        Fate Character Sheet Manager is designed to streamline your gaming
        sessions by providing an easy-to-use platform for character management.
      </p>
      <h2 className="mb-2 mt-4 font-archivo-black text-3xl">Features</h2>
      <ul className="mb-4 ml-8 list-disc font-archivo">
        <li>Create Character Sheets</li>
        <li>Create Campaigns</li>
        <li>Organize characters by group</li>
        <li>
          Reveal partial information about characters in the campaign to players
        </li>
      </ul>
      <h2 className="mb-2 mt-4 font-archivo-black text-3xl">Contact</h2>
      <p className="font-archivo">
        For any inquiries, please email us at{' '}
        <a href="mailto:fatecore@opensauce.fi" className="text-blue-600">
          fatecore@opensauce.fi
        </a>
        .
      </p>
    </BaseLayout>
  );
};

export default About;
