import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

interface HistogramProps {
    data: { name: string; value: number }[];
    title: string;
}

export const Histogram: React.FC<HistogramProps> = ({ data, title }) => (
    <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
    </div>
);
