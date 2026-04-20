import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import UseChart from "../components/usechart";
import LoginChart from "../components/loginchart";
import UserTable from "../components/userTables";
import dashboardStyles from "../components/dashboardLayout.module.css";
import chartStyles from "../components/useChart.module.css";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, token, getAuthHeaders, logout, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalSessions: 0,
    totalUsers: 0
  });
  const router = useRouter();

  // Function to fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/message-stats', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Check if user is authenticated and is admin
    if (!user || !token) {
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      // User is not admin, redirect to home
      router.push("/");
      return;
    }

    // Fetch dashboard statistics
    fetchStats();
    setLoading(false);
  }, [user, token, router, authLoading]);

  // Show loading state
  if (loading || authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading dashboard...
      </div>
    );
  }

  // Don't render if not authenticated or not admin
  if (!user || !token || user.role !== "admin") {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
             <Sidebar
         sidebarOpen={sidebarOpen}
         onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
         isAuthenticated={!!user && !!token}
         user={user}
         messages={[]}
         sessions={[]}
         onNewChat={() => router.push("/")}
         onSwitchSession={() => {}}
         onDeleteSession={() => {}}
         onLogout={handleLogout}
         currentPage="dashboard"
       />

      <div className={`${dashboardStyles.dashboard} ${sidebarOpen ? dashboardStyles.sidebarOpen : ''}`}>
        {/* Dashboard Header */}
        <div className={dashboardStyles.header}>
          <div className={dashboardStyles.headerLeft}>
            <h1>Dashboard</h1>
          </div>
          <div className={dashboardStyles.headerRight}>
           
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className={dashboardStyles.grid}>
          <div className={dashboardStyles.card}>
            <div className={dashboardStyles.cardTitle}>Total Messages</div>
            <div className={dashboardStyles.cardValue}>{stats.totalMessages.toLocaleString()}</div>
            <div className={`${dashboardStyles.cardChange} ${dashboardStyles.positive}`}>
              ↗ 5.7% Last Week
            </div>
          </div>

          <div className={dashboardStyles.card}>
            <div className={dashboardStyles.cardTitle}>Total Sessions</div>
            <div className={dashboardStyles.cardValue}>{stats.totalSessions.toLocaleString()}</div>
            <div className={`${dashboardStyles.cardChange} ${dashboardStyles.positive}`}>
              ↗ 4.7% Last Week
            </div>
          </div>

          <div className={dashboardStyles.card}>
            <div className={dashboardStyles.cardTitle}>Total Users</div>
            <div className={dashboardStyles.cardValue}>{stats.totalUsers.toLocaleString()}</div>
            <div className={`${dashboardStyles.cardChange} ${dashboardStyles.neutral}`}>
              ↗ 8.1% Last Week
            </div>
          </div>
        </div>

        {/* Chart Cards */}
        <div className={chartStyles.chartGrid}>
          <div className={chartStyles.chartCard}>
            <div className={chartStyles.chartHeader}>
              <div>
                <h3 className={chartStyles.chartTitle}>Chatbot Interaction Volume</h3>
                <p className={chartStyles.chartDate}>This data from October 30 - November 05</p>
              </div>
            </div>
            <UseChart />
          </div>

          <div className={chartStyles.chartCard}>
            <div className={chartStyles.chartHeader}>
              <h3 className={chartStyles.chartTitle}>User Registration Growth</h3>
            </div>
            <LoginChart />
          </div>
        </div>

        {/* Recent Shipment Section */}
        <div className={dashboardStyles.userlog}>
          <h3>Users Log :</h3>
          <UserTable />
        </div>
      </div>
    </>
  );
}
