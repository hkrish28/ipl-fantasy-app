import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { CURRENT_SEASON } from '@/lib/constants';

interface Member {
  id: string;
  teamName: string;
}

interface DataPoint {
  date: string;
  [teamName: string]: string | number;
}

interface Props {
  competitionId: string;
  members: Member[];
}

// Color palette for different teams
const COLORS = [
  '#8884d8', // lavender
  '#82ca9d', // mint
  '#ffc658', // yellow
  '#ff7300', // orange
  '#0088FE', // blue
  '#00C49F', // teal
  '#FFBB28', // gold
  '#FF8042', // coral
];

export default function PointsTrendChart({ competitionId, members }: Props) {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      // Fetch last 7 days of points for each team
      const series = await Promise.all(
        members.map(async member => {
          const histRef = collection(
            db,
            `seasons/${CURRENT_SEASON}/competitions/${competitionId}/leaderboard/${member.id}/history`
          );
          const q = query(histRef, orderBy('__name__', 'desc'), limit(7));
          const snap = await getDocs(q);
          return snap.docs.map(doc => ({
            date: doc.id,
            teamId: member.id,
            points: doc.data().totalPoints,
          }));
        })
      );

      // Pivot into chart-friendly format
      const flat = series.flat();
      const dateMap = new Map<string, DataPoint>();
      flat.forEach(({ date, teamId, points }) => {
        if (!dateMap.has(date)) dateMap.set(date, { date });
        const entry = dateMap.get(date)!;
        const name = members.find(m => m.id === teamId)?.teamName || teamId;
        entry[name] = points;
      });

      const chartData = Array.from(dateMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      setData(chartData);
    }
    fetchHistory();
  }, [competitionId, members]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">7-Day Points Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {members.map((member, idx) => (
            <Line
              key={member.id}
              type="monotone"
              dataKey={member.teamName}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
