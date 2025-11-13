import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import './TablePage.css'

export default function Audit() {
  const { data: auditData } = useQuery({
    queryKey: ['audit'],
    queryFn: () => api.get('/audit?limit=100').then((res) => res.data),
  })

  return (
    <div className="table-page">
      <div className="page-header">
        <h1>Журнал аудита</h1>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Пользователь</th>
              <th>Действие</th>
              <th>Сущность</th>
              <th>ID сущности</th>
            </tr>
          </thead>
          <tbody>
            {auditData?.data?.map((log: any) => (
              <tr key={log.id}>
                <td>{new Date(log.at).toLocaleString()}</td>
                <td>{log.user?.fullName || log.userId || '-'}</td>
                <td>{log.action}</td>
                <td>{log.entity}</td>
                <td>{log.entityId || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

