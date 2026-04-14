'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Divider,
} from 'antd';
import { GoogleOutlined, LeftOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { isEmail, isVietnamesePhone } from '@/utils/format';
import api from '@/lib/api';
import toast from '@/lib/toast';

const { Text, Title } = Typography;

type Step = 'initial' | 'register' | 'login' | 'login-otp' | 'forgot' | 'reset';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ open, onClose }) => {
  const [step, setStep] = useState<Step>('initial');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login } = useAuthStore();
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    if (!open) { setStep('initial'); setContact(''); form.resetFields(); }
  }, [open, form]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const contactValid = (val: string) => isEmail(val) || isVietnamesePhone(val);

  // ── STEP: Check identity ──────────────────────────
  const handleCheckIdentity = async () => {
    if (!contactValid(contact)) {
      toast.error('Vui lòng nhập đúng định dạng SĐT Việt Nam hoặc Email');
      return;
    }
    setLoading(true);
    try {
      // _silent: true — interceptor won't show toast, component controls flow
      const { data } = await api.post('/auth/check-identity', { contact }, { _silent: true });
      if (data.exists) {
        setStep('login');
      } else {
        await sendOtp('register');
        setStep('register');
      }
    } finally { setLoading(false); }
  };

  // ── SEND OTP ───────────────────────────────────────
  const sendOtp = async (type: 'register' | 'login' | 'reset') => {
    await api.post('/auth/send-otp', { contact, type });
    setCountdown(60);
    toast.success('Mã OTP đã được gửi!');
  };

  // ── REGISTER ───────────────────────────────────────
  const handleRegister = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { contact, ...values });
      login(data.user);
      toast.success(`Chào mừng, ${data.user.name}! 🎉`);
      onClose();
      redirectByRole(data.user.role);
    } finally { setLoading(false); }
  };

  // ── LOGIN with password ────────────────────────────
  const handleLogin = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { contact, password: values.password });
      login(data.user);
      toast.success('Đăng nhập thành công!');
      onClose();
      redirectByRole(data.user.role);
    } finally { setLoading(false); }
  };

  // ── LOGIN with OTP ─────────────────────────────────
  const handleLoginOtp = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login-otp', { contact, otp: values.otp });
      login(data.user);
      toast.success('Đăng nhập thành công!');
      onClose();
      redirectByRole(data.user.role);
    } finally { setLoading(false); }
  };

  // ── RESET PASSWORD ─────────────────────────────────
  const handleResetPassword = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { contact, otp: values.otp, newPassword: values.newPassword });
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
      setStep('login');
    } finally { setLoading(false); }
  };

  const redirectByRole = (role: string) => {
    if (role === 'ADMIN' || role === 'SALE') {
      router.push('/admin');
    }
    // USER stays on current page
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/google`;
  };

  // ── RENDERS ────────────────────────────────────────
  const renderInitial = () => (
    <>
      <Title level={4} style={{ textAlign: 'center', marginBottom: 4 }}>
        Đăng nhập / Đăng ký
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 20 }}>
        Nhập số điện thoại hoặc email để tiếp tục
      </Text>
      <Input
        size="large"
        placeholder="SĐT: 0901234567 hoặc Email"
        value={contact}
        onChange={(e) => setContact(e.target.value.trim())}
        onPressEnter={handleCheckIdentity}
        status={contact && !contactValid(contact) ? 'error' : ''}
      />
      {contact && !contactValid(contact) && (
        <Text type="danger" style={{ fontSize: 12 }}>
          Vui lòng nhập đúng định dạng SĐT Việt Nam hoặc Email
        </Text>
      )}
      <Button
        type="primary" block size="large"
        loading={loading}
        disabled={!contactValid(contact)}
        onClick={handleCheckIdentity}
        style={{ marginTop: 12 }}
      >
        Tiếp tục
      </Button>
      <Divider plain style={{ color: '#aaa', fontSize: 12 }}>Hoặc</Divider>
      <Button icon={<GoogleOutlined />} block size="large" onClick={handleGoogleLogin}>
        Tiếp tục với Google
      </Button>
    </>
  );

  const renderRegister = () => (
    <>
      <Button type="text" icon={<LeftOutlined />} onClick={() => setStep('initial')} style={{ marginBottom: 8, padding: 0 }}>
        Trở lại
      </Button>
      <Title level={4}>Đăng ký tài khoản</Title>
      <Text type="secondary">Mã xác nhận đã gửi đến: <strong>{contact}</strong></Text>
      <Form form={form} layout="vertical" onFinish={handleRegister} style={{ marginTop: 16 }}>
        <Form.Item name="otp" label="Mã OTP (6 chữ số)" rules={[{ required: true, len: 6, message: 'Vui lòng nhập đủ 6 số' }]}>
          <Input.OTP size="large" length={6} />
        </Form.Item>
        <Button type="link" size="small" disabled={countdown > 0} onClick={() => sendOtp('register')} style={{ padding: 0, marginTop: -8, marginBottom: 8 }}>
          {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại mã'}
        </Button>
        <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }, { min: 2, message: 'Tối thiểu 2 ký tự' }]}>
          <Input size="large" placeholder="Nguyễn Văn A" />
        </Form.Item>
        <Form.Item name="password" label="Mật khẩu (tùy chọn)" rules={[{ min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
          <Input.Password size="large" placeholder="Để trống nếu chỉ dùng OTP" />
        </Form.Item>
        <Button type="primary" block size="large" htmlType="submit" loading={loading}>
          Hoàn tất đăng ký
        </Button>
      </Form>
    </>
  );

  const renderLogin = () => (
    <>
      <Button type="text" icon={<LeftOutlined />} onClick={() => setStep('initial')} style={{ marginBottom: 8, padding: 0 }}>
        Trở lại
      </Button>
      <Title level={4}>Chào mừng quay trở lại 👋</Title>
      <Text type="secondary">{contact}</Text>
      <Form form={form} layout="vertical" onFinish={handleLogin} style={{ marginTop: 16 }}>
        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
          <Input.Password size="large" placeholder="Nhập mật khẩu" />
        </Form.Item>
        <Button type="link" size="small" style={{ padding: 0, marginTop: -12, marginBottom: 8 }}
          onClick={() => { void sendOtp('reset'); setStep('forgot'); }}>
          Quên mật khẩu?
        </Button>
        <Button type="primary" block size="large" htmlType="submit" loading={loading}>
          Đăng nhập
        </Button>
        <Button block size="large" style={{ marginTop: 8 }}
          onClick={() => { void sendOtp('login'); setStep('login-otp'); }}>
          Đăng nhập bằng mã OTP
        </Button>
      </Form>
    </>
  );

  const renderLoginOtp = () => (
    <>
      <Button type="text" icon={<LeftOutlined />} onClick={() => setStep('login')} style={{ marginBottom: 8, padding: 0 }}>Trở lại</Button>
      <Title level={4}>Nhập mã OTP</Title>
      <Text type="secondary">Gửi đến: <strong>{contact}</strong></Text>
      <Form form={form} layout="vertical" onFinish={handleLoginOtp} style={{ marginTop: 16 }}>
        <Form.Item name="otp" label="Mã OTP" rules={[{ required: true, len: 6, message: 'Vui lòng nhập đủ 6 số' }]}>
          <Input.OTP size="large" length={6} />
        </Form.Item>
        <Button type="link" disabled={countdown > 0} onClick={() => sendOtp('login')} style={{ padding: 0 }}>
          {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại mã'}
        </Button>
        <Button type="primary" block size="large" htmlType="submit" loading={loading} style={{ marginTop: 12 }}>
          Xác nhận đăng nhập
        </Button>
      </Form>
    </>
  );

  const renderForgot = () => (
    <>
      <Button type="text" icon={<LeftOutlined />} onClick={() => setStep('login')} style={{ marginBottom: 8, padding: 0 }}>Trở lại</Button>
      <Title level={4}>Đặt lại mật khẩu</Title>
      <Text type="secondary">Mã OTP đã được gửi đến: <strong>{contact}</strong></Text>
      <Form form={form} layout="vertical" onFinish={handleResetPassword} style={{ marginTop: 16 }}>
        <Form.Item name="otp" label="Mã OTP" rules={[{ required: true, len: 6, message: 'Vui lòng nhập 6 số' }]}>
          <Input.OTP size="large" length={6} />
        </Form.Item>
        <Button type="link" disabled={countdown > 0} onClick={() => sendOtp('reset')} style={{ padding: 0 }}>
          {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại mã'}
        </Button>
        <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
          <Input.Password size="large" />
        </Form.Item>
        <Form.Item name="confirmPassword" label="Xác nhận mật khẩu"
          dependencies={['newPassword']}
          rules={[{ required: true }, ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
              return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
            },
          })]}>
          <Input.Password size="large" />
        </Form.Item>
        <Button type="primary" block size="large" htmlType="submit" loading={loading}>
          Đặt lại mật khẩu
        </Button>
      </Form>
    </>
  );

  const stepContent: Record<Step, React.ReactNode> = {
    initial: renderInitial(),
    register: renderRegister(),
    login: renderLogin(),
    'login-otp': renderLoginOtp(),
    forgot: renderForgot(),
    reset: renderForgot(),
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={420}
      destroyOnClose
    >
      {stepContent[step]}
    </Modal>
  );
};
