'use client';

import { useState, useEffect, useCallback } from 'react';

const DIMENSIONS = [
  'Meaning-Maker', 'Strategist', 'Tech-Savvy', 'Operator',
  'Relationship-Weaver', 'Culture-Architect', 'Self-Awareness', 'Transformator'
];

const STATUS_COLORS = {
  published: { bg: '#e8f5e9', text: '#2e7d32', label: 'Published' },
  draft: { bg: '#fff3e0', text: '#e65100', label: 'Draft' },
  unpublished: { bg: '#fce4ec', text: '#c62828', label: 'Unpublished' },
  rejected: { bg: '#efebe9', text: '#5d4037', label: 'Rejected' },
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newArticle, setNewArticle] = useState({
    title: '',
    lead: '',
    source_name: 'Ledge Editorial',
    article_url: '',
    primary_dimension: 'Strategist',
    leadership_angle: '',
    data_source: '',
    status: 'published'
  });
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({});

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? '/api/admin/articles' 
        : `/api/admin/articles?status=${filter}`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${password}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          setAuthError('Session expired');
        }
        return;
      }
      
      const data = await res.json();
      setArticles(data.articles || []);
      
      // Calculate stats
      const s = {};
      (data.articles || []).forEach(a => {
        s[a.status] = (s[a.status] || 0) + 1;
      });
      s.total = data.articles?.length || 0;
      setStats(s);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [password, filter]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      const res = await fetch('/api/admin/articles', {
        headers: { 'Authorization': `Bearer ${password}` }
      });
      
      if (res.ok) {
        setIsAuthenticated(true);
        const data = await res.json();
        setArticles(data.articles || []);
        const s = {};
        (data.articles || []).forEach(a => {
          s[a.status] = (s[a.status] || 0) + 1;
        });
        s.total = data.articles?.length || 0;
        setStats(s);
      } else {
        setAuthError('Wrong password');
      }
    } catch (err) {
      setAuthError('Connection error');
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchArticles();
  }, [isAuthenticated, filter, fetchArticles]);

  const updateStatus = async (id, newStatus) => {
    const res = await fetch('/api/admin/articles', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, status: newStatus })
    });
    
    if (res.ok) {
      showNotification(`Article ${newStatus}`);
      fetchArticles();
    }
  };

  const deleteArticle = async (id, title) => {
    if (!confirm(`Delete "${title.slice(0, 60)}..."?\nThis cannot be undone.`)) return;
    
    const res = await fetch(`/api/admin/articles?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${password}` }
    });
    
    if (res.ok) {
      showNotification('Article deleted', 'warning');
      fetchArticles();
    }
  };

  const createArticle = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newArticle)
    });
    
    if (res.ok) {
      showNotification('Article created!');
      setShowNewForm(false);
      setNewArticle({
        title: '', lead: '', source_name: 'Ledge Editorial',
        article_url: '', primary_dimension: 'Strategist',
        leadership_angle: '', data_source: '', status: 'published'
      });
      fetchArticles();
    } else {
      const err = await res.json();
      showNotification(err.error || 'Failed to create', 'error');
    }
  };

  const startEdit = (article) => {
    setEditingId(article.id);
    setEditForm({
      title: article.title,
      lead: article.lead || '',
      leadership_angle: article.leadership_angle,
      primary_dimension: article.primary_dimension,
      source_name: article.source_name,
      data_source: article.data_source || '',
    });
  };

  const saveEdit = async () => {
    const res = await fetch('/api/admin/articles', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: editingId, ...editForm })
    });

    if (res.ok) {
      showNotification('Article updated');
      setEditingId(null);
      fetchArticles();
    }
  };

  // ============================================
  // LOGIN SCREEN
  // ============================================
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7f6f3',
        fontFamily: '"DM Sans", sans-serif'
      }}>
        <form onSubmit={handleLogin} style={{
          background: 'white',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          width: '380px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontFamily: '"Fraunces", serif', 
            fontSize: '28px', 
            color: '#1a2b4a',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            Ledge Admin
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7b8d', 
            marginBottom: '32px' 
          }}>
            Content Management
          </div>
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #e8e6e1',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              marginBottom: '16px',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#b87333'}
            onBlur={(e) => e.target.style.borderColor = '#e8e6e1'}
          />
          
          {authError && (
            <div style={{ color: '#c62828', fontSize: '14px', marginBottom: '12px' }}>
              {authError}
            </div>
          )}
          
          <button type="submit" style={{
            width: '100%',
            padding: '14px',
            background: '#1a2b4a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
            onMouseOver={(e) => e.target.style.background = '#2a3b5a'}
            onMouseOut={(e) => e.target.style.background = '#1a2b4a'}
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  // ============================================
  // ADMIN DASHBOARD
  // ============================================
  const filteredArticles = filter === 'all' ? articles : articles.filter(a => a.status === filter);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f6f3',
      fontFamily: '"DM Sans", sans-serif',
      color: '#1a2b4a'
    }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '14px 24px',
          borderRadius: '8px',
          background: notification.type === 'success' ? '#2e7d32' : 
                      notification.type === 'warning' ? '#e65100' : '#c62828',
          color: 'white',
          fontSize: '14px',
          fontWeight: 600,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e8e6e1',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ 
            fontFamily: '"Fraunces", serif', 
            fontSize: '22px', 
            fontWeight: 600,
            color: '#1a2b4a'
          }}>
            Ledge Admin
          </span>
          <span style={{
            background: '#b87333',
            color: 'white',
            padding: '2px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            EDITOR
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" target="_blank" style={{
            fontSize: '13px',
            color: '#6b7b8d',
            textDecoration: 'none'
          }}>
            View Site →
          </a>
          <button onClick={() => { setIsAuthenticated(false); setPassword(''); }}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #e8e6e1',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              color: '#6b7b8d'
            }}>
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px' }}>
        {/* Stats bar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {[
            { label: 'Total', value: stats.total || 0, color: '#1a2b4a' },
            { label: 'Published', value: stats.published || 0, color: '#2e7d32' },
            { label: 'Draft', value: stats.draft || 0, color: '#e65100' },
            { label: 'Unpublished', value: stats.unpublished || 0, color: '#c62828' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'white',
              padding: '16px 24px',
              borderRadius: '8px',
              border: '1px solid #e8e6e1',
              minWidth: '120px'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7b8d', marginTop: '2px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Actions bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'published', 'draft', 'unpublished'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: filter === f ? '2px solid #b87333' : '1px solid #e8e6e1',
                  background: filter === f ? '#fef8f0' : 'white',
                  color: filter === f ? '#b87333' : '#6b7b8d',
                  fontSize: '13px',
                  fontWeight: filter === f ? 600 : 400,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}>
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={fetchArticles}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: '1px solid #e8e6e1',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                color: '#6b7b8d'
              }}>
              ↻ Refresh
            </button>
            <button onClick={() => setShowNewForm(!showNewForm)}
              style={{
                padding: '8px 20px',
                background: '#b87333',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
              + New Article
            </button>
          </div>
        </div>

        {/* New article form */}
        {showNewForm && (
          <div style={{
            background: 'white',
            border: '2px solid #b87333',
            borderRadius: '12px',
            padding: '28px',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              fontFamily: '"Fraunces", serif', 
              margin: '0 0 20px',
              fontSize: '18px'
            }}>
              New Article
            </h3>
            <form onSubmit={createArticle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input
                    required
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                    style={inputStyle}
                    placeholder="Article title"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Source</label>
                  <input
                    value={newArticle.source_name}
                    onChange={(e) => setNewArticle({...newArticle, source_name: e.target.value})}
                    style={inputStyle}
                    placeholder="Ledge Editorial"
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Lead / Summary</label>
                <textarea
                  value={newArticle.lead}
                  onChange={(e) => setNewArticle({...newArticle, lead: e.target.value})}
                  style={{...inputStyle, minHeight: '60px', resize: 'vertical'}}
                  placeholder="Brief summary..."
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Leadership Angle *</label>
                <textarea
                  required
                  value={newArticle.leadership_angle}
                  onChange={(e) => setNewArticle({...newArticle, leadership_angle: e.target.value})}
                  style={{...inputStyle, minHeight: '100px', resize: 'vertical'}}
                  placeholder="Your editorial perspective..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Dimension *</label>
                  <select
                    value={newArticle.primary_dimension}
                    onChange={(e) => setNewArticle({...newArticle, primary_dimension: e.target.value})}
                    style={inputStyle}
                  >
                    {DIMENSIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Data Source</label>
                  <input
                    value={newArticle.data_source}
                    onChange={(e) => setNewArticle({...newArticle, data_source: e.target.value})}
                    style={inputStyle}
                    placeholder="McKinsey, HBR..."
                  />
                </div>
                <div>
                  <label style={labelStyle}>Article URL</label>
                  <input
                    value={newArticle.article_url}
                    onChange={(e) => setNewArticle({...newArticle, article_url: e.target.value})}
                    style={inputStyle}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowNewForm(false)}
                  style={{
                    padding: '10px 20px', background: 'transparent',
                    border: '1px solid #e8e6e1', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '14px', color: '#6b7b8d'
                  }}>
                  Cancel
                </button>
                <button type="submit" style={{
                  padding: '10px 24px', background: '#1a2b4a',
                  color: 'white', border: 'none', borderRadius: '6px',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                }}>
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Articles list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7b8d' }}>
            Loading...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredArticles.map(article => (
              <div key={article.id} style={{
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e8e6e1',
                padding: editingId === article.id ? '24px' : '16px 20px',
                transition: 'all 0.2s'
              }}>
                {editingId === article.id ? (
                  /* Edit mode */
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={labelStyle}>Title</label>
                        <input value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          style={inputStyle} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={labelStyle}>Source</label>
                          <input value={editForm.source_name}
                            onChange={(e) => setEditForm({...editForm, source_name: e.target.value})}
                            style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Dimension</label>
                          <select value={editForm.primary_dimension}
                            onChange={(e) => setEditForm({...editForm, primary_dimension: e.target.value})}
                            style={inputStyle}>
                            {DIMENSIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={labelStyle}>Leadership Angle</label>
                      <textarea value={editForm.leadership_angle}
                        onChange={(e) => setEditForm({...editForm, leadership_angle: e.target.value})}
                        style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditingId(null)}
                        style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #e8e6e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                        Cancel
                      </button>
                      <button onClick={saveEdit}
                        style={{ padding: '8px 16px', background: '#1a2b4a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: STATUS_COLORS[article.status]?.bg || '#f5f5f5',
                          color: STATUS_COLORS[article.status]?.text || '#666',
                        }}>
                          {STATUS_COLORS[article.status]?.label || article.status}
                        </span>
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#b87333', 
                          fontWeight: 600 
                        }}>
                          {article.primary_dimension}
                        </span>
                        <span style={{ fontSize: '11px', color: '#aaa' }}>
                          {article.source_name}
                        </span>
                        <span style={{ fontSize: '11px', color: '#ccc' }}>
                          {new Date(article.curated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1a2b4a',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {article.title}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button onClick={() => startEdit(article)} title="Edit"
                        style={actionBtnStyle}>
                        ✎
                      </button>
                      {article.status === 'published' ? (
                        <button onClick={() => updateStatus(article.id, 'unpublished')} title="Unpublish"
                          style={{...actionBtnStyle, color: '#e65100'}}>
                          ↓
                        </button>
                      ) : (
                        <button onClick={() => updateStatus(article.id, 'published')} title="Publish"
                          style={{...actionBtnStyle, color: '#2e7d32'}}>
                          ↑
                        </button>
                      )}
                      <button onClick={() => deleteArticle(article.id, article.title)} title="Delete"
                        style={{...actionBtnStyle, color: '#c62828'}}>
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredArticles.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: '#6b7b8d' }}>
                No articles found
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Shared styles
const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#6b7b8d',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #e8e6e1',
  borderRadius: '6px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: '"DM Sans", sans-serif',
  color: '#1a2b4a'
};

const actionBtnStyle = {
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: '1px solid #e8e6e1',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#6b7b8d',
  transition: 'all 0.15s'
};
