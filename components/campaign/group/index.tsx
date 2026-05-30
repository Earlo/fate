'use client';
import Icon from '@/components/generic/icon/icon';
import VisibilityToggle from '@/components/sheet/visibilityToggle';
import { defaultGroupDimensions } from '@/schemas/consts/blankDefaults';
import { FC, useState } from 'react';
import CharacterGridLayout from './characterGridLayout';
import CharacterListLayout from './characterListLayout';
import GroupMemberMenu from './groupMemberMenu';
import GroupSettings from './groupSettings';
import { GroupProps } from './types';

const Group: FC<GroupProps> = ({ group, state, onChange, campaignId }) => {
  const [editing, setEditing] = useState(false);
  const isAdmin = state === 'admin';
  const layout = group.layout?.mode || 'list';
  const layoutDimensions = group.layout?.dimensions ?? defaultGroupDimensions();
  const layoutProps = {
    characters: group.characters,
    campaignId,
    state,
    onReorder: (characters: typeof group.characters) =>
      onChange({ ...group, characters }),
  };

  return (
    <div className="relative mx-auto flex min-h-24 w-full grow flex-col rounded-lg bg-gray-800 p-2 text-stone-100 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-l font-bold">{group.name}</h1>
        {isAdmin && (
          <div className="flex">
            <VisibilityToggle
              visible={group.visible}
              onChange={(visible) => onChange({ ...group, visible })}
            />
            <Icon onClick={() => setEditing(!editing)} icon="ellipsis" />
          </div>
        )}
        {editing && (
          <GroupSettings
            group={group}
            onChange={onChange}
            setEditing={setEditing}
          />
        )}
      </div>
      {layout === 'list' ? (
        <CharacterListLayout {...layoutProps} />
      ) : (
        <CharacterGridLayout
          {...layoutProps}
          dimensions={layoutDimensions}
          backgroundImage={group.layout?.backgroundImage}
        />
      )}
      <GroupMemberMenu
        group={group}
        state={state}
        onChange={onChange}
        campaignId={campaignId}
      />
    </div>
  );
};

export default Group;
