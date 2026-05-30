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
  const initialDimensions =
    group.layout?.dimensions ?? defaultGroupDimensions();
  const [draftGroup, setDraftGroup] = useState(group);
  const [dimensionInputs, setDimensionInputs] = useState({
    w: String(initialDimensions.w),
    h: String(initialDimensions.h),
  });
  const [isBackgroundUploading, setIsBackgroundUploading] = useState(false);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const parseDimension = (value: string) => {
    if (!/^\d+$/.test(value)) return;
    const dimension = Number(value);
    if (!Number.isSafeInteger(dimension) || dimension < 1) return;
    return dimension;
  };
  const parsedDimensions = {
    w: parseDimension(dimensionInputs.w),
    h: parseDimension(dimensionInputs.h),
  };
  const dimensionsAreValid =
    parsedDimensions.w !== undefined && parsedDimensions.h !== undefined;
  const gridDimensionsAreInvalid =
    draftGroup.layout?.mode === 'grid' && !dimensionsAreValid;
  const hasChanges = JSON.stringify(draftGroup) !== JSON.stringify(group);
  const saveIsDisabled =
    !hasChanges || gridDimensionsAreInvalid || isBackgroundUploading;
  const layoutDimensions =
    draftGroup.layout?.dimensions ?? defaultGroupDimensions();

  const updateLayout = (
    updates: Partial<NonNullable<PopulatedGroup['layout']>>,
  ) => {
    setDraftGroup((currentGroup) => {
      const baseLayout =
        currentGroup.layout?.mode === 'grid'
          ? currentGroup.layout
          : {
              mode: 'grid' as const,
              dimensions:
                currentGroup.layout?.dimensions ?? defaultGroupDimensions(),
            };
      return {
        ...currentGroup,
        layout: { ...baseLayout, ...updates },
      };
    });
  };

  const updateDimension = (dimension: 'w' | 'h', value: string) => {
    setDimensionInputs((currentInputs) => ({
      ...currentInputs,
      [dimension]: value,
    }));
    const parsedDimension = parseDimension(value);
    if (parsedDimension === undefined) return;
    setDraftGroup((currentGroup) => ({
      ...currentGroup,
      layout: {
        ...currentGroup.layout,
        mode: 'grid',
        dimensions: {
          ...(currentGroup.layout?.dimensions ?? defaultGroupDimensions()),
          [dimension]: parsedDimension,
        },
      },
    }));
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
    setDraftGroup((currentGroup) => ({
      ...currentGroup,
      [property]: !currentGroup[property],
    }));
  };

  return (
    <Modal
      onClose={() => setEditing(false)}
      className="mx-auto max-w-md rounded-lg bg-stone-100 shadow"
      title={`${draftGroup.name || 'Untitled group'} settings`}
    >
      <LabeledInput
        type="text"
        name="name"
        value={draftGroup.name}
        onChange={(event) =>
          setDraftGroup((currentGroup) => ({
            ...currentGroup,
            name: event.target.value,
          }))
        }
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ToggleSwitch
          checked={draftGroup.visible}
          onChange={() => toggleProperty('visible')}
          label="Visible"
          className="px-1 py-1"
        />
        <ToggleSwitch
          checked={draftGroup.public}
          onChange={() => toggleProperty('public')}
          label="Public"
          className="px-1 py-1"
        />
        <ToggleSwitch
          checked={draftGroup.layout?.mode === 'grid'}
          onChange={() => {
            setDraftGroup((currentGroup) => {
              const nextMode =
                currentGroup.layout?.mode === 'grid' ? 'list' : 'grid';
              const dimensions =
                currentGroup.layout?.dimensions ?? defaultGroupDimensions();
              const backgroundImage = currentGroup.layout?.backgroundImage;
              return {
                ...currentGroup,
                layout:
                  nextMode === 'grid'
                    ? { mode: nextMode, dimensions, backgroundImage }
                    : currentGroup.layout?.dimensions
                      ? { mode: nextMode, dimensions, backgroundImage }
                      : undefined,
              };
            });
          }}
          label="Grid Layout"
          className="px-1 py-1 sm:col-span-2"
        />
      </div>
      {draftGroup.layout?.mode === 'grid' && (
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput
            type="number"
            name="width"
            value={dimensionInputs.w}
            onChange={(event) => updateDimension('w', event.target.value)}
          />
          <LabeledInput
            type="number"
            name="height"
            value={dimensionInputs.h}
            onChange={(event) => updateDimension('h', event.target.value)}
          />
          {!dimensionsAreValid && (
            <p className="col-span-2 text-sm text-red-700">
              Width and height must be positive whole numbers.
            </p>
          )}
          <div className="col-span-2">
            <LabeledInput
              name="Background Image URL"
              value={draftGroup.layout?.backgroundImage ?? ''}
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
                disabled={!draftGroup.layout?.backgroundImage}
              />
            </div>
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-3">
        <Button label="Cancel" onClick={() => setEditing(false)} />
        <Button
          label="Save"
          onClick={() => {
            if (saveIsDisabled) return;
            const dimensions =
              parsedDimensions.w !== undefined &&
              parsedDimensions.h !== undefined
                ? { w: parsedDimensions.w, h: parsedDimensions.h }
                : layoutDimensions;
            setEditing(false);
            onChange({
              ...draftGroup,
              layout: draftGroup.layout && {
                ...draftGroup.layout,
                dimensions,
              },
            });
          }}
          disabled={saveIsDisabled}
        />
        <Button
          label="Delete"
          className="bg-red-800 hover:bg-red-900"
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
