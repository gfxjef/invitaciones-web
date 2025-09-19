'use client';

import React from 'react';

interface InvitationEditorMinimalProps {
  invitationId: number;
}

// Componente mínimo para probar si el problema está en los hooks
export const InvitationEditorMinimal: React.FC<InvitationEditorMinimalProps> = ({ 
  invitationId 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold">Editor Mínimo</h1>
      <p>Invitation ID: {invitationId}</p>
      <p>Si ves esto, el componente base funciona.</p>
    </div>
  );
};

export default InvitationEditorMinimal;