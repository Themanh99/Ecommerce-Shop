/**
 * lib/toast.ts
 *
 * Static toast wrappers using Ant Design's global message API.
 * Safe to call from anywhere (interceptors, utils, outside React tree).
 *
 * Usage:
 *   toast.success('Lưu thành công!')
 *   toast.error('Có lỗi xảy ra')
 *   toast.info('Đang xử lý...')
 */
import { message } from 'antd';

// Default duration in seconds
const DURATION = 3;

const toast = {
  success: (content: string, duration = DURATION) =>
    void message.success(content, duration),

  error: (content: string, duration = DURATION) =>
    void message.error(content, duration),

  warning: (content: string, duration = DURATION) =>
    void message.warning(content, duration),

  info: (content: string, duration = DURATION) =>
    void message.info(content, duration),

  loading: (content: string, duration = 0) =>
    message.loading(content, duration),
};

export default toast;
