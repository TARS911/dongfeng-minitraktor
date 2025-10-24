import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wbfhvcmvkyjsjvqkbxpz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZmh2Y212a3lqc2p2cWtieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzg1MzksImV4cCI6MjA3Njg1NDUzOX0.5yHwVSIkbhDnnUKrPSe6uTCW-ImZYrczI-8nRQB0fHY';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test connection
export async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('count')
            .limit(1);

        if (error) throw error;
        console.log('✅ Supabase подключен успешно');
        return true;
    } catch (error) {
        console.error('❌ Ошибка подключения к Supabase:', error.message);
        return false;
    }
}

export default supabase;
