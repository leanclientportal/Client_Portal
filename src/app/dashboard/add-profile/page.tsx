'use client';

import React from 'react';
import AddProfileForm from './components/AddProfileForm';

export default function AddProfilePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New Profile</h1>
      <AddProfileForm />
    </div>
  );
}
