import Button from './button';
import Input from './input';
import FormContainer from './formContainer';
import React, { FormEvent, useState } from 'react';
interface CharachterSheetProps {
  onClose: () => void;
}

const CharachterSheet: React.FC<CharachterSheetProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const sheet = {
      name,
    };
    await fetch('/api/sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheet),
    });
    onClose();
    setIsSubmitting(false);
  };
  return (
    <FormContainer onSubmit={handleSubmit}>
      <Input
        label="Name:"
        name="name"
        type="text"
        required
        onChange={(e) => setName(e.target.value)}
      />
      <Button label="Create" disabled={isSubmitting} type="submit" />
      <Button label="Cancel" disabled={isSubmitting} onClick={onClose} />
    </FormContainer>
  );
};

export default CharachterSheet;
