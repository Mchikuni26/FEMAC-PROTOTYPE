
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sckuwrsjwxnctrmvrrys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNja3V3cnNqd3huY3RybXZycnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2ODUwNjksImV4cCI6MjA4NTI2MTA2OX0.p1VlUDx7DoLaJa4UOGljMi7eZQ9DLAdcLi6kVB3RnJg';

export const supabase = createClient(supabaseUrl, supabaseKey);
