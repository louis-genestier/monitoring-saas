import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui";

export const ProductPriceChart = ({ data }) => {
  const [priceType, setPriceType] = useState("NEW");

  const chartData = useMemo(() => {
    return data
      .filter((item) => item.priceType === priceType)
      .map((item) => ({
        timestamp: new Date(item.timestamp).getTime(),
        [item.website.name]: item.price,
        id: item.id,
      }));
  }, [data, priceType]);

  const websites = useMemo(() => {
    return [
      ...new Set(
        data
          .filter((item) => item.priceType === priceType)
          .map((item) => item.website.name)
      ),
    ];
  }, [data, priceType]);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

  const formatXAxis = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <ToggleGroup
        type="single"
        value={priceType}
        onValueChange={(value) => value && setPriceType(value)}
        className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500"
      >
        <ToggleGroupItem
          value="NEW"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-sm"
          aria-label="Toggle New Prices"
        >
          New
        </ToggleGroupItem>
        <ToggleGroupItem
          value="USED"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-sm"
          aria-label="Toggle Used Prices"
        >
          Used
        </ToggleGroupItem>
      </ToggleGroup>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatXAxis}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(label) => new Date(label).toLocaleString()}
            formatter={(value, name) => [`€${value.toFixed(2)}`, name]}
          />
          <Legend />
          {websites.map((website, index) => (
            <Line
              key={website}
              data={chartData.filter((item) => item[website] !== undefined)}
              type="monotone"
              dataKey={website}
              stroke={colors[index % colors.length]}
              dot={{ r: 3 }}
              activeDot={{ r: 8 }}
              name={website}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
