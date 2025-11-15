# 🔒 Secure API Keys with Supabase Edge Functions

## ✅ What I Just Built:

1. **Supabase Edge Function** (`supabase/functions/freesound-download/`) - Server-side proxy for Freesound API
2. **SupabaseFreesoundService** (`src/services/SupabaseFreesoundService.ts`) - Client-side service that calls the Edge Function
3. **CORS Handler** (`supabase/functions/_shared/cors.ts`) - For cross-origin requests

---

## 🚀 Deployment Steps:

### **Step 1: Link Your Supabase Project**

```bash
cd "C:\Users\ezequiel-casillas\OneDrive\Documents\ADHD - Timer - NEW"
npx supabase link --project-ref brwhhkmjyadcaasqggtd
```

When prompted, enter your Supabase database password.

---

### **Step 2: Set Freesound API Secrets in Supabase**

These are stored **only on the server**, never in your app:

```bash
npx supabase secrets set FREESOUND_CLIENT_ID=p2LQTl6ruVcDyK8yoVJ3
npx supabase secrets set FREESOUND_CLIENT_SECRET=dicOJ7BihTzR8dGXVxSTUhUR4j2oLJrf2BJdBMwH
```

✅ **Now your API keys are safely stored in Supabase!**

---

### **Step 3: Deploy the Edge Function**

```bash
npx supabase functions deploy freesound-download
```

This uploads your function to Supabase's servers.

---

### **Step 4: Test the Edge Function**

```bash
curl -i --location --request POST 'https://brwhhkmjyadcaasqggtd.supabase.co/functions/v1/freesound-download' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"action":"getSound","soundId":"554735"}'
```

Replace `YOUR_SUPABASE_ANON_KEY` with your anon key from `app/config/environment.ts`.

---

## 🔧 Update Your App to Use Supabase Edge Function:

Now update `SoundService.ts` to use the secure Supabase service instead of direct API:

### Option A: Quick Switch (Recommended)

I can update `FreesoundAPI.ts` to use `SupabaseFreesoundService` internally.

### Option B: Replace Completely

Remove `FreesoundAPI.ts` and update `SoundService.ts` to use `SupabaseFreesoundService` directly.

---

## 🎯 How It Works:

```
Before (INSECURE):
App → Freesound API
    (exposed keys)

After (SECURE):
App → Supabase Edge Function → Freesound API
         (no keys)        (keys safe on server)
```

---

## 📋 Benefits:

✅ **API keys never in app code** - Can't be extracted  
✅ **Supabase handles auth** - Only logged-in users can call function  
✅ **Rate limiting** - Control usage server-side  
✅ **Logging** - Track API usage  
✅ **Easy updates** - Change keys without app update  

---

## 🛠️ Troubleshooting:

**"Project not linked"**
```bash
npx supabase login
npx supabase link --project-ref brwhhkmjyadcaasqggtd
```

**"Function failed to deploy"**
- Check you have Deno installed (Edge Functions use Deno)
- Verify your internet connection
- Check Supabase dashboard for error logs

**"403 Forbidden"**
- Make sure you're logged in: `npx supabase login`
- Check your Supabase project is active

---

## 🚀 Ready to Deploy?

Run these 3 commands:

```bash
# 1. Link project
npx supabase link --project-ref brwhhkmjyadcaasqggtd

# 2. Set secrets
npx supabase secrets set FREESOUND_CLIENT_ID=p2LQTl6ruVcDyK8yoVJ3
npx supabase secrets set FREESOUND_CLIENT_SECRET=dicOJ7BihTzR8dGXVxSTUhUR4j2oLJrf2BJdBMwH

# 3. Deploy function
npx supabase functions deploy freesound-download
```

Then I'll update your app to use it!

