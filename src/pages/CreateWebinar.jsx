import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { webinarAPI } from '../services/api';
import toast from 'react-hot-toast';
import './CreateWebinar.css';

export default function CreateWebinar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    instructor: '',
    dateTime: '',
    durationMinutes: 60,
    streamUrl: '',
    coverImageUrl: '',
    maxParticipants: 100,
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      loadWebinar();
    }
  }, [id]);

  const loadWebinar = async () => {
    try {
      const res = await webinarAPI.getById(id);
      const w = res.data;
      setForm({
        title: w.title || '',
        description: w.description || '',
        instructor: w.instructor || '',
        dateTime: w.dateTime ? w.dateTime.substring(0, 16) : '',
        durationMinutes: w.durationMinutes || 60,
        streamUrl: w.streamUrl || '',
        coverImageUrl: w.coverImageUrl || '',
        maxParticipants: w.maxParticipants || 100,
        category: w.category || '',
      });
    } catch (err) {
      toast.error('Failed to load webinar data.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? parseInt(value) || '' : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.instructor || !form.dateTime) {
      toast.error('Missing required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit) {
        await webinarAPI.update(id, payload);
        toast.success('Webinar updated successfully!');
      } else {
        await webinarAPI.create(payload);
        toast.success('Webinar created successfully!');
      }
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} webinar.`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="page container" id="create-webinar-page">
      <div className="create-form-wrapper animate-fade-in">
        <div className="page-header mb-8">
          <h1 className="gradient-text">{isEdit ? 'Edit Webinar' : 'Create New Webinar'}</h1>
          <p className="text-muted">{isEdit ? `Modifying: ${form.title}` : 'Fill in the details for your upcoming session'}</p>
        </div>

        <form onSubmit={handleSubmit} className="create-form card glass shadow-xl" id="webinar-form">
          <div className="form-group mb-6">
            <label className="form-label" htmlFor="wf-title">Webinar Title *</label>
            <input
              type="text"
              id="wf-title"
              name="title"
              className="form-input"
              placeholder="e.g. Master React in 60 Minutes"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group mb-6">
            <label className="form-label" htmlFor="wf-description">Detailed Description *</label>
            <textarea
              id="wf-description"
              name="description"
              className="form-textarea"
              placeholder="Provide a compelling description of what learners will gain..."
              rows={5}
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row grid grid-2 gap-6 mb-6">
            <div className="form-group">
              <label className="form-label" htmlFor="wf-instructor">Lead Instructor *</label>
              <input
                type="text"
                id="wf-instructor"
                name="instructor"
                className="form-input"
                placeholder="Full Name"
                value={form.instructor}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="wf-category">Category</label>
              <input
                type="text"
                id="wf-category"
                name="category"
                className="form-input"
                placeholder="e.g. Software Development"
                value={form.category}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row grid grid-2 gap-6 mb-6">
            <div className="form-group">
              <label className="form-label" htmlFor="wf-datetime">Start Date & Time *</label>
              <input
                type="datetime-local"
                id="wf-datetime"
                name="dateTime"
                className="form-input"
                value={form.dateTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="wf-duration">Duration (mins)</label>
              <input
                type="number"
                id="wf-duration"
                name="durationMinutes"
                className="form-input"
                min="15"
                max="480"
                value={form.durationMinutes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row grid grid-2 gap-6 mb-6">
            <div className="form-group">
              <label className="form-label" htmlFor="wf-max">Max Capacity</label>
              <input
                type="number"
                id="wf-max"
                name="maxParticipants"
                className="form-input"
                min="1"
                value={form.maxParticipants}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="wf-stream">Live Stream Link</label>
              <input
                type="url"
                id="wf-stream"
                name="streamUrl"
                className="form-input"
                placeholder="https://zoom.us/j/..."
                value={form.streamUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group mb-8">
            <label className="form-label" htmlFor="wf-cover">Cover Image Link</label>
            <input
              type="url"
              id="wf-cover"
              name="coverImageUrl"
              className="form-input"
              placeholder="https://image-host.com/cover.jpg"
              value={form.coverImageUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions flex justify-end gap-4 border-t pt-8">
            <button
              type="button"
              className="btn btn-outline px-8"
              onClick={() => navigate('/admin')}
            >
              Back to List
            </button>
            <button
              type="submit"
              className="btn btn-primary px-12 shadow-lg"
              id="submit-webinar"
              disabled={loading}
            >
              {loading
                ? (isEdit ? 'Updating Session...' : 'Creating Session...')
                : (isEdit ? 'Finalize Changes' : 'Launch Webinar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
