'use client';

import React from 'react';
import AddProfileForm from './components/AddProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddProfilePage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Add New Profile</CardTitle>
        </CardHeader>
        <CardContent>
            <AddProfileForm />
        </CardContent>
    </Card>
  );
}
