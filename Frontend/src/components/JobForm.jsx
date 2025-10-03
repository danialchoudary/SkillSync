import React, { useState } from 'react';

export default function JobForm({ onPost }) {
  const [form, setForm] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salary: '',
    skills: '',
    experience: '',
  });

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (onPost) onPost(form);
    setForm({ title: '', company: '', description: '', location: '', salary: '', skills: '', experience: '' });
  };

  return (
    <form className="bg-white rounded shadow p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-2">Post a New Job</h2>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Job Title" className="border px-3 py-2 rounded" required />
      <input name="company" value={form.company} onChange={handleChange} placeholder="Company Name" className="border px-3 py-2 rounded" required />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border px-3 py-2 rounded" rows={3} required />
      <div className="flex gap-4">
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="border px-3 py-2 rounded w-1/2" required />
        <input name="salary" value={form.salary} onChange={handleChange} placeholder="Salary" className="border px-3 py-2 rounded w-1/2" required />
      </div>
      <div className="flex gap-4">
        <input name="skills" value={form.skills} onChange={handleChange} placeholder="Skills (comma separated)" className="border px-3 py-2 rounded w-1/2" />
        <input name="experience" value={form.experience} onChange={handleChange} placeholder="Experience (years)" className="border px-3 py-2 rounded w-1/2" type="number" min="0" />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 self-end">Post Job</button>
    </form>
  );
}
