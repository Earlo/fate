'use client';
import { cn } from '@/lib/utils';
import React from 'react';
import Icon from '../generic/icon/icon';
import Label from '../generic/label';

interface EditableListProps<T> {
  title: string;
  items: T[];
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  onAdd?: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}

const EditableList = <T,>({
  title,
  items,
  disabled,
  className,
  labelClassName,
  onAdd,
  renderItem,
}: EditableListProps<T>) => {
  return (
    <div className={cn(className)}>
      <Label name={title} className={labelClassName}>
        {!disabled && onAdd && <Icon icon="plus" onClick={onAdd} />}
      </Label>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
};

export default EditableList;
