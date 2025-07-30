import { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    // 1. Create user in Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (signUpError) return setError(signUpError.message);

    // 2. Insert into user_profiles
    const user = data.user;
    if (!user) return setError("Signup failed. Please try again.");

    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert([
        {
          id: user.id,
          email: form.email,
          full_name: form.full_name,
          phone: form.phone,
          date_of_birth: form.date_of_birth,
          gender: form.gender,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    if (profileError) return setError(profileError.message);

    navigate("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        required
      />
      <input
        type="text"
        placeholder="Full Name"
        value={form.full_name}
        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={form.phone}
        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
      />
      <input
        type="date"
        placeholder="Date of Birth"
        value={form.date_of_birth}
        onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
      />
      <select
        value={form.gender}
        onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <button type="submit">Sign Up</button>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}