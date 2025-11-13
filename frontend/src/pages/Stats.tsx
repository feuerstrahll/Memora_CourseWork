import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import './Dashboard.css'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

export default function Stats() {
  const { data: generalStats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/stats').then((res) => res.data),
  })

  const { data: requestsStats } = useQuery({
    queryKey: ['stats', 'requests'],
    queryFn: () => api.get('/stats/requests').then((res) => res.data),
  })

  const { data: recordsByFond } = useQuery({
    queryKey: ['stats', 'records-by-fond'],
    queryFn: () => api.get('/stats/records-by-fond').then((res) => res.data),
  })

  const { data: recordsByYear } = useQuery({
    queryKey: ['stats', 'records-by-year'],
    queryFn: () => api.get('/stats/records-by-year').then((res) => res.data),
  })

  return (
    <div className="dashboard">
      <h1>Статистика</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Фондов</h3>
          <p className="stat-number">{generalStats?.fonds || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Описей</h3>
          <p className="stat-number">{generalStats?.inventories || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Единиц хранения</h3>
          <p className="stat-number">{generalStats?.records || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Цифровых копий</h3>
          <p className="stat-number">{generalStats?.digitalCopies || 0}</p>
        </div>
      </div>

      {requestsStats && (
        <div className="dashboard-info">
          <h2>Статистика заявок</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Новых</h3>
              <p className="stat-number">{requestsStats.new}</p>
            </div>
            <div className="stat-card">
              <h3>В работе</h3>
              <p className="stat-number">{requestsStats.inProgress}</p>
            </div>
            <div className="stat-card">
              <h3>Выполнено</h3>
              <p className="stat-number">{requestsStats.completed}</p>
            </div>
            <div className="stat-card">
              <h3>Всего</h3>
              <p className="stat-number">{requestsStats.total}</p>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Распределение заявок по статусам</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Новые', value: requestsStats.new },
                  { name: 'В работе', value: requestsStats.inProgress },
                  { name: 'Выполнено', value: requestsStats.completed },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0088FE" name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {recordsByFond && recordsByFond.length > 0 && (
        <div className="dashboard-info">
          <h2>Единицы хранения по фондам</h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3>Круговая диаграмма</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={recordsByFond}
                  dataKey="recordsCount"
                  nameKey="fondCode"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  label={(entry) => `${entry.fondCode}: ${entry.recordsCount}`}
                >
                  {recordsByFond.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3>Гистограмма</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recordsByFond}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fondCode" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="recordsCount" fill="#00C49F" name="Количество единиц" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table className="data-table" style={{ marginTop: '2rem' }}>
            <thead>
              <tr>
                <th>Код фонда</th>
                <th>Название фонда</th>
                <th>Количество единиц</th>
              </tr>
            </thead>
            <tbody>
              {recordsByFond.map((item: any) => (
                <tr key={item.fondId}>
                  <td>{item.fondCode}</td>
                  <td>{item.fondTitle}</td>
                  <td>{item.recordsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {recordsByYear && recordsByYear.length > 0 && (
        <div className="dashboard-info">
          <h2>Единицы хранения по годам</h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3>Линейный график</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={recordsByYear}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Количество единиц"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3>Столбчатая диаграмма</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={recordsByYear}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FFBB28" name="Количество единиц" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

