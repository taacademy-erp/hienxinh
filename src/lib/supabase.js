import { createClient } from '@supabase/supabase-js';

// Lấy biến môi trường từ Vite (ưu tiên .env)
const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://khulunssdjnckelwhcww.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TgaFe-4QlZucygM1xC7BLQ_vBYF5Jaa';

// Chuẩn hóa URL: tự động loại bỏ /rest/v1/ hoặc dấu gạch chéo cuối nếu có
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
export const supabaseAnonKey = supabaseKey;

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
