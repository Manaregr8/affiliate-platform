# Production Deployment Checklist

## 🚀 Pre-Deployment

### 1. Environment Variables
- [ ] Create production `.env` file (DO NOT commit to git)
- [ ] Set `NEXTAUTH_URL` to production domain (e.g., `https://yourdomain.com`)
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Generate new `NEXTAUTH_SECRET` for production
  ```bash
  openssl rand -base64 32
  ```
- [ ] Verify `DATABASE_URL` points to production database
- [ ] Ensure all secrets are stored in platform secrets (Vercel/Railway/etc.)

### 2. Database
- [ ] Run final migration on production database
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Seed initial data if needed
  ```bash
  npx prisma db seed
  ```
- [ ] Create database backups strategy
- [ ] Verify connection pooling is enabled (Supabase pooler ✓)
- [ ] Add database indexes for performance:
  ```sql
  -- Add to Prisma schema or run manually
  CREATE INDEX idx_student_affiliator ON "Student"("affiliatorId");
  CREATE INDEX idx_student_status ON "Student"("leadStatus");
  CREATE INDEX idx_payout_status ON "PayoutRequest"("status");
  CREATE INDEX idx_affiliate_super ON "Affiliate"("superAffiliatorId");
  CREATE INDEX idx_issue_topic ON "IssueReport"("topic");
  CREATE INDEX idx_issue_status ON "IssueReport"("status");
  ```

### 3. Security Hardening
- [ ] Review all API routes for authentication checks
- [ ] Verify CORS settings are restrictive
- [ ] Enable HTTPS only (handled by platform usually)
- [ ] Review rate limiting thresholds
- [ ] Add CSP headers in `next.config.js`:
  ```js
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ]
  ```

### 4. Code Quality
- [ ] Run full test suite (if available)
- [ ] Run production build locally
  ```bash
  npm run build
  npm run start
  ```
- [ ] Fix all TypeScript errors
- [ ] Fix all ESLint warnings
- [ ] Test all user flows manually

### 5. Performance
- [ ] Enable Next.js caching strategies
- [ ] Optimize images (already using next/image ✓)
- [ ] Review bundle size
  ```bash
  npm run build
  # Check .next/analyze output
  ```
- [ ] Add loading states for all async operations ✓
- [ ] Test on slow 3G connection

## 🎯 Platform-Specific Setup

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables via dashboard or CLI
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add DATABASE_URL production
```

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up

# Set environment variables
railway variables set NEXTAUTH_URL=https://yourdomain.com
railway variables set NEXT_PUBLIC_APP_URL=https://yourdomain.com
railway variables set NEXTAUTH_SECRET=your-secret
```

### Docker (Self-hosted)
```dockerfile
# Use provided Dockerfile
docker build -t affiliate-platform .
docker run -p 3000:3000 --env-file .env.production affiliate-platform
```

## ✅ Post-Deployment

### 1. Verification
- [ ] Test user registration (affiliator, super-affiliator)
- [ ] Test login flow
- [ ] Test student registration via referral link
- [ ] Test lead approval by counsellor
- [ ] Test token distribution
- [ ] Test payout request flow
- [ ] Submit issue report from affiliator and super-affiliator dashboards
- [ ] Verify email notifications work (if configured)
- [ ] Check all dashboards load correctly
- [ ] Test on mobile devices

### 2. Monitoring Setup
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up analytics (Plausible, Google Analytics)
- [ ] Monitor database performance
- [ ] Set up alerts for critical errors

### 3. Documentation
- [ ] Create user guides for each role
- [ ] Document admin procedures
- [ ] Create incident response plan
- [ ] Document backup/restore procedures

## 🔒 Security Best Practices

### Regular Maintenance
- [ ] Update dependencies monthly
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] Review access logs weekly
- [ ] Rotate secrets quarterly
- [ ] Review and update rate limits based on usage
- [ ] Test backup restoration monthly

### Incident Response
1. **Database Issues**
   - Restore from most recent backup
   - Check connection pool limits
   - Review slow query logs

2. **Authentication Issues**
   - Verify NEXTAUTH_URL matches domain
   - Check NEXTAUTH_SECRET is set
   - Review session configuration

3. **Rate Limiting Issues**
   - Adjust thresholds in rate-limit config
   - Consider Redis for distributed rate limiting
   - Review IP identification logic

## 📊 Performance Benchmarks

Expected performance (after optimization):
- Landing page: < 1s FCP
- Dashboard loads: < 2s
- API response times: < 200ms (p95)
- Database queries: < 50ms average

## 🚨 Known Limitations

Current implementation:
1. **Rate limiting**: In-memory (won't work across multiple instances)
   - **Solution**: Implement Redis-based rate limiting for production clusters

2. **File uploads**: No QR code upload yet
   - **Solution**: Add file upload with cloud storage (S3, Cloudinary)

3. **Email notifications**: Not implemented
   - **Solution**: Add email service (SendGrid, Mailgun, Resend)

4. **Real-time updates**: No WebSocket support
   - **Solution**: Add socket.io for live dashboard updates

## 📱 Mobile Considerations

- [x] Responsive tables with horizontal scroll
- [x] Touch-friendly buttons (min 44x44px)
- [x] Readable text sizes (min 16px)
- [ ] Test on iOS Safari and Chrome Android
- [ ] Add manifest.json for PWA support (optional)

## 🔄 Rollback Plan

If deployment fails:
1. Revert to previous version via platform dashboard
2. Check environment variables
3. Review deployment logs
4. Test database connection
5. Verify DNS settings

## 📞 Support Contacts

- Database: Supabase Support
- Hosting: [Platform] Support
- Domain/DNS: [Registrar] Support
- Development Team: [Your Contact]

---

## Quick Commands Reference

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Database
npx prisma migrate dev
npx prisma migrate deploy
npx prisma studio

# Linting
npm run lint

# Generate Prisma Client
npx prisma generate
```

---

**Last Updated**: December 2, 2025
**Version**: 1.0.0
**Status**: Ready for Production Testing
