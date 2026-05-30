import Button from '@/components/generic/button';
import LabeledInput from '@/components/generic/labeledInput';
import Modal from '@/components/generic/modal';
import ToggleSwitch from '@/components/generic/toggleSwitch';
import { uploadImage } from '@/lib/storage/client';
import { PopulatedGroup } from '@/schemas/campaign';
import { defaultGroupDimensions } from '@/schemas/consts/blankDefaults';
import { ChangeEvent, FC, useRef, useState } from 'react';

type GroupSettingsProps = {
  group: PopulatedGroup;
  onChange: (updatedGroup?: PopulatedGroup) => void;
  setEditing: (editing: boolean) => void;
};

const GroupSettings: FC<GroupSettingsProps> = ({
  group,
  onChange,
  setEditing,
}) => {
  const [newName, setNewName] = useState(group.name);
  const layoutDimensions = group.layout?.dimensions ?? defaultGroupDimensions();
  const [isBackgroundUploading, setIsBackgroundUploading] = useState(false);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const updateLayout = (
    updates: Partial<NonNullable<PopulatedGroup['layout']>>,
  ) => {
    const baseLayout =
      group.layout?.mode === 'grid'
        ? group.layout
        : { mode: 'grid' as const, dimensions: layoutDimensions };
    onChange({ ...group, layout: { ...baseLayout, ...updates } });
  };

  const handleBackgroundFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsBackgroundUploading(true);
    try {
      const url = await uploadImage(file, 'groups');
      updateLayout({ backgroundImage: url });
    } catch (error) {
      console.error('Group background upload failed', error);
    } finally {
      setIsBackgroundUploading(false);
      event.target.value = '';
    }
  };

  const toggleProperty = (property: 'public' | 'visible') => {
    onChange({ ...group, [property]: !group[property] });
  };

  return (
    <Modal
      onClose={() => setEditing(false)}
      className="mx-auto max-w-md rounded-lg bg-stone-100 shadow"
      title={`${newName || 'Untitled group'} settings`}
    >
      <LabeledInput
        type="text"
        name="name"
        value={newName}
        onChange={(event) => setNewName(event.target.value)}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ToggleSwitch
          checked={group.visible}
          onChange={() => toggleProperty('visible')}
          label="Visible"
          className="px-1 py-1"
        />
        <ToggleSwitch
          checked={group.public}
          onChange={() => toggleProperty('public')}
          label="Public"
          className="px-1 py-1"
        />
        <ToggleSwitch
          checked={group.layout?.mode === 'grid'}
          onChange={() => {
            const nextMode = group.layout?.mode === 'grid' ? 'list' : 'grid';
            const backgroundImage = group.layout?.backgroundImage;
            const nextLayout =
              nextMode === 'grid'
                ? {
                    mode: 'grid' as const,
                    dimensions: layoutDimensions,
                    backgroundImage,
                  }
                : group.layout?.dimensions
                  ? {
                      mode: 'list' as const,
                      dimensions: group.layout.dimensions,
                      backgroundImage,
                    }
                  : undefined;
            onChange({ ...group, layout: nextLayout });
          }}
          label="Grid Layout"
          className="px-1 py-1 sm:col-span-2"
        />
      </div>
      {group.layout?.mode === 'grid' && (
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput
            type="number"
            name="width"
            value={layoutDimensions.w}
            onChange={(event) =>
              updateLayout({
                dimensions: {
                  ...layoutDimensions,
                  w: parseInt(event.target.value),
                },
              })
            }
          />
          <LabeledInput
            type="number"
            name="height"
            value={layoutDimensions.h}
            onChange={(event) =>
              updateLayout({
                dimensions: {
                  ...layoutDimensions,
                  h: parseInt(event.target.value),
                },
              })
            }
          />
          <div className="col-span-2">
            <LabeledInput
              name="Background Image URL"
              value={group.layout?.backgroundImage ?? ''}
              onChange={(event) =>
                updateLayout({ backgroundImage: event.target.value })
              }
              placeholder="Paste an image URL"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundFileChange}
              ref={backgroundInputRef}
              className="hidden"
              disabled={isBackgroundUploading}
            />
            <div className="mt-2 flex gap-2">
              <Button
                label={isBackgroundUploading ? 'Uploading...' : 'Upload Map'}
                onClick={() => backgroundInputRef.current?.click()}
                disabled={isBackgroundUploading}
              />
              <Button
                label="Clear"
                onClick={() => updateLayout({ backgroundImage: '' })}
                disabled={!group.layout?.backgroundImage}
              />
            </div>
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-3">
        <Button
          label="Cancel"
          onClick={() => {
            setEditing(false);
            setNewName(group.name);
          }}
        />
        <Button
          label="Save"
          onClick={() => {
            setEditing(false);
            onChange({ ...group, name: newName });
          }}
        />
        <Button
          label="Delete"
          onClick={() => {
            setEditing(false);
            onChange();
          }}
        />
      </div>
    </Modal>
  );
};

export default GroupSettings;
