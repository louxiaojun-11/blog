'use client'

import { Check } from 'lucide-react'

interface SuccessMessageProps {
  message: string;
}

export default function SuccessMessage({ message }: SuccessMessageProps) {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg px-6 py-4 shadow-lg flex items-center gap-2 z-50">
      <div className="bg-green-100 rounded-full p-1">
        <Check className="w-4 h-4 text-green-600" />
      </div>
      <span className="text-green-800">{message}</span>
    </div>
  );
} 