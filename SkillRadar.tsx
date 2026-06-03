import React from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { Skill } from './types';

const SkillRadar: React.FC<{ skills: Skill[] }> = ({ skills }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart data={skills}>
      <PolarGrid stroke="rgba(255,255,255,0.05)" />
      <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
      <Radar dataKey="level" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
    </RadarChart>
  </ResponsiveContainer>
);

export default SkillRadar;
