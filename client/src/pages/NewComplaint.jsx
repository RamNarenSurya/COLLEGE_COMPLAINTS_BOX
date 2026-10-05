import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Send, Upload, File, X, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Classroom',
  'Laboratory',
  'Hostel',
  'Wi-Fi / Internet',
  'Infrastructure',
  'Transportation',
  'Cleanliness',
  'Electrical',
  'Water Supply',
  'Library',
  'Canteen',
  'Security',
  'Other'
];

export default function NewComplaint() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Classroom',
    description: '',
    location: '',
    priority: 'Medium'
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size must be under 10MB.');
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('category', formData.category);
      body.append('description', formData.description);
      body.append('location', formData.location);
      body.append('priority', formData.priority);

      if (file) {
        body.append('attachment', file);
      }

      const res = await api.submitComplaint(body);
      navigate(`/student/complaints/${res.complaint.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Submit New Complaint</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Report a campus or facility issue to administrative authorities</p>
        </div>
        <Link to="/student/dashboard" className="btn btn-secondary btn-sm">
          Cancel & Return
        </Link>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Complaint Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Projector not powering on in Seminar Hall 2"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Assessment</label>
              <select
                name="priority"
                className="form-control"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low (Minor issue)</option>
                <option value="Medium">Medium (Normal issue)</option>
                <option value="High">High (Significant impact)</option>
                <option value="Critical">Critical (Urgent attention)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Location *</label>
            <input
              type="text"
              name="location"
              className="form-control"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Block B, 3rd Floor, Room 304"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide full description of the issue, when it started, and specific observations..."
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Supporting Attachment (Photo/Document)</label>
            <div style={{
              border: '2px dashed var(--slate-300)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.5rem',
              textAlign: 'center',
              background: '#f8fafc',
              cursor: 'pointer'
            }}>
              {!file ? (
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <Upload size={32} color="var(--primary-600)" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--slate-700)' }}>
                    Click to upload photo or document
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>
                    JPG, PNG, PDF up to 10MB
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <File size={20} color="var(--primary-600)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{file.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem' }}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Complaint'} <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
