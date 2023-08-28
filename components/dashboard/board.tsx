import CharacterForm from '@/components/charachterForm';
import Button from '@/components/generic/button';
import { CharacterSheetT } from '@/schemas/sheet';
import CharacterButton from '@/components/dashboard/charachterButton';
import CampaignForm from '@/components/campaignForm';
import { CampaignT } from '@/schemas/campaign';
import CampaignButton from '@/components/dashboard/campaignButton';
import CampaignSheet from '@/components/campaignSheet';
import CloseButton from '@/components/generic/closeButton';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session } = useSession();
  const [showSheetForm, setShowSheetForm] = useState(false);
  const [charachters, setCharachters] = useState<CharacterSheetT[]>([]);
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterSheetT | null>(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignT[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignT | null>(
    null,
  );

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
          setCharachters(data);
        }
      }
    };
    fetchData();
  }, [session]);

  return (
    <div className="p-4 text-xl font-bold">
      <Button
        className="bg-green-500 hover:bg-green-700 "
        label="Create New Character Sheet"
        onClick={() => setShowSheetForm(true)}
      />
      <div>
        <h2>Your Character Sheets:</h2>
        {charachters.map((sheet) => (
          <CharacterButton
            key={sheet._id}
            name={sheet.name.text}
            highConcept={sheet.aspects[0].name}
            imageUrl={sheet.icon?.url}
            onClick={() => setSelectedCharacter(sheet)}
          />
        ))}
      </div>
      {session?.user.admin ? (
        <Button
          className="bg-blue-500 hover:bg-blue-700 mt-4"
          label="Create New Campaign"
          onClick={() => setShowCampaignForm(true)}
        />
      ) : null}
      <div>
        <h2>Your Campaigns:</h2>
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
            state="edit"
            setCampaigns={setCampaigns}
            onClose={() => setSelectedCampaign(null)}
          />
        ) : (
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <CloseButton
              className="float-right relative bottom-4 left-4"
              onClick={() => setSelectedCampaign(null)}
            />
            <CampaignSheet campaign={selectedCampaign} />
          </div>
        ))}

      {showCampaignForm && (
        <CampaignForm
          onClose={() => setShowCampaignForm(false)}
          setCampaigns={setCampaigns}
        />
      )}

      {selectedCharacter && (
        <CharacterForm
          key={selectedCharacter._id}
          initialSheet={selectedCharacter}
          state="edit"
          setCharachters={setCharachters}
          onClose={() => setSelectedCharacter(null)}
        />
      )}
      {showSheetForm && (
        <CharacterForm
          onClose={() => setShowSheetForm(false)}
          setCharachters={setCharachters}
        />
      )}
    </div>
  );
}
