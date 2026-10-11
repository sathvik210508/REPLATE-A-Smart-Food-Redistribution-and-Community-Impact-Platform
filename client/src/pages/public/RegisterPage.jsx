import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight, Building2, HeartHandshake, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'donor';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Organization fields
  const [orgName, setOrgName] = useState('');
  const [donorType, setDonorType] = useState('College Canteen');
  const [ngoType, setNgoType] = useState('NGO / Community Kitchen');
  const [serviceArea, setServiceArea] = useState('Gandipet / Hyderabad');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        organizationName: orgName || `${name}'s Organization`,
        donorType,
        ngoType,
        serviceArea,
        address: address || 'Hyderabad, Telangana',
        contactPerson: name,
      };

      const user = await register(payload);

      if (user.role === 'donor') navigate('/donor/dashboard');
      else if (user.role === 'ngo') navigate('/ngo/dashboard');
      else if (user.role === 'volunteer') navigate('/volunteer/dashboard');
      else navigate('/donor/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-replate-muted flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-xl bg-white rounded-card border border-replate-border shadow-card p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#16845B] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-replate-text">Join the REPLATE Platform</h2>
            <p className="text-xs text-replate-subtext mt-1">
              SDG 2 Zero Hunger Collaborative Network
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-replate-text mb-2">
              Select Your Participation Role:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  role === 'donor'
                    ? 'border-[#16845B] bg-[#EAF6EF] text-[#116747] font-semibold ring-1 ring-[#16845B]'
                    : 'border-replate-border bg-white text-replate-subtext hover:border-stone-300'
                }`}
              >
                <Building2 className="w-5 h-5 mx-auto mb-1 text-[#16845B]" />
                <span className="text-xs block">Food Donor</span>
                <span className="text-[10px] text-stone-500">Canteen/Restaurant</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ngo')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  role === 'ngo'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold ring-1 ring-blue-600'
                    : 'border-replate-border bg-white text-replate-subtext hover:border-stone-300'
                }`}
              >
                <HeartHandshake className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs block">NGO / Kitchen</span>
                <span className="text-[10px] text-stone-500">Recipient Network</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  role === 'volunteer'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800 font-semibold ring-1 ring-indigo-600'
                    : 'border-replate-border bg-white text-replate-subtext hover:border-stone-300'
                }`}
              >
                <Truck className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                <span className="text-xs block">Volunteer</span>
                <span className="text-[10px] text-stone-500">Logistics Partner</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-replate-text mb-1">
                  Full Name / Contact Person
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs focus:ring-1 focus:ring-[#16845B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-replate-text mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98490 12345"
                  className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs focus:ring-1 focus:ring-[#16845B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-replate-text mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@organization.org"
                  className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs focus:ring-1 focus:ring-[#16845B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-replate-text mb-1">
                  Service Area / Zone
                </label>
                <input
                  type="text"
                  required
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Gandipet / Gachibowli"
                  className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs focus:ring-1 focus:ring-[#16845B]"
                />
              </div>
            </div>

            {/* Role specific section */}
            {role !== 'volunteer' && (
              <div className="p-3 bg-replate-muted/60 rounded-xl border border-replate-border space-y-3">
                <span className="text-[11px] font-bold text-replate-subtext uppercase tracking-wider block">
                  Organization Details ({role.toUpperCase()})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-replate-text mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder={role === 'donor' ? 'e.g. CBIT College Canteen' : 'e.g. Akshaya Food Foundation'}
                      className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-replate-text mb-1">
                      {role === 'donor' ? 'Donor Category' : 'Organization Type'}
                    </label>
                    {role === 'donor' ? (
                      <select
                        value={donorType}
                        onChange={(e) => setDonorType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs bg-white"
                      >
                        <option value="College Canteen">College Canteen</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Event Organizer">Event Organizer</option>
                        <option value="Other">Other Facility</option>
                      </select>
                    ) : (
                      <select
                        value={ngoType}
                        onChange={(e) => setNgoType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs bg-white"
                      >
                        <option value="NGO / Community Kitchen">NGO / Community Kitchen</option>
                        <option value="Shelter">Shelter Home</option>
                        <option value="Charitable Trust">Charitable Trust</option>
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Pickup / Operating Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Gandipet Campus, Hyderabad, 500075"
                    className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs bg-white"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-replate-text mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs focus:ring-1 focus:ring-[#16845B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-replate-text mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs focus:ring-1 focus:ring-[#16845B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#16845B] hover:bg-[#116747] text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Sign In link */}
          <div className="mt-6 text-center text-xs text-replate-subtext border-t border-replate-border pt-4">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-[#16845B] hover:underline">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
