# Vercel Deployment Guide - BeehiveGameshow

## ✅ Pre-Deployment Checklist

- [x] Build configuration verified (`vercel.json` created)
- [x] Build test successful (318KB bundle)
- [x] Environment variables identified
- [ ] Supabase credentials ready
- [ ] Git repository pushed to GitHub

## 📋 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**

   - Visit: https://vercel.com/dashboard
   - Click "Add New Project"

2. **Import Repository**

   - Select "Import Git Repository"
   - Choose: `BeehiveGameshow`
   - Click "Import"

3. **Configure Project**

   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `dist` (auto-filled)

4. **Add Environment Variables** ⚠️ CRITICAL

   Click "Environment Variables" and add:

   | Name                     | Value                          | Environment                      |
   | ------------------------ | ------------------------------ | -------------------------------- |
   | `VITE_SUPABASE_URL`      | `your-project-url.supabase.co` | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | `your-anon-key`                | Production, Preview, Development |

   **Where to find these values:**

   - Go to your Supabase project dashboard
   - Settings → API
   - Copy "Project URL" and "anon public" key

5. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes for build to complete
   - You'll get a URL like: `https://beehive-gameshow.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow interactive prompts)
vercel

# When prompted:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? beehive-gameshow (or keep default)
# - Directory? ./ (press Enter)
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase anon key when prompted

# Deploy to production
vercel --prod
```

## 🔒 Security Checklist

- [ ] **Row Level Security (RLS)** enabled on Supabase tables
  - Currently using `using (true)` for development
  - ⚠️ Consider implementing proper policies for production
- [ ] **Environment variables** never committed to Git

  - ✅ `.env` is in `.gitignore`
  - ✅ Only `.env.example` in repository

- [ ] **Anon key** is safe to expose (read-only with RLS)
  - This is Supabase's public key, safe for frontend

## 🌐 Post-Deployment

### 1. Test Your Deployment

Once deployed, test these critical flows:

1. **Join Flow:**

   - Visit `/join`
   - Enter player name
   - Verify player appears in Supabase `players` table

2. **Host Flow:**

   - Visit `/host`
   - Create teams
   - Assign players
   - Verify real-time updates work

3. **Leaderboard Flow:**
   - Visit `/leaderboard`
   - Verify QR code displays
   - Test point updates
   - Verify real-time sync

### 2. Custom Domain (Optional)

If you want a custom domain:

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### 3. Configure Supabase Redirect URLs

⚠️ **Important:** Update Supabase allowed redirect URLs:

1. Go to Supabase Dashboard
2. Settings → Authentication → URL Configuration
3. Add your Vercel URL to "Site URL"
4. Add to "Redirect URLs":
   ```
   https://your-app.vercel.app
   https://your-app.vercel.app/**
   ```

## 🚀 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **Production:** Pushes to `main` branch
- **Preview:** Pushes to other branches or pull requests

Every commit gets a unique preview URL for testing.

## 📊 Monitoring

Access deployment analytics:

- **Dashboard:** https://vercel.com/dashboard
- **Analytics:** View traffic, performance, errors
- **Logs:** Real-time function logs and build logs

## 🐛 Troubleshooting

### Build Fails

```bash
# Test build locally first
npm run build

# Check for errors
npm run check
```

### Environment Variables Not Working

- Ensure they start with `VITE_` prefix
- Must redeploy after adding new env vars
- Check they're set for all environments (Production/Preview/Development)

### 404 on Refresh

- This should be fixed by `vercel.json` rewrites
- If still happening, verify `vercel.json` was deployed
- Check Vercel dashboard → Settings → General → "Output Directory" is `dist`

### Real-time Updates Not Working

- Check browser console for Supabase connection errors
- Verify `VITE_SUPABASE_URL` is correct
- Ensure Supabase project is not paused
- Check Realtime is enabled in Supabase dashboard

## 📝 Environment Variables Reference

Your current environment variables (from `.env.example`):

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Never commit your actual `.env` file!** ✅ It's already in `.gitignore`

## ✅ Deployment Complete Checklist

After deployment, verify:

- [ ] App loads at Vercel URL
- [ ] QR code displays correctly
- [ ] Players can join via `/join`
- [ ] Host can create teams
- [ ] Real-time updates work across tabs
- [ ] Leaderboard displays correctly
- [ ] All pages load without errors (check browser console)
- [ ] Mobile responsive design works

## 🎉 Success!

Your app should now be live at: `https://your-app-name.vercel.app`

Share the `/join` page with players and use `/host` for hosting!

---

## Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Vite Deployment:** https://vite.dev/guide/static-deploy.html#vercel
