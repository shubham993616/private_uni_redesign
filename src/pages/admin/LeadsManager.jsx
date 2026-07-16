import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Building2, TrendingUp, Eye, FileText, CheckCircle, Download, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import DataTable from './components/DataTable';

export default function LeadsManager() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleCSVExport = () => {
    const link = document.createElement('a');
    link.href = '/api/v1/admin/leads/export-csv';
    link.click();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsRes, analyticsRes] = await Promise.all([
        api.get('/admin/leads'),
        api.get('/admin/saas-analytics')
      ]);
      setLeads(leadsRes.data.data || []);
      setAnalytics(analyticsRes.data.data || null);
    } catch (err) {
      toast.error('Failed to load leads and analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    { key: 'name', label: 'Student Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'state', label: 'State' },
    { key: 'preferredCourse', label: 'Preferred Course' },
    { 
      key: 'universityId', 
      label: 'Target University', 
      render: row => row.universityId ? (
        <span className="font-semibold text-link dark:text-primary-300">{row.universityId.name}</span>
      ) : <span className="text-light-muted dark:text-dark-muted">N/A</span>
    },
    { 
      key: 'leadType', 
      label: 'Type', 
      render: row => row.leadType === 'apply' ? (
        <span className="badge badge-green">Apply Now</span>
      ) : (
        <span className="badge badge-blue">Brochure</span>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: row => new Date(row.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  ];

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-light-muted dark:text-dark-muted">Loading Leads Panel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="text-caption">Total Captured Leads</span>
            <h3 className="text-stat mt-1">{analytics?.totalLeads || 0}</h3>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4">
          <div className="p-3 bg-accent/10 text-accent-dark rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-caption">Sponsored Partners</span>
            <h3 className="text-stat mt-1">{analytics?.sponsoredCount || 0}</h3>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4">
          <div className="p-3 bg-success/10 text-success rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-caption">Conversion Focus</span>
            <h3 className="text-stat mt-1">Phase 1 MVP</h3>
          </div>
        </div>
      </div>

      {/* Analytics Sub-grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leads By University */}
        <div className="card p-6">
          <h3 className="text-h3 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
            Top Leads by University
          </h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {analytics?.leadsByUniversity && analytics.leadsByUniversity.length > 0 ? (
              analytics.leadsByUniversity.map((item, index) => (
                <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-light-card dark:bg-dark-bg/50 border border-light-border dark:border-dark-border/40">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-light-muted dark:text-dark-muted">#{index + 1}</span>
                    <div>
                      <p className="font-semibold text-sm text-light-text dark:text-dark-text leading-tight">{item.name}</p>
                      {item.isSponsored && (
                        <span className="text-eyebrow !text-accent-dark dark:!text-accent-300">{item.sponsorTier} Partner</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-data text-sm text-link">{item.leadCount} leads</span>
                    <button
                      onClick={() => navigate(`/admin/partner/${item._id}`)}
                      className="p-1.5 rounded-btn bg-primary/10 text-link dark:text-primary-300 hover:bg-primary/20 transition-colors duration-150"
                      title="View Partner Dashboard"
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-support">No leads collected yet.</p>
            )}
          </div>
        </div>

        {/* Top Profile Views */}
        <div className="card p-6">
          <h3 className="text-h3 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" aria-hidden="true" />
            Top Profile Views (Analytics)
          </h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {analytics?.topViewedUniversities && analytics.topViewedUniversities.length > 0 ? (
              analytics.topViewedUniversities.map((item, index) => (
                <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-light-card dark:bg-dark-bg/50 border border-light-border dark:border-dark-border/40">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-light-muted dark:text-dark-muted">#{index + 1}</span>
                    <div>
                      <p className="font-semibold text-sm text-light-text dark:text-dark-text leading-tight">{item.name}</p>
                      {item.isSponsored && (
                        <span className="text-eyebrow !text-accent-dark dark:!text-accent-300">{item.sponsorTier} Partner</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-data text-sm">{item.views || 0} views</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-support">No view data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-h3">Leads Registry</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCSVExport}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-btn bg-success/10 text-success-text dark:text-green-400 hover:bg-success/20 border border-success/20 transition-colors duration-150"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Export CSV
            </button>
            <button 
              onClick={loadData}
              className="text-xs font-semibold text-link dark:text-primary-300 bg-primary/10 px-3 py-1.5 rounded-btn hover:bg-primary/20 transition-colors duration-150"
            >
              Refresh List
            </button>
          </div>
        </div>
        <DataTable
          data={leads}
          columns={columns}
          searchFields={['name', 'email', 'phone', 'state', 'preferredCourse', 'universityId.name']}
          searchPlaceholder="Search leads by name, email, university..."
        />
      </div>
    </div>
  );
}
