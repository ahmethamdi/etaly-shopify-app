# ETAly - Plan Features & Restrictions

## Overview
ETAly offers different pricing tiers with specific features and limitations.

## Plan Tiers

### FREE Plan
**Price:** $0/month

**Features:**
- ✅ Basic delivery rules (unlimited)
- ✅ Country-based targeting
- ✅ Min/Max delivery days
- ✅ Cutoff time settings
- ✅ 4 Free message templates:
  - Next Day Arrival (success)
  - Estimated Arrival (info)
  - Countdown Timer (warning)
  - Same-Day Dispatch (info)
- ✅ Product-specific delivery overrides
- ✅ Basic analytics

**Restrictions:**
- ❌ Premium templates (locked with 🔒 PRO badge)
- ❌ Advanced analytics
- ❌ Priority support
- ❌ Custom CSS styling
- ❌ Bulk import/export

---

### PRO Plan
**Price:** TBD

**Features:**
- ✅ Everything in FREE plan
- ✅ 10+ Premium templates:
  - Holiday Deadline (warning)
  - Weekend Notice (info)
  - Express Delivery (success)
  - Global Delivery (info)
  - Delivery Guarantee (success)
  - And more...
- ✅ Advanced analytics & insights
- ✅ Custom CSS styling
- ✅ Priority email support
- ✅ Bulk import/export
- ✅ White-label options

**No Restrictions:**
- All templates unlocked
- Unlimited customization

---

## Feature Implementation

### Template Restrictions

**Location:** `app/routes/app.delivery-rules.tsx`

```typescript
// Check if user can access template
const isPro = template.isPro;
const isFree = storePlan === "free";
const isLocked = isPro && isFree;

// In dropdown
{
  label: `${prefix} ${template.name}${isPro ? " 🔒 PRO" : ""}`,
  value: template.templateId,
  disabled: isLocked
}
```

**Database:** `prisma/schema.prisma`
```prisma
model MessageTemplate {
  isPro Boolean @default(false)  // Marks template as PRO-only
}
```

**Seeding:** `prisma/seed-templates.ts`
```typescript
{
  templateId: "holiday_shipping",
  name: "Holiday Deadline",
  isPro: true,  // This template requires PRO plan
}
```

---

## Plan Upgrade Flow

### 1. User sees locked template
- Dropdown shows: "⏰ Holiday Deadline 🔒 PRO"
- Option is disabled (grayed out)
- Help text shows: "🔒 Upgrade to PRO to unlock premium templates"

### 2. User clicks upgrade (future)
- Redirect to pricing page
- Show plan comparison
- Process payment via Shopify Billing API

### 3. After upgrade
- `store.plan` updates to "pro"
- All templates become unlocked
- User can now select any template

---

## Code Locations

### Plan Check Points

1. **Delivery Rules Page**
   - File: `app/routes/app.delivery-rules.tsx`
   - Line: ~233
   - Usage: Restricts template selection

2. **Store Model**
   - File: `prisma/schema.prisma`
   - Line: ~25
   - Field: `plan String @default("free")`

3. **Template Seeding**
   - File: `prisma/seed-templates.ts`
   - Line: ~5-150
   - Sets: `isPro: true/false`

---

## Testing Plan Restrictions

### Test as FREE user:
1. Create a new store (defaults to `plan: "free"`)
2. Go to Delivery Rules → Create Rule
3. Open "Message Template" dropdown
4. See PRO templates marked with 🔒
5. Try to select a PRO template → Should be disabled

### Test as PRO user:
1. Update store plan in database:
   ```sql
   UPDATE Store SET plan = 'pro' WHERE shop = 'your-shop.myshopify.com';
   ```
2. Refresh Delivery Rules page
3. All templates should be unlocked
4. Help text should say: "Choose which message template to use for this delivery rule"

---

## Future Enhancements

### Planned Features
- [ ] Upgrade button in template dropdown
- [ ] Plan comparison modal
- [ ] Shopify Billing API integration
- [ ] Usage analytics per plan
- [ ] A/B testing (PRO only)
- [ ] Custom template builder (PRO only)
- [ ] API access (PRO only)

---

## Notes

- Plan enforcement is done on **frontend and backend**
- Frontend: Disables UI elements for locked features
- Backend: Should validate plan before saving (TODO)
- Default plan is always "free" for new stores
- Plan changes take effect immediately (no cache)
