import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import {
  Users,
  Package,
  ShoppingCart,
  ShieldAlert,
  TrendingUp,
  Clock,
  Activity,
  AlertTriangle,
  Brain,
  Bug,
  Globe,
  Terminal,
  Database,
  Lock,
  Zap,
  Eye,
  Filter,
  ChevronDown,
  Search,
} from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState({
    stats: { users: 0, products: 0, orders: 0, attacks: 0 },
    recentAttacks: [],
    modelPreference: "random_forest",
    availableModels: {},
  });
  const [loading, setLoading] = useState(true);
  const [savingModel, setSavingModel] = useState(false);
  const [selectedAttackType, setSelectedAttackType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axiosInstance.get("/admin/dashboard");
        if (res.data && res.data.status) {
          setData({
            stats: res.data.stats,
            recentAttacks: res.data.recentAttacks,
            modelPreference: res.data.modelPreference,
            availableModels: res.data.availableModels || {},
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard", err);
        setData({
          stats: { users: 0, products: 0, orders: 0, attacks: 0 },
          recentAttacks: [],
          modelPreference: "random_forest",
          availableModels: {},
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleModelChange = async (e) => {
    const model = e.target.value;
    setData((prev) => ({ ...prev, modelPreference: model }));
    setSavingModel(true);
    try {
      await axiosInstance.post("/admin/security/model-preference", { model });
    } catch (err) {
      console.error("Lỗi khi lưu model preference", err);
    } finally {
      setSavingModel(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      label: "Người Dùng",
      value: data.stats.users,
      icon: Users,
      color: "#6366f1",
      bgColor: "rgba(99, 102, 241, 0.15)",
    },
    {
      label: "Sản Phẩm",
      value: data.stats.products,
      icon: Package,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.15)",
    },
    {
      label: "Đơn Hàng",
      value: data.stats.orders,
      icon: ShoppingCart,
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.15)",
    },
    {
      label: "Lượt Tấn Công",
      value: data.stats.attacks,
      icon: ShieldAlert,
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.15)",
    },
  ];

  // Function to classify attack type from URL
  const classifyAttack = (url) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("or 1=1") || lowerUrl.includes("union select") || lowerUrl.includes("'--") || lowerUrl.includes("and 1=1")) {
      return "SQL Injection";
    }
    if (lowerUrl.includes("<script") || lowerUrl.includes("onerror") || lowerUrl.includes("onload") || lowerUrl.includes("<img") || lowerUrl.includes("<svg") || lowerUrl.includes("javascript:")) {
      return "XSS";
    }
    if (lowerUrl.includes(";ls") || lowerUrl.includes(";rm") || lowerUrl.includes("|cat") || lowerUrl.includes("`ls`")) {
      return "Command Injection";
    }
    if (lowerUrl.includes("../") || lowerUrl.includes("..\\") || lowerUrl.includes("etc/passwd") || lowerUrl.includes("config/.env")) {
      return "Path Traversal";
    }
    if (lowerUrl.includes("localhost") || lowerUrl.includes("192.168") || lowerUrl.includes("http://")) {
      return "SSRF";
    }
    if (lowerUrl.includes("[ne]") || lowerUrl.includes("[gt]") || lowerUrl.includes("[where]")) {
      return "NoSQL Injection";
    }
    if (lowerUrl.includes(")(uid=") || lowerUrl.includes("*))")) {
      return "LDAP Injection";
    }
    if (lowerUrl.includes("{{") || lowerUrl.includes("{$")) {
      return "SSTI";
    }
    return "Unknown";
  };

  // Web attack stats by type
  const webAttackStats = [
    {
      label: "SQL Injection",
      value: data.recentAttacks.filter(a => classifyAttack(a.url || "") === "SQL Injection").length,
      icon: Database,
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.15)",
    },
    {
      label: "XSS",
      value: data.recentAttacks.filter(a => classifyAttack(a.url || "") === "XSS").length,
      icon: Bug,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.15)",
    },
    {
      label: "Command Injection",
      value: data.recentAttacks.filter(a => classifyAttack(a.url || "") === "Command Injection").length,
      icon: Terminal,
      color: "#dc2626",
      bgColor: "rgba(220, 38, 38, 0.15)",
    },
    {
      label: "Path Traversal",
      value: data.recentAttacks.filter(a => classifyAttack(a.url || "") === "Path Traversal").length,
      icon: Eye,
      color: "#7c3aed",
      bgColor: "rgba(124, 58, 237, 0.15)",
    },
  ];

  // Attack type classification
  const attackTypes = [
    { key: "all", label: "Tất cả", icon: Globe, color: "#6366f1" },
    { key: "SQL Injection", label: "SQL Injection", icon: Database, color: "#ef4444" },
    { key: "XSS", label: "Cross-Site Scripting", icon: Bug, color: "#f59e0b" },
    { key: "Command Injection", label: "Command Injection", icon: Terminal, color: "#dc2626" },
    { key: "Path Traversal", label: "Path Traversal", icon: Eye, color: "#7c3aed" },
    { key: "SSRF", label: "Server-Side Request Forgery", icon: Zap, color: "#06b6d4" },
    { key: "NoSQL Injection", label: "NoSQL Injection", icon: Database, color: "#84cc16" },
    { key: "LDAP Injection", label: "LDAP Injection", icon: Lock, color: "#ec4899" },
    { key: "SSTI", label: "Template Injection", icon: Zap, color: "#f97316" },
  ];

  // Filter attacks by type and search
  const filteredAttacks = data.recentAttacks.filter((attack) => {
    const attackType = classifyAttack(attack.url || "");
    const matchesType = selectedAttackType === "all" || attackType === selectedAttackType;
    const matchesSearch = searchTerm === "" || 
      (attack.url && attack.url.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (attack.ip_address && attack.ip_address.includes(searchTerm));
    return matchesType && matchesSearch;
  });

  // Count attacks by type
  const attackTypeStats = attackTypes.slice(1).map((type) => ({
    ...type,
    count: data.recentAttacks.filter((a) => classifyAttack(a.url || "") === type.key).length,
  }));

  return (
    <div className="admin-page">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Xin chào, Admin!</h1>
          <p>Chào mừng bạn quay trở lại trang quản trị</p>
        </div>
        <div className="header-right">
          <div className="model-selector">
            <Brain size={18} style={{ color: "#6366f1" }} />
            <label htmlFor="model-select">ML Model:</label>
            <select
              id="model-select"
              value={data.modelPreference}
              onChange={handleModelChange}
              disabled={savingModel}
            >
              {Object.entries(data.availableModels).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.name} ({info.accuracy})
                </option>
              ))}
            </select>
            {savingModel && (
              <span className="saving-indicator">Đang lưu...</span>
            )}
          </div>
          <div className="header-time">
            <Clock size={20} />
            <span>
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="stat-card"
              style={{ "--card-color": stat.color }}
            >
              <div
                className="stat-icon"
                style={{ background: stat.bgColor, color: stat.color }}
              >
                <Icon size={28} />
              </div>
              <div className="stat-info">
                <h3>{stat.label}</h3>
                <h2>{stat.value}</h2>
              </div>
              <div className="stat-trend">
                <TrendingUp size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Web Attack Stats */}
      <div className="web-attack-stats">
        <div className="web-attack-stats-header">
          <Globe size={20} style={{ color: "#ef4444" }} />
          <h3>Thống Kê Tấn Công Web</h3>
        </div>
        <div className="stats-grid web-stats-grid">
          {webAttackStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="stat-card web-attack-card"
                style={{ "--card-color": stat.color }}
              >
                <div
                  className="stat-icon"
                  style={{ background: stat.bgColor, color: stat.color }}
                >
                  <Icon size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stat.label}</h3>
                  <h2>{stat.value}</h2>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Web Attacks Category Dashboard */}
      <div className="web-attacks-section">
        <div className="section-header">
          <div className="section-title">
            <Globe size={24} style={{ color: "#ef4444" }} />
            <h2>Danh Mục Tấn Công Web</h2>
          </div>
          <div className="attack-stats-row">
            <div
              className={`attack-type-card ${selectedAttackType === "all" ? 'active' : ''}`}
              style={{ "--type-color": "#6366f1" }}
              onClick={() => {
                setSelectedAttackType("all");
                setSearchTerm("");
              }}
            >
              <Globe size={20} style={{ color: "#6366f1" }} />
              <span className="attack-type-label">Tất cả</span>
              <span className="attack-type-count" style={{ background: "#6366f1" }}>{data.recentAttacks.length}</span>
            </div>
            {attackTypeStats.map((type, index) => {
              const TypeIcon = type.icon;
              return (
                <div
                  key={index}
                  className={`attack-type-card ${selectedAttackType === type.key ? 'active' : ''}`}
                  style={{ "--type-color": type.color }}
                  onClick={() => setSelectedAttackType(selectedAttackType === type.key ? "all" : type.key)}
                >
                  <TypeIcon size={20} style={{ color: type.color }} />
                  <span className="attack-type-label">{type.label}</span>
                  <span className="attack-type-count" style={{ background: type.color }}>{type.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="attacks-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm URL, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="attacks-count">
            <Filter size={18} />
            <span>Hiển thị {filteredAttacks.length} / {data.recentAttacks.length} sự kiện</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>
            <ShieldAlert size={22} style={{ color: "#ef4444" }} />
            Lịch sử chặn tấn công
            {selectedAttackType !== "all" && (
              <span className="filter-indicator">
                - {attackTypes.find(t => t.key === selectedAttackType)?.label}
              </span>
            )}
          </h3>
          <span className="badge badge-danger">
            {filteredAttacks.length} sự kiện
          </span>
        </div>

        {filteredAttacks.length === 0 ? (
          <div className="empty-state">
            <Activity size={60} />
            <h4>Hệ thống an toàn</h4>
            <p>Chưa ghi nhận lượt tấn công nào</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Loại Tấn Công</th>
                  <th>IP Address</th>
                  <th>URL Tấn Công</th>
                  <th>Model</th>
                  <th>Confidence</th>
                  <th>Thời Gian</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttacks.map((log) => {
                  const attackType = classifyAttack(log.url || "");
                  const typeConfig = attackTypes.find(t => t.key === attackType) || attackTypes[0];
                  const TypeIcon = typeConfig.icon;
                  return (
                    <tr key={log.id}>
                      <td>
                        <span className="badge badge-secondary">#{log.id}</span>
                      </td>
                      <td>
                        <span className="attack-type-badge" style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}>
                          <TypeIcon size={14} />
                          {attackType}
                        </span>
                      </td>
                      <td>
                        <span className="ip-address">{log.ip_address || "N/A"}</span>
                      </td>
                      <td>
                        <div className="url-cell">{log.url}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {log.model_used || "N/A"}
                        </span>
                      </td>
                      <td>
                        {log.confidence ? (
                          <span className="confidence-badge">
                            {(log.confidence * 100).toFixed(1)}%
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        <span className="time-cell">
                          {new Date(log.created_at).toLocaleString("vi-VN")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding: 24px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius);
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-content h1 {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--admin-text-primary);
          margin: 0 0 4px 0;
        }

        .header-content p {
          font-size: 0.95rem;
          color: var(--admin-text-secondary);
          margin: 0;
        }

        .header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .header-time {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--admin-text-secondary);
          font-size: 0.9rem;
        }

        .model-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 10px;
        }

        .model-selector label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--admin-text-primary);
          margin: 0;
          white-space: nowrap;
        }

        .model-selector select {
          padding: 6px 12px;
          border: 1px solid var(--admin-border);
          border-radius: 6px;
          background: var(--admin-bg);
          color: var(--admin-text-primary);
          font-size: 0.85rem;
          cursor: pointer;
          min-width: 200px;
        }

        .model-selector select:focus {
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
        }

        .saving-indicator {
          font-size: 0.8rem;
          color: var(--admin-primary);
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .stat-card {
          position: relative;
        }

        .stat-trend {
          position: absolute;
          top: 20px;
          right: 20px;
          color: var(--admin-text-muted);
          opacity: 0.5;
        }

        .ip-address {
          font-family: monospace;
          color: #ef4444;
          font-weight: 600;
        }

        .url-cell {
          max-width: 280px;
          padding: 8px 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 6px;
          font-size: 0.82rem;
          word-break: break-all;
          color: var(--admin-text-primary);
        }

        .badge-info {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .badge-primary {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .confidence-badge {
          font-weight: 700;
          color: #ef4444;
        }

        .time-cell {
          color: var(--admin-text-muted);
          font-size: 0.82rem;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          color: var(--admin-text-secondary);
        }

        .loading-container .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--admin-border);
          border-top-color: var(--admin-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-right {
            align-items: flex-start;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .url-cell {
            max-width: 200px;
          }

          .model-selector select {
            min-width: 160px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Web Attacks Section */
        .web-attacks-section {
          background: var(--admin-card-bg);
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius);
          padding: 20px;
          margin-bottom: 24px;
        }

        .section-header {
          margin-bottom: 16px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .section-title h2 {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--admin-text-primary);
          margin: 0;
        }

        .attack-stats-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .attack-type-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .attack-type-card:hover {
          background: rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
        }

        .attack-type-card.active {
          border-color: var(--type-color);
          background: rgba(0, 0, 0, 0.08);
        }

        .attack-type-label {
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--admin-text-secondary);
        }

        .attack-type-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: 11px;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
        }

        .attacks-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-top: 1px solid var(--admin-border);
          margin-top: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          background: var(--admin-bg);
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          min-width: 280px;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--admin-text-primary);
          font-size: 0.9rem;
          outline: none;
        }

        .search-box input::placeholder {
          color: var(--admin-text-muted);
        }

        .attacks-count {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--admin-text-secondary);
          font-size: 0.85rem;
        }

        .filter-indicator {
          color: #ef4444;
          font-weight: 600;
        }

        .attack-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .badge-secondary {
          background: rgba(107, 114, 128, 0.15);
          color: #6b7280;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.78rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .attack-stats-row {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 8px;
          }

          .attack-type-card {
            flex-shrink: 0;
          }

          .search-box {
            min-width: 100%;
          }

          .attacks-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
        }

        /* Web Attack Stats */
        .web-attack-stats {
          margin-bottom: 24px;
        }

        .web-attack-stats-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--admin-border);
        }

        .web-attack-stats-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--admin-text-primary);
          margin: 0;
        }

        .web-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .web-attack-card {
          padding: 16px;
          background: var(--admin-card-bg);
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius);
        }

        .web-attack-card .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .web-attack-card .stat-info h3 {
          font-size: 0.85rem;
          color: var(--admin-text-secondary);
          margin: 0 0 4px 0;
          font-weight: 500;
        }

        .web-attack-card .stat-info h2 {
          font-size: 1.5rem;
          color: var(--card-color);
          margin: 0;
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .web-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .web-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .web-attack-card {
            padding: 12px;
          }

          .web-attack-card .stat-info h2 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}
