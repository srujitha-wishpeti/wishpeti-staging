import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

serve(async (req) => {
  try {
    // 1. Fetch fresh rates for ALL currencies
    // Using the open access endpoint for simplicity
    const res = await fetch('https://open.er-api.com/v6/latest/INR')
    const rateData = await res.json()
    
    if (rateData.result !== 'success') {
      throw new Error(`API Error: ${rateData['error-type'] || 'Unknown error'}`)
    }

    const allRates = rateData.rates // This is the object { "INR": 83.5, "EUR": 0.9, ... }

    // 2. Initialize Supabase Admin Client
    // These ENV variables are automatically provided by Supabase in production
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Update the database table
    const { error } = await supabase
      .from('global_settings')
      .update({ 
        rates: allRates, 
        last_updated: new Date().toISOString() 
      })
      .eq('id', 'current_rates')

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, message: "Rates updated", count: Object.keys(allRates).length }), 
      { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }), 
      { 
        headers: { "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})