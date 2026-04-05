import React from 'react';

type MaintenanceSettings = {
  isActive?: boolean;
  bannerType?: 'maintenance' | 'emergency';
  titleEn?: string;
  titleTh?: string;
  messageEn?: string;
  messageTh?: string;
  estimatedEndTime?: string;
};

export default function MaintenanceIntercept({ settings }: { settings: MaintenanceSettings }) {
  if (!settings?.isActive) return null;

  const isEmergency = settings.bannerType === 'emergency';
  
  const content = (
    <div className={`w-full py-3 px-4 flex flex-col items-center justify-center z-[9999] text-center ${isEmergency ? 'bg-red-900 border-b-2 border-red-500 text-white fixed top-0 left-0 right-0 max-h-svh overflow-y-auto min-h-svh pt-24' : 'bg-amber-600/90 border-b border-amber-400 text-white relative'}`}>
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        <h2 className="text-lg md:text-2xl font-bold uppercase tracking-wider text-white">
          {settings.titleEn || 'Maintenance'} {settings.titleTh ? `| ${settings.titleTh}` : ''}
        </h2>
        {settings.messageEn && <p className="text-sm md:text-base text-white/90 whitespace-pre-wrap">{settings.messageEn}</p>}
        {settings.messageTh && <p className="text-sm md:text-base text-white/90 whitespace-pre-wrap">{settings.messageTh}</p>}
        {settings.estimatedEndTime && (
          <div className="mt-2 text-xs font-bold bg-black/30 w-fit mx-auto px-3 py-1 rounded inline-block">
            Expected Completion: {new Date(settings.estimatedEndTime).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );

  return content;
}
