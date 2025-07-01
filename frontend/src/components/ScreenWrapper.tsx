import React from 'react';

interface ScreenWrapperProps {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ title, children, onBack }) => (
  <div className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl p-4 animate-fade-in">
    {onBack && <button onClick={onBack} className="text-cyan-400 mb-4">&larr; Voltar</button>}
    <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">{title}</h1>
    {children}
  </div>
);

export default ScreenWrapper; 