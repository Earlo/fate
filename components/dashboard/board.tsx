import Button from '@/components/generic/button';
import { CharacterSheetT } from '@/schemas/sheet';
import CampaignForm from '@/components/campaignForm';
import { CampaignT } from '@/schemas/campaign';
import CampaignButton from '@/components/dashboard/campaignButton';
import CampaignSheet from '@/components/campaignSheet';
import CloseButton from '@/components/generic/closeButton';
import CharacterButton from '@/components/dashboard/characterButton';
import CharacterForm from '@/components/characterForm';
import { defaultSkills } from '@/consts/blankCampaingSheet';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session } = useSession();
  const [showSheetForm, setShowSheetForm] = useState(false);
  const [characters, setCharacters] = useState<CharacterSheetT[]>([]);
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterSheetT | null>(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignT[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignT | null>(
    null,
  );
  // merge all unique skills from all campaigns on top of defaultSkills
  const allSkills = [
    ...defaultSkills.map((skill) => skill.name),
    ...campaigns
      .map((campaign) => campaign.skills)
      .flat()
      .map((skill) => skill.name),
  ].filter((skill, index, self) => self.indexOf(skill) === index);

  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const response = await fetch(`/api/campaigns?id=${session.user._id}`);
        if (response.status === 200) {
          const data = await response.json();
          setCampaigns(data);
        }
      }
    };
    fetchData();
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const response = await fetch(`/api/sheets?id=${session.user._id}`);
        if (response.status === 200) {
          const data = await response.json();
          setCharacters(data);
        }
      }
    };
    fetchData();
  }, [session]);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
      <div className="col-span-1">
        <h2 className="mb-2 text-xl font-bold">Your Character Sheets:</h2>
        <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
          {characters.map((sheet) => (
            <CharacterButton
              key={sheet._id}
              character={sheet}
              onClick={() => setSelectedCharacter(sheet)}
            />
          ))}
        </div>
        <Button
          className="w-full bg-green-500 pt-4 hover:bg-green-700"
          label="Create New Character Sheet"
          onClick={() => setShowSheetForm(true)}
        />
      </div>
      <div className="col-span-1">
        <h2 className="mb-2 text-xl font-bold">Your Campaigns:</h2>
        <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <CampaignButton
              key={campaign._id}
              name={campaign.name}
              imageUrl={campaign.icon}
              onClick={() => setSelectedCampaign(campaign)}
            />
          ))}
        </div>
        {selectedCampaign &&
          (selectedCampaign.controlledBy === session?.user?._id ? (
            <CampaignForm
              key={selectedCampaign._id}
              initialCampaign={selectedCampaign}
              state={
                selectedCampaign.controlledBy === session?.user?._id
                  ? 'edit'
                  : 'view'
              }
              setCampaigns={setCampaigns}
              onClose={() => setSelectedCampaign(null)}
            />
          ) : (
            <div className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md">
              <CloseButton
                className="relative bottom-4 left-4 float-right"
                onClick={() => setSelectedCampaign(null)}
              />
              <CampaignSheet campaign={selectedCampaign} />
              <Link href={`/campaign/${selectedCampaign._id}`} passHref>
                <Button className="pt-4" label="View Campaign" />
              </Link>
            </div>
          ))}
        <Button
          className="w-full pt-4"
          label="Create New Campaign"
          onClick={() => setShowCampaignForm(true)}
        />
      </div>
      {showCampaignForm && (
        <CampaignForm
          onClose={() => setShowCampaignForm(false)}
          setCampaigns={setCampaigns}
        />
      )}
      {selectedCharacter && (
        <CharacterForm
          key={selectedCharacter._id}
          initialSheet={characters.find(
            (sheet) => sheet._id === selectedCharacter._id,
          )}
          state="edit"
          setCharacters={setCharacters}
          onClose={() => setSelectedCharacter(null)}
          skills={allSkills}
        />
      )}
      {showSheetForm && (
        <CharacterForm
          onClose={() => setShowSheetForm(false)}
          setCharacters={setCharacters}
          skills={allSkills}
        />
      )}
    </div>
  );
}
