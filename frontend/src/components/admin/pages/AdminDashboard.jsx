import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import { Users, Package, ShoppingCart, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState({
    stats: { users: 0, products: 0, orders: 0, attacks: 0 },
    recentAttacks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axiosInstance.get("/admin/dashboard");
        if (res.data && res.data.status) {
          setData({
            stats: res.data.stats,
            recentAttacks: res.data.recentAttacks
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>;

  return (
    <div className="container-fluid py-3">
      <h2 className="mb-4 text-primary fw-bold">📊 Admin Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100 bg-primary text-white" style={{ borderRadius: '12px' }}>
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <h6 className="card-title text-white-50 text-uppercase fw-bold mb-2">Người Dùng</h6>
                <h2 className="mb-0 fw-bold display-6">{data.stats.users}</h2>
              </div>
              <Users size={48} className="opacity-50" />
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100 bg-success text-white" style={{ borderRadius: '12px' }}>
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <h6 className="card-title text-white-50 text-uppercase fw-bold mb-2">Sản Phẩm</h6>
                <h2 className="mb-0 fw-bold display-6">{data.stats.products}</h2>
              </div>
              <Package size={48} className="opacity-50" />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100 bg-info text-white" style={{ borderRadius: '12px' }}>
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <h6 className="card-title text-white-50 text-uppercase fw-bold mb-2">Đơn Hàng</h6>
                <h2 className="mb-0 fw-bold display-6">{data.stats.orders}</h2>
              </div>
              <ShoppingCart size={48} className="opacity-50" />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100 bg-danger text-white" style={{ borderRadius: '12px' }}>
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <h6 className="card-title text-white-50 text-uppercase fw-bold mb-2">Lượt Tấn Công</h6>
                <h2 className="mb-0 fw-bold display-6">{data.stats.attacks}</h2>
              </div>
              <ShieldAlert size={48} className="opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Attack Logs Table */}
      <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="card-header bg-white border-bottom pt-4 pb-3">
          <h5 className="mb-0 text-danger d-flex align-items-center fw-bold">
            <ShieldAlert className="me-2" size={24} /> 
            LỊCH SỬ CHẶN TẤN CÔNG (test_attack)
          </h5>
        </div>
        <div className="card-body p-0">
          {data.recentAttacks.length === 0 ? (
            <div className="p-5 text-center">
              <div className="alert alert-success d-inline-block px-5 py-3 rounded-pill shadow-sm">
                <i className="bi bi-shield-check me-2"></i>
                ✅ Hệ thống an toàn. Chưa ghi nhận lượt tấn công nào.
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-3 px-4">#ID</th>
                    <th className="py-3">IP Address</th>
                    <th className="py-3">URL Tấn Công</th>
                    <th className="py-3">User Agent</th>
                    <th className="py-3 px-4">Thời Gian</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentAttacks.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4"><span className="badge bg-secondary px-2 py-2">#{log.id}</span></td>
                      <td className="font-monospace text-danger fw-bold">{log.ip_address || "N/A"}</td>
                      <td className="text-break" style={{maxWidth: '300px'}}>
                        <div className="bg-light p-2 rounded small text-dark border border-danger border-opacity-25">
                          {log.url}
                        </div>
                      </td>
                      <td className="text-muted small text-break" style={{maxWidth: '250px'}}>{log.user_agent || "Khuyết danh"}</td>
                      <td className="px-4 fw-medium text-secondary">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}