'use client';
import Button from '@/components/generic/button';
import CampaignForm from '@/components/campaignForm';
import { CampaignT } from '@/schemas/campaign';
import CampaignButton from '@/components/dashboard/campaignButton';
import CharacterButton from '@/components/dashboard/characterButton';
import { defaultSkills } from '@/schemas/consts/blankCampaignSheet';
import { getCampaignsByUserId } from '@/lib/apiHelpers/campaigns';
import { userContext } from '@/app/userProvider';
import { useState, useEffect, useContext } from 'react';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session } = useSession();
  const { sheets, setBigSheet } = useContext(userContext);
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
        const data = await getCampaignsByUserId(session.user._id);
        setCampaigns(data);
      }
    };
    fetchData();
  }, [session]);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
      <div className="col-span-1">
        <h2 className="mb-2 text-xl font-bold">Your Character Sheets:</h2>
        <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
          {sheets.map((sheet) => (
            <CharacterButton
              key={sheet._id}
              character={sheet}
              onClick={() =>
                setBigSheet({ sheet, state: 'edit', skills: allSkills })
              }
            />
          ))}
        </div>
        <Button
          className="w-full bg-green-500 pt-4 hover:bg-green-700"
          label="Create New Character Sheet"
          onClick={() =>
            setBigSheet({
              state: 'create',
              skills: allSkills,
            })
          }
        />
      </div>
      <div className="col-span-1">
        <h2 className="mb-2 text-xl font-bold">Your Campaigns:</h2>
        <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <CampaignButton
              key={campaign._id}
              name={campaign.name}
              imageUrl={campaign.icon ?? undefined}
              onClick={() => setSelectedCampaign(campaign)}
            />
          ))}
        </div>
        {selectedCampaign && (
          <CampaignForm
            key={selectedCampaign._id}
            initialCampaign={selectedCampaign}
            state={
              selectedCampaign.owner === session?.user?._id ? 'edit' : 'view'
            }
            setCampaigns={setCampaigns}
            onClose={() => setSelectedCampaign(null)}
          />
        )}
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
    </div>
  );
}
