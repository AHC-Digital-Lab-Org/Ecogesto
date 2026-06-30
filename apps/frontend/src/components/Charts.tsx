import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";

const colors = ["#4F9447", "#3D8FA6", "#C9893F", "#9B4D39", "#537358", "#8A6D3B", "#5C7CA6"];

export function Bars({ data, valueLabel = "value" }: { data: Array<{ name: string; value: number }>; valueLabel?: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1D7C0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-16} textAnchor="end" height={70} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => [`${value}`, valueLabel]} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={96} paddingAngle={2}>
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function LineArea({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1D7C0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#4F9447" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

type ImpactDifficultyPoint = {
  codigo: string;
  nombre: string;
  dificultad: string;
  dificultadScore: number;
  impacto: number;
  coste: string;
  costeScore: number;
};

const difficultyTicks: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Moderada",
  4: "Avanzada"
};

export function ImpactDifficultyScatter({ data }: { data: ImpactDifficultyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 18, right: 18, bottom: 18, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1D7C0" />
        <XAxis
          type="number"
          dataKey="dificultadScore"
          name="Dificultad"
          domain={[0.5, 4.5]}
          ticks={[1, 2, 3, 4]}
          tickFormatter={(value) => difficultyTicks[Number(value)] ?? String(value)}
          tick={{ fontSize: 11 }}
        />
        <YAxis type="number" dataKey="impacto" name="Impacto" unit=" kg" tick={{ fontSize: 12 }} />
        <ZAxis type="number" dataKey="costeScore" range={[80, 260]} name="Coste" />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(value, name) => {
            if (name === "Impacto") return [`${Number(value).toLocaleString("es-ES")} kg CO2e`, name];
            if (name === "Coste") return [String(value), "Coste relativo"];
            return [String(value), name];
          }}
          labelFormatter={(_, payload) => {
            const item = payload?.[0]?.payload as ImpactDifficultyPoint | undefined;
            return item ? `${item.codigo} · ${item.nombre} · ${item.coste}` : "";
          }}
        />
        <Scatter name="EcoGestos" data={data} fill="#4F9447" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
