import React from 'react';
import { LanguageSelector } from '@/contexts/LanguageContext';

export default function LanguageSwitcher({ className = '' }) {
    return <LanguageSelector className={className} />;
}
