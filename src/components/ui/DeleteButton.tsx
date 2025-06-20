'use client';

import React from 'react';

interface DeleteButtonProps {
  id: string;
  onDelete: (formData: FormData) => void;
  itemType?: string;
  className?: string;
}

export default function DeleteButton({ 
  id, 
  onDelete, 
  itemType = 'item',
  className = "px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
}: DeleteButtonProps) {
  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemType}?`)) {
      e.preventDefault();
    }
  };

  return (
    <form action={onDelete} style={{ display: 'inline' }} onSubmit={handleDelete}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>Delete</button>
    </form>
  );
}