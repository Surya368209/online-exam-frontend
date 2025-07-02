import { useState } from 'react';

const RegisterPage = () => {
const [formData, setFormData] = useState({
  rollNo: '',
  role: 'student',
  fullName: '',
  name: '',
  department: '',
  year: '',
  designation: '',
  email: '' // ✅ Add this
});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { role, ...rest } = formData;
    let payload = { rollNo: formData.rollNo, role };

    if (role === 'student') {
      payload.fullName = formData.fullName;
      payload.department = formData.department;
      payload.year = formData.year;
        payload.email = formData.email; 
    } else {
      payload.name = formData.name;
      payload.department = formData.department;
      payload.designation = formData.designation;
        payload.email = formData.email; 
    }

try {
  const res = await fetch('http://localhost:8081/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();  // read backend error response
    throw new Error(errorText || 'Registration failed');
  }

  setSuccess('Registered successfully. You can now log in.');
} catch (err) {
  setError(err.message || 'Error registering');
} finally {
  setLoading(false);
}
  };

  return (
    <div className="auth-form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Roll No:
          <input
            type="text"
            name="rollNo"
            value={formData.rollNo}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Role:
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </label>
        <br />
        {formData.role === 'student' && (
          <>
            <label>
              Full Name:
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </label>
            <br />
            <label>
              Department:
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </label>
            <br />
            <label>
              Year:
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </label>
            <br />
            <label>
  Email:
  <input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    required
  />
</label>
<br />
          </>
        )}
        {formData.role === 'teacher' && (
          <>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
            <br />
            <label>
              Department:
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </label>
            <br />
            <label>
              Designation:
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </label>
                        <label>
  Email:
  <input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    required
  />
</label>
<br />
            <br />
          </>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;
