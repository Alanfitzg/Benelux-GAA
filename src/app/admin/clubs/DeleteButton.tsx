'use client';

import React from 'react';

export default function DeleteButton({ id, onDelete }: { id: string; onDelete: (formData: FormData) => void }) {
  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!window.confirm('Are you sure you want to delete this club?')) {
      e.preventDefault();
    }
  };

  return (
    <form action={onDelete} method="post" style={{ display: 'inline' }} onSubmit={handleDelete}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
    </form>
  );
} 