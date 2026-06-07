'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StatusData {
  status: string;
  label: string;
  count: number;
  total: number;
  color: string;
}

interface Props {
  data: StatusData[];
}

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: { payload: StatusData }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-sm px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-gray-800 mb-1">{d.label}</p>
      <p className="text-gray-500">{d.count}件 · ¥{d.total.toLocaleString()}</p>
    </div>
  );
}

export default function InvoiceStatusChart({ data }: Props) {
  const hasData = data.some((d) => d.count > 0);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="w-full h-48">
      {hasData ? (
        <div className="relative w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                cx="40%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
                iconSize={8}
                formatter={(_, entry) => {
                  const d = (entry as { payload: StatusData }).payload;
                  return (
                    <span className="text-xs text-gray-600">
                      {d.label} <span className="font-medium text-gray-900">{d.count}</span>
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label — absolutely positioned to stay centered in the donut */}
          <div
            className="absolute pointer-events-none text-center"
            style={{ top: '50%', left: '40%', transform: 'translate(-50%, -50%)' }}
          >
            <p className="text-xl font-bold text-gray-900 leading-none">{total}</p>
            <p className="text-[11px] text-gray-400 mt-1">件合計</p>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-sm text-gray-400">
          データがありません
        </div>
      )}
    </div>
  );
}
