import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ChangePasswordViaOTP = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      await axios.post('/api/auth/send-otp');
      setOtpSent(true);
      toast.success('OTP sent to your registered email.');
    } catch (err) {
      console.error('Error sending OTP:', err);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Please fill both OTP and new password.');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/auth/change-password', { otp, newPassword });
      toast.success('Password changed successfully!');
      setOtp('');
      setNewPassword('');
      setOtpSent(false);
    } catch (err) {
      console.error('Change password error:', err);
      toast.error(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-6 border rounded-xl bg-base-100 shadow-md">
      <h3 className="text-lg font-bold mb-4">🔐 Change Password</h3>

      {!otpSent && (
        <button
          className={`btn btn-accent ${loading ? 'btn-disabled' : ''}`}
          onClick={handleSendOtp}
        >
          {loading ? 'Sending...' : 'Send OTP to Email'}
        </button>
      )}

      {otpSent && (
        <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
          <input
            type="text"
            placeholder="Enter OTP"
            className="input input-bordered w-full"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            className="input input-bordered w-full"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ChangePasswordViaOTP;
