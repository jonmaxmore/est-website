'use client';

import React from 'react';
import HeroSection from '@/components/sections/HeroSection';
import WeaponSection from '@/components/sections/WeaponSection';
import GameFeaturesSection from '@/components/sections/GameFeaturesSection';
import NewsSection from '@/components/sections/NewsSection';
import type { CMSNewsArticle } from '@/types/cms';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CampaignContent({ campaign, news, weapons }: { campaign: any, news: CMSNewsArticle[], weapons: any[] }) {
  if (!campaign?.layout?.length) return null;

  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {campaign.layout.map((block: any, idx: number) => {
        switch (block.blockType) {
          case 'hero':
            return <HeroSection key={`hero-${idx}`} data={block} />;
          
          case 'weaponsShowcase':
            return <WeaponSection key={`weapons-${idx}`} data={block} weapons={weapons} />;
          
          case 'gameFeatures':
            return <GameFeaturesSection key={`features-${idx}`} data={block} />;
          
          case 'newsTicker':
            return <NewsSection key={`news-${idx}`} data={block} news={news} />;
          
          default:
            console.warn(`Unknown block type: ${block.blockType}`);
            return null;
        }
      })}
    </>
  );
}
