import { createClient } from '@supabase/supabase-js';

// ✅ URL cố định của project - không phụ thuộc vào env var để tránh Vercel config sai
// Nếu cần thay đổi project, sửa trực tiếp ở đây
const HARDCODED_URL = 'https://khulunssdjnckelwhcww.supabase.co';
const HARDCODED_KEY = 'sb_publishable_TgaFe-4QlZucygM1xC7BLQ_vBYF5Jaa';

// Ưu tiên env var nếu hợp lệ (chứa project id đúng), fallback về hardcoded
const rawUrl = (() => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  // Chỉ dùng env var nếu chứa project id đúng
  if (envUrl && envUrl.includes('khulunssdjnckelwhcww')) return envUrl;
  return HARDCODED_URL;
})();

const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || HARDCODED_KEY;

// Chuẩn hóa URL: loại bỏ /rest/v1/ hoặc dấu gạch chéo cuối nếu có
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
export const supabaseAnonKey = supabaseKey;

console.log('🔌 Supabase URL:', supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Thiếu thông tin kết nối Supabase! Vui lòng kiểm tra VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env'
  );
}


// Khởi tạo Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Hàm tiện ích kiểm tra tình trạng kết nối tới Supabase
 * @returns {Promise<{ ok: boolean, message: string, details?: any }>}
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { ok: false, message: 'Lỗi Supabase Auth: ' + error.message, details: error };
    }
    return { ok: true, message: 'Kết nối Supabase thành công!', details: data };
  } catch (err) {
    return { ok: false, message: 'Lỗi kết nối Supabase: ' + err.message, details: err };
  }
}

export default supabase;
